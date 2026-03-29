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

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright admin/public E2E + Next.js build/typecheck |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm exec vitest run test/admin/admin-auth.test.ts` |
| **Full suite command** | `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-repository.test.ts test/admin/admin-stats-route.test.ts test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts test/assessment/public-result.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts test/e2e/public-result.spec.ts` |
| **Estimated runtime** | ~45-90 seconds |

---

## Sampling Rate

- **After every task commit:** run the task-local Vitest suite and `npm run typecheck` when route, schema, or shared domain files change.
- **After every wave:** run all Vitest coverage touched in that wave, then the relevant browser scenario for the public-result restart loop or protected admin flow.
- **Before `$gsd-verify-work`:** `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-repository.test.ts test/admin/admin-stats-route.test.ts test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts test/assessment/public-result.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts test/e2e/public-result.spec.ts`
- **Max feedback latency:** 45-90 seconds.

---

## Plan And Wave Graph

| Plan | Wave | Depends On | Scope | Primary Automated Commands |
|------|------|------------|-------|-----------------------------|
| `05-01` | 1 | none | admin auth contract, login route, protected boundary | `npm exec vitest run test/admin/admin-auth.test.ts && npm run typecheck` |
| `05-02` | 1 | none | append-only stats events, start/restart persistence | `npm exec vitest run test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts test/assessment/public-result.test.ts && npm run typecheck` |
| `05-03` | 2 | `05-01`, `05-02` | suppressed aggregate read model and protected stats API | `npm exec vitest run test/admin/admin-stats-repository.test.ts test/admin/admin-stats-route.test.ts && npm run typecheck` |
| `05-04` | 3 | `05-03` | protected admin dashboard and full browser proof | `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts test/e2e/public-result.spec.ts` |

Wave 1 is intentionally parallel: auth and event capture do not need to share files. The aggregate read layer waits until both boundaries are fixed, and the admin UI waits until the protected API returns already-suppressed DTOs.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 1 | STAT-01 | auth/session | `npm exec vitest run test/admin/admin-auth.test.ts` | ⬜ pending |
| 05-01-02 | 01 | 1 | STAT-01 | page/route guard | `npm exec vitest run test/admin/admin-auth.test.ts && npm run typecheck` | ⬜ pending |
| 05-02-01 | 02 | 1 | STAT-02, STAT-05 | schema/event writes | `npm exec vitest run test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts && npm run typecheck` | ⬜ pending |
| 05-02-02 | 02 | 1 | STAT-02, STAT-05 | restart persistence | `npm exec vitest run test/assessment/assessment-session-route.test.ts test/assessment/public-result.test.ts test/assessment/score-route.test.ts && npm run typecheck` | ⬜ pending |
| 05-03-01 | 03 | 2 | STAT-02, STAT-03, STAT-04, STAT-05, STAT-06 | suppression/repository | `npm exec vitest run test/admin/admin-stats-repository.test.ts && npm run typecheck` | ⬜ pending |
| 05-03-02 | 03 | 2 | STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06 | protected API | `npm exec vitest run test/admin/admin-stats-repository.test.ts test/admin/admin-stats-route.test.ts && npm run typecheck` | ⬜ pending |
| 05-04-01 | 04 | 3 | STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06 | admin render | `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-route.test.ts && npm run typecheck` | ⬜ pending |
| 05-04-02 | 04 | 3 | STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06 | browser/full-story | `npm exec vitest run test/admin/admin-auth.test.ts test/admin/admin-stats-repository.test.ts test/admin/admin-stats-route.test.ts test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts test/assessment/public-result.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/admin-stats.spec.ts test/e2e/public-result.spec.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave Validation Notes

- No extra Wave 0 is required. Existing Vitest and Playwright infrastructure from Phases 3 and 4 already covers route and mobile browser verification.
- The admin stats API must only return already-suppressed DTOs; tests should fail if raw low-count buckets can reach the UI boundary.
- Public-result restart verification should prove the event is written from the server mutation boundary, not from a client-only click handler.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin page reads clearly on a narrow laptop or tablet viewport | STAT-02..05 | Automation proves presence and auth flow, not operator readability | Log in at `/admin/login`, open the dashboard, and confirm daily cards/distribution sections remain understandable without exposing hidden-cell counts |
| Suppressed cells communicate privacy intent clearly | STAT-06 | The wording and visual treatment are product-facing decisions | Confirm hidden rows/days are labeled as suppressed or hidden rather than shown as blank or `0` |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verification path
- [x] Sampling continuity is maintained across all four plans
- [x] Browser verification covers both the protected admin path and the share-loop event source
- [x] No watch-mode commands are specified
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** ready for planning and checker review
