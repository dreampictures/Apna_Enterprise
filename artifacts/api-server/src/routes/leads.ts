import { Router } from "express";
import { db, leadsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/leads", async (req, res) => {
  const { name, phone, page } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }
  try {
    const [lead] = await db
      .insert(leadsTable)
      .values({
        name: String(name).slice(0, 100),
        phone: String(phone).slice(0, 20),
        page: String(page || "/").slice(0, 200),
      })
      .returning();
    res.status(201).json(lead);
  } catch (err) {
    req.log.error({ err }, "Failed to save lead");
    res.status(500).json({ error: "Failed to save lead" });
  }
});

router.get("/leads", requireAuth, async (req, res) => {
  try {
    const leads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));
    res.json({ leads });
  } catch (err) {
    req.log.error({ err }, "Failed to get leads");
    res.status(500).json({ error: "Failed to get leads" });
  }
});

export default router;
