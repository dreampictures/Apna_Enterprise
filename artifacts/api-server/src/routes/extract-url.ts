import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as cheerio from "cheerio";

const router = Router();

interface ExtractedSection {
  type: "text" | "table" | "links";
  title: string;
  content?: string;
  columns?: string[];
  rows?: { value: string; url: string }[][];
  links?: { label: string; url: string; tag: string }[];
}

interface ExtractedData {
  title?: string;
  department?: string;
  shortDesc?: string;
  vacancyCount?: number;
  startDate?: string;
  lastDate?: string;
  officialWebsite?: string;
  officialNotificationUrl?: string;
  applyUrl?: string;
  sections: ExtractedSection[];
}

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function parseIndianDate(text: string): string | undefined {
  const m1 = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m1) {
    const [, d, mo, y] = m1;
    const month = parseInt(mo);
    if (month >= 1 && month <= 12) {
      return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  const m2 = text.match(/(\d{1,2})\s+([a-zA-Z]+)[,\s]+(\d{4})/);
  if (m2) {
    const [, d, mo, y] = m2;
    const moNum = MONTH_MAP[mo.toLowerCase()];
    if (moNum) return `${y}-${moNum}-${d.padStart(2, "0")}`;
  }
  return undefined;
}

function extractVacancy(text: string): number | undefined {
  const m = text.match(/(\d[\d,]+)\s*(post|vacancy|vacancies|seat|opening|position)/i);
  if (m) {
    const n = parseInt(m[1].replace(/,/g, ""));
    if (n > 0 && n < 1000000) return n;
  }
  return undefined;
}

function resolveHref(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function genericExtract(html: string, url: string): ExtractedData {
  const $ = cheerio.load(html);
  const result: ExtractedData = { sections: [] };

  result.title = (
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().replace(/[|\-–].*/g, "").trim() ||
    ""
  ).replace(/\s+/g, " ").slice(0, 200);

  result.shortDesc = (
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    ""
  ).slice(0, 300);

  try {
    result.officialWebsite = new URL(url).origin;
  } catch {
    result.officialWebsite = url;
  }

  const bodyText = $("body").text().replace(/\s+/g, " ");
  result.vacancyCount = extractVacancy(bodyText);

  // Date extraction from labeled rows/cells
  const START_LABELS = ["start date", "starting date", "application begin", "apply from", "online begin"];
  const LAST_LABELS = ["last date", "closing date", "apply before", "apply last date", "end date", "last day", "submission date", "apply up to"];

  $("td, li, p, span").each((_, el) => {
    const text = $(el).text().toLowerCase().replace(/\s+/g, " ").trim();
    const full = $(el).text() + " " + $(el).next().text() + " " + $(el).parent().text();

    if (!result.startDate) {
      for (const label of START_LABELS) {
        if (text.includes(label)) {
          const parsed = parseIndianDate(full);
          if (parsed) { result.startDate = parsed; break; }
        }
      }
    }
    if (!result.lastDate) {
      for (const label of LAST_LABELS) {
        if (text.includes(label)) {
          const parsed = parseIndianDate(full);
          if (parsed) { result.lastDate = parsed; break; }
        }
      }
    }
  });

  // PDF notification link
  $("a[href]").each((_, el) => {
    if (result.officialNotificationUrl) return;
    const href = $(el).attr("href") || "";
    const text = $(el).text().toLowerCase();
    if ((href.includes(".pdf") || href.endsWith(".pdf")) &&
        (text.includes("notification") || text.includes("advt") || text.includes("official") || text.includes("advertisement"))) {
      result.officialNotificationUrl = resolveHref(href, url);
    }
  });

  // Apply link
  $("a[href]").each((_, el) => {
    if (result.applyUrl) return;
    const href = $(el).attr("href") || "";
    const text = $(el).text().toLowerCase();
    if (text.includes("apply online") || text.includes("apply now") || text.includes("register online")) {
      result.applyUrl = resolveHref(href, url);
    }
  });

  // Tables → table sections
  $("table").each((i, el) => {
    const rows: { value: string; url: string }[][] = [];
    let headerRow: string[] = [];

    $(el).find("tr").each((ri, tr) => {
      const isTh = $(tr).find("th").length > 0;
      const cells: { value: string; url: string }[] = [];
      $(tr).find("td, th").each((_, td) => {
        const val = $(td).text().trim().replace(/\s+/g, " ").slice(0, 200);
        const href = $(td).find("a[href]").first().attr("href") || "";
        cells.push({ value: val, url: href ? resolveHref(href, url) : "" });
      });
      if (cells.length === 0 || cells.every(c => !c.value)) return;
      if (ri === 0 && isTh) {
        headerRow = cells.map(c => c.value);
      } else {
        rows.push(cells);
      }
    });

    const colCount = rows[0]?.length ?? 0;
    if (rows.length === 0 || colCount < 2 || colCount > 7) return;

    const cols = headerRow.length === colCount ? headerRow : rows[0].map((_, ci) => `Col ${ci + 1}`);
    const dataRows = headerRow.length === colCount ? rows : rows.slice(1);
    if (dataRows.length === 0) return;

    const heading = (
      $(el).find("caption").text().trim() ||
      $(el).closest("div,section").find("h2,h3,h4,strong").first().text().trim() ||
      `Table ${i + 1}`
    ).slice(0, 80);

    result.sections.push({
      type: "table",
      title: heading,
      columns: cols.map(c => c.slice(0, 50)),
      rows: dataRows.map(r => r.map(c => ({ value: c.value, url: c.url }))),
    });
  });

  // Important links section
  const seen = new Set<string>();
  const importantLinks: { label: string; url: string; tag: string }[] = [];
  const LINK_KEYWORDS = ["apply", "notification", "advt", "advertisement", "syllabus", "admit", "result", "download", "official", "vacancy", "recruitment", "form"];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = $(el).text().trim().replace(/\s+/g, " ");
    if (!label || label.length < 4 || label.length > 100) return;
    if (!href.startsWith("http") && !href.startsWith("/")) return;

    const resolved = resolveHref(href, url);
    if (seen.has(resolved)) return;
    seen.add(resolved);

    const lcLabel = label.toLowerCase();
    const lcHref = href.toLowerCase();
    const isRelevant = LINK_KEYWORDS.some(k => lcLabel.includes(k)) || lcHref.endsWith(".pdf");
    if (!isRelevant) return;

    const tag = lcLabel.includes("apply") ? "apply"
      : (lcLabel.includes("notification") || lcLabel.includes("advt") || lcHref.endsWith(".pdf")) ? "notification"
      : lcLabel.includes("result") ? "result"
      : lcLabel.includes("admit") ? "admit"
      : "default";

    importantLinks.push({ label, url: resolved, tag });
  });

  if (importantLinks.length > 0) {
    result.sections.push({
      type: "links",
      title: "Important Links",
      links: importantLinks.slice(0, 20),
    });
  }

  return result;
}

function sarkariResultExtract(html: string, url: string): ExtractedData {
  const $ = cheerio.load(html);
  const base = genericExtract(html, url);

  const extraSections: ExtractedSection[] = [];
  $(".border-box, .tb1, table.table-bordered").each((i, el) => {
    const caption = $(el).find("caption, .head").text().trim();
    if (base.sections.some(s => s.title === caption)) return;
    const rows: { value: string; url: string }[][] = [];
    $(el).find("tr").each((_, tr) => {
      const cells: { value: string; url: string }[] = [];
      $(tr).find("td").each((_, td) => {
        const val = $(td).text().trim().replace(/\s+/g, " ").slice(0, 200);
        const href = $(td).find("a[href]").first().attr("href") || "";
        cells.push({ value: val, url: href ? resolveHref(href, url) : "" });
      });
      if (cells.length >= 2) rows.push(cells);
    });
    if (rows.length > 0) {
      extraSections.push({
        type: "table",
        title: caption || `Details ${i + 1}`,
        columns: ["Particulars", "Details"],
        rows: rows.map(r => [r[0], r[1] ?? { value: "", url: "" }]),
      });
    }
  });

  base.sections = [...extraSections, ...base.sections];
  return base;
}

function freeJobAlertExtract(html: string, url: string): ExtractedData {
  const $ = cheerio.load(html);
  const base = genericExtract(html, url);

  if (!base.department) {
    const dept = $(".post-labels a, .entry-categories a, .post-category a").first().text().trim();
    if (dept) base.department = dept;
  }

  if (!base.vacancyCount) {
    const text = $(".post-body, .entry-content, article").text();
    base.vacancyCount = extractVacancy(text);
  }

  return base;
}

router.post("/admin/extract-url", requireAuth, async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    res.status(400).json({ error: "Invalid URL. Please enter a valid http/https URL." });
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: "Only HTTP and HTTPS URLs are supported." });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url.trim(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      res.status(400).json({ error: `Website returned error ${response.status}. It may require login or block automated access.` });
      return;
    }

    const html = await response.text();
    const hostname = parsedUrl.hostname.toLowerCase();

    let extracted: ExtractedData;
    if (hostname.includes("freejobAlert") || hostname.includes("free-job-Alert") || hostname.includes("freejobAlert")) {
      extracted = freeJobAlertExtract(html, url);
    } else if (hostname.includes("sarkariresult") || hostname.includes("sarkari-result")) {
      extracted = sarkariResultExtract(html, url);
    } else {
      extracted = genericExtract(html, url);
    }

    extracted.sections = extracted.sections.slice(0, 10);

    res.json({ success: true, data: extracted, sourceUrl: url });
  } catch (err: any) {
    req.log.error({ err }, "URL extraction failed");
    if (err.name === "AbortError") {
      res.status(408).json({ error: "Request timed out after 12 seconds. The website is too slow or blocked access." });
    } else {
      res.status(500).json({ error: "Could not fetch or parse the page. The site may block automated access." });
    }
  }
});

export default router;
