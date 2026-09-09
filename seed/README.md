# Seed fixtures

These JSON files are **example seed data** stripped of credentials. Never commit real password hashes.

- `companies.json` — example companies (no secrets)
- `jobs.json` — example jobs (references company slugs; resolved at seed time)
- `users.json` — example users **without** password hashes. Seed script hashes `SEED_ADMIN_PASSWORD` at runtime.

To seed locally:
```
npm run seed
# requires MONGODB_URI, SESSION_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD in .env
```

**Git history warning**: real password hashes were previously committed in `models/*.json`. Rotate any real credentials that were exposed, and rewrite history with `git filter-repo` or BFG:
```
git filter-repo --path models/User.json --path models/job.json --path models/company.json --path routes/companies.json --invert-paths
```
Then force-push and rotate `SESSION_SECRET` / `MONGODB_URI` credentials.
