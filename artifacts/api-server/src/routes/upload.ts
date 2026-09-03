import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { uploadToR2 } from "../lib/r2";
import { requireAuth } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rateLimit";

const router = Router();
const publicUploadRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Memory storage — files kept in RAM, sent to R2 immediately
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter(_req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

/**
 * POST /upload/pdf
 * Upload a single PDF to R2.
 * Returns { url, key, name, size }
 *
 * Accepts an optional ?folder=query param to organise files (default: "uploads").
 * Admin-only route — requires JWT.
 */
router.post(
  "/upload/pdf",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded or file is not a PDF" });
      return;
    }

    const folder = (req.query.folder as string) || "uploads";
    const ext = ".pdf";
    const key = `${folder}/${randomUUID()}${ext}`;

    try {
      const url = await uploadToR2(key, req.file.buffer, "application/pdf");
      res.status(201).json({
        url,
        key,
        name: req.file.originalname,
        size: req.file.size,
      });
    } catch (err) {
      req.log.error({ err }, "R2 upload failed");
      res.status(500).json({ error: "Failed to upload file to R2" });
    }
  },
);

/**
 * POST /upload/pdf/public
 * Same as above but open (no auth) — useful for application form submissions.
 * Files go into the "applications" folder.
 */
router.post(
  "/upload/pdf/public",
  publicUploadRateLimit,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded or file is not a PDF" });
      return;
    }

    const key = `applications/${randomUUID()}.pdf`;

    try {
      const url = await uploadToR2(key, req.file.buffer, "application/pdf");
      res.status(201).json({
        url,
        key,
        name: req.file.originalname,
        size: req.file.size,
      });
    } catch (err) {
      req.log.error({ err }, "R2 upload failed");
      res.status(500).json({ error: "Failed to upload file to R2" });
    }
  },
);

export default router;
