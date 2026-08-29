---
name: Duplicate API workflow
description: Imported multi-artifact workspaces may have a primary app workflow and generated artifact workflows competing for the same API port.
---

The primary application workflow owns the user-facing frontend and API ports. Generated artifact API workflows can fail with EADDRINUSE even when the application itself is healthy.

**Why:** The imported project’s main start script launches both the frontend and API, while artifact registration can also create standalone frontend/API workflows.

**How to apply:** Verify the primary workflow and its health endpoint first; do not change secrets or app ports just to repair a duplicate artifact workflow.