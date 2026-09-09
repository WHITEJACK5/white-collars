# infra — Honest Scope

At solo/small-team scale, `docker-compose.yml` is the correct infra abstraction.
We intentionally do **not** ship `k8s-manifests.yaml` or Terraform — that would be fake at this traffic/team size.

Stage 3 will add per-service `Dockerfile` under `services/*/Dockerfile` and a root `turbo.json`.
Real cloud infra (when needed): extract `infra/` to a separate repo with Terraform, one folder per service.
