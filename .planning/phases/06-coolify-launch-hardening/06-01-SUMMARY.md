---
phase: 06-coolify-launch-hardening
plan: 01
subsystem: infra
tags: [coolify, docker, nextjs, standalone, vitest]
requires:
  - phase: 05-04
    provides: protected admin dashboard and the existing anonymous/public Next.js app runtime
provides:
  - deterministic Dockerfile-based Coolify web app image contract
  - standalone Next.js production build output
  - deployment-facing regression coverage for Docker artifacts and app-only boundaries
affects: [06-02, 06-03, 06-04, operations]
tech-stack:
  added: [docker]
  patterns: [multi-stage Node 24 Dockerfile, standalone Next.js runtime, deployment contract tests]
key-files:
  created: [Dockerfile, .dockerignore, test/ops/deployment-contract.test.ts]
  modified: [next.config.ts]
key-decisions:
  - "The repo now declares a checked-in Dockerfile instead of relying on Coolify buildpack inference."
  - "The production image runs the standalone Next.js server as the single web process and does not bundle PostgreSQL concerns."
patterns-established:
  - "Deployment artifacts are regression-guarded with Vitest before build config changes land."
  - "Coolify app images stay app-only, with PostgreSQL remaining a separate service boundary."
requirements-completed: [OPER-01]
duration: 5min
completed: 2026-03-30
---

# Phase 06 Plan 01: Coolify Launch Hardening Summary

**Standalone Next.js output, multi-stage Node 24 Docker image, and deployment contract tests for deterministic Coolify app builds**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T23:56:00Z
- **Completed:** 2026-03-30T00:01:13Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added a deployment-contract test that locks `output: "standalone"`, checked-in Docker artifacts, and the app-only container boundary.
- Enabled standalone Next.js output while preserving the existing `/results/:publicId*` `Referrer-Policy: no-referrer` rule.
- Shipped a multi-stage Node 24 Dockerfile and `.dockerignore` so Coolify can build a deterministic web image without database-in-container assumptions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define the deployment artifact contract in tests** - `9ab0027` (test)
2. **Task 2: Implement the standalone Docker build path for Coolify** - `aca1e08` (feat)

## Files Created/Modified

- `Dockerfile` - Multi-stage Node 24 image that runs `node .next/standalone/server.js`
- `.dockerignore` - Minimal Docker context that excludes git, local build output, planning artifacts, and local env files
- `next.config.ts` - Adds `output: "standalone"` while preserving the public-result header policy
- `test/ops/deployment-contract.test.ts` - Deployment regression coverage for standalone output and app-only image boundaries
- `.planning/phases/06-coolify-launch-hardening/deferred-items.md` - Tracks the out-of-scope Next.js security warning surfaced by container build

## Decisions Made

- The checked-in Dockerfile is now the production build contract for Coolify so deployment behavior does not depend on buildpack inference.
- The runtime image executes only the standalone Next.js server process; PostgreSQL remains an external service boundary owned by later ops work.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relaxed Docker command matching in the deployment contract test**
- **Found during:** Task 2 (Implement the standalone Docker build path for Coolify)
- **Issue:** The initial test only matched one Docker `CMD` syntax variant and failed against an equivalent JSON-array command.
- **Fix:** Updated the assertion to accept the same `node .next/standalone/server.js` runtime contract across valid Docker syntaxes.
- **Files modified:** `test/ops/deployment-contract.test.ts`
- **Verification:** `npm exec vitest run test/ops/deployment-contract.test.ts && npm run build && docker build -t enneagram-phase06 .`
- **Committed in:** `aca1e08`

**2. [Rule 1 - Bug] Narrowed the dockerignore boundary assertion to the actual database-in-container risk**
- **Found during:** Task 2 (Implement the standalone Docker build path for Coolify)
- **Issue:** The initial test incorrectly treated ignoring compose files as a contract violation even though compose files are unrelated to bundling PostgreSQL into the app image.
- **Fix:** Changed the assertion to reject PostgreSQL-specific ignore patterns instead of generic compose filenames.
- **Files modified:** `test/ops/deployment-contract.test.ts`
- **Verification:** `npm exec vitest run test/ops/deployment-contract.test.ts && npm run build && docker build -t enneagram-phase06 .`
- **Committed in:** `aca1e08`

---

**Total deviations:** 2 auto-fixed (2 bug fixes)
**Impact on plan:** Both fixes kept the TDD contract aligned with the intended deployment boundary. No scope creep.

## Issues Encountered

- `docker build` surfaced an upstream warning that `next@15.5.3` has a known security issue. This was recorded in `deferred-items.md` because this plan was limited to deployment artifact hardening, not a framework upgrade.

## User Setup Required

None - no external service configuration required in this plan.

## Next Phase Readiness

- Phase 06-02 can now add runtime env and health-check wiring on top of a deterministic Docker artifact.
- The repository is ready for Coolify to consume an explicit web-app image contract separate from PostgreSQL state ownership.

## Self-Check

PASSED

---
*Phase: 06-coolify-launch-hardening*
*Completed: 2026-03-30*
