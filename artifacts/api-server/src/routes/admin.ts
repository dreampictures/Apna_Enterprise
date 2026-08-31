import { Router } from "express";
import { db, usersTable, applicationsTable, visitorsTable, leadsTable, servicePricesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminLoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { username, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ token, username: user.username });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /admin/dashboard
router.get("/admin/dashboard", requireAuth, async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(applicationsTable);

    const recentApplications = await db
      .select()
      .from(applicationsTable)
      .orderBy(desc(applicationsTable.createdAt))
      .limit(10);

    const byService = await db
      .select({
        service: applicationsTable.service,
        count: count(),
      })
      .from(applicationsTable)
      .groupBy(applicationsTable.service);

    const [visitor] = await db.select().from(visitorsTable).limit(1);
    const [{ totalLeads }] = await db.select({ totalLeads: count() }).from(leadsTable);

    res.json({
      totalApplications: total,
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        trackingNumber: a.trackingNumber,
        name: a.name,
        phone: a.phone,
        service: a.service,
        message: a.message,
        status: a.status,
        callbackRequested: a.callbackRequested,
        paymentStatus: a.paymentStatus,
        paymentAmount: a.paymentAmount,
        paidAt: a.paidAt?.toISOString() ?? null,
        details: a.serviceDetails,
        createdAt: a.createdAt.toISOString(),
      })),
      applicationsByService: byService.map((s) => ({
        service: s.service,
        count: s.count,
      })),
      visitorCount: visitor?.visitCount ?? 0,
      totalLeads,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

// GET /admin/pricing - Read service prices (admin only)
router.get("/admin/pricing", requireAuth, async (_req, res) => {
  try {
    const prices = await db
      .select({
        service: servicePricesTable.service,
        price: servicePricesTable.price,
        updatedAt: servicePricesTable.updatedAt,
      })
      .from(servicePricesTable)
      .orderBy(servicePricesTable.service);

    res.json({
      prices: prices.map((item) => ({
        service: item.service,
        price: item.price,
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    _req.log.error({ err }, "Failed to get service pricing");
    res.status(500).json({ error: "Failed to get service pricing" });
  }
});

// PUT /admin/pricing/:service - Set a service price (admin only)
router.put("/admin/pricing/:service", requireAuth, async (req, res) => {
  const service = decodeURIComponent(String(req.params.service ?? "")).trim();
  const price = Number(req.body?.price);

  if (!service || !Number.isInteger(price) || price < 0 || price > 100000000) {
    res.status(400).json({ error: "Service and a valid non-negative price are required" });
    return;
  }

  try {
    const [saved] = await db
      .insert(servicePricesTable)
      .values({ service, price })
      .onConflictDoUpdate({
        target: servicePricesTable.service,
        set: { price, updatedAt: new Date() },
      })
      .returning();

    res.json({
      service: saved.service,
      price: saved.price,
      updatedAt: saved.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save service price");
    res.status(500).json({ error: "Failed to save service price" });
  }
});

export default router;
