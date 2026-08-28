---
name: Imported workspace runtime
description: Startup behavior for imported pnpm monorepos in this workspace
---

Imported pnpm workspace projects may arrive without installed dependencies even when the lockfile is complete; install from the existing lockfile before diagnosing application code.

**Why:** The workflow can report missing tools such as Vite or esbuild before the application has had a chance to start.

**How to apply:** When an imported workspace fails with missing package/module errors, run a frozen-lockfile install first and preserve the repository's existing package manager and dependency versions.