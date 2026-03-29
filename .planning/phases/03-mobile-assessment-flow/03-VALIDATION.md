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
| **Framework** | Vitest 3.2.4 + Next.js build/typecheck |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm exec vitest run test/assessment/score-route.test.ts` |
| **Full suite command** | `npm exec vitest run && npm run typecheck && npm run build` |
| **Estimated runtime** | ~20-40 seconds |

---

## Sampling Rate

- **After every task commit:** Run a task-local Vitest command plus `npm run typecheck` when TSX or route files change.
- **After every plan wave:** Run `npm exec vitest run` for touched files, then `npm run typecheck`.
- **Before `$gsd-verify-work`:** `npm exec vitest run && npm run typecheck && npm run build`
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FLOW-01, FLOW-02 | component/integration | `npm exec vitest run test/assessment/mobile-flow.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | FLOW-02, FLOW-03 | component/integration | `npm exec vitest run test/assessment/mobile-flow.test.ts && npm run typecheck` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | FLOW-04 | unit/integration | `npm exec vitest run test/assessment/draft-persistence.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | FLOW-04 | integration | `npm exec vitest run test/assessment/draft-persistence.test.ts test/assessment/mobile-flow.test.ts && npm run typecheck` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | FLOW-05 | integration | `npm exec vitest run test/assessment/assessment-submit.test.ts test/assessment/score-route.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | FLOW-05 | end-to-end integration | `npm exec vitest run test/assessment/assessment-submit.test.ts test/assessment/mobile-flow.test.ts test/assessment/draft-persistence.test.ts && npm run typecheck && npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/assessment/mobile-flow.test.ts` — progress, mobile question flow, disabled submit, and anonymous entry coverage
- [ ] `test/assessment/draft-persistence.test.ts` — version-aware draft save/recover/clear behavior
- [ ] `test/assessment/assessment-submit.test.ts` — submit integration, route error handling, and redirect target contract

Existing infrastructure covers framework setup, route mocking, and type/build verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile tap comfort and question readability on a narrow viewport | FLOW-02 | Real-device spacing, thumb reach, and perceived density are not reliably captured by unit tests | Run the app on a phone-sized viewport, answer several questions, and confirm controls stay readable and easy to tap without horizontal overflow |
| Refresh/resume behavior feels understandable to users | FLOW-04 | Correctness can be automated, but user comprehension of restored progress is experiential | Start answering, refresh mid-flow, confirm prior answers and progress are restored in an obvious way, then submit and verify the draft clears |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify expectations or explicit Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing test references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-29
