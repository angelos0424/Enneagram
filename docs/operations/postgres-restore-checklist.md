# PostgreSQL Restore Rehearsal Checklist

Use this checklist to leave evidence for each non-production restore drill.

## Restore Evidence

| Field | Value |
|-------|-------|
| Backup ID | |
| Backup source | |
| Restore target | |
| Operator | |
| Verified at | |
| Outcome | |

## Verification Queries

- `SELECT COUNT(*) AS assessment_results_count FROM assessment_results;`
- `SELECT COUNT(*) AS assessment_draft_sessions_count FROM assessment_draft_sessions;`
- `SELECT COUNT(*) AS admin_stats_events_count FROM admin_stats_events;`

## Verification Notes

| Table | Result | Notes |
|-------|--------|-------|
| assessment_results | | |
| assessment_draft_sessions | | |
| admin_stats_events | | |

## Sign-Off

- [ ] Backup file came from the intended Coolify backup set.
- [ ] Restore ran against an isolated non-production PostgreSQL target.
- [ ] Verification queries completed for all required application tables.
- [ ] Any failures or anomalies were recorded before the drill was closed.
