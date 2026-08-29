import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import crypto from "crypto";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Memory storage — file never touches disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (allowed.includes(file.mimetype) || ["xlsx", "xls", "csv"].includes(ext || "")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Use .xlsx, .xls, or .csv"));
    }
  },
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Parse Excel/CSV buffer → { columns, rows } */
function parseExcel(buffer: Buffer, originalName: string): { columns: string[]; rows: string[][] } {
  const ext = originalName.split(".").pop()?.toLowerCase();
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("No sheets found in file.");
  const ws = wb.Sheets[sheetName];
  const data: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!data || data.length < 1) throw new Error("File has no data.");

  const headerRow = data[0] as unknown[];
  if (!headerRow || headerRow.length === 0) throw new Error("First row (header) is empty.");

  const columns = headerRow.map((c) => String(c ?? "").trim()).filter(Boolean);
  if (columns.length === 0) throw new Error("No column headers found in first row.");

  const rows = data.slice(1).map((row) => {
    const r = row as unknown[];
    return columns.map((_, i) => {
      const val = r[i];
      if (val === null || val === undefined) return "";
      if (val instanceof Date) return val.toLocaleDateString("en-IN");
      return String(val).trim();
    });
  }).filter((row) => row.some((cell) => cell !== ""));

  return { columns, rows };
}

/** Build a Section object (type=table) from parsed data */
function buildTableSection(columns: string[], rows: string[][], title = "Imported Data") {
  return {
    id: uid(),
    type: "table",
    title,
    content: "",
    columns,
    rows: rows.map((row) => row.map((value) => ({ value, url: "" }))),
    links: [],
    faqs: [],
  };
}

/* ─────────────────────────────────────────
   POST /api/admin/excel-import/parse
   Parse Excel → return preview data + hash
──────────────────────────────────────────── */
router.post(
  "/admin/excel-import/parse",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const buffer = req.file.buffer;
      const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

      // Check for duplicate
      const dupCheck = await pool.query(
        "SELECT id, file_name, imported_at FROM excel_import_logs WHERE file_hash = $1 AND status = 'success' LIMIT 1",
        [fileHash]
      );

      let duplicate: { id: number; fileName: string; importedAt: string } | null = null;
      if (dupCheck.rows[0]) {
        duplicate = {
          id: dupCheck.rows[0].id,
          fileName: dupCheck.rows[0].file_name,
          importedAt: dupCheck.rows[0].imported_at,
        };
      }

      const { columns, rows } = parseExcel(buffer, req.file.originalname);

      // File is discarded here — never stored
      res.json({
        columns,
        rows,
        rowCount: rows.length,
        columnCount: columns.length,
        fileName: req.file.originalname,
        fileHash,
        duplicate,
      });
    } catch (err: any) {
      req.log.error({ err }, "Excel parse failed");
      res.status(422).json({ error: err.message || "Failed to parse file." });
    }
  }
);

/* ─────────────────────────────────────────
   POST /api/admin/excel-import/create
   Create a new Draft post from Excel data
──────────────────────────────────────────── */
router.post("/admin/excel-import/create", requireAuth, async (req, res) => {
  const { columns, rows, fileName, fileHash, title, category, sectionTitle } = req.body;

  if (!columns || !rows) {
    res.status(400).json({ error: "Missing columns or rows." });
    return;
  }

  const postTitle = (title || fileName || "Excel Import").replace(/\.(xlsx?|csv)$/i, "");
  const slug = slugify(postTitle) + "-" + uid();
  const section = buildTableSection(columns, rows, sectionTitle || "Imported Data");

  try {
    const result = await pool.query(
      `INSERT INTO announcements
        (title, slug, short_desc, category, is_published, is_urgent, is_featured, sections, robots)
       VALUES ($1,$2,$3,$4,false,false,false,$5,'index, follow')
       RETURNING *`,
      [
        postTitle,
        slug,
        `Imported from Excel: ${fileName}`,
        category || "Announcement",
        JSON.stringify([section]),
      ]
    );

    // Log the import
    const adminUser = (req as any).user?.username || "admin";
    await pool.query(
      `INSERT INTO excel_import_logs
        (file_name, file_hash, row_count, column_count, import_mode, status, admin_user, announcement_id)
       VALUES ($1,$2,$3,$4,'create','success',$5,$6)`,
      [fileName, fileHash, rows.length, columns.length, adminUser, result.rows[0].id]
    );

    res.status(201).json({ id: result.rows[0].id, slug: result.rows[0].slug });
  } catch (err: any) {
    req.log.error({ err }, "Excel import create failed");
    res.status(500).json({ error: err.message || "Failed to create post." });
  }
});

/* ─────────────────────────────────────────
   POST /api/admin/excel-import/append/:id
   Append rows to existing post's table
──────────────────────────────────────────── */
router.post("/admin/excel-import/append/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { columns, rows, fileName, fileHash, sectionTitle } = req.body;
  if (!columns || !rows) { res.status(400).json({ error: "Missing columns or rows." }); return; }

  try {
    const existing = await pool.query("SELECT * FROM announcements WHERE id = $1", [id]);
    if (!existing.rows[0]) { res.status(404).json({ error: "Post not found." }); return; }

    const sections: any[] = JSON.parse(existing.rows[0].sections || "[]");

    // Find first table section — append rows to it
    const tableIdx = sections.findIndex((s: any) => s.type === "table");
    if (tableIdx !== -1) {
      const newRows = rows.map((row: string[]) => row.map((value: string) => ({ value, url: "" })));
      sections[tableIdx].rows = [...sections[tableIdx].rows, ...newRows];
    } else {
      // No existing table — create one
      sections.push(buildTableSection(columns, rows, sectionTitle || "Imported Data"));
    }

    await pool.query(
      "UPDATE announcements SET sections = $1 WHERE id = $2",
      [JSON.stringify(sections), id]
    );

    const adminUser = (req as any).user?.username || "admin";
    await pool.query(
      `INSERT INTO excel_import_logs
        (file_name, file_hash, row_count, column_count, import_mode, status, admin_user, announcement_id)
       VALUES ($1,$2,$3,$4,'append','success',$5,$6)`,
      [fileName, fileHash, rows.length, columns.length, adminUser, id]
    );

    res.json({ id, slug: existing.rows[0].slug });
  } catch (err: any) {
    req.log.error({ err }, "Excel import append failed");
    res.status(500).json({ error: err.message || "Failed to append." });
  }
});

/* ─────────────────────────────────────────
   POST /api/admin/excel-import/replace/:id
   Replace table in existing post
──────────────────────────────────────────── */
router.post("/admin/excel-import/replace/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { columns, rows, fileName, fileHash, sectionTitle } = req.body;
  if (!columns || !rows) { res.status(400).json({ error: "Missing columns or rows." }); return; }

  try {
    const existing = await pool.query("SELECT * FROM announcements WHERE id = $1", [id]);
    if (!existing.rows[0]) { res.status(404).json({ error: "Post not found." }); return; }

    const sections: any[] = JSON.parse(existing.rows[0].sections || "[]");
    const newSection = buildTableSection(columns, rows, sectionTitle || "Imported Data");

    const tableIdx = sections.findIndex((s: any) => s.type === "table");
    if (tableIdx !== -1) {
      sections[tableIdx] = { ...newSection, id: sections[tableIdx].id };
    } else {
      sections.push(newSection);
    }

    await pool.query(
      "UPDATE announcements SET sections = $1 WHERE id = $2",
      [JSON.stringify(sections), id]
    );

    const adminUser = (req as any).user?.username || "admin";
    await pool.query(
      `INSERT INTO excel_import_logs
        (file_name, file_hash, row_count, column_count, import_mode, status, admin_user, announcement_id)
       VALUES ($1,$2,$3,$4,'replace','success',$5,$6)`,
      [fileName, fileHash, rows.length, columns.length, adminUser, id]
    );

    res.json({ id, slug: existing.rows[0].slug });
  } catch (err: any) {
    req.log.error({ err }, "Excel import replace failed");
    res.status(500).json({ error: err.message || "Failed to replace." });
  }
});

/* ─────────────────────────────────────────
   GET /api/admin/excel-import/posts
   List existing posts for Append/Replace
──────────────────────────────────────────── */
router.get("/admin/excel-import/posts", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, slug, category, is_published FROM announcements ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      isPublished: r.is_published,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list posts");
    res.status(500).json({ error: "Failed" });
  }
});

/* ─────────────────────────────────────────
   GET /api/admin/excel-import/logs
   Import history
──────────────────────────────────────────── */
router.get("/admin/excel-import/logs", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM excel_import_logs ORDER BY imported_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get import logs");
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
