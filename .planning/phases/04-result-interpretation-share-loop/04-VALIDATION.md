---
phase: 04
slug: result-interpretation-share-loop
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright public/mobile E2E + Next.js build/typecheck |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm exec vitest run test/assessment/public-result.test.ts` |
| **Full suite command** | `npm exec vitest run test/assessment/result-contract.test.ts test/assessment/public-result.test.ts test/assessment/assessment-session-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts test/e2e/public-result.spec.ts` |
| **Estimated runtime** | ~30-75 seconds |

---

## Sampling Rate

- **After every task commit:** run the task-local Vitest suite plus `npm run typecheck` when shared types or route files change.
- **After every plan wave:** run the touched-file Vitest coverage, then the relevant Playwright public-result or submit-flow scenario.
- **Before `$gsd-verify-work`:** `npm exec vitest run test/assessment/result-contract.test.ts test/assessment/public-result.test.ts test/assessment/assessment-session-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts test/e2e/public-result.spec.ts`
- **Max feedback latency:** 30-75 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | RSLT-05, RSLT-06, SHAR-07 | contract/content | `npm exec vitest run test/assessment/result-contract.test.ts test/assessment/public-result.test.ts` | ⬜ pending |
| 04-01-02 | 01 | 1 | RSLT-02, RSLT-04 | server/view-model | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ⬜ pending |
| 04-02-01 | 02 | 2 | RSLT-01, RSLT-03 | render/layout | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ⬜ pending |
| 04-02-02 | 02 | 2 | RSLT-01..06 | build/render | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck && npm run build` | ⬜ pending |
| 04-03-01 | 03 | 3 | SHAR-02 | client/share | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ⬜ pending |
| 04-03-02 | 03 | 3 | SHAR-02 | browser/share | `npx playwright test test/e2e/public-result.spec.ts -g "shares or copies the public result link"` | ⬜ pending |
| 04-04-01 | 04 | 4 | SHAR-04, SHAR-05 | loop/cta | `npm exec vitest run test/assessment/public-result.test.ts test/assessment/assessment-session-route.test.ts && npm run typecheck` | ⬜ pending |
| 04-04-02 | 04 | 4 | SHAR-05, SHAR-07 | end-to-end | `npm exec vitest run test/assessment/public-result.test.ts test/assessment/assessment-session-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/public-result.spec.ts -g "returns shared-result visitors to a fresh assessment"` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave Validation Notes

- No separate Wave 0 is required. Vitest and Playwright infrastructure already exists from Phases 2 and 3.
- Use a dedicated `test/e2e/public-result.spec.ts` once share and restart-loop behaviors land, rather than overloading the submit-flow spec.
- Public result tests must continue to prove immutable snapshot rendering and absence of rescoring.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero hierarchy and long-scroll readability on a phone viewport | RSLT-01..06 | Browser automation catches presence, not visual rhythm | Open a public result on a narrow viewport and confirm the primary type, distribution, cards, and disclaimer read in a clear order without cramped sections |
| Native share availability and clipboard fallback messaging | SHAR-02 | Browser environments vary in `navigator.share` support | Verify one environment with native share and one fallback path where only clipboard copy is available |
| CTA loop feels like a fresh start rather than a resumed draft | SHAR-05 | The desired behavior is experiential as well as functional | Open a shared result, tap `검사해보기`, and confirm the explicit reset path lands on a fresh assessment start |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verification path
- [x] Sampling continuity is maintained across all plans
- [x] Existing browser infrastructure is sufficient for Phase 4
- [x] No watch-mode commands are specified
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** ready for planning and checker review
