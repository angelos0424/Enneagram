---
phase: 01-assessment-contract-scoring-core
plan: 02
subsystem: testing
tags: [assessment, enneagram, typescript, vitest, content-contracts]
requires:
  - phase: 01-01
    provides: Next.js, TypeScript, and Vitest bootstrap workspace
provides:
  - authoritative Korean assessment definition with versioned question and option contracts
  - locked scoring policy constants for downstream scoring and persistence work
  - reusable answer fixtures and contract-drift tests for future assessment plans
affects: [phase-01-scoring, phase-02-persistence, result-snapshots]
tech-stack:
  added: []
  patterns: [code-first assessment catalog, version-pinned scoring policies, contract-drift testing]
key-files:
  created:
    - src/domain/assessment/types.ts
    - src/domain/assessment/constants.ts
    - src/content/assessments/ko/v1.ts
    - src/content/type-copy/ko/v1.ts
    - test/assessment/fixtures.ts
    - test/assessment/definition.test.ts
  modified: []
key-decisions:
  - "Assessment content, option labels, and type copy stay in typed code modules as the Phase 1 source of truth."
  - "Scoring-policy values are pinned in constants so later plans consume explicit tie-break, normalization, and persistence rules."
  - "Contract-drift coverage stays separate from scoring-behavior tests and only guards versions, labels, ordering, and policy sync."
patterns-established:
  - "Assessment definitions should satisfy shared domain types instead of relying on untyped content objects."
  - "Future scoring tests can build answers from shared fixture helpers instead of hand-writing payloads."
requirements-completed: [ASMT-01]
duration: 7min
completed: 2026-03-29
---

# Phase 01 Plan 02: Lock the authoritative Korean assessment contracts, constants, fixtures, and definition tests Summary

**Versioned Korean assessment content with fixed scoring-policy constants, nine-type copy metadata, and drift tests for labels, ordering, and version sync**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-29T08:53:39Z
- **Completed:** 2026-03-29T09:00:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added the authoritative Korean assessment definition with 18 ordered questions, five locked Likert labels, and deterministic per-type weight maps.
- Added version constants for assessment, scoring, copy, tie-break policy, normalization formula, nearby-type retention, and Phase 1 persistence scope.
- Added reusable answer fixtures and definition-level tests to guard contract drift before scoring behavior is implemented.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define the authoritative assessment and scoring policy contracts per D-01 through D-11** - `3a80fa6` (feat)
2. **Task 2: Add contract-drift fixtures and definition tests for the authoritative assessment definition** - `c52f34e` (test)

## Files Created/Modified
- `src/domain/assessment/types.ts` - Shared Enneagram, Likert, assessment-definition, nearby-type, and type-copy contracts.
- `src/domain/assessment/constants.ts` - Locked Phase 1 version identifiers and policy constants.
- `src/content/assessments/ko/v1.ts` - Single source of truth for Korean Likert options and the 18-question pilot bank.
- `src/content/type-copy/ko/v1.ts` - Versioned minimal copy entries for all nine Enneagram types.
- `test/assessment/fixtures.ts` - Reusable answer builders for uniform, dominant-type, and equal-top scoring scenarios.
- `test/assessment/definition.test.ts` - Drift tests for version synchronization, option labels, question ordering, and policy constants.

## Decisions Made
- Kept the authoritative assessment content in TypeScript modules so later scoring and persistence code consume typed contracts directly.
- Used one deterministic weight shape per question across all nine types so scoring behavior can stay pure and server-authoritative in the next plan.
- Added a minimal but real copy catalog now so result snapshots can stamp a concrete `copyVersion` instead of inventing copy metadata later.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tightened the question weight builder typing**
- **Found during:** Task 1 (Define the authoritative assessment and scoring policy contracts per D-01 through D-11)
- **Issue:** `Object.fromEntries` widened numeric keys and tuples, causing `npm run typecheck` to fail against the required `Record<EnneagramType, readonly [number, number, number, number, number]>` contract.
- **Fix:** Replaced the `Object.fromEntries` return path with an explicitly typed weight-map accumulator.
- **Files modified:** `src/content/assessments/ko/v1.ts`
- **Verification:** `npm run typecheck`
- **Committed in:** `3a80fa6` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The auto-fix was required to make the plan’s typed contract compile. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The scoring plan can now rely on a fixed `assessmentDefinition`, `typeCopyDefinition`, and shared answer fixtures.
- Persistence work can stamp `assessmentVersion`, `scoringVersion`, and `copyVersion` without inventing new identifiers.

## Self-Check

PASSED

---
*Phase: 01-assessment-contract-scoring-core*
*Completed: 2026-03-29*
