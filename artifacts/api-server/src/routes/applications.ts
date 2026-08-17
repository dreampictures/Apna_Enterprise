import { Router } from "express";
import { db, applicationsTable } from "@workspace/db";
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

// POST /applications - Submit a new service application
router.post("/applications", async (req, res) => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed: " + parsed.error.message });
    return;
  }

  const { name, phone, service, message, callbackRequested } = parsed.data;

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
          service,
          message: message ?? null,
          callbackRequested: callbackRequested ?? false,
        })
        .returning();

      res.status(201).json({
        id: app.id,
        trackingNumber: app.trackingNumber,
        name: app.name,
        phone: app.phone,
        service: app.service,
        message: app.message,
        createdAt: app.createdAt.toISOString(),
      });
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

    const headers = ["ID", "Tracking No", "Name", "Phone", "Service", "Status", "Callback Requested", "Message", "Date"];
    const rows = applications.map((a) => [
      a.id,
      `"${a.trackingNumber}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.service}"`,
      `"${a.status}"`,
      a.callbackRequested ? "Yes" : "No",
      `"${(a.message ?? "").replace(/"/g, '""')}"`,
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
