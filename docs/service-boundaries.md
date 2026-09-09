# Service Boundaries — White Collarss (Stage 2)

This doc justifies each boundary for **this product**, not a generic microservices essay.

## Why these 5 (not 12)

* **users-service** — Single owner of `User`. Auth, jobs, applications all need “who is this?”. Without a users seam, every service would duplicate `isActive`/`emailVerified` checks and you’d never be able to extract auth to a dedicated team.
* **auth-service** — Owns sessions, password hashing (via `users-service`), reset/verify tokens. Split from users because auth has different threat model (rate limits, CSRF, audit) and scales with login traffic, not profile reads.
* **jobs-service** — Owns `Job` + `Company` + `Company` scraping (future: cron that scrapes company sites, writes to `Job` via internal `POST /jobs`). Kept **together** (not `jobs` + `companies` separate) because 95% of queries are `Job.find({companyRef})` — splitting would add a join on every listing for no team boundary (same Feed team would own both).
* **applications-service** — Owns `Application` + blobs (`resume`, `video`). High write fan-out, different storage (S3), and the planned **mandatory video upload** needs independent scaling (video transcoding CPU vs job listing reads). If kept inside `jobs-service`, a viral job would starve video uploads.
* **notifications-service** — Owns email. Only called internally (`auth-service` → verify/reset, `applications-service` → status change). No public route via gateway — keeps SMTP secrets isolated.

`pages` (EJS) is **not** a service — it’s `apps/web` that calls `jobs-service` + `applications-service` via gateway.

## What would trigger further splits

* `jobs-service` → `search-service` when full-text search moves to Elasticsearch and needs its own index pipeline.
* `applications-service` → `media-service` when video upload load justifies dedicated S3 + transcoding workers separate from application state.
* `notifications-service` → `payments-service` only if monetization (employer billing) is added.

Until those triggers, **Stage 3 monorepo** is the ceiling.

## Current internal call → contract mapping (Stage 1 → Stage 2)

Verified via `grep -R "require.*service" src/`:

| Location | Call | Contract |
|----------|------|----------|
| `src/auth/service.js:10` → `users/service.findByEmail` | `auth → users: POST /users/verify-password` | `users.yaml# /users/{id}/verify-password` |
| `src/auth/service.js:22` → `users/service.createUser` | `auth → users: POST /users` | `users.yaml# POST /users` |
| `src/jobs/controller.js:8` → `jobs/service.list` | `web → jobs: GET /jobs` | `jobs.yaml# GET /jobs` |
| `src/jobs/controller.js:33` → `companies/service.listActive` | `jobs → companies` (same service, no network) | — |
| `src/jobs/controller.js:146` → `applications/service.create` | `applications → jobs: GET /jobs/{id}` (validate) | `jobs.yaml# GET /jobs/{id}` |
| `src/shared/auth.js:1` → `users/service.findById` | `gateway → users: GET /users/{id}` (session verify) | `users.yaml# GET /users/{id}` |
| `src/pages/controller.js:5` → `jobs/service.list` | `web → jobs: GET /jobs?featured` | `jobs.yaml# GET /jobs` |

All 7 calls map cleanly. No `src/jobs/*` directly touches `User` model — it goes via `users/service` (future HTTP).

## What we intentionally did NOT split

* Separate git repos per service, K8s manifests, Terraform, service mesh — out of scope at solo/small-team scale. `infra/docker-compose.yml` + Turborepo is the honest Stage 3.
