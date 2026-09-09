# WHITE COLLARS — Professional Job Portal

> **Scrapes real jobs from company sites · One-click apply with saved documents · Mandatory video upload for select roles — built as an interview-defensible, staged monorepo.**

[![Node](https://img.shields.io/badge/node-22.x-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Turborepo](https://img.shields.io/badge/managed%20with-Turborepo-red)](https://turbo.build)
[![Deploy: Vercel](https://img.shields.io/badge/deploy-Vercel-black)](https://vercel.com)

**Live:** `https://white-collars.vercel.app` · **Contracts:** [`packages/api-contracts/`](packages/api-contracts/) · **Architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## Overview

WHITE COLLARS is a full-stack job portal that aggregates listings by scraping company career pages, lets logged-in users **one-click apply** using saved resumes/cover letters, and — for roles that require it — enforces a **mandatory video introduction** upload (MP4/MOV/WebM, 50 MB, S3-ready).

The codebase is intentionally **staged**: it starts as a hardened Express/EJS monolith, is internally decomposed by feature, then becomes a **Turborepo monorepo with independently deployable packages** — the honest ceiling for a solo/small-team portfolio targeting a January 2026 internship. No fake Kubernetes, no cargo-cult polyrepo.

Current stage: **Stage 3 — Monorepo** (feature-based `src/`, OpenAPI contracts, gateway + 4 services, `docker-compose` for local dev).

---

## Features

**Job Seeker**
* Browse & search jobs (full-text, location, category, employment type) with pagination
* View job detail + related jobs, increment view count
* One-click apply with `resume` (PDF/DOC) + `coverLetter` + optional `video`
* Application status tracking (`pending → reviewed → shortlisted → interview → accepted/rejected`)

**Employer**
* Post / edit / archive jobs (dashboard at `/employer/dashboard`)
* View applicants per job, update status with note, see resume & cover letter
* Company directory (`/companies`) backed by real `Company` model (not hardcoded)

**Platform**
* Session auth (HTTP-only, SameSite=Lax, Secure prod) with `User.comparePassword()` single source
* CSRF double-submit cookie on every mutating form, CSP without `unsafe-inline` for scripts
* Password `8+` with upper/lower/digit+symbol, `select:false` for hashes
* Serverless-safe DB (cached `global._mongooseCached`) + rate limiter (lazy expiry, Upstash-ready)

---

## Tech Stack

* **Runtime:** Node 22, Express 4, EJS, Mongoose 8, MongoDB (Atlas)
* **Auth & Security:** `bcryptjs`, `express-session` + `connect-mongo`, `cookie-parser`, `csurf`-free double-submit CSRF, `helmet`-style headers via `src/shared/security`
* **Uploads:** `multer` → `public/uploads/resumes|videos|profiles|company-logos` (S3 swap in prod)
* **Validation:** `express-validator` (single `src/shared/validation` source)
* **Monorepo:** Turborepo 2, npm workspaces, Docker (per-service `Dockerfile`), GitHub Actions (per-service `ci.yml` + `turbo run`)
* **Contracts:** OpenAPI 3.0 YAML in `packages/api-contracts` (published as `@white-collars/api-contracts`)
* **Deploy:** Vercel (`api/index.js` → `@vercel/node`, `vercel.json` rewrites)

---

## Project Structure

```
white-collars/
├── apps/
│   ├── web/                  # EJS frontend (calls gateway; reuses views/ + public/)
│   └── api-gateway/          # single entry — forwards /api/* → right service
├── services/
│   ├── auth-service/         # sessions, reset/verify tokens → calls users-service via HTTP
│   │   ├── src/{handlers,domain,repository,clients}
│   │   ├── Dockerfile, package.json (own version), .github/workflows/ci.yml
│   ├── users-service/        # owns User
│   ├── jobs-service/         # owns Job + Company (scraped listings)
│   └── applications-service/ # owns Application + blobs, calls jobs-service to validate
├── packages/
│   ├── api-contracts/        # users.yaml, auth.yaml, jobs.yaml, applications.yaml, notifications.yaml
│   └── shared-sdk/           # logging, errors, db, security, auth, upload — ONLY shared code
├── src/                      # Stage 1 internal decomposition (still runnable via server.js)
│   ├── jobs/{model,service,controller,routes}
│   ├── users/{model,service}
│   ├── companies/{model,service,controller,routes}
│   ├── applications/{model,service}
│   ├── auth/{controller,routes,service}
│   ├── pages/{controller,routes,contact.model,service} # home/about/contact/privacy/terms
│   └── shared/{db,errors,security,csrf,rateLimiter,upload,validation,flash,auth}
├── infra/
│   ├── docker-compose.yml    # mongo + 4 services + gateway (local dev)
│   └── README.md             # honest scope: compose, not fake K8s
├── views/  public/  seed/    # EJS views, neon theme (white grid + black + #39FF14), fixtures
├── server.js                 # Stage 1 entry — now loads src/ (feature-based); api/index.js for Vercel
├── turbo.json, package.json  # workspaces: apps/*, services/*, packages/*
├── ARCHITECTURE.md           # staged migration + honest stopping point
└── docs/service-boundaries.md
```

**Rule enforced:** Only `service.js` may `require('./model')`; cross-feature goes via `service` function (now) → HTTP client (Stage 3). Verified via `grep` in CI.

---

## Getting Started

### Prerequisites
* Node 22, npm 11, MongoDB Atlas (or local `mongod`), Docker (for `infra/`)

### 1. Clone & install
```bash
git clone https://github.com/WHITEJACK5/white-collars.git
cd white-collars
npm install          # installs workspaces via Turborepo
```

### 2. Env
```bash
cp .env.example .env
# edit .env — required: MONGODB_URI, SESSION_SECRET (≥32 chars)
# optional: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (for npm run seed)
```

`.env.example` documents every var (`MONGODB_URI`, `SESSION_SECRET`, `SEED_ADMIN_*`, SMTP placeholders, `CSRF_SECRET`).

### 3. Seed (optional)
```bash
npm run seed   # uses src/shared/db + SEED_ADMIN_*; logs verify/reset URLs in dev
```

### 4. Run

**Monolith (Stage 1) — fastest for local dev:**
```bash
npm run dev          # nodemon server.js → http://localhost:3000
# or: npm --workspace apps/web run dev
```

**Monorepo (Stage 3) — isolated services:**
```bash
docker-compose -f infra/docker-compose.yml up --build
# gateway on :3000, users :3001, auth :3002, jobs :3003, applications :3004
# each service also: npm --workspace services/jobs-service run dev
```

**Build/test across packages:**
```bash
npm run build   # turbo run build (8 packages)
npm run test    # turbo run test
npm run lint
```

---

## Environment Variables

| Var | Required | Description |
|-----|----------|-------------|
| `MONGODB_URI` | **yes** | Atlas URI — app throws on boot if missing (no fallback) |
| `SESSION_SECRET` | **yes** | ≥32 chars random — throws if missing/short |
| `NODE_ENV` | no | `development` / `production` (controls HSTS, Secure cookie) |
| `PORT` / `*_SERVICE_PORT` | no | 3000 (gateway/web), 3001-3004 per service |
| `SEED_ADMIN_EMAIL` / `PASSWORD` | seed only | creates initial employer; password hashed via `User` hook |
| `USERS_SERVICE_URL` etc. | Stage 3 | `http://users-service:3001` (compose DNS) |

---

## API Contracts

Single source of truth: [`packages/api-contracts/`](packages/api-contracts/) (OpenAPI 3.0, versioned via `packages/api-contracts/package.json`).

| Contract | Service | Example Paths |
|----------|---------|---------------|
| `users.yaml` | `users-service:3001` | `POST /users`, `GET /users?email`, `GET /users/:id`, `POST /users/:id/verify-password` |
| `auth.yaml` | `auth-service:3002` | `POST /auth/signin`, `/signup`, `/forgot-password`, `/reset-password/{token}`, `GET /verify-email/{token}` |
| `jobs.yaml` | `jobs-service:3003` | `GET /jobs?page&limit&title`, `POST /jobs`, `GET /jobs/:id` (views++), `GET /companies`, `GET /companies/:slug` |
| `applications.yaml` | `applications-service:3004` | `POST /applications` (multipart resume/video), `GET /applications?jobId`, `PATCH /applications/:id/status` |
| `notifications.yaml` | `notifications-service` (internal) | `POST /notifications/email` (verify/reset/status) |

Every `src/*/service.js` function maps 1:1 to a contract path — see `packages/api-contracts/README.md` table.

---

## Security

* No `fallback-secret` — `server.js` throws if `SESSION_SECRET` missing
* `User.password` `select:false`, `pre('save')` hash `genSalt(12)`, `comparePassword()` single source
* CSP `script-src 'self'` (no `unsafe-inline` for JS), `style-src 'self' 'unsafe-inline'` interim for `style=""` attrs (migrate to classes to remove)
* CSRF double-submit cookie (`_csrf` cookie vs `X-CSRF-Token` header), session `SameSite=Lax`, `Secure` in prod
* Rate limiter: in-memory lazy expiry + prod warning to swap to Upstash Redis via `store` interface
* Uploads: `multer` with `fileFilter` (resume `pdf|doc|docx`, video `mp4|mov|webm|mkv`), `50MB` limit, `public/uploads/.gitkeep` kept

---

## Deployment

* **Vercel:** `vercel.json` builds `api/index.js` (`@vercel/node`), rewrites `/(.*)` → `/api/index.js`, headers include CSP/HSTS. Env vars set in Vercel dashboard (`MONGODB_URI`, `SESSION_SECRET`).
* **Docker (Stage 3):** per-service `Dockerfile` (`node:22-alpine`), `infra/docker-compose.yml` for local. No fake `k8s-manifests.yaml` — honest at this scale.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Turborepo — runs all `dev` in parallel |
| `npm run build` | `turbo run build` (8 workspaces) |
| `npm run test` | `turbo run test` |
| `npm run seed` | `node seed.js` (requires `.env` + Atlas) |
| `npm --workspace services/jobs-service run dev` | Run single service in isolation |

---

## Roadmap & Honest Ceiling

* Current: **Stage 3 monorepo** — `src/` decomposed, contracts versioned, gateway + 4 services independently buildable via `docker-compose`.
* Not doing (Stage 4): separate git repos per service, real K8s/Terraform, service mesh — would be cargo-cult at solo/small-team traffic. See `ARCHITECTURE.md` for triggers (e.g., `applications-service` video transcoding needs separate scaling → split `media-service`).
* Next if needed: Elasticsearch `search-service` (when `jobs-service` full-text needs it), S3 for uploads, Upstash Redis limiter, SMTP.

---

## Contributing & License

PRs via `main` → `git pull --rebase`, `turbo run lint` must pass. See `docs/service-boundaries.md` before adding cross-service calls.

MIT — see `LICENSE`.

---

## Interview Note

This repo is intentionally **staged** — the commit history shows `Stage 1 → Stage 2 → Stage 3` with verifiable checks (`grep` 0 cross-model imports, `node --check`, `turbo run build`). It is defensible as “we did the discipline before the network boundary” rather than a folder reshuffle.

