---
name: Fly deployment builder
description: Reliable builder selection for deploying this workspace to Fly.io
---

When deploying this workspace to Fly.io, prefer the classic remote builder with `--remote-only --depot=false` if the default pooled Depot builder fails while pushing to the Fly registry with a 401 Unauthorized error.

**Why:** The application image can build successfully while the pooled builder's registry handshake fails; switching builders resolves the push without changing application configuration or runtime secrets.

**How to apply:** Keep the existing `fly.toml` and Dockerfile unchanged, and use the builder flag only for the deploy command. Do not work around the error by modifying Fly app secrets.