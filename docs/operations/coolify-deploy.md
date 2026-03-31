# Coolify Deployment Runbook

## Topology

- Deploy the Next.js app as one Coolify application built from the checked-in `Dockerfile`.
- Deploy PostgreSQL as a separate Coolify PostgreSQL service with its own persistent volume.
- Do not run PostgreSQL inside the web app container.

## Web App Settings

- Build Pack: `Dockerfile`
- Port: `3000`
- Health Check Path: `/api/health`
- Health Check Expectation: HTTP `200` with a process-only JSON response
- Startup Command: the checked-in `Dockerfile` now runs `node scripts/ops/apply-db-migrations.cjs && node server.js`, so pending checked-in SQL migrations are applied before the Next.js server accepts traffic.

## Required Environment Variables

Map these values into the Coolify web application:

| Variable | Required | Notes |
|----------|----------|-------|
| `APP_ORIGIN` | Yes | Public production origin used for absolute metadata URLs, for example `https://enneagram.example.com` |
| `DATABASE_URL` | Yes | PostgreSQL connection string from the separate Coolify database service |
| `NODE_ENV` | Yes | Set to `production` |
| `ADMIN_PASSWORD` | Yes | Operator-only admin login secret, minimum 8 characters |
| `ADMIN_SESSION_SECRET` | Yes | Session signing secret, minimum 32 characters |

## Coolify PostgreSQL Service

- Create a dedicated PostgreSQL service instead of bundling a database into the app deployment.
- Attach persistent storage to the PostgreSQL service.
- Copy the generated PostgreSQL connection string into the app's `DATABASE_URL`.
- Keep backups and restore settings on the database service, not on the web app.

## Verification

After deployment:

1. Open the app URL and confirm the home page loads.
2. Request `/api/health` and confirm it returns HTTP `200`.
3. Confirm `/api/health` returns a JSON payload with `ok: true`, `service: "web"`, and `checks.process: "up"`.
4. Confirm the app can reach PostgreSQL through the configured `DATABASE_URL`.
5. Confirm the `assessment_results` table now includes `result_status` and `confidence_score` after the deployment migration step.

## Manual Recovery

If a deployment ever ships application code ahead of the database schema, run the checked-in migration helper against the production `DATABASE_URL` before retrying the web release:

```bash
DATABASE_URL="<production-database-url>" npm run db:migrate
```

For the current v2 rollout incident, the immediate fix is to apply `drizzle/0004_phase8_result_status_optional_wing.sql` or run `npm run db:migrate` against the same PostgreSQL service that the web app uses.

## Failure Boundaries

- `/api/health` is a process-level liveness signal only and must not query PostgreSQL.
- PostgreSQL availability should be diagnosed separately from the Coolify app health check to avoid restart loops during transient database incidents.
- If startup migration fails, keep the release unhealthy and inspect the migration logs before sending traffic to the new container.
