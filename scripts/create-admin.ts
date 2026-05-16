import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("❌  Set DATABASE_URL before running this script.");
  process.exit(1);
}

const USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@1234";

const pool = new Pool({ connectionString: DB_URL });

const hash = await bcrypt.hash(PASSWORD, 10);

await pool.query(
  `INSERT INTO users (username, password)
   VALUES ($1, $2)
   ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
  [USERNAME, hash],
);

console.log(`✅  Admin user ready  →  username: ${USERNAME}  |  password: ${PASSWORD}`);

await pool.end();
