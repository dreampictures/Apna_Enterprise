import { Router } from "express";
import { db, usersTable, applicationsTable, visitorsTable, leadsTable } from "@workspace/db";
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
        name: a.name,
        phone: a.phone,
        service: a.service,
        message: a.message,
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

export default router;
