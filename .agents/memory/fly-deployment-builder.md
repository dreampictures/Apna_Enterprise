---
name: Fly deployment builder
description: Reliable builder selection for deploying this workspace to Fly.io
---

When deploying this workspace to Fly.io, prefer the classic remote builder with `--remote-only --depot=false` if the default pooled Depot builder fails while pushing to the Fly registry with a 401 Unauthorized error.

**Why:** The application image can build successfully while the pooled builder's registry handshake fails; switching builders resolves the push without changing application configuration or runtime secrets.

**How to apply:** Keep the existing `fly.toml` and Dockerfile unchanged, and use the builder flag only for the deploy command. Do not work around the error by modifying Fly app secrets.

Use `flyctl` for Fly.io commands in this workspace; the installed `fly` binary may be the unrelated Concourse CLI and does not support Fly application flags.

**Why:** Calling `fly` can fail before deployment with unknown `--app`/`-a` flags even though the correct Fly.io CLI is installed.

**How to apply:** Run status, deploy, secrets, and logs through `flyctl`, with the existing Fly API token available to the command environment.

An authenticated Fly token may still be unable to see the deployed app when it belongs to a different Fly account or organization; verify app visibility before deploying.

**Why:** A token can authenticate successfully and list a builder app while `flyctl status --app apna-enterprise` returns “Could not find App”.

**How to apply:** Do not recreate or rename the app to work around this. Use a token from the account/org that owns `apna-enterprise`, or have that account grant access first.