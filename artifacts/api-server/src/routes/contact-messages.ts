import { Router } from "express";
import { and, count, desc, eq, gt } from "drizzle-orm";
import { db, contactMessagesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rateLimit";

const router = Router();

type ContactMessageBody = {
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};

function parseContactMessageBody(body: unknown): ContactMessageBody | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const keys = ["fullName", "email", "phone", "subject", "message"];
  if (Object.keys(input).some((key) => !keys.includes(key))) return null;
  if (typeof input.fullName !== "string" || typeof input.email !== "string" ||
      typeof input.subject !== "string" || typeof input.message !== "string") return null;
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();
  const phone = input.phone == null ? null : typeof input.phone === "string" ? input.phone.trim() : null;
  if (input.phone != null && typeof input.phone !== "string") return null;
  if (fullName.length < 2 || fullName.length > 100 || subject.length < 2 || subject.length > 200 ||
      message.length < 1 || message.length > 5000 || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (phone && phone.length > 20)) return null;
  return { fullName, email, phone, subject, message };
}

const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many contact requests. Please try again later.",
});

router.post("/contact-messages", contactRateLimit, async (req, res) => {
  const parsed = parseContactMessageBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid contact message" });
    return;
  }

  const values = {
    fullName: parsed.fullName,
    email: parsed.email.toLowerCase(),
    phone: parsed.phone || null,
    subject: parsed.subject,
    message: parsed.message,
  };

  try {
    const duplicateSince = new Date(Date.now() - 10 * 60 * 1000);
    const [duplicate] = await db
      .select({ id: contactMessagesTable.id })
      .from(contactMessagesTable)
      .where(and(
        eq(contactMessagesTable.email, values.email),
        eq(contactMessagesTable.subject, values.subject),
        eq(contactMessagesTable.message, values.message),
        gt(contactMessagesTable.createdAt, duplicateSince),
      ))
      .limit(1);

    if (duplicate) {
      res.status(429).json({ error: "Unable to submit contact message" });
      return;
    }

    const [created] = await db.insert(contactMessagesTable).values(values).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to save contact message");
    res.status(500).json({ error: "Unable to submit contact message" });
  }
});

router.get("/admin/inbox", requireAuth, async (req, res) => {
  try {
    const [messages, [{ unreadCount }]] = await Promise.all([
      db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt)),
      db.select({ unreadCount: count() }).from(contactMessagesTable).where(eq(contactMessagesTable.isRead, false)),
    ]);
    res.json({ messages, unreadCount });
  } catch (err) {
    req.log.error({ err }, "Failed to get contact inbox");
    res.status(500).json({ error: "Failed to get contact inbox" });
  }
});

router.get("/admin/inbox/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid message id" });
    return;
  }
  try {
    const [message] = await db.select().from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, id)).limit(1);
    if (!message) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }
    res.json(message);
  } catch (err) {
    req.log.error({ err }, "Failed to get contact message");
    res.status(500).json({ error: "Failed to get contact message" });
  }
});

router.patch("/admin/inbox/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || typeof req.body?.isRead !== "boolean") {
    res.status(400).json({ error: "A valid message id and isRead boolean are required" });
    return;
  }
  try {
    const [message] = await db.update(contactMessagesTable)
      .set({ isRead: req.body.isRead })
      .where(eq(contactMessagesTable.id, id)).returning();
    if (!message) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }
    res.json(message);
  } catch (err) {
    req.log.error({ err }, "Failed to update contact message");
    res.status(500).json({ error: "Failed to update contact message" });
  }
});

router.delete("/admin/inbox/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid message id" });
    return;
  }
  try {
    const [deleted] = await db.delete(contactMessagesTable)
      .where(eq(contactMessagesTable.id, id)).returning({ id: contactMessagesTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }
    res.json({ success: true, id: deleted.id });
  } catch (err) {
    req.log.error({ err }, "Failed to delete contact message");
    res.status(500).json({ error: "Failed to delete contact message" });
  }
});

export default router;