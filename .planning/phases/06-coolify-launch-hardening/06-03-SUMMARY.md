---
phase: 06-coolify-launch-hardening
plan: 03
subsystem: ui
tags: [nextjs, metadata, open-graph, twitter-cards, playwright, vitest]
requires:
  - phase: 06-02
    provides: APP_ORIGIN contract, health-boundary env work, and Coolify runtime assumptions
provides:
  - Privacy-safe server metadata for immutable public result pages
  - Route-scoped OG image generation for shared result previews
  - Regression coverage for noindex plus crawler-visible preview tags
affects: [results, sharing, coolify-launch-hardening, oper-04]
tech-stack:
  added: []
  patterns: [route-level generateMetadata from stored snapshot, route-scoped next/og image generation]
key-files:
  created: [src/app/results/[publicId]/opengraph-image.tsx]
  modified: [src/app/layout.tsx, src/app/results/[publicId]/snapshot-metadata.ts, test/assessment/public-result.test.ts, test/e2e/public-result.spec.ts]
key-decisions:
  - "Public preview metadata stays derived from immutable snapshot copy only, never from raw answers or admin-only fields."
  - "Metadata emits absolute URLs in every environment by preferring APP_ORIGIN and falling back to localhost outside production."
patterns-established:
  - "Public result previews remain noindex/nofollow while still exposing Open Graph and Twitter tags."
  - "Browser verification for share previews checks absolute crawler tags by path contract rather than test-hostname specifics."
requirements-completed: [OPER-04]
duration: 8min
completed: 2026-03-30
---

# Phase 06 Plan 03: Privacy-Safe Share Preview Metadata Summary

**Immutable public result pages now emit server-owned Open Graph and Twitter metadata plus a route-scoped OG image without exposing answers or weakening privacy defaults**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-30T00:09:11Z
- **Completed:** 2026-03-30T00:17:12Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added a TDD contract for public-result preview metadata covering `noindex`, absolute URLs, snapshot-derived copy, and leak prevention.
- Implemented async snapshot metadata generation with absolute Open Graph and Twitter fields backed by immutable stored result copy.
- Added a privacy-safe `opengraph-image` route and browser coverage proving the public result page still shares and restarts correctly after the metadata upgrade.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define the public-result metadata and OG contract in tests** - `32ee781` (test)
2. **Task 2: Implement server-generated result metadata and the OG image route** - `48db58e` (feat)

## Files Created/Modified
- `src/app/layout.tsx` - Sets a metadata base so crawler tags resolve to absolute URLs in deployed and local verification environments.
- `src/app/results/[publicId]/snapshot-metadata.ts` - Loads immutable snapshots, derives preview copy, and emits privacy-safe Open Graph and Twitter metadata.
- `src/app/results/[publicId]/opengraph-image.tsx` - Renders a summary-only OG image from stored snapshot data.
- `test/assessment/public-result.test.ts` - Guards noindex defaults, absolute preview metadata, and non-leakage of answers/admin tokens.
- `test/e2e/public-result.spec.ts` - Verifies crawler-visible meta tags alongside the existing share and restart browser flows.

## Decisions Made

- Public preview metadata uses the stored result snapshot and copy catalog instead of rescoring or touching raw answer payloads, so previews stay immutable and privacy-first.
- Absolute preview URLs fall back to `http://localhost:3000` outside production so local build and Playwright verification remain crawler-equivalent while production still honors `APP_ORIGIN`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Narrowed metadata origin lookup to avoid unrelated env parsing failures**
- **Found during:** Task 2 (Implement server-generated result metadata and the OG image route)
- **Issue:** Calling `getEnv()` inside snapshot metadata required unrelated runtime secrets during isolated metadata tests.
- **Fix:** Switched metadata origin resolution to a route-local origin helper instead of parsing the full app env contract.
- **Files modified:** `src/app/results/[publicId]/snapshot-metadata.ts`
- **Verification:** `npm exec vitest run test/assessment/public-result.test.ts`
- **Committed in:** `48db58e` (part of task commit)

**2. [Rule 1 - Bug] Added a localhost fallback so preview tags stay absolute during browser verification**
- **Found during:** Task 2 (Implement server-generated result metadata and the OG image route)
- **Issue:** Local Playwright runs emitted relative or hostname-mismatched OG URLs when `APP_ORIGIN` was unset.
- **Fix:** Added a shared localhost metadata-base fallback and adjusted the e2e assertion to verify absolute URL/path correctness instead of a specific local hostname.
- **Files modified:** `src/app/layout.tsx`, `src/app/results/[publicId]/snapshot-metadata.ts`, `test/e2e/public-result.spec.ts`
- **Verification:** `npm run build && npx playwright test test/e2e/public-result.spec.ts`
- **Committed in:** `48db58e` (part of task commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were required to satisfy the metadata contract across test and local-runtime environments. No scope creep.

## Issues Encountered

- `npm run typecheck` initially failed because `tsconfig.json` includes `.next/types/**/*.ts` and the workspace did not have current Next type artifacts yet. Running `npm run build` regenerated those files, after which `npm run typecheck` passed cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `OPER-04` is now covered by server-generated public-result metadata, OG images, and regression tests.
- Phase `06-04` can focus on PostgreSQL backup and restore readiness without additional share-preview work.

## Self-Check: PASSED

- Found summary file: `.planning/phases/06-coolify-launch-hardening/06-03-SUMMARY.md`
- Found task commit: `32ee781`
- Found task commit: `48db58e`

---
*Phase: 06-coolify-launch-hardening*
*Completed: 2026-03-30*
