import { Router } from "express";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db, applicationsTable, paymentRequestsTable, servicePricesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  CreateApplicationBody,
  CreatePaymentRequestBody,
  ListApplicationsQueryParams,
  ExportApplicationsCsvQueryParams,
  SetApplicationPriceBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rateLimit";

const router = Router();
const applicationSubmitRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const publicPaymentRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const trackingRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 60 });

const VALID_STATUSES = ["pending", "review", "applying", "applied", "rejected", "completed"] as const;
type AppStatus = (typeof VALID_STATUSES)[number];

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const d = new Date();
  const yy = d.getFullYear().toString().slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let rand = "";
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `AE${yy}${mm}${dd}${rand}`;
}

function payuPaymentUrl(): string {
  return process.env.PAYU_ENV === "test"
    ? "https://test.payu.in/_payment"
    : "https://secure.payu.in/_payment";
}

function publicAppUrl(req: any): string {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, "");

  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] ?? "").split(",")[0].trim();
  let host = forwardedHost || String(req.get("host") ?? "").trim();

  // The development frontend proxies /api to localhost. PayU cannot call a
  // localhost callback, so use Replit's public dev domain when the request
  // host is only an internal/local address.
  const isLocalHost = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)(:\d+)?$/i.test(host);
  if (isLocalHost) {
    host =
      process.env.REPLIT_DEV_DOMAIN ||
      String(process.env.REPLIT_DOMAINS ?? "").split(",")[0].trim() ||
      host;
  }

  const protocol = forwardedProto || (isLocalHost ? "https" : req.protocol || "https");
  return `${protocol}://${host}`;
}

function payuHash(values: string[]): string {
  return createHash("sha512").update(values.join("|")).digest("hex");
}

const PAYU_EMPTY_UDFS = ["", "", ""] as const;
const PAYU_EMPTY_SPLIT_PAYMENT_FIELDS = ["", "", "", "", ""] as const;
const PAYMENT_GATEWAY_FEE_RATE = 0.02;
const PAYMENT_GATEWAY_GST_RATE = 0.18;
const DYNAMIC_PRICED_SERVICES = new Set([
  "Air Ticket Booking",
  "Train Ticket Booking",
  "Bus Ticket Booking",
  "Job Application Forms (Govt Naukri)",
  "Insurance Services",
]);
const INSURANCE_TYPES = [
  "Car Insurance - Comprehensive",
  "Car Insurance - Third Party",
  "Bike Insurance - Comprehensive",
  "Bike Insurance - Third Party",
  "Health Insurance",
] as const;

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculatePaymentBreakdown(baseAmount: number) {
  const gatewayFee = roundCurrency(baseAmount * PAYMENT_GATEWAY_FEE_RATE);
  const gatewayFeeGst = roundCurrency(gatewayFee * PAYMENT_GATEWAY_GST_RATE);

  return {
    baseAmount,
    gatewayFee,
    gatewayFeeGst,
    amount: roundCurrency(baseAmount + gatewayFee + gatewayFeeGst),
  };
}

function createPayUHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  trackingNumber,
  applicationId,
}: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  trackingNumber: string;
  applicationId: number;
}) {
  // PayU's hosted checkout hash includes udf1-udf5 followed by the
  // five optional split-payment fields. udf1/udf2 identify this application.
  return payuHash([
    key, txnid, amount, productinfo, firstname, email,
    trackingNumber, String(applicationId), ...PAYU_EMPTY_UDFS,
    ...PAYU_EMPTY_SPLIT_PAYMENT_FIELDS, process.env.PAYU_MERCHANT_SALT!,
  ]);
}

function isValidPayUHash(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected.toLowerCase(), "utf8");
  const actualBuffer = Buffer.from(actual.toLowerCase(), "utf8");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function pricingStatus(pricingType: string, applicationPrice: number | null | undefined): string {
  if (pricingType !== "dynamic") return "fixed";
  return applicationPrice === null || applicationPrice === undefined ? "waiting_for_price" : "price_assigned";
}

function validateInsuranceDetails(service: string, details: string | undefined): string | null {
  if (service !== "Insurance Services") return null;

  let parsed: Record<string, unknown>;
  try {
    const value = JSON.parse(details ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return "Insurance details are invalid.";
    parsed = value as Record<string, unknown>;
  } catch {
    return "Insurance details are invalid.";
  }

  const insuranceType = String(parsed.insuranceType ?? "");
  if (!(INSURANCE_TYPES as readonly string[]).includes(insuranceType)) {
    return "Please select a valid insurance type.";
  }

  const isVehicleInsurance = insuranceType.startsWith("Car Insurance") || insuranceType.startsWith("Bike Insurance");
  if (isVehicleInsurance && !String(parsed.rcNumber ?? "").trim()) {
    return "RC Number is required for car or bike insurance.";
  }
  if (insuranceType === "Health Insurance") {
    if (!["individual", "family", "senior-citizen"].includes(String(parsed.healthCover ?? ""))) {
      return "Please select a valid health cover type.";
    }
    const members = Number(parsed.members);
    if (!Number.isInteger(members) || members < 1 || members > 50) {
      return "Please enter a valid number of people to cover.";
    }
  }

  return null;
}

function createPaymentFields(
  req: any,
  {
    id,
    reference,
    name,
    email,
    phone,
    baseAmount,
    productinfo,
  }: {
    id: number;
    reference: string;
    name: string;
    email: string;
    phone?: string | null;
    baseAmount: number;
    productinfo: string;
  },
) {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!key || !salt) {
    throw new Error("Payment gateway is not configured");
  }

  const paymentBreakdown = calculatePaymentBreakdown(baseAmount);
  const txnid = `AE${Date.now()}${id}${randomBytes(4).toString("hex")}`;
  const amount = paymentBreakdown.amount.toFixed(2);
  const appUrl = publicAppUrl(req);
  const fields = {
    key,
    txnid,
    amount,
    productinfo,
    firstname: name,
    email,
    phone: phone ?? "",
    udf1: reference,
    udf2: String(id),
    udf3: "",
    udf4: "",
    udf5: "",
    surl: `${appUrl}/api/payments/payu/success`,
    furl: `${appUrl}/api/payments/payu/failure`,
    hash: createPayUHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname: name,
      email,
      trackingNumber: reference,
      applicationId: id,
    }),
  };

  return { fields, txnid, ...paymentBreakdown };
}

// POST /applications - Submit a new service application
router.post("/applications", applicationSubmitRateLimit, async (req, res) => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed: " + parsed.error.message });
    return;
  }

  const { name, phone, email, service, message, callbackRequested, details } = parsed.data;
  const insuranceDetailsError = validateInsuranceDetails(service, details);
  if (insuranceDetailsError) {
    res.status(400).json({ error: insuranceDetailsError });
    return;
  }
  const [configuredPrice] = await db
    .select({ price: servicePricesTable.price })
    .from(servicePricesTable)
    .where(eq(servicePricesTable.service, service))
    .limit(1);
  const pricingType = DYNAMIC_PRICED_SERVICES.has(service) ? "dynamic" : "fixed";
  const baseAmount = pricingType === "dynamic" ? null : (configuredPrice?.price ?? 0);
  const paymentBreakdown = baseAmount === null ? null : calculatePaymentBreakdown(baseAmount);
  const paymentAmount = paymentBreakdown?.amount ?? null;

  if (paymentAmount !== null && paymentAmount > 0 && (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT)) {
    res.status(503).json({ error: "Payment gateway is not configured. Please contact the office." });
    return;
  }
  if (paymentAmount !== null && paymentAmount > 0 && !email) {
    res.status(400).json({ error: "Email is required for online payment." });
    return;
  }

  // Generate unique tracking number (retry on collision)
  let trackingNumber = generateTrackingNumber();
  let attempts = 0;
  while (attempts < 5) {
    try {
      const [app] = await db
        .insert(applicationsTable)
        .values({
          trackingNumber,
          name,
          phone,
          email: email ?? null,
          service,
          message: message ?? null,
          serviceDetails: details ?? "{}",
          callbackRequested: callbackRequested ?? false,
           paymentStatus: paymentAmount !== null && paymentAmount > 0 ? "initiated" : "not_required",
          paymentAmount,
          pricingType,
          applicationPrice: baseAmount,
        })
        .returning();

      const response: Record<string, unknown> = {
        id: app.id,
        trackingNumber: app.trackingNumber,
        name: app.name,
        phone: app.phone,
        email: app.email,
        service: app.service,
        message: app.message,
        details: app.serviceDetails,
         pricingType: app.pricingType,
         pricingStatus: pricingStatus(app.pricingType, app.applicationPrice),
         applicationPrice: app.applicationPrice,
        createdAt: app.createdAt.toISOString(),
      };

       if (paymentAmount !== null && paymentAmount > 0) {
         const payment = createPaymentFields(req, {
           id: app.id,
           reference: app.trackingNumber,
           name: app.name,
           email: app.email!,
           phone: app.phone,
           baseAmount: baseAmount!,
           productinfo: `${service} application`,
         });
         await db
           .update(applicationsTable)
           .set({ paymentTxnId: payment.txnid })
           .where(eq(applicationsTable.id, app.id));
         response.payment = { required: true, action: payuPaymentUrl(), ...payment };
       } else if (paymentAmount === 0) {
        response.payment = {
          required: false,
          ...calculatePaymentBreakdown(0),
        };
      }

      res.status(201).json(response);
      return;
    } catch (err: any) {
      // Retry on unique constraint violation for tracking number
      if (err?.code === "23505" && err?.constraint?.includes("tracking_number")) {
        trackingNumber = generateTrackingNumber();
        attempts++;
        continue;
      }
      req.log.error({ err }, "Failed to create application");
      res.status(500).json({ error: "Failed to save application" });
      return;
    }
  }
  res.status(500).json({ error: "Failed to generate tracking number" });
});

async function handlePayUResponse(req: any, res: any, success: boolean) {
  const payload = req.body as Record<string, string | undefined>;
  const txnid = String(payload.txnid ?? "");
  const status = String(payload.status ?? "");
  const [app] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.paymentTxnId, txnid))
    .limit(1);
  const [manualRequest] = app
    ? []
    : await db
        .select()
        .from(paymentRequestsTable)
        .where(eq(paymentRequestsTable.paymentTxnId, txnid))
        .limit(1);

  let valid = false;
  const paymentRecord = app ?? manualRequest;
  if (paymentRecord && process.env.PAYU_MERCHANT_SALT && payload.hash && payload.key) {
    const reverseHash = payuHash([
      process.env.PAYU_MERCHANT_SALT,
      status,
      ...PAYU_EMPTY_SPLIT_PAYMENT_FIELDS,
      String(payload.udf5 ?? ""),
      String(payload.udf4 ?? ""),
      String(payload.udf3 ?? ""),
      String(payload.udf2 ?? ""),
      String(payload.udf1 ?? ""),
      String(payload.email ?? ""),
      String(payload.firstname ?? ""),
      String(payload.productinfo ?? ""),
      String(payload.amount ?? ""),
      txnid,
      String(payload.key),
    ]);
    valid = payload.key === process.env.PAYU_MERCHANT_KEY && isValidPayUHash(reverseHash, payload.hash);
  }

  const expectedAmount = app?.paymentAmount
    ?? (manualRequest ? calculatePaymentBreakdown(Number(manualRequest.amount)).amount : null);
  const amountMatches = paymentRecord && expectedAmount !== null && Number(payload.amount) === Number(expectedAmount);
  const statusValue = status.toLowerCase();
  const paymentSucceeded = valid && amountMatches && success && statusValue === "success";
  if (app && paymentSucceeded) {
    await db
      .update(applicationsTable)
      .set({ paymentStatus: "paid", paidAt: new Date() })
      .where(eq(applicationsTable.id, app.id));
  } else if (app && valid && amountMatches && !success) {
    await db
      .update(applicationsTable)
      .set({ paymentStatus: "failed" })
      .where(eq(applicationsTable.id, app.id));
  } else if (manualRequest && paymentSucceeded) {
    await db
      .update(paymentRequestsTable)
      .set({ paymentStatus: "paid", paidAt: new Date() })
      .where(eq(paymentRequestsTable.id, manualRequest.id));
  } else if (manualRequest && valid && amountMatches && !success) {
    await db
      .update(paymentRequestsTable)
      .set({ paymentStatus: "failed" })
      .where(eq(paymentRequestsTable.id, manualRequest.id));
  }

  const result = paymentSucceeded ? "success" : "failed";
  if (manualRequest) {
    res.redirect(303, `${publicAppUrl(req)}/pay/${encodeURIComponent(manualRequest.token)}?payment=${result}`);
    return;
  }
  const tracking = app?.trackingNumber ?? "";
  res.redirect(303, `${publicAppUrl(req)}/apply?payment=${result}&tracking=${encodeURIComponent(tracking)}`);
}

router.post("/payments/payu/success", async (req, res) => {
  try {
    await handlePayUResponse(req, res, true);
  } catch (err) {
    req.log.error({ err }, "Failed to process PayU success callback");
    res.redirect(303, `${publicAppUrl(req)}/apply?payment=failed`);
  }
});

router.post("/payments/payu/failure", async (req, res) => {
  try {
    await handlePayUResponse(req, res, false);
  } catch (err) {
    req.log.error({ err }, "Failed to process PayU failure callback");
    res.redirect(303, `${publicAppUrl(req)}/apply?payment=failed`);
  }
});

// GET /applications/track/:trackingNumber - Public tracking endpoint
router.get("/applications/track/:trackingNumber", trackingRateLimit, async (req, res) => {
  const trackingNumber = String(req.params.trackingNumber ?? "");
  if (!trackingNumber || trackingNumber.length > 20) {
    res.status(400).json({ error: "Invalid tracking number" });
    return;
  }

  try {
    const [app] = await db
      .select({
        trackingNumber: applicationsTable.trackingNumber,
        service: applicationsTable.service,
        status: applicationsTable.status,
        callbackRequested: applicationsTable.callbackRequested,
         paymentStatus: applicationsTable.paymentStatus,
         paymentAmount: applicationsTable.paymentAmount,
         pricingType: applicationsTable.pricingType,
         applicationPrice: applicationsTable.applicationPrice,
         serviceDetails: applicationsTable.serviceDetails,
        createdAt: applicationsTable.createdAt,
      })
      .from(applicationsTable)
      .where(eq(applicationsTable.trackingNumber, trackingNumber.toUpperCase()))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({
      trackingNumber: app.trackingNumber,
      service: app.service,
      status: app.status,
      callbackRequested: app.callbackRequested,
      paymentStatus: app.paymentStatus,
      paymentAmount: app.paymentAmount ?? 0,
      pricingType: app.pricingType,
      pricingStatus: pricingStatus(app.pricingType, app.applicationPrice),
      applicationPrice: app.applicationPrice,
       details: app.serviceDetails,
      createdAt: app.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to track application");
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

router.post("/applications/track/:trackingNumber/payment", publicPaymentRateLimit, async (req, res) => {
  const trackingNumber = String(req.params.trackingNumber ?? "").trim().toUpperCase();
  if (!trackingNumber || trackingNumber.length > 20) {
    res.status(400).json({ error: "Invalid tracking number" });
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.trackingNumber, trackingNumber))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.paymentStatus === "paid") {
      res.status(400).json({ error: "This application has already been paid." });
      return;
    }
    if (app.pricingType === "dynamic" && app.applicationPrice === null) {
      res.status(400).json({ error: "The final service amount has not been assigned yet." });
      return;
    }
    if (!app.applicationPrice && app.pricingType !== "dynamic") {
      res.status(400).json({ error: "Online payment is not required for this application." });
      return;
    }
    if (!app.email) {
      res.status(400).json({ error: "An email address is required for online payment. Please contact the office." });
      return;
    }

    let fixedServicePrice: number | null = null;
    if (app.pricingType !== "dynamic" && app.applicationPrice === null) {
      const [configuredPrice] = await db
        .select({ price: servicePricesTable.price })
        .from(servicePricesTable)
        .where(eq(servicePricesTable.service, app.service))
        .limit(1);
      fixedServicePrice = configuredPrice?.price ?? null;
    }
    const baseAmount = app.pricingType === "dynamic"
      ? Number(app.applicationPrice)
      : Number(app.applicationPrice ?? fixedServicePrice ?? 0);
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      res.status(400).json({ error: "A valid payable amount is not available." });
      return;
    }

    const payment = createPaymentFields(req, {
      id: app.id,
      reference: app.trackingNumber,
      name: app.name,
      email: app.email,
      phone: app.phone,
      baseAmount: app.pricingType === "dynamic" ? baseAmount : Number(app.paymentAmount),
      productinfo: `${app.service} application`,
    });
    await db
      .update(applicationsTable)
      .set({ paymentTxnId: payment.txnid, paymentAmount: payment.amount, paymentStatus: "initiated" })
      .where(eq(applicationsTable.id, app.id));
    res.json({ required: true, action: payuPaymentUrl(), ...payment });
  } catch (err) {
    req.log.error({ err }, "Failed to initiate application payment");
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// GET /applications/receipt/:trackingNumber - Public paid receipt details
router.get("/applications/receipt/:trackingNumber", async (req, res) => {
  const trackingNumber = String(req.params.trackingNumber ?? "").trim().toUpperCase();
  if (!trackingNumber || trackingNumber.length > 20) {
    res.status(400).json({ error: "Invalid tracking number" });
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.trackingNumber, trackingNumber))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (app.paymentStatus !== "paid" || !app.paidAt) {
      res.status(409).json({ error: "Payment receipt is not available yet." });
      return;
    }

    res.json({
      trackingNumber: app.trackingNumber,
      name: app.name,
      phone: app.phone,
      email: app.email,
      service: app.service,
      paymentAmount: app.paymentAmount ?? 0,
      paymentTxnId: app.paymentTxnId ?? "",
      paidAt: app.paidAt.toISOString(),
      createdAt: app.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get payment receipt");
    res.status(500).json({ error: "Failed to fetch payment receipt" });
  }
});

// GET /applications - List all applications (admin only)
router.get("/applications", requireAuth, async (req, res) => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { service, limit, offset } = parsed.data;

  try {
    let query = db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt));

    if (service) {
      query = query.where(eq(applicationsTable.service, service)) as typeof query;
    }

    const applications = await query.limit(limit).offset(offset);
    const [{ total }] = await db
      .select({ total: count() })
      .from(applicationsTable)
      .where(service ? eq(applicationsTable.service, service) : sql`1=1`);

    res.json({
      applications: applications.map((a) => ({
        id: a.id,
        trackingNumber: a.trackingNumber,
        name: a.name,
        phone: a.phone,
        email: a.email,
        service: a.service,
        message: a.message,
        status: a.status,
        callbackRequested: a.callbackRequested,
        paymentStatus: a.paymentStatus,
        paymentAmount: a.paymentAmount,
         pricingType: a.pricingType,
         pricingStatus: pricingStatus(a.pricingType, a.applicationPrice),
         applicationPrice: a.applicationPrice,
        paidAt: a.paidAt?.toISOString() ?? null,
         details: a.serviceDetails,
        createdAt: a.createdAt.toISOString(),
      })),
      total,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list applications");
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.patch("/applications/:id/price", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }
  const parsed = SetApplicationPriceBody.safeParse(req.body);
  if (!parsed.success || !Number.isFinite(parsed.data.price) || parsed.data.price <= 0) {
    res.status(400).json({ error: "Price must be a positive number." });
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, id))
      .limit(1);
    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.pricingType !== "dynamic") {
      res.status(400).json({ error: "This application uses a fixed service price." });
      return;
    }
    if (app.paymentStatus === "paid") {
      res.status(400).json({ error: "A paid application cannot be repriced." });
      return;
    }

    const applicationPrice = Number(parsed.data.price);
    const paymentAmount = calculatePaymentBreakdown(applicationPrice).amount;
    const user = (req as any).user as { username?: string } | undefined;
    const [updated] = await db
      .update(applicationsTable)
      .set({
        applicationPrice,
        paymentAmount,
        paymentStatus: "not_required",
        paymentTxnId: null,
        priceAssignedAt: new Date(),
        priceAssignedBy: user?.username ?? "admin",
        internalNotes: parsed.data.internalNotes ?? null,
      })
      .where(eq(applicationsTable.id, id))
      .returning();

    res.json({
      id: updated.id,
      pricingType: updated.pricingType,
      pricingStatus: pricingStatus(updated.pricingType, updated.applicationPrice),
      applicationPrice: updated.applicationPrice,
      paymentAmount: updated.paymentAmount,
      paymentStatus: updated.paymentStatus,
      priceAssignedAt: updated.priceAssignedAt?.toISOString() ?? null,
      priceAssignedBy: updated.priceAssignedBy ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to assign application price");
    res.status(500).json({ error: "Failed to save application price" });
  }
});

// PATCH /applications/:id/status - Update application status (admin only)
router.patch("/applications/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }

  const { status } = req.body as { status?: string };
  if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }

  try {
    await db.update(applicationsTable).set({ status }).where(eq(applicationsTable.id, id));
    res.json({ success: true, status });
  } catch (err) {
    req.log.error({ err }, "Failed to update application status");
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE /applications/:id - Delete an old application (admin only)
router.delete("/applications/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }

  try {
    const deleted = await db
      .delete(applicationsTable)
      .where(eq(applicationsTable.id, id))
      .returning({ id: applicationsTable.id });

    if (!deleted.length) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({ success: true, id });
  } catch (err) {
    req.log.error({ err }, "Failed to delete application");
    res.status(500).json({ error: "Failed to delete application" });
  }
});

// GET /applications/export - Export CSV (admin only)
router.get("/applications/export", requireAuth, async (req, res) => {
  const parsed = ExportApplicationsCsvQueryParams.safeParse(req.query);
  const service = parsed.success ? parsed.data.service : undefined;

  try {
    let query = db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt));
    if (service) {
      query = query.where(eq(applicationsTable.service, service)) as typeof query;
    }
    const applications = await query;

    const headers = ["ID", "Tracking No", "Name", "Phone", "Service", "Status", "Payment Status", "Payment Amount", "Paid At", "Callback Requested", "Message", "Service Details", "Date"];
    const rows = applications.map((a) => [
      a.id,
      `"${a.trackingNumber}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.service}"`,
      `"${a.status}"`,
      `"${a.paymentStatus}"`,
      a.paymentAmount ?? "",
      a.paidAt?.toISOString() ?? "",
      a.callbackRequested ? "Yes" : "No",
      `"${(a.message ?? "").replace(/"/g, '""')}"`,
       `"${(a.serviceDetails ?? "{}").replace(/"/g, '""')}"`,
      a.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Failed to export applications");
    res.status(500).json({ error: "Failed to export" });
  }
});

router.get("/admin/payments", requireAuth, async (req, res) => {
  try {
    const [applications, paymentRequests] = await Promise.all([
      db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt)),
      db.select().from(paymentRequestsTable).orderBy(desc(paymentRequestsTable.createdAt)),
    ]);

    const payments = [
      ...applications
        .filter((application) => application.paymentStatus !== "not_required")
        .map((application) => ({
          id: `application-${application.id}`,
          source: "application" as const,
          reference: application.trackingNumber,
          service: application.service,
          clientName: application.name,
          email: application.email,
          phone: application.phone,
          amount: application.paymentAmount ?? 0,
          paymentStatus: application.paymentStatus,
          transactionId: application.paymentTxnId,
          paidAt: application.paidAt?.toISOString() ?? null,
          createdAt: application.createdAt.toISOString(),
        })),
      ...paymentRequests.map((request) => ({
        id: `manual-${request.id}`,
        source: "manual" as const,
        reference: `PR-${request.id}`,
        service: request.service,
        clientName: request.name,
        email: request.email,
        phone: request.phone,
        amount: request.amount,
        paymentStatus: request.paymentStatus,
        transactionId: request.paymentTxnId,
        paidAt: request.paidAt?.toISOString() ?? null,
        createdAt: request.createdAt.toISOString(),
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ payments });
  } catch (err) {
    req.log.error({ err }, "Failed to list payments");
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.post("/payment-requests", requireAuth, async (req, res) => {
  const parsed = CreatePaymentRequestBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.email) {
    res.status(400).json({ error: "Service, client name, amount, and email are required." });
    return;
  }

  try {
    const token = randomBytes(24).toString("hex");
    const user = (req as any).user as { username?: string } | undefined;
    const [request] = await db
      .insert(paymentRequestsTable)
      .values({
        token,
        service: parsed.data.service,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email,
        amount: parsed.data.amount,
        notes: parsed.data.notes ?? null,
        createdBy: user?.username ?? "admin",
      })
      .returning();

    res.status(201).json({
      token: request.token,
      service: request.service,
      name: request.name,
      amount: request.amount,
      paymentStatus: request.paymentStatus,
      paidAt: null,
      createdAt: request.createdAt.toISOString(),
      paymentPageUrl: `${publicAppUrl(req)}/pay/${request.token}`,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create manual payment request");
    res.status(500).json({ error: "Failed to create payment request" });
  }
});

router.get("/payment-requests/:token", async (req, res) => {
  const token = String(req.params.token ?? "").trim();
  if (token.length < 32 || token.length > 64) {
    res.status(404).json({ error: "Payment request not found" });
    return;
  }

  try {
    const [request] = await db
      .select()
      .from(paymentRequestsTable)
      .where(eq(paymentRequestsTable.token, token))
      .limit(1);
    if (!request) {
      res.status(404).json({ error: "Payment request not found" });
      return;
    }
    res.json({
      token: request.token,
      service: request.service,
      name: request.name,
      amount: request.amount,
      paymentStatus: request.paymentStatus,
      paidAt: request.paidAt?.toISOString() ?? null,
      createdAt: request.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch manual payment request");
    res.status(500).json({ error: "Failed to fetch payment request" });
  }
});

router.post("/payment-requests/:token/payment", publicPaymentRateLimit, async (req, res) => {
  const token = String(req.params.token ?? "").trim();
  if (token.length < 32 || token.length > 64) {
    res.status(404).json({ error: "Payment request not found" });
    return;
  }

  try {
    const [request] = await db
      .select()
      .from(paymentRequestsTable)
      .where(eq(paymentRequestsTable.token, token))
      .limit(1);
    if (!request) {
      res.status(404).json({ error: "Payment request not found" });
      return;
    }
    if (request.paymentStatus === "paid") {
      res.status(400).json({ error: "This payment request has already been paid." });
      return;
    }
    if (!request.email) {
      res.status(400).json({ error: "The payment request does not have a client email address." });
      return;
    }

    const payment = createPaymentFields(req, {
      id: request.id,
      reference: request.token,
      name: request.name,
      email: request.email,
      phone: request.phone,
      baseAmount: Number(request.amount),
      productinfo: `${request.service} manual payment`,
    });
    await db
      .update(paymentRequestsTable)
      .set({ paymentTxnId: payment.txnid, paymentStatus: "initiated" })
      .where(eq(paymentRequestsTable.id, request.id));
    res.json({ required: true, action: payuPaymentUrl(), ...payment });
  } catch (err) {
    req.log.error({ err }, "Failed to initiate manual payment");
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

export default router;
