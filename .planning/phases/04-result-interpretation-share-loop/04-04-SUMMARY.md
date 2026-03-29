---
phase: 04-result-interpretation-share-loop
plan: 04
subsystem: public-results
tags: [nextjs, react, vitest, playwright, restart-loop]
requires:
  - phase: 04-result-interpretation-share-loop
    provides: result-first public-result layout and share action surface
provides:
  - always-visible public-result restart CTA
  - explicit delete boundary for clearing canonical draft sessions before returning home
  - recommendation section finish with stable follow-up actions
affects: [public-results, assessment-session, share-loop]
tech-stack:
  added: []
  patterns:
    - restart behavior is isolated in a small client CTA that calls an explicit server delete boundary
    - recommendation links can point to on-page continuation anchors instead of mutating routes
key-files:
  created:
    - src/app/results/[publicId]/public-result-restart-cta.tsx
    - src/app/results/[publicId]/result-recommendations.tsx
  modified:
    - src/app/api/assessment-session/route.ts
    - src/app/results/[publicId]/result-snapshot-view.tsx
    - src/content/type-copy/ko/v1.ts
    - test/assessment/assessment-session-route.test.ts
    - test/assessment/public-result.test.ts
    - test/e2e/public-result.spec.ts
key-decisions:
  - "The restart loop reuses DELETE /api/assessment-session instead of adding a new route surface, keeping the fresh-start boundary explicit without destabilizing the production build."
  - "Recommendation links point back to the visible restart CTA anchor rather than a bare navigation to `/`."
patterns-established:
  - "Shared-result visitors return to a fresh anonymous assessment only after the canonical draft cookie and server draft state are cleared."
requirements-completed: [SHAR-04, SHAR-05, SHAR-07]
duration: 14min
completed: 2026-03-29
---

# Phase 04 Plan 04: Fresh-Start Loop Summary

**Closed the result-share loop with a visible restart CTA, explicit draft reset, and recommendation finish**

## Accomplishments

- Added a client-only `검사해보기` CTA to the public-result hero so the restart entry point is always visible without displacing the result-first hierarchy.
- Extended `DELETE /api/assessment-session` into the canonical fresh-start boundary and added regression coverage that proves it clears the draft cookie and server state.
- Finished the recommendation section as a dedicated public-result panel and linked the restart recommendation to the live CTA anchor instead of a bare `/` navigation.
- Added direct Playwright coverage that proves a visitor can reach a clean `0 / 18` assessment start from the public result page.

## Task Commits

1. **Task 1-2: Finish the restart loop and recommendation section** - `49c7983` `feat(04-04): add public-result restart loop`

## Verification

- `npm exec vitest run test/assessment/public-result.test.ts test/assessment/assessment-session-route.test.ts`
- `npm run build`
- `npm run typecheck`
- `npx playwright test test/e2e/public-result.spec.ts -g "returns shared-result visitors to a fresh assessment"`

## Next Phase Readiness

- Phase `05` can now measure share-loop behavior against a stable public-result surface instead of changing the user-facing restart mechanics again.
