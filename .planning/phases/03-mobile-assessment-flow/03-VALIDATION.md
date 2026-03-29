---
phase: 03
slug: mobile-assessment-flow
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + Playwright mobile E2E + Next.js build/typecheck |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm exec vitest run test/assessment/assessment-session-route.test.ts` |
| **Full suite command** | `npm exec vitest run && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts` |
| **Estimated runtime** | ~40-90 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-local Vitest or Playwright command plus `npm run typecheck` when TSX or route files change.
- **After every plan wave:** Run touched-file Vitest coverage, then the relevant Playwright mobile scenario for session recovery or submit redirect, then `npm run typecheck`.
- **Before `$gsd-verify-work`:** `npm exec vitest run && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts`
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FLOW-01, FLOW-02 | component/integration | `npm exec vitest run test/assessment/mobile-flow.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | FLOW-02, FLOW-03 | component/integration | `npm exec vitest run test/assessment/mobile-flow.test.ts && npm run typecheck` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | FLOW-04 | browser-harness | `npx playwright test --list` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | FLOW-04 | route/schema | `npm exec vitest run test/assessment/assessment-session-route.test.ts && npm run typecheck && npm exec drizzle-kit generate && git diff --exit-code -- drizzle src/db/schema.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | FLOW-04 | integration/e2e | `npm exec vitest run test/assessment/assessment-session-route.test.ts test/assessment/mobile-flow.test.ts && npm run typecheck && npx playwright test test/e2e/mobile-assessment.spec.ts -g "restores draft after refresh"` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | FLOW-05 | route/integration | `npm exec vitest run test/assessment/score-route.test.ts test/assessment/assessment-session-route.test.ts test/assessment/assessment-submit.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | FLOW-05 | end-to-end integration | `npm exec vitest run test/assessment/assessment-submit.test.ts test/assessment/mobile-flow.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts -g "submits completed assessment"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — mobile browser test harness
- [ ] `test/e2e/mobile-assessment.spec.ts` — anonymous start, cookie-backed refresh recovery, and submit redirect coverage
- [ ] `test/assessment/assessment-session-route.test.ts` — start/load/update/finalize route coverage for anonymous draft sessions
- [ ] `test/assessment/mobile-flow.test.ts` — progress, mobile question flow, and client hydration coverage
- [ ] `test/assessment/assessment-submit.test.ts` — submit integration, route error handling, and redirect target contract

Existing infrastructure covers Vitest route mocking and type/build verification; Playwright must be added in Phase 3 implementation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile tap comfort and question readability on a narrow viewport | FLOW-02 | Real-device spacing, thumb reach, and perceived density are not reliably captured by unit tests | Run the app on a phone-sized viewport, answer several questions, and confirm controls stay readable and easy to tap without horizontal overflow |
| Refresh/resume behavior feels understandable to users | FLOW-04 | Correctness is now browser-automated, but user comprehension of restored progress is still experiential | Start answering, refresh mid-flow, confirm prior answers and progress are restored in an obvious way, then submit and verify the resumed state is clearly gone after success |
| Submit redirect and result handoff feel smooth on a phone-sized viewport | FLOW-05 | Redirect correctness can be browser-tested, but perceived transition quality and readability still need manual review | Complete the flow on a phone-sized viewport, submit, confirm the redirect lands on the public result page without jarring layout breakage, then start a fresh assessment |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify expectations or explicit Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing test references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-29
