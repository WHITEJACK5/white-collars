# api-contracts — Single Source of Truth for Service Boundaries

This directory is the **proto-schemas** equivalent for white_collarss. In the monorepo (Stage 3) each service will import its contract as a versioned package:

```json
// services/jobs-service/package.json
"dependencies": { "@white-collars/api-contracts": "1.0.0" }
```

Contracts are written as **OpenAPI 3.0** (REST) — simple tooling for solo/small-team, but the discipline is the same as gRPC/protobuf at scale: no service may import another service's code, only its contract + HTTP client.

## Services (Stage 2 boundaries)

| Service | Owns | Exposes | Depends on |
|---------|------|---------|------------|
| `users-service` | `User` model, profiles | `GET /users/:id`, `POST /users`, `PATCH /users/:id` | — |
| `auth-service` | sessions, tokens, password reset | `POST /auth/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | `users-service` (fetch user, create user) |
| `jobs-service` | `Job` + `Company` (scraped listings + directory) | `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`, `GET /companies`, `GET /companies/:slug` | `users-service` (postedBy lookup for authz), `applications-service` (counts) — optional |
| `applications-service` | `Application`, resume/video blobs | `POST /applications`, `GET /applications?jobId=`, `PATCH /applications/:id/status`, `POST /applications/:id/video` | `jobs-service` (validate job exists, isExpired), `users-service` (applicant profile), `notifications-service` (status change) |
| `notifications-service` | email / in-app | `POST /notifications/email` (internal) | — (called by auth/applications) |

`pages` (home/about/contact) stays in `apps/web` (EJS) and calls `jobs-service` + `companies` via gateway — not a separate service.

## How Stage 1 internal calls map to these contracts

| Stage 1 internal call | Future network call | Contract |
|-----------------------|---------------------|----------|
| `auth/service.authenticate → users/service.findByEmailWithPassword` | `auth-service → users-service: GET /users?email=` + `comparePassword` stays in users-service | `users.yaml# GET /users` |
| `auth/service.register → users/service.createUser` | `auth-service → users-service: POST /users` | `users.yaml# POST /users` |
| `jobs/controller.listJobs → jobs/service.list` | `web → jobs-service: GET /jobs` | `jobs.yaml# GET /jobs` |
| `jobs/controller.showCreateForm → companies/service.listActive` | `jobs-service → companies (internal to jobs-service)` — merged, no cross-network | — |
| `jobs/controller.applyForJob → jobs/service.getById` | `applications-service → jobs-service: GET /jobs/:id` (validate) | `jobs.yaml# GET /jobs/:id` |
| `jobs/employer.controller.dashboard → jobs/service.findByPostedBy` | `web → jobs-service: GET /jobs?postedBy=` | `jobs.yaml# GET /jobs` |
| `pages/controller.home → jobs/service.list` + `companies/service.listActive` | `web → jobs-service: GET /jobs?featured` and `GET /companies` | `jobs.yaml` |
| `shared/auth.isEmployer → users/service.findById` | `gateway → users-service: GET /users/:id` for session verification | `users.yaml# GET /users/:id` |

If a new internal call cannot be expressed as one of the rows above, the boundary is wrong — fix the boundary now (Stage 2), not after the split.

## Versioning

Contracts are versioned via git tag + npm `version` in `packages/api-contracts/package.json`. Breaking change → bump major, update all clients.

## Verification for Stage 2

1. Every `src/*/service.js` exported function has a corresponding path in one of the `*.yaml` files.
2. No `src/*/service.js` imports another feature's `model.js` — only its own `model.js` and `../shared/*`.
3. `grep -R "require.*src/.*service"` shows the call graph above.

See `docs/service-boundaries.md` for rationale per service and `ARCHITECTURE.md` for Stage 3/4 horizon.
