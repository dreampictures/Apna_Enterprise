# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Application: Global Enterprise

A full-stack business services web application for a company offering travel and government document services in India.

### Services
- Air Ticket Booking
- Train Ticket Booking
- International Parcel Booking
- PAN Card Apply
- Aadhaar Card Services
- Voter Card Apply

### Frontend (artifacts/global-enterprise)
- React + Vite, Tailwind CSS, shadcn/ui
- Pages: Home, Services, Apply Form, Contact, Admin Login, Admin Dashboard
- Blue + white theme, Font Awesome icons via react-icons/fa
- WhatsApp floating button with dynamic links
- Visitor count display in footer

### Backend (artifacts/api-server)
- Express 5 with pino logging
- JWT authentication for admin routes (JWT_SECRET env var)
- bcryptjs for password hashing
- Routes: /api/applications, /api/admin/login, /api/admin/dashboard, /api/visitors/track, /api/visitors/count

### Database Schema (lib/db/src/schema)
- `users` — admin users (id, username, password hashed)
- `applications` — service applications (id, name, phone, service, message, created_at)
- `visitors` — single-row visitor count table

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `JWT_SECRET` — secret for JWT token signing
