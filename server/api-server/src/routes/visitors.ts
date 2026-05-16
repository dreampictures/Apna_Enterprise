import { Router } from "express";
import { db, visitorsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// POST /visitors/track - Increment visitor count
router.post("/visitors/track", async (req, res) => {
  try {
    const rows = await db.select().from(visitorsTable).limit(1);

    if (rows.length === 0) {
      const [newRow] = await db.insert(visitorsTable).values({ visitCount: 1 }).returning();
      res.json({ count: newRow.visitCount });
    } else {
      const [updated] = await db
        .update(visitorsTable)
        .set({ visitCount: sql`${visitorsTable.visitCount} + 1` })
        .returning();
      res.json({ count: updated.visitCount });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to track visitor");
    res.status(500).json({ error: "Failed to track visitor" });
  }
});

// GET /visitors/count - Get visitor count
router.get("/visitors/count", async (req, res) => {
  try {
    const [row] = await db.select().from(visitorsTable).limit(1);
    res.json({ count: row?.visitCount ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to get visitor count");
    res.status(500).json({ error: "Failed to get visitor count" });
  }
});

export default router;
