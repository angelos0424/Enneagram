---
phase: 01-assessment-contract-scoring-core
plan: 03
subsystem: api
tags: [zod, vitest, nextjs, scoring, enneagram]
requires:
  - phase: 01-assessment-contract-scoring-core
    provides: assessment constants, versioned questionnaire definition, and test fixtures from plan 02
provides:
  - Deterministic assessment scoring engine with raw scores, normalized distribution, wing, nearby types, and direction mapping
  - Server-side POST scoring route with explicit schema validation and machine-readable 400 error codes
  - Regression coverage for scoring math and route-boundary error handling
affects: [phase-01-plan-04, result-snapshots, assessment-submit-flow]
tech-stack:
  added: []
  patterns: [pure domain scorer behind route boundary, zod-validated submission parsing, deterministic tie-break sorting]
key-files:
  created:
    - src/domain/assessment/schema.ts
    - src/domain/assessment/mappings.ts
    - src/domain/assessment/normalization.ts
    - src/domain/assessment/scoring.ts
    - src/app/api/assessments/score/route.ts
    - test/assessment/scoring.test.ts
    - test/assessment/score-route.test.ts
  modified:
    - src/domain/assessment/scoring.ts
    - test/assessment/scoring.test.ts
key-decisions:
  - "The scoring engine returns assessmentVersion, scoringVersion, and copyVersion directly so later snapshot persistence can serialize canonical results without reconstructing metadata."
  - "Route-level 400 responses preserve machine-readable error codes for invalid shape, unknown version, duplicate question ids, and incomplete coverage."
  - "Nearby types are always the top three non-primary candidates sorted by raw score descending then type id ascending."
patterns-established:
  - "Scoring Pattern: validate request shape with Zod, then delegate deterministic domain logic to a framework-free scorer."
  - "Error Pattern: domain validation failures surface as explicit error codes that route handlers translate into stable JSON 400 responses."
requirements-completed: [ASMT-02, ASMT-03, ASMT-04, ASMT-05, ASMT-06]
duration: 12 min
completed: 2026-03-29
---

# Phase 01 Plan 03: Deterministic Scoring Summary

**Deterministic enneagram scoring with version-stamped results, nearby-type ranking, and a server-authoritative POST scoring endpoint**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-29T09:03:30Z
- **Completed:** 2026-03-29T09:15:27Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Locked Phase 1 scoring behavior with regression coverage for primary type resolution, normalization, wing selection, direction mapping, and nearby-type ordering.
- Implemented a pure scoring engine that validates full question coverage and returns canonical result metadata alongside raw and normalized scores.
- Added a Next.js route handler that keeps scoring server-authoritative and returns explicit `400` error codes for all required invalid-input paths.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write scoring regression tests that lock the Phase 1 math rules** - `db08f96` (test)
2. **Task 2: Implement the pure scoring engine and fixed enneagram mappings** - `4670d0f` (feat)
3. **Task 3: Expose a server-authoritative scoring endpoint with explicit request validation** - `9980abe` (feat)

## Files Created/Modified
- `src/domain/assessment/schema.ts` - Zod schema for scoring submissions.
- `src/domain/assessment/mappings.ts` - Fixed enneagram growth/stress and wing adjacency maps.
- `src/domain/assessment/normalization.ts` - Chart-ready normalization helper using the locked Phase 1 formula.
- `src/domain/assessment/scoring.ts` - Pure scoring engine and domain error codes.
- `src/app/api/assessments/score/route.ts` - Server-side POST endpoint for canonical scoring.
- `test/assessment/scoring.test.ts` - Regression suite covering the deterministic scoring contract.
- `test/assessment/score-route.test.ts` - Direct route-handler tests for success and required `400` responses.

## Decisions Made
- Returned version metadata from the scorer itself so later persistence code can store canonical snapshots without recomputing fields.
- Kept duplicate and coverage validation in the domain scorer rather than in the route so future adapters can reuse identical behavior.
- Limited route responsibilities to parsing, delegating, and error translation to preserve a clean server boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced invalid dominance/tie fixtures in the scoring regression suite**
- **Found during:** Task 2 (Implement the pure scoring engine and fixed enneagram mappings)
- **Issue:** The original dominance and equal-top helpers selected `value: 5` for nearly every question, which made multiple tests assert the wrong primary type instead of validating the scorer.
- **Fix:** Reworked the regression inputs to use question-focus fixtures that actually create dominant, equal-top, and nearby-type scenarios.
- **Files modified:** `test/assessment/scoring.test.ts`
- **Verification:** `npm exec vitest run test/assessment/scoring.test.ts`
- **Committed in:** `4670d0f` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The auto-fix was necessary to make the regression suite validate the intended scoring contract. No scope creep.

## Issues Encountered
- `tsc` rejected the scoring registry as a literal-key object during Task 3. Widening it to `Record<string, AssessmentDefinition>` preserved behavior and cleared typechecking.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 04 can consume the scorer result shape directly because it already includes `assessmentVersion`, `scoringVersion`, and `copyVersion`.
- Persistence and snapshot schema work remain for the next plan, but the canonical scoring contract and route boundary are now stable.

## Self-Check: PASSED
- Verified summary file exists at `.planning/phases/01-assessment-contract-scoring-core/01-03-SUMMARY.md`.
- Verified task commits `db08f96`, `4670d0f`, and `9980abe` exist in git history.

---
*Phase: 01-assessment-contract-scoring-core*
*Completed: 2026-03-29*
