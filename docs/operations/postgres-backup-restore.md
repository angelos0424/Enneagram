# PostgreSQL Backup And Restore Runbook

## Scope

This runbook covers the PostgreSQL state that backs permanent public results, anonymous draft recovery, and admin aggregate events. Recovery must prove the real application tables can be restored:

- `assessment_results`
- `assessment_draft_sessions`
- `admin_stats_events`

## Backup Policy

- Configure scheduled backups in `Coolify Database -> Backups`.
- Send scheduled backups to an `S3-compatible` object storage destination managed by operations.
- Keep the production PostgreSQL service and backup configuration on the Coolify database resource, not on the web app.
- Retain enough history to recover from operator error and recent data corruption.

## Restore Target Constraints

- Restore only into an `isolated non-production PostgreSQL target`.
- Use the `same major version` of PostgreSQL when possible.
- Do not rehearse against the production database.
- Use PostgreSQL client tools that match the target major version when running `pg_restore` or `psql`.

## Inputs Required Before Rehearsal

- A recent backup identifier from Coolify or the backing object storage.
- Connection details for the isolated restore target:
  - host
  - port
  - database
  - user
  - password
- A local path to the downloaded dump file.

## Restore Procedure

1. In Coolify, open `Coolify Database -> Backups` and trigger or select a recent backup.
2. Download the dump file from the configured backup storage.
3. Provision an isolated non-production PostgreSQL target.
4. Export the target connection variables and run the helper script, or follow the raw commands below.

```bash
export PGHOST="<target-host>"
export PGPORT="5432"
export PGDATABASE="<target-database>"
export PGUSER="<target-user>"
export PGPASSWORD="<target-password>"

pg_restore --verbose --clean -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" "<dump-file>"
```

If your dump format requires it, use `pg_restore --verbose --clean` with the matching custom-format dump produced by the PostgreSQL service. The rehearsal helper wraps the same command flow and post-restore verification queries.

## Post-Restore Verification

After restore, verify the expected application tables exist and return counts:

```sql
SELECT COUNT(*) AS assessment_results_count FROM assessment_results;
SELECT COUNT(*) AS assessment_draft_sessions_count FROM assessment_draft_sessions;
SELECT COUNT(*) AS admin_stats_events_count FROM admin_stats_events;
```

You can run the verification directly:

```bash
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
  -c "SELECT COUNT(*) AS assessment_results_count FROM assessment_results;"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
  -c "SELECT COUNT(*) AS assessment_draft_sessions_count FROM assessment_draft_sessions;"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
  -c "SELECT COUNT(*) AS admin_stats_events_count FROM admin_stats_events;"
```

Or use the helper:

```bash
./scripts/ops/rehearse-postgres-restore.sh --dump-file "<dump-file>"
```

## Evidence To Record

Complete `docs/operations/postgres-restore-checklist.md` after each rehearsal with:

- Backup ID
- Backup source
- Restore target
- Operator
- Verified at
- Outcome
- Verification notes for `assessment_results`, `assessment_draft_sessions`, and `admin_stats_events`

## Failure Handling

- If `pg_restore --verbose --clean` fails, stop and capture the error output before retrying.
- If any verification query fails, treat the rehearsal as failed even if the restore command returned success.
- If row counts look unexpectedly low or zero, compare the selected backup identifier with the intended recovery point before approving launch readiness.
