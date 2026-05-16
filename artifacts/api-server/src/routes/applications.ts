import { Router } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { CreateApplicationBody, ListApplicationsQueryParams, ExportApplicationsCsvQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// POST /applications - Submit a new service application
router.post("/applications", async (req, res) => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed: " + parsed.error.message });
    return;
  }

  const { name, phone, service, message } = parsed.data;

  try {
    const [app] = await db
      .insert(applicationsTable)
      .values({ name, phone, service, message: message ?? null })
      .returning();

    res.status(201).json({
      id: app.id,
      name: app.name,
      phone: app.phone,
      service: app.service,
      message: app.message,
      createdAt: app.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create application");
    res.status(500).json({ error: "Failed to save application" });
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
        name: a.name,
        phone: a.phone,
        service: a.service,
        message: a.message,
        status: a.status,
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
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }

  const { status } = req.body as { status?: string };
  if (!status || !["pending", "done"].includes(status)) {
    res.status(400).json({ error: "Status must be 'pending' or 'done'" });
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

    const headers = ["ID", "Name", "Phone", "Service", "Message", "Date"];
    const rows = applications.map((a) => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.service}"`,
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
