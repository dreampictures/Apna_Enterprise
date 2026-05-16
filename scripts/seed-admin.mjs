import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌  DATABASE_URL is not set.");
    console.error("    Run: DATABASE_URL=your-neon-url node scripts/seed-admin.mjs");
    process.exit(1);
  }

  const { default: bcrypt } = await import("bcryptjs");
  const { Pool } = (await import("pg")).default;

  const username = await ask("Admin username: ");
  const password = await ask("Admin password: ");
  rl.close();

  if (!username || !password) {
    console.error("❌  Username and password cannot be empty.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
      [username, hash]
    );
    console.log(`✅  Admin user "${username}" created/updated successfully.`);
  } catch (err) {
    console.error("❌  Failed to create admin user:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
