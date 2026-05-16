# Deployment Guide — fly.io + Neon

## Overview
This app is a monorepo with:
- **Frontend**: React + Vite → built to `artifacts/global-enterprise/dist/public`
- **Backend**: Express API server → bundled to `artifacts/api-server/dist/index.mjs`
- **Database**: PostgreSQL via Drizzle ORM

In production, the Express server serves both the API and the React frontend as static files.

---

## Step 1 — Create Neon Database

1. Sign up at https://neon.tech (free)
2. Create a new Project → choose region `AWS ap-southeast-1` (Singapore, closest to India)
3. Copy your **Connection string** from the dashboard:
   ```
   postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2 — Push Database Schema to Neon

Run this from your project root:

```bash
DATABASE_URL="your-neon-connection-string" pnpm --filter @workspace/db run push
```

This creates all tables: `users`, `applications`, `leads`, `visitors`, `page_views`.

---

## Step 3 — Create Admin User

```bash
DATABASE_URL="your-neon-connection-string" node scripts/seed-admin.mjs
```

You will be prompted for a username and password.

---

## Step 4 — Install fly CLI & Login

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

```bash
fly auth login
```

---

## Step 5 — Launch fly.io App

From the project root (the `fly.toml` is already configured):

```bash
fly launch --no-deploy
```

- App name: `apna-enterprise` (or any name you want)
- Region: `sin` (Singapore)
- Skip Postgres: Yes (using Neon)
- Skip Redis: Yes

---

## Step 6 — Set Secrets

```bash
fly secrets set \
  DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" \
  JWT_SECRET="replace-with-long-random-string-min-32-chars"
```

Generate a good JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 7 — Deploy

```bash
fly deploy
```

Once done, open your live app:
```bash
fly open
```

---

## Useful Commands

| Task | Command |
|------|---------|
| View logs | `fly logs` |
| SSH into machine | `fly ssh console` |
| Redeploy | `fly deploy` |
| Update a secret | `fly secrets set KEY=value` |
| View secrets | `fly secrets list` |
| Scale memory | `fly scale memory 512` |
| App status | `fly status` |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing admin login tokens |
| `NODE_ENV` | Yes | Set to `production` (already in fly.toml) |
| `PORT` | Yes | Set to `8080` (already in fly.toml) |
