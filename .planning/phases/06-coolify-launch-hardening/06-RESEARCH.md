# Phase 06: coolify-launch-hardening - Research

**Researched:** 2026-03-29
**Domain:** Coolify production deployment, PostgreSQL backup/restore, and server-generated share metadata
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No `CONTEXT.md` exists for this phase.

Use the existing roadmap, requirements, project constraints, and current codebase reality:
- Mobile-first, Korean-only, anonymous assessment product
- Coolify-targeted deployment with a separate PostgreSQL service
- Public result pages must stay privacy-first by default
- Scope is limited to `OPER-01`, `OPER-03`, and `OPER-04`
- Keep Phase 06 focused on launch hardening, not new product features
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OPER-01 | 시스템은 Coolify에서 웹 앱과 PostgreSQL을 분리된 서비스로 배포할 수 있다. | Dockerfile-based Next.js deployment, explicit runtime env contract, lightweight health endpoint, and separate Coolify PostgreSQL service |
| OPER-03 | 운영자는 데이터베이스 백업 구성을 통해 결과 데이터를 복구할 수 있다. | Coolify scheduled PostgreSQL backups to S3-compatible storage, restore runbook, and restore rehearsal into a non-production target |
| OPER-04 | 시스템은 결과 페이지 공유 미리보기를 위한 메타데이터를 서버에서 생성할 수 있다. | Route-level `generateMetadata`, `metadataBase`, and `results/[publicId]/opengraph-image.tsx` while preserving `robots.noindex` defaults |
</phase_requirements>

## Summary

Phase 06 is an operations-boundary phase, not a platform rewrite. The current repo already has the right product shape for deployment on Coolify: one Next.js App Router app, one PostgreSQL database, anonymous cookies, and immutable public result pages. What it does not have yet is the production contract around that shape. There is no `Dockerfile`, no `.dockerignore`, no explicit app health route, no deployment-oriented env documentation beyond `DATABASE_URL`, no backup/restore runbook, and the public result metadata currently stops at title, description, and `robots` defaults.

The deployment recommendation is straightforward: ship a single Dockerfile-based Next.js app as one Coolify application, and run PostgreSQL as a separate Coolify-managed database service with its own persistent volume and backup policy. Do not put database state in the app container, do not rely on Nixpacks defaults, and do not make the app health check depend on a live database query. For this repo, the most reliable app image is a standalone Next.js build with `output: "standalone"` and an explicit container command.

For share previews, the current privacy posture is already correct and should stay in place: public result pages remain `noindex`, `nofollow`, and `Referrer-Policy: no-referrer`. Phase 06 should add server-generated Open Graph and Twitter metadata on those same routes, plus a route-scoped OG image. That gives social preview cards for anonymous share links without turning result pages into indexable SEO pages.

**Primary recommendation:** Plan Phase 06 as four dependent slices: deployment contract and Docker build path first, then runtime env and health boundaries, then server-generated result-page metadata/OG, and finally PostgreSQL backup/restore with a rehearsed recovery runbook.

## Project Constraints (from CLAUDE.md)

- Preserve the current core stack: Next.js App Router, React, TypeScript, Drizzle, PostgreSQL, anonymous-user model.
- Keep deployment aligned to Coolify and a separate managed PostgreSQL service.
- Do not introduce new infrastructure that is not required by `OPER-01`, `OPER-03`, or `OPER-04`.
- Public result pages must keep privacy-first defaults.
- Follow existing repo patterns rather than redesigning the architecture during Phase 06.
- Respect the GSD workflow; this research file is for planning, not bypassing phase execution.

## What Exists Today

### Already implemented
- `src/env.ts` validates `DATABASE_URL`, `NODE_ENV`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`.
- `src/db/schema.ts` and `drizzle/` migrations already persist `assessment_results`, `assessment_draft_sessions`, and `admin_stats_events`.
- `src/app/results/[publicId]/page.tsx` already resolves immutable public snapshots server-side.
- `src/app/results/[publicId]/snapshot-metadata.ts` already sets `robots.index = false` and `robots.follow = false`.
- `next.config.ts` already applies `Referrer-Policy: no-referrer` to `/results/:publicId*`.
- `test/assessment/public-result.test.ts` already checks the privacy defaults.

### Missing for Phase 06
- No `Dockerfile`
- No `.dockerignore`
- No `output: "standalone"` in `next.config.ts`
- No app health endpoint for Coolify health checks
- No deployment runbook or restore runbook
- No env example for production-required secrets beyond `DATABASE_URL`
- No server-generated OG/Twitter metadata or route-level OG image
- No backup policy or restore rehearsal guidance for the Coolify PostgreSQL service

## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| `next` | `15.5.3` in repo; latest `16.2.1` published 2026-03-20 | Web app runtime and metadata generation | Already in use; Phase 06 should harden deployability, not introduce a framework upgrade |
| `drizzle-orm` | `0.45.2` published 2026-03-27 | DB access for results and admin data | Already in use and fits a single-app + single-DB deployment |
| `pg` | `8.20.0` published 2026-03-04 | PostgreSQL driver | Already in use; no Phase 06 reason to replace it |
| PostgreSQL | `16.x` | Coolify-managed primary database | Matches project stack guidance and keeps backup/restore operationally standard |
| Coolify Dockerfile build path | current docs | Deterministic application deployment | More predictable than relying on Nixpacks detection for a production launch |

### Supporting
| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `zod` | `4.1.5` in repo; latest `4.3.6` published 2026-01-22 | Env contract validation | Extend the existing env schema for deployment metadata like site origin |
| `next/og` | bundled with Next.js | Dynamic OG image generation | Use for result-page social previews without a separate image service |
| `pg_restore` / `psql` | same major as target PostgreSQL | Restore tooling | Use for manual recovery rehearsal or customized import flow |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dockerfile-based deploy | Nixpacks default | Less config up front, but more build drift and less control over Node/runtime details |
| Separate Coolify PostgreSQL service | DB container inside the app stack | Simpler initial UI setup, but worse operational separation and backup discipline |
| Route-scoped OG metadata via Next Metadata API | Client-generated share tags | Client tags are not reliable for crawlers and do not satisfy `OPER-04` |
| Scheduled Coolify DB backups to S3-compatible storage | Ad hoc manual dumps only | Manual dumps are not a production recovery strategy |

**Installation:**
```bash
# No new npm package is required for the recommended Phase 06 path.
# Restore rehearsal may require PostgreSQL client tools outside npm.
```

**Version verification:** verified with `npm view` on 2026-03-29 for `next`, `drizzle-orm`, `pg`, and `zod`.

## Architecture Patterns

### Recommended Project Structure
```text
.
├── Dockerfile                    # production image for Coolify
├── .dockerignore                 # keep build context small and deterministic
├── next.config.ts                # add output: "standalone"
├── src/
│   ├── app/
│   │   ├── api/health/route.ts   # lightweight liveness/readiness response
│   │   └── results/[publicId]/
│   │       ├── page.tsx
│   │       ├── snapshot-metadata.ts
│   │       └── opengraph-image.tsx
│   └── env.ts                    # validated production env contract
└── docs/operations/
    ├── coolify-deploy.md         # deploy topology and env mapping
    └── postgres-restore.md       # backup/restore runbook
```

### Pattern 1: Standalone Next.js image for the Coolify app
**What:** Build a production image from a checked-in Dockerfile and run the standalone server output.
**When to use:** The main web application deployment.
**Prescriptive choice:** Add `output: "standalone"` and use a multi-stage Dockerfile.

**Why this fits the repo:**
- The repo already builds with `next build`.
- Coolify supports Dockerfile-based application deployment.
- Standalone output reduces runtime image size and removes the need to install full `node_modules` in the final stage.

**Example:**
```ts
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

### Pattern 2: App health check must be process-level, not DB-coupled
**What:** Expose a cheap route like `/api/health` that returns `200` when the process can serve requests.
**When to use:** Coolify health checks and container `HEALTHCHECK`.
**Prescriptive choice:** Do not query PostgreSQL in the main health check.

**Why this fits the repo:**
- The app should stay routable during transient DB issues long enough to surface errors cleanly.
- A DB-dependent health check can create restart loops and false negatives.
- Database health can be checked separately in manual ops or an admin-only diagnostic route later.

**Example:**
```ts
// Source: repo-aligned pattern; health check target for Coolify
export async function GET() {
  return Response.json(
    { ok: true, service: "web", timestamp: new Date().toISOString() },
    { status: 200 },
  );
}
```

### Pattern 3: Keep PostgreSQL as a separate Coolify resource
**What:** One Coolify application for the Next.js web app, one Coolify PostgreSQL database resource for state.
**When to use:** Production and staging deployment.
**Prescriptive choice:** The app receives only `DATABASE_URL`; PostgreSQL keeps its own persistent volume and backup policy.

**Why this fits the repo:**
- All durable product state already lives in PostgreSQL tables.
- The app container has no legitimate reason to own persistent result data.
- Coolify documents backup import and backup configuration on the database resource, not the app resource.

### Pattern 4: Result-page metadata stays private but previewable
**What:** Keep `robots.noindex` and `Referrer-Policy: no-referrer`, while adding route-level Open Graph and Twitter metadata plus a result-specific OG image.
**When to use:** `src/app/results/[publicId]/page.tsx` and route segment metadata files.
**Prescriptive choice:** Add `metadataBase` from a validated site-origin env var and use absolute metadata/image URLs.

**Why this fits the repo:**
- Public result pages already exist and are server-rendered.
- Share previews are required, but search indexing is not.
- Anonymous share links should reveal only high-level result summary, not raw answer data or admin tokens.

**Example:**
```ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
export const alt = "에니어그램 결과 미리보기";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
```

### Low-Risk Execution Slices

### Slice 1: Deployment contract and build artifact
**Why first:** Nothing else matters if the app cannot build and start deterministically on Coolify.
**Scope:**
- add `Dockerfile`
- add `.dockerignore`
- add `output: "standalone"` to `next.config.ts`
- document the Coolify app settings and exposed port

### Slice 2: Runtime env and health boundaries
**Why second:** Coolify reliability depends on explicit runtime assumptions.
**Scope:**
- extend `src/env.ts` and `.env.example`
- add site-origin env for metadata
- add `/api/health`
- document which env vars are build-time vs runtime in Coolify

### Slice 3: Server-generated social metadata for public result pages
**Why third:** This is self-contained and depends on the site-origin/env work from Slice 2.
**Scope:**
- upgrade `snapshot-metadata.ts`
- add `metadataBase`
- add `openGraph` and `twitter` fields
- add `results/[publicId]/opengraph-image.tsx`
- extend metadata tests and public-result e2e coverage

### Slice 4: PostgreSQL backups, restore runbook, and rehearsal
**Why fourth:** Backup policy is only useful once the deployment topology is defined.
**Scope:**
- define Coolify scheduled backup policy to S3-compatible storage
- document dump format and restore constraints
- document restore rehearsal into a non-production target
- verify recovery path against the actual tables this app uses

### Anti-Patterns to Avoid
- **Do not deploy PostgreSQL inside the web app container:** it breaks operational separation and makes backups harder.
- **Do not rely on Coolify Nixpacks defaults for launch:** Phase 06 should reduce implicit behavior, not increase it.
- **Do not use a DB query as the main liveness check:** it can create restart storms during transient outages.
- **Do not use production `DATABASE_URL` in preview deployments:** previews should use isolated env or no deploy at all.
- **Do not expose answer payloads or admin tokens in OG metadata or OG images:** only result summary content belongs in previews.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Next.js deployment image | Ad hoc shell-based server startup | Dockerfile + standalone Next output | Predictable runtime, smaller image, easier Coolify config |
| Durable state | App-container filesystem persistence | Coolify PostgreSQL resource with persistent storage | Results, drafts, and events already live in PostgreSQL |
| Backup scheduling | Manual cron scripts in the app repo | Coolify database backup configuration to S3-compatible storage | Keeps backup lifecycle attached to the DB resource |
| Share metadata | Manual `<head>` string concatenation | Next Metadata API + `opengraph-image.tsx` | Reliable crawler support and route-level ownership |
| Recovery validation | Assume backups are enough | Rehearsed restore runbook into a non-production target | Backups without restore proof are not operationally trustworthy |

**Key insight:** Phase 06 should harden the boundaries around the existing app, not invent new moving parts. The app already has the correct state model; launch risk is now in deployment determinism, environment discipline, and verified recovery.

## Common Pitfalls

### Pitfall 1: Shipping without a deterministic Dockerfile
**What goes wrong:** builds succeed locally but fail or drift on Coolify.
**Why it happens:** implicit framework detection and runtime defaults change over time.
**How to avoid:** check in a multi-stage Dockerfile and use standalone Next output.
**Warning signs:** Coolify build logs choose unexpected Node versions or install behavior.

### Pitfall 2: Letting health checks depend on PostgreSQL readiness
**What goes wrong:** short DB hiccups trigger app restarts and 502s.
**Why it happens:** liveness and dependency checks get conflated.
**How to avoid:** use `/api/health` for process liveness; treat DB reachability as a separate operational diagnostic.
**Warning signs:** the app restarts repeatedly during temporary DB failures.

### Pitfall 3: Mixing build-time and runtime env assumptions
**What goes wrong:** metadata origin or secrets differ between build and runtime.
**Why it happens:** Coolify supports separate build and runtime env flags.
**How to avoid:** explicitly decide which vars must exist at build time and which are runtime-only, then document that in the deploy runbook.
**Warning signs:** metadata URLs point at the wrong domain or builds fail only in Coolify.

### Pitfall 4: Treating backups as complete without a restore drill
**What goes wrong:** backup files exist, but restore fails under pressure.
**Why it happens:** version compatibility, file format, or credentials were never tested.
**How to avoid:** rehearse restore into a non-production PostgreSQL target using the same major version when possible.
**Warning signs:** the team has a backup schedule but no successful restore timestamp.

### Pitfall 5: Adding OG previews that weaken privacy defaults
**What goes wrong:** public result pages become indexable or reveal too much detail.
**Why it happens:** SEO and social sharing are treated as the same requirement.
**How to avoid:** keep `robots` blocked, keep `Referrer-Policy: no-referrer`, and limit OG content to type/result summary only.
**Warning signs:** result pages gain canonical/indexable behavior or preview cards include sensitive payload data.

## Code Examples

Verified patterns from official sources:

### Standalone deployment output
```ts
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
module.exports = {
  output: "standalone",
};
```

### Running the standalone server on a specific port/host
```bash
# Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
PORT=8080 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

### Coolify env behavior for build vs runtime
```text
# Source: https://coolify.io/docs/knowledge-base/environment-variables
Build + Runtime: available during image build and in the running container
Build only: available during image build only
Runtime only: available in the running container only
```

### Coolify PostgreSQL restore command
```bash
# Source: https://coolify.io/docs/databases/backups
pg_restore --verbose --clean -h localhost -U postgres -d postgres pg-dump-postgres-1697207547.dmp
```

### Coolify PostgreSQL import expectation
```bash
# Source: https://coolify.io/docs/databases/postgresql
docker exec pg-db pg_dump -U postgres -d postgres -Fc >example-database.sql.gz
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit Node app deploy via buildpack detection | Checked-in Dockerfile with explicit standalone output | Current Coolify and Next.js guidance | Lower deployment drift and clearer runtime control |
| Title/description-only metadata | Route-scoped metadata plus OG/Twitter fields and generated social image | Current App Router metadata conventions | Proper social previews without client-side hacks |
| Backup existence as a proxy for recoverability | Scheduled backups plus explicit restore rehearsal | Current operational baseline | Recovery becomes testable, not assumed |

**Deprecated/outdated:**
- App-container filesystem persistence for durable data: wrong boundary for this app because PostgreSQL already owns all durable state.
- Client-only share tags: insufficient for crawler previews and do not satisfy `OPER-04`.

## Open Questions

1. **What is the canonical production origin for this app?**
   - What we know: public result pages need absolute metadata/image URLs.
   - What's unclear: the final Coolify domain or custom domain is not yet recorded in the repo.
   - Recommendation: make site origin a required Phase 06 env var and document it as both build-time and runtime if used in static metadata generation.

2. **Which S3-compatible target will store backups?**
   - What we know: Coolify backup guidance assumes external object storage for scheduled database backups.
   - What's unclear: AWS S3, Cloudflare R2, MinIO, or another target has not been selected.
   - Recommendation: treat the bucket/provider choice as an execution-time ops decision, but do not let planning proceed without naming one.

3. **Will preview deployments be enabled for this repo?**
   - What we know: Coolify supports different env vars for preview deployments.
   - What's unclear: whether this project wants preview apps at all.
   - Recommendation: keep preview deploy behavior out of core Phase 06 requirements, but if enabled, require non-production env and database isolation.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | local app build and type-aware tooling | ✓, wrong version for repo engine | `22.22.0` | Use Docker image with Node 24 for deployment; upgrade local Node before relying on engine parity |
| npm | package install and scripts | ✓ | `10.9.4` | — |
| Docker | local image validation and restore rehearsal helpers | ✓ | `28.4.0` | — |
| `psql` | local plain-SQL restore verification | ✗ | — | Use Coolify import UI or run client tools inside a matching PostgreSQL container |
| `pg_isready` | local DB readiness probing | ✗ | — | Use app health route for app checks; use containerized PostgreSQL tools for DB checks |
| Coolify server access | actual deploy and backup configuration | unknown from workspace | — | Human/operator action required |
| S3-compatible bucket | scheduled PostgreSQL backups | unknown from workspace | — | Human/operator action required |

**Missing dependencies with no fallback:**
- Coolify server access is not verifiable from this workspace.
- An S3-compatible backup target is not verifiable from this workspace.

**Missing dependencies with fallback:**
- Local PostgreSQL client tools are absent, but restore rehearsal can still use Coolify import tooling or a temporary PostgreSQL container.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` + Playwright `1.58.2` |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npx vitest run test/assessment/public-result.test.ts` |
| Full suite command | `npm run test && npx playwright test test/e2e/public-result.spec.ts` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OPER-01 | App can build and expose a Coolify-safe health boundary with explicit env contract | unit + build | `npm run build && npx vitest run test/ops/deployment-contract.test.ts` | ❌ Wave 0 |
| OPER-03 | Backup configuration can be used to recover production data | manual-only restore drill | `manual-only: restore into non-production Coolify/PostgreSQL target using runbook` | ❌ Wave 0 |
| OPER-04 | Public result pages emit server-generated social preview metadata while keeping privacy defaults | unit + e2e | `npx vitest run test/assessment/public-result.test.ts test/assessment/result-contract.test.ts && npx playwright test test/e2e/public-result.spec.ts` | ✅ partial / ❌ OG coverage |

### Sampling Rate
- **Per task commit:** `npx vitest run test/assessment/public-result.test.ts`
- **Per wave merge:** `npm run build && npm run test`
- **Phase gate:** `npm run build && npm run test && npx playwright test test/e2e/public-result.spec.ts`, plus one successful non-production restore drill

### Wave 0 Gaps
- [ ] `test/ops/deployment-contract.test.ts` — assert env contract, health route, and deployment-facing config
- [ ] Extend `test/assessment/public-result.test.ts` — verify `openGraph`, `twitter`, and origin-aware metadata fields
- [ ] Extend `test/e2e/public-result.spec.ts` — verify OG image route returns `200` for a stored result slug
- [ ] Add an operator runbook artifact, e.g. `docs/operations/postgres-restore.md` — manual verification source of truth for `OPER-03`

## Sources

### Primary (HIGH confidence)
- Repository code and phase artifacts:
  - `src/app/results/[publicId]/page.tsx`
  - `src/app/results/[publicId]/snapshot-metadata.ts`
  - `src/env.ts`
  - `src/db/schema.ts`
  - `next.config.ts`
  - `test/assessment/public-result.test.ts`
- Next.js standalone output docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Next.js `generateMetadata` docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js `opengraph-image` docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Coolify environment variables docs: https://coolify.io/docs/knowledge-base/environment-variables
- Coolify PostgreSQL docs: https://coolify.io/docs/databases/postgresql
- Coolify backups docs: https://coolify.io/docs/databases/backups

### Secondary (MEDIUM confidence)
- Coolify applications overview/navigation confirming Dockerfile, Preview Deploy, Persistent Storage, and Health Checks documentation surfaces: https://coolify.io/docs/applications/
- `npm view` package registry metadata checked on 2026-03-29 for `next`, `drizzle-orm`, `pg`, and `zod`

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - mostly repo reality plus official Next.js and Coolify docs
- Architecture: HIGH - recommendations align directly with current code shape and official deployment/metadata guidance
- Pitfalls: HIGH - based on the repo's current gaps and well-understood deployment failure modes

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
