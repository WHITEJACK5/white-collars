# White Collarss — Architecture

> Staged migration from Express/EJS monolith → industry-realistic, interview-defensible system.
> Current stage: **Stage 2 (contracts defined, still one repo)**. See `packages/api-contracts/README.md`.

---

## Stage 1 — Internal decomposition (done)

**Layout:** `src/jobs/`, `src/users/`, `src/companies/`, `src/applications/`, `src/auth/`, `src/pages/`, `src/shared/`
Each feature owns `model.js` + `service.js` + `controller.js` + `routes.js` (+ `validation.js` where needed).
Rule enforced: **only `service.js` may `require('./model')`**; other features call `jobs/service.getJobById()` etc. `shared/` is the only cross-feature import (future `platform-sdk`).

**Verification:** `Select-String -Path "src\*\*.js" -Pattern "require\(.*model" | Where Path -notmatch "service.js|model.js"` → 0. `node --check server.js` → 0.

## Stage 2 — Service boundaries & contracts (done, still one repo)

**Boundaries for this product** (see `docs/service-boundaries.md` for why 5, not 12):

* `users-service` — `User`
* `auth-service` — sessions, reset/verify (calls `users-service`)
* `jobs-service` — `Job` + `Company` (scraped listings + directory; kept together because `Job.companyRef` join is hot)
* `applications-service` — `Application` + `resume`/`video` blobs (needs independent scaling for video)
* `notifications-service` — internal email (called by `auth` + `applications`)

**Contracts:** `packages/api-contracts/*.yaml` (OpenAPI 3.0) — versioned via `packages/api-contracts/package.json`. Every `src/*/service` function maps 1:1 to a path (see `packages/api-contracts/README.md` table). No new internal call may be added without a contract entry — boundary fix is cheap now.

**What would trigger further splits:** `jobs → search-service` when Elasticsearch is needed; `applications → media-service` when video transcoding needs separate workers.

## Stage 3 — Monorepo with independent packages (next, honest “large but not Google-scale” answer)

**Target layout:**
```
white-collarss/           # one git repo (monorepo), Turborepo/Nx
  apps/
    web/                  # EJS server (current views) or future React
    api-gateway/          # single entry, forwards /api/jobs → jobs-service etc.
  services/
    auth-service/         # own package.json, Dockerfile, .github/workflows/ci.yml, tests/
    jobs-service/
    applications-service/
    users-service/
  packages/
    api-contracts/        # already exists — publish as @white-collars/api-contracts
    shared-sdk/           # ← from src/shared (logging, errors, csrf, auth client) — ONLY shared code allowed
  infra/
    docker-compose.yml    # local dev: gateway + services + Mongo + (future Upstash)
    # NOTE: real K8s/Terraform out of scope — we use compose, not fake manifests
```

* Each service: own `package.json` (own deps/version), `Dockerfile`, `tests/`, `migrations/`, `deploy/` (compose snippet), `ci.yml` per service.
* Communication **only via HTTP** to contracts — `services/jobs-service/src/clients/users.client.js` fetchs `http://users-service:3001/users/:id`, never `require('../../users/model')`.
* Turborepo `pipeline: { build: {dependsOn: ["^build"]}, test, lint }` orchestrates.
* Verification: `docker-compose up jobs-service` (plus `users-service` if needed) boots isolated; `npm run test` per package.

## Stage 4 — Honest stopping point

**We will NOT do** (cargo-culting at this scale): separate git repos per service (`company/` org polyrepo), real Kubernetes manifests, Terraform-managed cloud infra, or service mesh. Those require team size / traffic that justifies them.

**This repo stops at Stage 3 monorepo.** Going further would be indefensible in a January 2026 internship interview — Stage 3 is already the correct ceiling for a solo/small-team portfolio project that needs to be *real and runnable*, not a folder tree with no code.

**What would trigger real polyrepo/split:** team > ~8, or `applications-service` video load needing independent deploys/scaling from `jobs-service`, or distinct ownership (Identity team owns `users-service`).

---

## Current server entry

`server.js` now loads `src/pages/routes`, `src/auth/routes`, `src/jobs/routes`, `src/companies/routes`, `src/jobs/employer.routes` — all feature-based. `api/index.js` re-exports app for Vercel (`/api/health`).

## Infra note

`infra/` will contain `docker-compose.yml` for local dev. Real cloud infra is out of scope; we state that explicitly rather than faking `k8s-manifests.yaml`.

