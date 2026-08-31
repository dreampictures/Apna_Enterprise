import { Router } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { db, applicationsTable, servicePricesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { CreateApplicationBody, ListApplicationsQueryParams, ExportApplicationsCsvQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

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

// POST /applications - Submit a new service application
router.post("/applications", async (req, res) => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed: " + parsed.error.message });
    return;
  }

  const { name, phone, email, service, message, callbackRequested, details } = parsed.data;
  const [configuredPrice] = await db
    .select({ price: servicePricesTable.price })
    .from(servicePricesTable)
    .where(eq(servicePricesTable.service, service))
    .limit(1);
  const baseAmount = configuredPrice?.price ?? 0;
  const paymentBreakdown = calculatePaymentBreakdown(baseAmount);
  const paymentAmount = paymentBreakdown.amount;

  if (paymentAmount > 0 && (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT)) {
    res.status(503).json({ error: "Payment gateway is not configured. Please contact the office." });
    return;
  }
  if (paymentAmount > 0 && !email) {
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
          paymentStatus: paymentAmount > 0 ? "initiated" : "not_required",
          paymentAmount,
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
        createdAt: app.createdAt.toISOString(),
      };

      if (paymentAmount > 0) {
        const key = process.env.PAYU_MERCHANT_KEY!;
        const txnid = `AE${Date.now()}${app.id}`;
        const amount = paymentAmount.toFixed(2);
        const productinfo = `${service} application`;
        const action = payuPaymentUrl();
        const appUrl = publicAppUrl(req);
        const fields = {
          key,
          txnid,
          amount,
          productinfo,
          firstname: name,
          email: email!,
          phone,
          udf1: app.trackingNumber,
          udf2: String(app.id),
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
             email: email!,
             trackingNumber: app.trackingNumber,
             applicationId: app.id,
           }),
        };
        await db
          .update(applicationsTable)
          .set({ paymentTxnId: txnid })
          .where(eq(applicationsTable.id, app.id));
        response.payment = { required: true, action, fields, ...paymentBreakdown };
      } else {
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

  let valid = false;
  if (app && process.env.PAYU_MERCHANT_SALT && payload.hash && payload.key) {
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

  const amountMatches = app && Number(payload.amount) === Number(app.paymentAmount);
  if (app && valid && amountMatches && success && status.toLowerCase() === "success") {
    await db
      .update(applicationsTable)
      .set({ paymentStatus: "paid", paidAt: new Date() })
      .where(eq(applicationsTable.id, app.id));
  } else if (app && valid && !success) {
    await db
      .update(applicationsTable)
      .set({ paymentStatus: "failed" })
      .where(eq(applicationsTable.id, app.id));
  }

  const result = valid && amountMatches && success && status.toLowerCase() === "success" ? "success" : "failed";
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
router.get("/applications/track/:trackingNumber", async (req, res) => {
  const { trackingNumber } = req.params;
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
       details: app.serviceDetails,
      createdAt: app.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to track application");
    res.status(500).json({ error: "Failed to fetch application" });
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
        service: a.service,
        message: a.message,
        status: a.status,
        callbackRequested: a.callbackRequested,
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

    const headers = ["ID", "Tracking No", "Name", "Phone", "Service", "Status", "Callback Requested", "Message", "Service Details", "Date"];
    const rows = applications.map((a) => [
      a.id,
      `"${a.trackingNumber}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.service}"`,
      `"${a.status}"`,
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

export default router;
