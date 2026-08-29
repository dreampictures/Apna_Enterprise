---
name: Fly deployment secrets
description: Secret names that the imported application expects to be configured in Fly.io before deployment
---

Before deploying this application to Fly.io, verify that the Fly app has these secret names configured:

- `DATABASE_URL`
- `JWT_SECRET`
- `R2_ACCESS_KEY_ID`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`
- `R2_SECRET_ACCESS_KEY`

**Why:** The user confirmed these are set in the Fly.io app and wants them remembered for future deployments.

**How to apply:** Check configuration by secret name only before a Fly deployment; never retrieve, print, or store the secret values.