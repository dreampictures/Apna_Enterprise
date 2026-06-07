import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
