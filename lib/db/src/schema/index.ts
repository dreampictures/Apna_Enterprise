import { pgTable, serial, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  service: text("service").notNull(),
  message: text("message"),
  serviceDetails: text("service_details").default("{}").notNull(),
  status: text("status").default("pending").notNull(),
  callbackRequested: boolean("callback_requested").default(false).notNull(),
  paymentStatus: text("payment_status").default("not_required").notNull(),
  paymentTxnId: text("payment_txn_id").unique(),
  paymentAmount: numeric("payment_amount", { precision: 12, scale: 2, mode: "number" }),
  paidAt: timestamp("paid_at"),
  pricingType: text("pricing_type").default("fixed").notNull(),
  applicationPrice: numeric("application_price", { precision: 12, scale: 2, mode: "number" }),
  priceAssignedAt: timestamp("price_assigned_at"),
  priceAssignedBy: text("price_assigned_by"),
  internalNotes: text("internal_notes"),
  documentUrl: text("document_url"),
  documentKey: text("document_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

export const servicePricesTable = pgTable("service_prices", {
  id: serial("id").primaryKey(),
  service: text("service").notNull().unique(),
  price: integer("price").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServicePrice = typeof servicePricesTable.$inferSelect;

export const paymentRequestsTable = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  service: text("service").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  paymentStatus: text("payment_status").default("not_started").notNull(),
  paymentTxnId: text("payment_txn_id").unique(),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentRequest = typeof paymentRequestsTable.$inferSelect;

export const visitorsTable = pgTable("visitors", {
  id: serial("id").primaryKey(),
  visitCount: integer("visit_count").default(0).notNull(),
});

export type Visitor = typeof visitorsTable.$inferSelect;

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  page: text("page").default("/").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Lead = typeof leadsTable.$inferSelect;

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  device: text("device").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PageView = typeof pageViewsTable.$inferSelect;

export const khaataClientsTable = pgTable("khaata_clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type KhaataClient = typeof khaataClientsTable.$inferSelect;

export const khaataTransactionsTable = pgTable("khaata_transactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "debit" = client owes us | "credit" = client paid / advance
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type KhaataTransaction = typeof khaataTransactionsTable.$inferSelect;

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDesc: text("short_desc"),
  category: text("category").notNull().default("General"),
  department: text("department"),
  publishDate: timestamp("publish_date").defaultNow(),
  startDate: timestamp("start_date"),
  lastDate: timestamp("last_date"),
  vacancyCount: integer("vacancy_count"),
  officialWebsite: text("official_website"),
  officialNotificationUrl: text("official_notification_url"),
  applyUrl: text("apply_url"),
  isPublished: boolean("is_published").default(false).notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  sections: text("sections").default("[]").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  focusKeywords: text("focus_keywords"),
  canonicalUrl: text("canonical_url"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  robots: text("robots").default("index, follow"),
  pdfUrl: text("pdf_url"),
  pdfKey: text("pdf_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
