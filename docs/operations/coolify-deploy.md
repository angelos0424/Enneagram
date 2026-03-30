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

## Failure Boundaries

- `/api/health` is a process-level liveness signal only and must not query PostgreSQL.
- PostgreSQL availability should be diagnosed separately from the Coolify app health check to avoid restart loops during transient database incidents.
