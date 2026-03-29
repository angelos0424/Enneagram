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
| **Framework** | Vitest 3.2.4 + Playwright E2E + Next.js build/typecheck |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm exec vitest run test/assessment/public-result.test.ts` |
| **Full suite command** | `npm exec vitest run test/assessment/public-result.test.ts test/assessment/score-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts test/e2e/public-result.spec.ts` |
| **Estimated runtime** | ~45-90 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-local Vitest or Playwright command plus `npm run typecheck` when TSX, route, or domain types change.
- **After every plan wave:** Run touched-file Vitest coverage, then the relevant Playwright scenario for result landing or public-result loop behavior, then `npm run typecheck`.
- **Before `$gsd-verify-work`:** `npm exec vitest run test/assessment/public-result.test.ts test/assessment/score-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts test/e2e/public-result.spec.ts`
- **Max feedback latency:** 45-90 seconds including browser coverage

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | RSLT-05, RSLT-06 | domain/route | `npm exec vitest run test/assessment/public-result.test.ts` | ✅ existing | ⬜ pending |
| 04-01-02 | 01 | 1 | RSLT-01, RSLT-05, RSLT-06 | integration | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ✅ existing | ⬜ pending |
| 04-02-01 | 02 | 2 | RSLT-01, RSLT-02, RSLT-03, RSLT-04 | integration | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ✅ existing | ⬜ pending |
| 04-02-02 | 02 | 2 | SHAR-04, SHAR-05 | browser/integration | `npm exec vitest run test/assessment/public-result.test.ts && npm run build && npx playwright test test/e2e/mobile-assessment.spec.ts -g "redirects to the saved public result page after submit"` | ✅ existing | ⬜ pending |
| 04-03-01 | 03 | 3 | SHAR-02, SHAR-07 | component/integration | `npm exec vitest run test/assessment/public-result.test.ts && npm run typecheck` | ✅ existing | ⬜ pending |
| 04-03-02 | 03 | 3 | SHAR-02, SHAR-04, SHAR-05, SHAR-07 | browser/e2e | `npm exec vitest run test/assessment/public-result.test.ts test/assessment/score-route.test.ts && npm run typecheck && npm run build && npx playwright test test/e2e/public-result.spec.ts` | ❌ to add | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `test/assessment/public-result.test.ts` — current immutable public-result regression baseline exists and can be extended
- [x] `test/e2e/mobile-assessment.spec.ts` — current browser flow already lands on `/results/{publicId}`
- [ ] `test/e2e/public-result.spec.ts` — direct public-result page share/CTA loop coverage to add during execution
- [ ] Optional share-controls test file if browser APIs are abstracted into a dedicated client utility/component

No new foundational tooling is required; Phase 3 already established the route, browser, and build harnesses this phase should extend.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real native share sheet invocation on mobile | SHAR-02 | `navigator.share` support and OS share-sheet presentation are not deterministic in automation | Open a saved result on a mobile device, tap the share control, and confirm the native share sheet opens with the result URL |
| Result hierarchy readability on a narrow viewport | RSLT-01, RSLT-03, RSLT-05 | Automated tests cannot judge visual emphasis or reading comfort | Open the result page on a phone-sized viewport and confirm the primary type is visually dominant and supporting sections are readable without horizontal overflow |
| CTA clarity for shared-result visitors | SHAR-04, SHAR-05, SHAR-07 | Correct navigation can be automated, but “what do I do next?” clarity is experiential | Visit a public result link as if shared by another user, verify the top CTA is immediately visible, and confirm the recommendation section clearly suggests restart/share next steps |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify expectations
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Existing Phase 3 infrastructure removes the need for Wave 0 setup work
- [x] No watch-mode flags
- [ ] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution; Phase 4 should extend existing public-result and browser coverage rather than introducing a new verification stack.
