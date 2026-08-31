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
- `PAYU_ENV`
- `PAYU_MERCHANT_KEY`
- `PAYU_MERCHANT_SALT`
- `PUBLIC_APP_URL`

**Why:** The application needs these values for storage, authentication, public callbacks, and hosted PayU checkout to work in production.

**How to apply:** Check configuration by secret name only before a Fly deployment; never retrieve, print, or store secret values. For Fly CLI operations, pass a secure `FLY_API_TOKEN` through the process environment rather than using interactive login.