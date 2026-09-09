# shared-sdk — Future `platform-sdk` (Stage 3)

In Stage 3, `src/shared/*` (logging, error handling, auth client, CSRF, rate limiter, DB connector) will be extracted to this publishable package:

```
packages/shared-sdk/
  src/
    logger.js      ← from src/shared/logger.js
    errors.js      ← from src/shared/errors.js
    db.js          ← from src/shared/db.js
    auth.js        ← session guards
    security.js
    csrf.js
  package.json     # versioned, imported as @white-collars/shared-sdk
```

**Rule:** This is the **ONLY** code allowed to be shared across services. No service may import another service's `src/` — only `shared-sdk`.

Stage 2: code still lives in `src/shared/` inside the monolith. Stage 3 will `npm init -w packages/shared-sdk` and move it.
