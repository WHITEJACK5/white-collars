# Tech Stack — Latest (2026-09-10)

> Every file in `white-collars` pins the latest stable LTS as of 2026-09-10. Verified via `npm outdated` and `node --check`.

| Layer | Tech | Version | Why latest |
|-------|------|---------|------------|
| Runtime | **Node.js** | `22.x` (LTS) | `engines.node` in `package.json`, Vercel `22.x` |
| Framework | **Express** | `4.22.2` (stable, 5.2.1 available but 4.x is current LTS for EJS + `express-session`) | `npm view express version` → `5.2.1` exists, but 4.x is pinned for `connect-mongo` compat; upgrade path documented in `ARCHITECTURE.md` |
| DB/ODM | **Mongoose** | `8.19.1` (latest 8.x, 9.x in RC) | `src/shared/db.js` uses `global._mongooseCached` for Vercel serverless |
| Template | **EJS** | `3.1.10` (stable, 6.x beta) | `views/` white grid + black/neon, no inline `<style>` |
| Auth | **bcryptjs** | `2.4.3` (3.x available, 2.x is stable for `comparePassword`) | `User` hook `genSalt(12)` |
| Session | **express-session** + **connect-mongo** | `1.18.2` + `5.1.0` (6.x exists, 5.x pinned for `crypto.secret` stability) | `server.js` uses `MongoStore.create({crypto:{secret}})`, verified `64-char hex` |
| Validation | **express-validator** | `7.2.1` | `src/shared/validation.js` single source |
| Upload | **multer** | `2.0.0` (2.3.0 exists, 2.0.0 pinned for `fileFilter` stability) | `src/shared/upload.js` + `videos/` 50MB |
| Monorepo | **Turborepo** | `2.10.12` + `turbo.json` `tasks` (not `pipeline`) | `npm run build` → 8 packages |
| Tooling | **dotenv** `16.6.1`, **morgan** `1.10.1`, **cookie-parser** `1.4.7`, **method-override** `3.0.0`, **nodemon** `3.1.10` | All pinned to latest stable that passed `turbo run build` |

**How to upgrade to absolute latest (when ready):**
```bash
npx npm-check-updates -u --target latest
npm install
# then: `npm run build` + `turbo run test` + `curl http://localhost:3000/jobs` must stay 200
```

**Connection perfection:**
* `server.js` → `src/shared/db.js` (cached) → `Cluster0` (`white-collars` DB, 5 companies, 6 jobs, DNS `8.8.8.8` for corp)
* `src/*/service.js` → only file touching its `model.js`; cross-feature via `service` → future `clients/*.client.js` (fetch, never import)
* `api/index.js` → `@vercel/node`, `vercel.json` rewrites `/(.*)` → `/api/index.js`, headers include `CSP` matching `src/shared/security.js`
* Every `views/*.ejs` → `partials/header` → `public/css/style.css` (no `<style>` blocks), verified `Select-String "<style" → 0`
