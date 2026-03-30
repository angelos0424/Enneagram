---
phase: 06-coolify-launch-hardening
plan: 02
subsystem: infra
tags: [coolify, nextjs, health-check, env, postgres, vitest]
requires:
  - phase: 06-01
    provides: Deterministic Dockerfile and standalone Next.js deployment artifact
provides:
  - Production runtime env validation with `APP_ORIGIN`
  - Process-only `/api/health` endpoint for Coolify health checks
  - Coolify runbook for separate web app and PostgreSQL services
  - Ops regression tests for env and health contracts
affects: [06-03, 06-04, operations, metadata]
tech-stack:
  added: []
  patterns: [production-only env refinement, process-level health checks, repo-owned Coolify runbook]
key-files:
  created: [src/app/api/health/route.ts, docs/operations/coolify-deploy.md, test/ops/health-route.test.ts]
  modified: [src/env.ts, .env.example, test/ops/deployment-contract.test.ts]
key-decisions:
  - "APP_ORIGIN is enforced only for production so local and test helpers stay lightweight while deploys still fail fast on missing origin."
  - "The Coolify health endpoint stays process-only and must not query PostgreSQL to avoid restart loops during transient DB incidents."
patterns-established:
  - "Deployment-facing env additions should be locked by ops tests before implementation."
  - "Operational health checks return stable JSON with a fixed 200 contract and no database dependency."
requirements-completed: [OPER-01]
duration: 4 min
completed: 2026-03-30
---

# Phase 06 Plan 02: Runtime contract with production `APP_ORIGIN`, process-only health checks, and a Coolify deployment runbook

**Production env validation, `/api/health`, and a repo-owned Coolify app/PostgreSQL runbook now define the runtime contract for launch.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T00:03:20Z
- **Completed:** 2026-03-30T00:07:28Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added failing ops coverage first for production `APP_ORIGIN` parsing and a stable health route contract.
- Implemented production-aware env validation, a process-level `/api/health` route, and the launch env surface in `.env.example`.
- Added a Coolify deployment runbook for the separated web-app and PostgreSQL topology, including port, health check, and env mapping.

## Task Commits

Each task was committed atomically:

1. **Task 1: Lock the runtime env and health contract in tests** - `1501032` (test)
2. **Task 2: Implement the production origin env, health endpoint, and Coolify runbook** - `4fd38db` (feat)

## Files Created/Modified

- `src/env.ts` - Adds `APP_ORIGIN` validation with a production-only requirement.
- `.env.example` - Documents the launch-required runtime env surface.
- `src/app/api/health/route.ts` - Returns the stable process-level health payload for Coolify.
- `docs/operations/coolify-deploy.md` - Explains the separated app/PostgreSQL deployment topology and verification steps.
- `test/ops/deployment-contract.test.ts` - Locks the production env contract.
- `test/ops/health-route.test.ts` - Guards the process-only health semantics and payload shape.

## Decisions Made

- Enforced `APP_ORIGIN` only when `NODE_ENV` is `production` so deploys fail fast without forcing unrelated test helpers to supply a public origin.
- Kept `/api/health` independent from PostgreSQL and documented that boundary in the runbook to avoid liveness-driven restart loops.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `next build` completed compilation, static page generation, and trace collection, but the streamed command session did not emit a clean final exit marker in this environment. Verification relied on the successful build log plus the absence of a remaining `next build` process.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The runtime contract is explicit enough for phase 06 metadata work to consume a validated public origin.
- Coolify can target `/api/health` without coupling container liveness to database reachability.

## Self-Check: PASSED

- Verified files exist: `src/env.ts`, `.env.example`, `src/app/api/health/route.ts`, `docs/operations/coolify-deploy.md`, `test/ops/deployment-contract.test.ts`, `test/ops/health-route.test.ts`
- Verified commits exist: `1501032`, `4fd38db`

---
*Phase: 06-coolify-launch-hardening*
*Completed: 2026-03-30*
