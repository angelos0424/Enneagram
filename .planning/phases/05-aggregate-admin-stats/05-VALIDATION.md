---
phase: 05
slug: aggregate-admin-stats
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for protected aggregate admin stats.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright + Next.js build/typecheck |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm exec vitest run test/admin/admin-auth.test.ts` |
| **Full suite command** | `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-events.test.ts test/admin/admin-stats-repository.test.ts test/admin/admin-dashboard.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts` |
| **Estimated runtime** | ~35-90 seconds |

---

## Sampling Rate

- **After every task commit:** run the task-local Vitest suite and `npm run typecheck` when shared types, env, or route files change.
- **After every plan wave:** run the touched-file Vitest coverage, then the relevant Playwright admin scenario once UI or auth navigation exists.
- **Before `$gsd-verify-work`:** `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-events.test.ts test/admin/admin-stats-repository.test.ts test/admin/admin-dashboard.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts`
- **Max feedback latency:** 35-90 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 1 | STAT-01 | auth/env | `npm exec vitest run test/admin/admin-auth.test.ts` | ⬜ pending |
| 05-01-02 | 01 | 1 | STAT-01 | protected-route | `npm exec vitest run test/admin/admin-auth.test.ts && npm run typecheck` | ⬜ pending |
| 05-02-01 | 02 | 2 | STAT-02, STAT-05 | schema/event-write | `npm exec vitest run test/admin/admin-stats-events.test.ts` | ⬜ pending |
| 05-02-02 | 02 | 2 | STAT-02, STAT-05 | route/integration | `npm exec vitest run test/admin/admin-stats-events.test.ts test/assessment/assessment-session-route.test.ts` | ⬜ pending |
| 05-03-01 | 03 | 3 | STAT-02, STAT-03, STAT-04, STAT-06 | repository/domain | `npm exec vitest run test/admin/admin-stats-repository.test.ts && npm run typecheck` | ⬜ pending |
| 05-03-02 | 03 | 3 | STAT-06 | suppression | `npm exec vitest run test/admin/admin-stats-repository.test.ts test/admin/admin-dashboard.test.ts` | ⬜ pending |
| 05-04-01 | 04 | 4 | STAT-01..06 | page/render | `npm exec vitest run test/admin/admin-dashboard.test.ts && npm run typecheck` | ⬜ pending |
| 05-04-02 | 04 | 4 | STAT-01..06 | browser/e2e | `npm run build && npx playwright test test/e2e/admin-stats.spec.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave Validation Notes

- No separate Wave 0 is needed; Vitest, Playwright, and production-build verification already exist in the repo.
- Keep admin verification app-owned and testable in-repo; do not assume reverse-proxy auth that the codebase cannot validate.
- All privacy suppression must be verified in repository/domain tests before dashboard rendering tests.
- Restart-click instrumentation should be validated through the dedicated shared-result restart boundary, not generic session delete behavior.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin dashboard remains readable on a narrow viewport | STAT-01..06 | Browser automation catches presence more than information density | Open `/admin` on a phone-sized viewport and confirm KPI cards, trend rows, and suppression messaging remain legible |
| Hidden cells do not become trivially derivable from visible totals | STAT-06 | Privacy reasoning spans multiple widgets, not one assertion | Review the dashboard with low-volume fixture data and confirm totals are omitted or masked when suppression is active |
| Login/logout flow feels operator-safe | STAT-01 | UX edge cases matter for protected screens | Verify wrong-password feedback, successful login redirect, and logout/session expiry behavior manually once implemented |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verification path
- [x] Sampling continuity is maintained across all plans
- [x] Existing browser infrastructure is sufficient for Phase 05
- [x] No watch-mode commands are specified
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** ready for execution planning and checker review
