import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("❌  DATABASE_URL not set"); process.exit(1); }

const USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@1234";

const hash = await bcrypt.hash(PASSWORD, 10);

await pool.query(
  `INSERT INTO users (username, password) VALUES ($1, $2)
   ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
  [USERNAME, hash],
);

console.log(`✅  Admin ready  →  username: ${USERNAME}  |  password: ${PASSWORD}`);
await pool.end();
