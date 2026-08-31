---
name: `.replit` validation
description: Safe handling of merged Replit workflow configuration files.
---

When `.replit` has merge conflicts or needs edits, write a complete temporary TOML file and pass it through the platform validator before replacing the live configuration.

**Why:** Direct edits are blocked, and unvalidated merge markers or tracked credentials can leave the workspace configuration invalid or unsafe.

**How to apply:** Remove conflict markers and credentials from the temporary file, validate and replace it, then stage the resulting `.replit` and verify workflow status.