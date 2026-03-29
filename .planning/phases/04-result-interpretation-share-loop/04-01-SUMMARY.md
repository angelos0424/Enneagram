---
phase: 04-result-interpretation-share-loop
plan: 01
subsystem: public-results
tags: [nextjs, vitest, immutable-snapshots, result-copy]
requires:
  - phase: 02-persistent-result-snapshots
    provides: immutable public result retrieval by stored snapshot and copyVersion
provides:
  - richer versioned interpretation content for public results
  - immutable view-model mapping for wing, growth, stress, disclaimer, and recommendations
  - regression coverage for Phase 4 copy and public-result contracts
affects: [public-results, result-copy, phase-04-layout]
tech-stack:
  added: []
  patterns:
    - versioned type-copy catalog remains the single interpretation source of truth
    - public result view models are enriched from stored snapshot data without rescoring
key-files:
  created: []
  modified:
    - src/domain/assessment/types.ts
    - src/content/type-copy/ko/v1.ts
    - src/app/results/[publicId]/page.tsx
    - src/app/results/[publicId]/result-snapshot-view.tsx
    - test/assessment/result-contract.test.ts
    - test/assessment/public-result.test.ts
key-decisions:
  - "Phase 4 interpretation content stays inside the versioned type-copy catalog instead of being hardcoded in the result page."
  - "The public result page can expose richer fields only by mapping stored snapshot ids and stored copyVersion, never by rescoring."
patterns-established:
  - "Type copy entries now carry detail cards, disclaimer content, and recommendation items."
  - "ResultSnapshotViewModel includes derived copy entries for wing, growth, and stress labels."
requirements-completed: [RSLT-05, RSLT-06]
duration: 8min
completed: 2026-03-29
---

# Phase 04 Plan 01: Result Copy Contract Summary

**Expanded immutable interpretation content and mapped the richer public-result view model without breaking snapshot rendering**

## Accomplishments

- Expanded `TypeCopyEntry` to include explanation cards, disclaimer content, and recommendation items inside the versioned copy catalog.
- Populated Korean type copy with the richer Phase 4 interpretation contract.
- Extended the public result page/view model so wing, growth, stress, detail cards, disclaimer, and recommendations all resolve from stored snapshot ids plus stored `copyVersion`.
- Added regression coverage for the richer copy contract and immutable public-result rendering path.

## Task Commits

1. **Task 1: Expand the versioned interpretation-copy contract for detailed result reading** - `32850ec` `feat(04-01): expand immutable result copy contract`
2. **Task 2: Build the richer immutable public-result view model from stored snapshot data** - `9aed9c3` `feat(04-01): map richer immutable result view model`

## Verification

- `npm exec vitest run test/assessment/result-contract.test.ts test/assessment/public-result.test.ts`
- `npm run typecheck`

## Next Phase Readiness

- Phase `04-02` can now redesign the public result page against a stable immutable content contract instead of inventing ad hoc strings.
- Share and restart-loop plans can rely on recommendation and disclaimer primitives already being versioned.
