import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        visit_count INTEGER DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        page TEXT DEFAULT '/' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        page TEXT NOT NULL,
        device TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      INSERT INTO visitors (id, visit_count)
      VALUES (1, 0)
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_desc TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        department TEXT,
        publish_date TIMESTAMP DEFAULT NOW(),
        start_date TIMESTAMP,
        last_date TIMESTAMP,
        vacancy_count INTEGER,
        official_website TEXT,
        official_notification_url TEXT,
        apply_url TEXT,
        is_published BOOLEAN DEFAULT false NOT NULL,
        is_urgent BOOLEAN DEFAULT false NOT NULL,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        sections TEXT DEFAULT '[]' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS khaata_clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS khaata_transactions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES khaata_clients(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cameti_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        daily_amount INTEGER NOT NULL DEFAULT 300,
        total_members INTEGER NOT NULL DEFAULT 12,
        started_on DATE NOT NULL DEFAULT CURRENT_DATE,
        pin TEXT NOT NULL DEFAULT '1103',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cameti_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES cameti_groups(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        has_taken BOOLEAN NOT NULL DEFAULT false,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cameti_months (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES cameti_groups(id) ON DELETE CASCADE,
        month_number INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        winner_member_id INTEGER REFERENCES cameti_members(id) ON DELETE SET NULL,
        bid_amount INTEGER,
        profit_per_member INTEGER,
        daily_reduction INTEGER,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cameti_collections (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES cameti_groups(id) ON DELETE CASCADE,
        member_id INTEGER NOT NULL REFERENCES cameti_members(id) ON DELETE CASCADE,
        collected_date DATE NOT NULL,
        amount INTEGER NOT NULL,
        month_id INTEGER REFERENCES cameti_months(id) ON DELETE SET NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    logger.info("Database schema verified / created successfully");
  } catch (err) {
    logger.error({ err }, "Failed to ensure database schema");
    throw err;
  } finally {
    client.release();
  }
}
