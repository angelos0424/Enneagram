# Technology Stack

**Project:** 에니어그램 모바일 테스트 사이트
**Researched:** 2026-03-29
**Scope:** Stack recommendation for a Korean mobile-first enneagram assessment web app with anonymous sessions, persistent shareable result pages, admin stats, and Coolify deployment
**Overall recommendation confidence:** MEDIUM-HIGH

## Recommended Stack

This should be a **single Next.js full-stack app** deployed on **Coolify**, backed by **PostgreSQL**, with **Drizzle ORM** and **server-rendered share pages**.

That is the right stack for this product because:

- The product is fundamentally a **mobile-first web flow**, not a native-app problem.
- Shareable result pages benefit from **SSR, route-based metadata, and dynamic OG images**.
- Anonymous usage means you do **not** need a full end-user auth platform.
- Admin stats are mostly **SQL aggregates**, so a relational database is a better default than document storage.
- Coolify favors a boring containerized Node app with a separate managed database more than a BaaS-heavy architecture.

## Prescriptive Recommendation

### Core Application

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.x | Full-stack web framework | App Router gives SSR, route handlers, metadata, cookies, and OG image generation in one runtime. That fits anonymous tests, persistent result pages, and share previews without introducing a separate API service. | HIGH |
| React | 19.x | UI runtime | Current stable React baseline for Next.js 15. Use it normally; do not design around edge-only gimmicks. | HIGH |
| TypeScript | 5.x | Type safety across app + DB layer | This project has content logic, scoring logic, result modeling, and admin stats. Strong typing will prevent drift between questionnaire schema, score computation, and persisted result records. | HIGH |
| Node.js | 24 LTS | Runtime in container | As of March 29, 2026, Node 24 is Active LTS. Pinning to current LTS is the lowest-risk runtime choice for Coolify containers. | HIGH |

### Frontend / UI

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Styling system | Tailwind v4 is the current default utility stack for Next.js teams. It keeps the mobile-first assessment flow fast to build without locking the app into a heavy component framework. | HIGH |
| `next/font` + Korean font asset | Next.js built-in | Font loading | Use `next/font` so fonts are self-hosted and do not create extra network requests. For Korean UI, prefer a local variable Korean font asset; fall back to `Noto Sans KR` if you want the simplest setup. | HIGH |
| Radix UI primitives | current stable | Accessible overlays and controls | Use Radix only where accessibility is easy to get wrong: dialogs, popovers, tabs, dropdowns. This keeps the public UI custom while avoiding accessibility bugs in admin controls. | MEDIUM |
| shadcn/ui | current stable | Admin/internal UI building blocks | Good fit for admin cards, tables, dialogs, filters, and form scaffolding. Use selectively; do not turn the public results pages into generic dashboard UI. | MEDIUM |

### Database / Persistence

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL | 16 | Primary database | The data is relational: assessment definitions, answer payloads, computed scores, result pages, and admin aggregates. PostgreSQL is the standard boring choice and is easy to run on Coolify. | HIGH |
| Drizzle ORM | current stable | Type-safe SQL access | In 2026, Drizzle is a strong default for greenfield TypeScript apps, especially when you want explicit SQL-shaped queries for admin stats and result retrieval without a heavy runtime layer. It is a better fit here than a more abstract ORM. | MEDIUM |
| `drizzle-kit` | current stable | Migrations | Use migration files checked into git. This keeps schema changes reviewable and deployment-safe. | HIGH |
| `pg` | current stable | PostgreSQL driver | Standard Node PostgreSQL driver underneath Drizzle for a long-lived Node server on Coolify. | HIGH |

### Validation / Data Contracts

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zod | 4.x or current stable | Request/result validation | Use Zod for assessment submission payloads, admin filters, and environment validation. The scoring pipeline should reject malformed payloads early. | MEDIUM-HIGH |

### Deployment / Operations

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Coolify Application + Dockerfile build pack | current | App deployment | Use a checked-in Dockerfile instead of relying on Nixpacks defaults. Dockerfile gives deterministic builds, predictable Node versioning, and fewer deployment surprises as Coolify/Nixpacks change. | MEDIUM-HIGH |
| Coolify managed PostgreSQL service | current | Database hosting | Use a separate Coolify PostgreSQL service, not a DB container hidden inside the app deploy. This makes backups, upgrades, and operations cleaner. | HIGH |
| Coolify scheduled DB backups to S3-compatible storage | current | Recovery | Persistent result pages are the product. If the DB is lost, the product promise is broken. Backups are not optional. | HIGH |

## Supporting Libraries

Use these unless implementation proves they are unnecessary:

| Library | Purpose | When to Use | Confidence |
|---------|---------|-------------|------------|
| `jose` | Signed tokens / tamper-resistant payloads | Use for signed admin session cookies or signed one-time admin login flows. | MEDIUM |
| `nanoid` | Human-safe public result IDs | Use for shareable result slugs instead of exposing sequential IDs. | MEDIUM-HIGH |
| `date-fns` | Date formatting for admin reporting | Use sparingly for admin charts, export labels, and retention summaries. | MEDIUM |
| `recharts` | Lightweight admin charts | Use only if stats pages actually need charts. For MVP, summary cards + tables are enough. | LOW-MEDIUM |
| `@vercel/og` via `next/og` | Dynamic OG image generation | Use for share previews on result pages so Kakao/X/other share targets show meaningful previews. | HIGH |

## Anonymous Session Strategy

Do **not** introduce a full auth product for end users.

Use this model instead:

- On assessment start, set an **HttpOnly anonymous session cookie** using Next.js `cookies()`.
- Keep the cookie value opaque, random, and non-guessable.
- Persist only what you actually need:
  - If the user can abandon/resume: store a draft session row in PostgreSQL.
  - If the user only needs completion + share page: keep progress client-side until submit, then write a final result row.
- Store the permanent share target as a separate `result_public_id` or slug, not the raw session id.

Why this is the standard fit here:

- Anonymous sessions are a **state problem**, not an identity problem.
- A cookie + DB row is enough.
- Redis-backed session infrastructure is unnecessary at this stage.

## Data Model Shape

Start with a small relational schema:

- `assessments`
  - versioned questionnaire metadata
- `assessment_questions`
  - ordered Korean prompt content
- `assessment_results`
  - public id, calculated type, wing, growth/stress directions, score distribution, summary content, timestamps, optional coarse analytics fields
- `assessment_answers`
  - raw answer payload for recomputation and future algorithm changes
- `admin_users` or `admin_credentials`
  - only if admin login is handled in-app rather than via reverse proxy auth

Practical note:

- Keep **computed result fields denormalized** on `assessment_results` for fast public reads.
- Also keep the **raw answers** so scoring logic can be revised later without breaking old records.

## Recommended Deployment Topology

Use this exact shape first:

1. One `web` service:
   - Next.js 15 app running in Node 24
   - Dockerfile-based deploy on Coolify
2. One `postgres` service:
   - Coolify-managed PostgreSQL 16
   - persistent volume
   - scheduled backups
3. No Redis
4. No worker service
5. No object storage on day one unless you decide to persist generated image assets instead of generating them on request

This keeps the first production system small enough to operate on one VPS.

## What NOT to Use

### Do not use React Native / Flutter

Why not:

- The product’s growth loop is a **shared URL**, not an app install.
- Mobile web is the core channel.
- Native app packaging adds cost without improving the core user journey.

### Do not use a SPA-only Vite frontend + separate API backend

Why not:

- You would be re-building things Next.js already gives you: SSR pages, metadata, OG previews, cookies, route handlers, and server-side rendering for result pages.
- It increases deployment surface for no product gain.

### Do not use Supabase as the starting architecture

Why not:

- Supabase is good, but this app does not need its auth/storage/realtime stack on day one.
- On Coolify, plain PostgreSQL + a single Node app is operationally simpler.
- Adding a BaaS here would mostly add concepts, not leverage.

### Do not use MongoDB

Why not:

- Admin stats and result analytics are naturally relational and aggregate-heavy.
- PostgreSQL will be easier to query, index, and evolve for this workload.

### Do not use Redis for sessions initially

Why not:

- Anonymous sessions do not justify another moving part.
- Cookie + Postgres is enough until you have a clear queue/cache need.

### Do not use Prisma as the default first choice here

Why not:

- Prisma is still a valid option, but for this project Drizzle is the better fit because the admin side will lean on explicit SQL aggregates and the stack does not need a heavier abstraction layer.
- If the team is weak on SQL and strongly prefers schema-first DX, Prisma is the acceptable fallback.

## Recommended Package Set

```bash
# Core
pnpm add next@latest react@latest react-dom@latest
pnpm add drizzle-orm pg zod nanoid jose
pnpm add @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-dropdown-menu

# Dev
pnpm add -D typescript @types/node @types/react @types/react-dom
pnpm add -D tailwindcss @tailwindcss/postcss
pnpm add -D drizzle-kit eslint eslint-config-next
```

If charts are needed for admin stats:

```bash
pnpm add recharts
```

## Decision Summary

If building this today, use:

- **Next.js 15 + React 19 + TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL 16**
- **Drizzle ORM + drizzle-kit + pg**
- **HttpOnly anonymous cookie sessions**
- **Dockerfile deploy on Coolify**
- **Separate Coolify PostgreSQL service with backups**

That is the most practical 2026 stack for this product because it preserves:

- fast mobile-first UI delivery
- server-rendered share pages
- simple anonymous usage
- easy SQL-based admin stats
- low operational complexity on self-hosted infrastructure

## Confidence Notes

| Recommendation Area | Confidence | Notes |
|---------------------|------------|-------|
| Next.js 15 + React 19 for product shell | HIGH | Official docs clearly support App Router, cookies, metadata, and OG generation for this use case. |
| Tailwind CSS 4 for styling | HIGH | Current mainstream utility-first default; low architectural risk. |
| PostgreSQL on Coolify | HIGH | Strong fit for permanent result persistence and admin aggregates; first-class Coolify support. |
| Drizzle over Prisma | MEDIUM | Strong ecosystem signal and good technical fit, but this is partly a judgment call based on 2026 TypeScript ecosystem direction. |
| Dockerfile over Nixpacks on Coolify | MEDIUM-HIGH | Operational recommendation rather than hard requirement; chosen for determinism and reduced deployment drift. |
| No Redis / no BaaS at start | HIGH | Fits the actual product scope and avoids premature infrastructure. |

## Sources

- Project context: [.planning/PROJECT.md](/home/ubuntu/Project/Enneagram/.planning/PROJECT.md)
- Next.js upgrade guide for version 15: https://nextjs.org/docs/app/guides/upgrading/version-15
- Next.js `cookies()` API: https://nextjs.org/docs/app/api-reference/functions/cookies
- Next.js metadata and OG images: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Next.js font module: https://nextjs.org/docs/15/app/api-reference/components/font
- React 19 stable announcement: https://react.dev/blog/2024/12/05/react-19
- Node.js release status: https://nodejs.org/ko/about/previous-releases
- Tailwind CSS v4.0 release: https://tailwindcss.com/blog/tailwindcss-v4
- Drizzle ORM overview: https://orm.drizzle.team/docs/overview
- Drizzle database connection docs: https://orm.drizzle.team/docs/connect-overview
- Drizzle Kit overview: https://orm.drizzle.team/docs/kit-overview
- PostgreSQL on Coolify: https://coolify.io/docs/databases/postgresql
- Coolify build pack overview: https://coolify.io/docs/applications/build-packs/overview
- Coolify Dockerfile build pack: https://coolify.io/docs/applications/build-packs/dockerfile
- Coolify Nixpacks build pack: https://coolify.io/docs/applications/build-packs/nixpacks
- Coolify database backups: https://coolify.io/docs/databases/backups

## Validation Gaps

- Drizzle-over-Prisma is a **directional ecosystem call**, not a hard official-platform mandate.
- If the team strongly prefers schema-first ORM tooling and expects more junior contributors, Prisma is still a safe fallback.
