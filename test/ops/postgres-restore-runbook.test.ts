import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(__dirname, "../..");
const runbookPath = path.join(projectRoot, "docs/operations/postgres-backup-restore.md");
const checklistPath = path.join(projectRoot, "docs/operations/postgres-restore-checklist.md");
const scriptPath = path.join(projectRoot, "scripts/ops/rehearse-postgres-restore.sh");

const requiredTables = [
  "assessment_results",
  "assessment_draft_sessions",
  "admin_stats_events",
] as const;

describe("postgres restore runbook contract", () => {
  it("checks in the runbook, checklist, and rehearsal helper", () => {
    expect(existsSync(runbookPath)).toBe(true);
    expect(existsSync(checklistPath)).toBe(true);
    expect(existsSync(scriptPath)).toBe(true);
  });

  it("keeps the runbook explicit about scheduled backups, restore flow, and verification queries", () => {
    const runbook = readFileSync(runbookPath, "utf8");

    expect(runbook).toContain("Coolify Database -> Backups");
    expect(runbook).toMatch(/scheduled backups?/i);
    expect(runbook).toMatch(/S3-compatible/i);
    expect(runbook).toMatch(/isolated non-production PostgreSQL target/i);
    expect(runbook).toMatch(/same major version/i);
    expect(runbook).toContain("pg_restore --verbose --clean");

    for (const table of requiredTables) {
      expect(runbook).toContain(table);
      expect(runbook).toContain(`SELECT COUNT(*) AS ${table}_count FROM ${table};`);
    }
  });

  it("keeps the rehearsal helper aligned with the real application tables and restore command", () => {
    const script = readFileSync(scriptPath, "utf8");

    expect(script).toContain("pg_restore --verbose --clean");

    for (const table of requiredTables) {
      expect(script).toContain(table);
      expect(script).toContain(`SELECT COUNT(*) AS ${table}_count FROM ${table};`);
    }
  });

  it("reserves evidence fields in the restore checklist", () => {
    const checklist = readFileSync(checklistPath, "utf8");

    expect(checklist).toMatch(/Backup ID/i);
    expect(checklist).toMatch(/Backup source/i);
    expect(checklist).toMatch(/Restore target/i);
    expect(checklist).toMatch(/Operator/i);
    expect(checklist).toMatch(/Verified at/i);
    expect(checklist).toMatch(/Outcome/i);

    for (const table of requiredTables) {
      expect(checklist).toContain(table);
    }
  });
});
