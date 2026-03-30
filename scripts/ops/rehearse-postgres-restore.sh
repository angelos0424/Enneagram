#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/ops/rehearse-postgres-restore.sh --dump-file <path>

Required environment:
  PGHOST         Restore target host
  PGPORT         Restore target port
  PGDATABASE     Restore target database
  PGUSER         Restore target user
  PGPASSWORD     Restore target password

This helper restores a dump into an isolated non-production PostgreSQL target
and then verifies the application tables used by the app:
  - assessment_results
  - assessment_draft_sessions
  - admin_stats_events
EOF
}

DUMP_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dump-file)
      DUMP_FILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$DUMP_FILE" ]]; then
  echo "--dump-file is required." >&2
  usage >&2
  exit 1
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file not found: $DUMP_FILE" >&2
  exit 1
fi

required_env=(PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD)

for name in "${required_env[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
done

echo "Rehearsing restore into isolated non-production PostgreSQL target:"
echo "  host: $PGHOST"
echo "  port: $PGPORT"
echo "  database: $PGDATABASE"
echo "  user: $PGUSER"

pg_restore --verbose --clean -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" "$DUMP_FILE"

queries=(
  "SELECT COUNT(*) AS assessment_results_count FROM assessment_results;"
  "SELECT COUNT(*) AS assessment_draft_sessions_count FROM assessment_draft_sessions;"
  "SELECT COUNT(*) AS admin_stats_events_count FROM admin_stats_events;"
)

for query in "${queries[@]}"; do
  echo
  echo "Running verification query: $query"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "$query"
done

echo
echo "Restore rehearsal completed. Record Backup ID, backup source, restore target, operator, verified at, and outcome in docs/operations/postgres-restore-checklist.md."
