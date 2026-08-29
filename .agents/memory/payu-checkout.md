---
name: PayU hosted checkout
description: PayU hosted checkout hashing and rate-limit behavior for this project
---

PayU hosted checkout request hashes must include every sent `udf1`–`udf5` value in order; sending an extra UDF without hashing it can surface as a generic gateway failure. PayU also rate-limits repeated requests in a short window.

**Why:** The integration sent an application ID as `udf2` but originally hashed it as blank, while repeated payment taps could submit the same checkout more than once.

**How to apply:** Keep PayU credentials server-side, use the test endpoint only with test credentials, generate a fresh transaction ID, and disable the checkout submit button after the first tap.