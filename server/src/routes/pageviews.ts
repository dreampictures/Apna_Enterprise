import { Router } from "express";
import { db, pageViewsTable } from "@workspace/db";
import { desc, sql, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/pageviews/track", async (req, res) => {
  const { page, device } = req.body;
  try {
    await db.insert(pageViewsTable).values({
      page: String(page || "/").slice(0, 200),
      device: String(device || "desktop").slice(0, 20),
    });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to track page view");
    res.status(500).json({ error: "Failed to track page view" });
  }
});

router.get("/pageviews/summary", requireAuth, async (req, res) => {
  try {
    const byPage = await db
      .select({ page: pageViewsTable.page, count: count() })
      .from(pageViewsTable)
      .groupBy(pageViewsTable.page)
      .orderBy(desc(sql`count(*)`));

    const byDevice = await db
      .select({ device: pageViewsTable.device, count: count() })
      .from(pageViewsTable)
      .groupBy(pageViewsTable.device);

    const [{ total }] = await db
      .select({ total: count() })
      .from(pageViewsTable);

    res.json({ byPage, byDevice, total });
  } catch (err) {
    req.log.error({ err }, "Failed to get page view summary");
    res.status(500).json({ error: "Failed to get page view summary" });
  }
});

export default router;
