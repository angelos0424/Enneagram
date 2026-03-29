---
phase: 06
slug: coolify-launch-hardening
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for Coolify deployment hardening, privacy-safe share previews, and backup/restore readiness.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright + Next.js build + Docker build |
| **Config file** | `vitest.config.ts`, `playwright.config.ts`, `next.config.ts` |
| **Quick run command** | `npm exec vitest run test/ops/deployment-contract.test.ts` |
| **Full suite command** | `npm exec vitest run test/ops/deployment-contract.test.ts test/ops/health-route.test.ts test/assessment/public-result.test.ts test/ops/postgres-restore-runbook.test.ts && npm run typecheck && npm run build && docker build -t enneagram-phase06 . && npx playwright test test/e2e/public-result.spec.ts` |
| **Estimated runtime** | ~60-180 seconds plus manual restore drill |

---

## Sampling Rate

- **After every task commit:** run the task-local Vitest suite and `npm run typecheck` whenever shared env, metadata, or route files move.
- **After every plan wave:** run the touched-file Vitest coverage, then `npm run build`; add `docker build -t enneagram-phase06 .` once Docker artifacts exist.
- **Before `$gsd-verify-work`:** `npm exec vitest run test/ops/deployment-contract.test.ts test/ops/health-route.test.ts test/assessment/public-result.test.ts test/ops/postgres-restore-runbook.test.ts && npm run typecheck && npm run build && docker build -t enneagram-phase06 . && npx playwright test test/e2e/public-result.spec.ts`
- **Phase gate:** one successful non-production restore drill following the runbook and recording the timestamp/outcome.
- **Max feedback latency:** 60-180 seconds for automated checks; restore drill is manual and scheduled.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 06-01-01 | 01 | 1 | OPER-01 | deployment-contract | `npm exec vitest run test/ops/deployment-contract.test.ts` | ⬜ pending |
| 06-01-02 | 01 | 1 | OPER-01 | build/container | `npm exec vitest run test/ops/deployment-contract.test.ts && npm run build && docker build -t enneagram-phase06 .` | ⬜ pending |
| 06-02-01 | 02 | 2 | OPER-01 | env/health-tests | `npm exec vitest run test/ops/deployment-contract.test.ts test/ops/health-route.test.ts` | ⬜ pending |
| 06-02-02 | 02 | 2 | OPER-01 | route/build | `npm exec vitest run test/ops/deployment-contract.test.ts test/ops/health-route.test.ts && npm run typecheck && npm run build` | ⬜ pending |
| 06-03-01 | 03 | 3 | OPER-04 | metadata-contract | `npm exec vitest run test/assessment/public-result.test.ts` | ⬜ pending |
| 06-03-02 | 03 | 3 | OPER-04 | metadata/build/browser | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/public-result.spec.ts` | ⬜ pending |
| 06-04-01 | 04 | 4 | OPER-03 | restore-contract | `npm exec vitest run test/ops/postgres-restore-runbook.test.ts && npm run typecheck` | ⬜ pending |
| 06-04-02 | 04 | 4 | OPER-03 | rehearsal-gate | `npm exec vitest run test/ops/postgres-restore-runbook.test.ts && npm run build` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave Validation Notes

- No separate Wave 0 is needed; Vitest, Playwright, build verification, and Docker are already available in the workspace.
- `OPER-01` is not complete with documentation alone; the repo must build as a standalone Next.js image and expose a cheap process-level health endpoint for Coolify.
- `OPER-04` must preserve the existing privacy posture: `robots.noindex`, `robots.nofollow`, and `Referrer-Policy: no-referrer` stay in place while share previews gain server-generated metadata and an OG image route.
- `OPER-03` is not satisfied by “backup exists” prose. The plan must yield a restore runbook plus a rehearsal path that checks the actual app tables (`assessment_results`, `assessment_draft_sessions`, `admin_stats_events`) in a non-production restore target.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Coolify health check wiring matches the final application URL and port | OPER-01 | Coolify UI and deployment target are outside the repo | Deploy the built image in Coolify, point health checks to `/api/health`, and confirm the app stays healthy without DB-coupled restart loops |
| Backup schedule writes dumps to the intended S3-compatible bucket | OPER-03 | Bucket credentials and Coolify DB backup UI are operator-managed | Configure scheduled PostgreSQL backups on the Coolify database resource, trigger one on demand, and confirm the dump lands in the expected bucket/path |
| Restore rehearsal succeeds in a non-production PostgreSQL target | OPER-03 | The actual recovery environment is external to the repo | Restore the latest dump into a non-production Postgres target using the runbook, then verify `assessment_results`, `assessment_draft_sessions`, and `admin_stats_events` row visibility plus app read access against that target |
| Share previews render a safe summary card in the real channel | OPER-04 | Social crawlers and messaging apps cannot be fully simulated in-repo | Paste a public result URL into one target channel (for example KakaoTalk or Slack) and confirm the preview shows the OG image/title/description without exposing answer payloads or admin tokens |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verification path
- [x] Sampling continuity is maintained across all plans
- [x] Docker build verification is included for deployment hardening
- [x] Backup/restore includes a manual rehearsal gate, not docs-only acceptance
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** ready for execution planning and checker review
