---
phase: 03-mobile-assessment-flow
plan: 04
subsystem: ui
tags: [nextjs, react, vitest, playwright, postgres]
requires:
  - phase: 03-mobile-assessment-flow
    provides: route-backed anonymous draft bootstrap and autosave flow
provides:
  - successful submit finalizes canonical anonymous draft sessions on the server
  - mobile submit UI redirects strictly from server-returned public result links
  - browser coverage proves submit redirect and fresh-start behavior after success
affects: [04-result-interpretation-share-loop, anonymous-session-flow, public-results]
tech-stack:
  added: []
  patterns:
    - shared cookie-store helpers for anonymous assessment session access
    - client submit boundary that consumes score-route responses and server error payloads
key-files:
  created:
    - src/features/assessment/submit-assessment.ts
  modified:
    - src/app/api/assessments/score/route.ts
    - src/db/repositories/assessment-draft-session-repository.ts
    - src/features/assessment/use-assessment-draft.ts
    - src/features/assessment/assessment-experience.tsx
    - test/e2e/mobile-assessment.spec.ts
key-decisions:
  - "Successful submit finalization stays server-authoritative by deleting the canonical anonymous draft only after snapshot persistence succeeds."
  - "The client redirects only from `publicResult.href` returned by `/api/assessments/score`, never by rebuilding result URLs locally."
  - "The home assessment route is forced dynamic so the shipped anonymous flow validates against runtime behavior instead of brittle static prerendering."
patterns-established:
  - "Anonymous session access: route handlers read `assessment_session` through `readAssessmentDraftSessionTokenFromCookieStore`."
  - "Submit boundary: UI state and redirects flow through `submit-assessment.ts`, with retryable errors surfaced without clearing answers."
requirements-completed: [FLOW-05]
duration: 13min
completed: 2026-03-29
---

# Phase 03 Plan 04: Mobile Assessment Submit Summary

**Authoritative mobile submit finalization with server draft cleanup, strict public-result redirects, and browser-verified fresh-start recovery**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-29T13:42:00Z
- **Completed:** 2026-03-29T13:55:22Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- The score route now finalizes canonical anonymous draft sessions only after the immutable result snapshot is saved successfully.
- The mobile assessment flow can submit completed answers, show pending and retryable error states, and redirect via the server-returned `publicResult.href`.
- Browser coverage now proves that a successful mobile submit lands on `/results/{publicId}` and that a new visit to `/` starts from a fresh anonymous draft.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend the server submit path to finalize canonical draft sessions on success** - `364715e` (feat)
2. **Task 2: Wire submit UI, retry states, and browser redirect verification to the finalized session flow** - `9df386e` (feat)

Additional task-related fix:

- `707be75` (fix) - stabilized Playwright dev-server startup by removing `.next` deletion from the browser test web-server command

## Files Created/Modified
- `src/features/assessment/submit-assessment.ts` - client submit boundary for posting canonical answers and reading `publicResult.href`
- `src/app/api/assessments/score/route.ts` - finalizes canonical draft sessions after successful snapshot persistence
- `src/db/repositories/assessment-draft-session-repository.ts` - explicit draft finalization boundary over delete semantics
- `src/domain/assessment/draft-session.ts` - shared helper for reading the anonymous session token from cookie stores
- `src/features/assessment/use-assessment-draft.ts` - submit pending/error state management that preserves retryable answers
- `src/features/assessment/assessment-experience.tsx` - mobile CTA pending state, error rendering, and redirect handoff
- `src/db/repositories/assessment-result-repository.ts` - in-memory result persistence mode for Playwright submit verification in this workspace
- `test/assessment/score-route.test.ts` - submit success/failure cleanup regression coverage
- `test/assessment/assessment-submit.test.ts` - submit boundary coverage for request shape, redirect contract, and server errors
- `test/e2e/mobile-assessment.spec.ts` - mobile submit redirect and post-submit fresh-start coverage

## Decisions Made

- Server cleanup remains authoritative: the canonical draft row is finalized only after snapshot save completes, so failed submits leave retryable draft state intact.
- Redirect generation remains server-owned: the client consumes `publicResult.href` directly instead of interpolating `/results/{id}` itself.
- The mobile assessment home page is runtime-rendered (`force-dynamic`) because this phase depends on the anonymous session runtime path, not static export behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Repaired Next.js flat ESLint config for build verification**
- **Found during:** Task 2
- **Issue:** `next build` failed because the repo ESLint config was not exporting a valid flat-config array for the current Next.js build pipeline.
- **Fix:** Switched `eslint.config.mjs` to a `FlatCompat`-based flat-config export array.
- **Files modified:** `eslint.config.mjs`
- **Verification:** `npm run build`
- **Committed in:** `9df386e`

**2. [Rule 3 - Blocking] Avoided brittle home-page prerender failures during build**
- **Found during:** Task 2
- **Issue:** `next build` failed while prerendering `/`, even though the anonymous assessment flow is meant to run against request-time session behavior.
- **Fix:** Marked `src/app/page.tsx` as `force-dynamic` so build verification matches the runtime assessment experience.
- **Files modified:** `src/app/page.tsx`
- **Verification:** `npm run build`
- **Committed in:** `9df386e`

**3. [Rule 3 - Blocking] Stabilized Playwright submit verification in the shared parallel workspace**
- **Found during:** Task 2
- **Issue:** Browser submit verification needed result persistence without local PostgreSQL, and dev-server startup was racing when `.next` was deleted before `next dev`.
- **Fix:** Added in-memory assessment result repository support for test runs and configured Playwright to run `next dev` with in-memory draft/result flags but without deleting `.next` on startup.
- **Files modified:** `src/db/repositories/assessment-result-repository.ts`, `playwright.config.ts`
- **Verification:** `npx playwright test test/e2e/mobile-assessment.spec.ts -g "redirects to the saved public result page after submit"`
- **Committed in:** `9df386e`, `707be75`

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All deviations were required to complete the planned verification in this shared workspace. No product scope changed beyond making the intended submit flow verifiable and buildable.

## Issues Encountered

- Clean builds in this parallel workspace were more reliable after explicitly removing stale `.next` output before `npm run build`.
- Playwright dev-server logs still emit a Next.js `allowedDevOrigins` warning for `127.0.0.1`, but it does not block the mobile submit flow or test pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 now satisfies FLOW-05 and hands Phase 4 a stable public-result redirect contract rooted in persisted snapshots.
- The next phase can focus on interpreting and sharing stored results without revisiting anonymous draft finalization semantics.

## Self-Check: PASSED

- Found `.planning/phases/03-mobile-assessment-flow/03-04-SUMMARY.md`
- Found commit `364715e`
- Found commit `9df386e`
- Found commit `707be75`
