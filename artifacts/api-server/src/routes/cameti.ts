import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

/* ─────────────────────────────────────────────────────────────
   GROUPS
───────────────────────────────────────────────────────────── */

// GET /cameti/groups
router.get("/cameti/groups", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM cameti_groups ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list cameti groups");
    res.status(500).json({ error: "Failed" });
  }
});

// POST /cameti/groups
router.post("/cameti/groups", async (req, res) => {
  const { name, daily_amount = 300, total_members = 12, started_on, pin = "1103" } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "Name required" }); return; }
  try {
    const { rows } = await pool.query(
      `INSERT INTO cameti_groups (name, daily_amount, total_members, started_on, pin)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), daily_amount, total_members, started_on || new Date().toISOString().split("T")[0], pin]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create cameti group");
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /cameti/groups/:id  — edit group settings
router.patch("/cameti/groups/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, daily_amount, started_on } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "Name required" }); return; }
  try {
    const { rows } = await pool.query(
      `UPDATE cameti_groups SET name=$1, daily_amount=$2, started_on=$3 WHERE id=$4 RETURNING *`,
      [name.trim(), daily_amount, started_on, id]
    );
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update group");
    res.status(500).json({ error: "Failed" });
  }
});

// GET /cameti/groups/:id/month-stats  — per-month collection totals
router.get("/cameti/groups/:id/month-stats", async (req, res) => {
  const group_id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      `SELECT month_id, SUM(amount)::int as total_collected, COUNT(DISTINCT member_id)::int as members_paid, COUNT(*)::int as entries
       FROM cameti_collections WHERE group_id=$1 AND month_id IS NOT NULL
       GROUP BY month_id`,
      [group_id]
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get month stats");
    res.status(500).json({ error: "Failed" });
  }
});

// GET /cameti/groups/:id  — full group with members + months
router.get("/cameti/groups/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows: groups } = await pool.query(`SELECT * FROM cameti_groups WHERE id=$1`, [id]);
    if (!groups.length) { res.status(404).json({ error: "Not found" }); return; }

    const { rows: members } = await pool.query(
      `SELECT * FROM cameti_members WHERE group_id=$1 ORDER BY sort_order, id`, [id]
    );
    const { rows: months } = await pool.query(
      `SELECT cm.*, mem.name as winner_name
       FROM cameti_months cm
       LEFT JOIN cameti_members mem ON mem.id = cm.winner_member_id
       WHERE cm.group_id=$1 ORDER BY cm.month_number`, [id]
    );

    res.json({ ...groups[0], members, months });
  } catch (err) {
    req.log.error({ err }, "Failed to get cameti group");
    res.status(500).json({ error: "Failed" });
  }
});

/* ─────────────────────────────────────────────────────────────
   MEMBERS
───────────────────────────────────────────────────────────── */

// POST /cameti/groups/:id/members
router.post("/cameti/groups/:id/members", async (req, res) => {
  const group_id = Number(req.params.id);
  const { name, phone, sort_order = 0 } = req.body;
  if (!name?.trim() || !phone?.trim()) { res.status(400).json({ error: "Name and phone required" }); return; }
  try {
    const { rows } = await pool.query(
      `INSERT INTO cameti_members (group_id, name, phone, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [group_id, name.trim(), phone.trim(), sort_order]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to add member");
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /cameti/members/:id  — edit name/phone
router.patch("/cameti/members/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, phone } = req.body;
  if (!name?.trim() || !phone?.trim()) { res.status(400).json({ error: "Name and phone required" }); return; }
  try {
    const { rows } = await pool.query(
      `UPDATE cameti_members SET name=$1, phone=$2 WHERE id=$3 RETURNING *`,
      [name.trim(), phone.trim(), id]
    );
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update member");
    res.status(500).json({ error: "Failed" });
  }
});

// DELETE /cameti/members/:id
router.delete("/cameti/members/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query(`DELETE FROM cameti_members WHERE id=$1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete member");
    res.status(500).json({ error: "Failed" });
  }
});

// GET /cameti/members/:id/history  — all collections for a member
router.get("/cameti/members/:id/history", async (req, res) => {
  const member_id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      `SELECT cc.*, cm.name as member_name
       FROM cameti_collections cc
       JOIN cameti_members cm ON cm.id = cc.member_id
       WHERE cc.member_id=$1
       ORDER BY cc.collected_date DESC`,
      [member_id]
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get member history");
    res.status(500).json({ error: "Failed" });
  }
});

/* ─────────────────────────────────────────────────────────────
   MONTHS / BOLI
───────────────────────────────────────────────────────────── */

// POST /cameti/groups/:id/months  — open a new month
router.post("/cameti/groups/:id/months", async (req, res) => {
  const group_id = Number(req.params.id);
  const { month_number, year, month } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO cameti_months (group_id, month_number, year, month)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [group_id, month_number, year, month]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create month");
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /cameti/months/:id/boli  — record boli winner + split profit
router.patch("/cameti/months/:id/boli", async (req, res) => {
  const month_id = Number(req.params.id);
  const { winner_member_id, bid_amount, total_members } = req.body;
  if (!winner_member_id || !bid_amount) {
    res.status(400).json({ error: "winner_member_id and bid_amount required" }); return;
  }
  const n = total_members || 12;
  const profit_per_member = Math.floor(bid_amount / n);
  const daily_reduction = Math.floor(profit_per_member / 30);

  try {
    const { rows } = await pool.query(
      `UPDATE cameti_months
       SET winner_member_id=$1, bid_amount=$2, profit_per_member=$3,
           daily_reduction=$4, status='closed'
       WHERE id=$5 RETURNING *`,
      [winner_member_id, bid_amount, profit_per_member, daily_reduction, month_id]
    );
    // mark winner as has_taken
    await pool.query(`UPDATE cameti_members SET has_taken=true WHERE id=$1`, [winner_member_id]);
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to record boli");
    res.status(500).json({ error: "Failed" });
  }
});

/* ─────────────────────────────────────────────────────────────
   COLLECTIONS
───────────────────────────────────────────────────────────── */

// GET /cameti/groups/:id/collections?date=YYYY-MM-DD
router.get("/cameti/groups/:id/collections", async (req, res) => {
  const group_id = Number(req.params.id);
  const date = req.query.date as string | undefined;
  try {
    let query = `
      SELECT cc.*, cm.name as member_name, cm.phone as member_phone
      FROM cameti_collections cc
      JOIN cameti_members cm ON cm.id = cc.member_id
      WHERE cc.group_id=$1`;
    const params: unknown[] = [group_id];
    if (date) { query += ` AND cc.collected_date=$2`; params.push(date); }
    query += ` ORDER BY cc.collected_date DESC, cm.sort_order`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get collections");
    res.status(500).json({ error: "Failed" });
  }
});

// POST /cameti/groups/:id/collections  — record one or bulk collections
router.post("/cameti/groups/:id/collections", async (req, res) => {
  const group_id = Number(req.params.id);
  // body: { entries: [{member_id, amount, collected_date, note?, month_id?}] }
  const { entries } = req.body as {
    entries: { member_id: number; amount: number; collected_date: string; note?: string; month_id?: number }[]
  };
  if (!entries?.length) { res.status(400).json({ error: "entries array required" }); return; }
  try {
    const inserted: unknown[] = [];
    for (const e of entries) {
      const { rows } = await pool.query(
        `INSERT INTO cameti_collections (group_id, member_id, collected_date, amount, month_id, note)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [group_id, e.member_id, e.collected_date, e.amount, e.month_id || null, e.note || null]
      );
      inserted.push(rows[0]);
    }
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error({ err }, "Failed to record collections");
    res.status(500).json({ error: "Failed" });
  }
});

// DELETE /cameti/collections/:id
router.delete("/cameti/collections/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query(`DELETE FROM cameti_collections WHERE id=$1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete collection");
    res.status(500).json({ error: "Failed" });
  }
});

// GET /cameti/groups/:id/summary  — per-member collection summary
router.get("/cameti/groups/:id/summary", async (req, res) => {
  const group_id = Number(req.params.id);
  try {
    const { rows: members } = await pool.query(
      `SELECT * FROM cameti_members WHERE group_id=$1 ORDER BY sort_order, id`, [group_id]
    );
    const { rows: cols } = await pool.query(
      `SELECT member_id, SUM(amount)::int as total_paid, COUNT(*)::int as days_paid
       FROM cameti_collections WHERE group_id=$1 GROUP BY member_id`, [group_id]
    );
    const colMap: Record<number, { total_paid: number; days_paid: number }> = {};
    for (const c of cols) colMap[c.member_id] = { total_paid: c.total_paid, days_paid: c.days_paid };

    const result = members.map(m => ({
      ...m,
      total_paid: colMap[m.id]?.total_paid || 0,
      days_paid: colMap[m.id]?.days_paid || 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get summary");
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
