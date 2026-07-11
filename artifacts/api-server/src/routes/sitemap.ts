import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const BASE_URL = "https://apnaenterprise.in";

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/updates", priority: "0.9", changefreq: "daily" },
  { loc: "/services", priority: "0.8", changefreq: "monthly" },
  { loc: "/apply", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact", priority: "0.6", changefreq: "monthly" },
];

router.get("/sitemap.xml", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT slug, publish_date, created_at, is_urgent, is_featured
       FROM announcements WHERE is_published = true
       ORDER BY publish_date DESC`
    );

    const urls: string[] = [];

    for (const p of STATIC_PAGES) {
      urls.push(`  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
    }

    for (const row of result.rows) {
      const lastmod = (row.publish_date || row.created_at)
        ? new Date(row.publish_date || row.created_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const priority = row.is_urgent ? "0.9" : row.is_featured ? "0.85" : "0.7";
      urls.push(`  <url>
    <loc>${BASE_URL}/updates/${row.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "Failed to generate sitemap");
    res.status(500).send("Failed to generate sitemap");
  }
});

router.get("/robots.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`);
});

export default router;
