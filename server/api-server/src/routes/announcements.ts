import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function isExpired(lastDate: string | null): boolean {
  if (!lastDate) return false;
  return new Date(lastDate) < new Date();
}

function mapRow(row: any) {
  const expired = isExpired(row.last_date);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDesc: row.short_desc,
    category: row.category,
    department: row.department,
    publishDate: row.publish_date,
    startDate: row.start_date,
    lastDate: row.last_date,
    vacancyCount: row.vacancy_count,
    officialWebsite: row.official_website,
    officialNotificationUrl: row.official_notification_url,
    applyUrl: row.apply_url,
    isPublished: row.is_published,
    isUrgent: row.is_urgent,
    isFeatured: row.is_featured,
    isExpired: expired,
    sections: (() => { try { return JSON.parse(row.sections || "[]"); } catch { return []; } })(),
    createdAt: row.created_at,
  };
}

// GET /announcements — public list
router.get("/announcements", async (req, res) => {
  const { category, limit = "20", offset = "0", published } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit) || 20, 100);
  const off = parseInt(offset) || 0;

  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (published === "1") {
      conditions.push(`is_published = true`);
    }
    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(`SELECT COUNT(*) FROM announcements ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    values.push(lim, off);
    const rows = await pool.query(
      `SELECT * FROM announcements ${where} ORDER BY is_urgent DESC, is_featured DESC, publish_date DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json({ announcements: rows.rows.map(mapRow), total });
  } catch (err) {
    req.log.error({ err }, "Failed to list announcements");
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// GET /announcements/:slug — public detail
router.get("/announcements/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM announcements WHERE slug = $1 AND is_published = true",
      [req.params.slug]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get announcement");
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

// POST /announcements — admin create
router.post("/announcements", requireAuth, async (req, res) => {
  const {
    title, slug, shortDesc, category, department,
    publishDate, startDate, lastDate, vacancyCount,
    officialWebsite, officialNotificationUrl, applyUrl,
    isPublished, isUrgent, isFeatured, sections,
  } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const finalSlug = slug?.trim() || slugify(title);
  const finalSections = JSON.stringify(sections || []);

  try {
    const result = await pool.query(
      `INSERT INTO announcements
        (title, slug, short_desc, category, department, publish_date, start_date, last_date,
         vacancy_count, official_website, official_notification_url, apply_url,
         is_published, is_urgent, is_featured, sections)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        title, finalSlug, shortDesc || null, category || "General", department || null,
        publishDate || null, startDate || null, lastDate || null,
        vacancyCount || null, officialWebsite || null, officialNotificationUrl || null, applyUrl || null,
        isPublished ?? false, isUrgent ?? false, isFeatured ?? false, finalSections,
      ]
    );
    res.status(201).json(mapRow(result.rows[0]));
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Slug already exists. Use a different title or slug." });
      return;
    }
    req.log.error({ err }, "Failed to create announcement");
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// PUT /announcements/:id — admin update
router.put("/announcements/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const {
    title, slug, shortDesc, category, department,
    publishDate, startDate, lastDate, vacancyCount,
    officialWebsite, officialNotificationUrl, applyUrl,
    isPublished, isUrgent, isFeatured, sections,
  } = req.body;

  const finalSections = JSON.stringify(sections || []);

  try {
    const result = await pool.query(
      `UPDATE announcements SET
        title=$1, slug=$2, short_desc=$3, category=$4, department=$5,
        publish_date=$6, start_date=$7, last_date=$8, vacancy_count=$9,
        official_website=$10, official_notification_url=$11, apply_url=$12,
        is_published=$13, is_urgent=$14, is_featured=$15, sections=$16
       WHERE id=$17 RETURNING *`,
      [
        title, slug, shortDesc || null, category || "General", department || null,
        publishDate || null, startDate || null, lastDate || null,
        vacancyCount || null, officialWebsite || null, officialNotificationUrl || null, applyUrl || null,
        isPublished ?? false, isUrgent ?? false, isFeatured ?? false, finalSections, id,
      ]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapRow(result.rows[0]));
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Slug already exists." });
      return;
    }
    req.log.error({ err }, "Failed to update announcement");
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// DELETE /announcements/:id — admin delete
router.delete("/announcements/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete announcement");
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
