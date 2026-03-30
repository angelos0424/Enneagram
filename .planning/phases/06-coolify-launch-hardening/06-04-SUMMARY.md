---
phase: 06-coolify-launch-hardening
plan: 04
subsystem: operations
tags: [postgres, backup, restore, runbook, checklist, vitest]
provides:
  - Backup and restore runbook for the real PostgreSQL application tables
  - Restore rehearsal helper script and evidence checklist
  - Regression coverage tying the runbook to `assessment_results`, `assessment_draft_sessions`, and `admin_stats_events`
manual_checkpoint_pending: true
affects: [operations, backups, recovery, oper-03]
completed: 2026-03-30
---

# Phase 06 Plan 04: PostgreSQL Backup And Restore Summary

**Repo-owned backup/restore artifacts are in place and tested, but launch readiness still requires one operator-run non-production restore drill**

## What Landed

- `docs/operations/postgres-backup-restore.md` documents the Coolify backup source, isolated restore target constraints, `pg_restore --verbose --clean` flow, and post-restore verification queries.
- `docs/operations/postgres-restore-checklist.md` provides the evidence log for backup id, restore target, operator, timestamp, outcome, and per-table verification notes.
- `scripts/ops/rehearse-postgres-restore.sh` restores a dump into a non-production PostgreSQL target and verifies `assessment_results`, `assessment_draft_sessions`, and `admin_stats_events`.
- `test/ops/postgres-restore-runbook.test.ts` guards that the runbook and helper stay aligned with the real application tables and recovery steps.

## Verification

- `npm exec vitest run test/ops/postgres-restore-runbook.test.ts`
- `npm run build`

## Remaining Manual Gate

- Trigger or download a recent Coolify PostgreSQL backup.
- Restore it into an isolated non-production PostgreSQL target.
- Run `scripts/ops/rehearse-postgres-restore.sh --dump-file <path>`.
- Record the outcome in `docs/operations/postgres-restore-checklist.md`.

## Status

- Repo-side OPER-03 artifacts: complete
- Operator restore rehearsal: pending
