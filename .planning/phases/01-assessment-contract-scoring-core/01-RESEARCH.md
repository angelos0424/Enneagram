# Phase 1: Assessment Contract & Scoring Core - Research

**Researched:** 2026-03-29
**Domain:** Versioned assessment content, server-authoritative scoring, result-version contract
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Content Source
- **D-01:** Phase 1에서는 문항, 선택지, 유형 설명 원본을 코드 파일로 고정한다.
- **D-02:** 운영 중 실시간 수정 가능한 DB 기반 콘텐츠 관리 기능은 이번 phase 범위에 포함하지 않는다.

### Response And Scoring Contract
- **D-03:** 응답 형식은 5점 리커트 척도로 고정한다.
- **D-04:** 응답 라벨은 적합도형 표현을 사용한다: `전혀 나와 맞지 않는다 / 별로 맞지 않는다 / 반반이다 / 꽤 맞는다 / 매우 잘 맞는다`.
- **D-05:** 각 응답은 에니어그램 9개 유형 점수에 가중치 방식으로 반영되는 구조를 전제로 한다.

### Result Determination Rules
- **D-06:** 주 유형은 최고점 규칙으로 결정한다.
- **D-07:** 날개는 주 유형의 인접 유형 중 더 높은 점수를 가진 유형으로 결정한다.
- **D-08:** 성장 방향과 스트레스 방향은 주 유형 기준의 고정 매핑으로 결정한다.
- **D-09:** 시스템은 최종 판정과 함께 근접 상위 유형 정보도 결과 데이터에 남겨 이후 결과 해석에 활용할 수 있어야 한다.

### Versioning And Integrity
- **D-10:** 결과 저장 시 문항 세트 버전, 점수 계산 버전, 결과 카피 버전을 모두 함께 저장한다.
- **D-11:** 이후 규칙이나 카피가 바뀌더라도 과거 결과는 당시 기준을 재현할 수 있어야 한다.

### the agent's Discretion
- 문항/선택지/가중치 정의 파일의 정확한 파일 포맷 (`ts` vs `json`), 디렉터리 구조, 타입 모델링 방식은 the agent가 결정한다.
- 점수 정규화 방식, 근접 상위 유형의 저장 개수, 테스트 fixture 구조는 the agent가 결정한다.
- 유형 설명 원본을 Phase 1에서 최소 계약 수준으로 둘지, placeholder 포함 구조로 둘지는 the agent가 결정한다.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASMT-01 | 운영자는 버전이 명시된 한국어 에니어그램 문항 세트와 선택지를 관리 가능한 형태로 유지할 수 있다. | Code-first `assessmentDefinition` module, typed question ids, version constants, single source of truth directory |
| ASMT-02 | 시스템은 제출된 응답을 서버에서 계산하여 주 유형을 산출할 수 있다. | Route Handler -> Zod validation -> pure scoring engine -> deterministic top-type resolver |
| ASMT-03 | 시스템은 제출된 응답을 서버에서 계산하여 유형별 점수 분포를 산출할 수 있다. | Raw score aggregation plus explicit normalization contract stored alongside raw totals |
| ASMT-04 | 시스템은 산출된 주 유형과 점수 분포를 바탕으로 날개를 결정할 수 있다. | Adjacent-type lookup map plus deterministic tie rule |
| ASMT-05 | 시스템은 주 유형을 기준으로 성장 방향과 스트레스 방향을 결정할 수 있다. | Fixed lookup tables keyed by primary type, kept separate from UI copy |
| ASMT-06 | 시스템은 결과 저장 시 문항 버전과 계산 버전을 함께 기록할 수 있다. | Result schema includes `assessmentVersion`, `scoringVersion`, `copyVersion` and optional top-nearby types |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Mobile-first web experience is mandatory.
- Korean-only content for the initial release.
- Anonymous user model; do not design Phase 1 around account identity.
- Persistent results are a product constraint; contracts must support later permanent snapshots.
- Deployment target is Coolify.
- Use the established stack direction: Next.js 15, React 19, TypeScript, Tailwind 4, PostgreSQL 16, Drizzle ORM.
- Keep scoring server-authoritative and snapshot-first.
- Do not plan DB-backed real-time content management in this phase.
- Validation architecture is enabled in `.planning/config.json`; Phase 1 planning should include test foundation work.

## Summary

Phase 1 should be planned as a contract-definition phase, not a feature-polish phase. The highest-value output is a deterministic scoring pipeline with versioned inputs and a stable result shape that every later phase can trust. Because the repo is still greenfield, the plan should explicitly include the bootstrap work needed to create a TypeScript app skeleton, a scoring domain module, a persistence schema, and a test harness.

The key technical decision is to keep all questionnaire content and scoring rules in code, behind typed modules, with the server as the only authority that can turn answers into results. The client should eventually send only `{ assessmentVersion, answers[] }`; the server validates the payload, resolves the matching definition, computes raw type totals, computes normalized scores for presentation, derives wing and growth/stress directions, and stamps the versions into the persisted result.

The main uncertainty is not the web stack. It is questionnaire quality and ambiguity policy. The plan should therefore lock down question IDs, answer values, weight-map structure, normalization formula, tie-handling rules, and top-nearby-type retention before Phase 2 starts storing immutable snapshots.

**Primary recommendation:** Plan Phase 1 around a pure scoring engine plus a versioned assessment-definition module, and treat API, DB schema, and tests as adapters around that core.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 15.5.3 | App shell and Route Handlers | Next.js App Router is the project-standard full-stack runtime and gives a native server boundary for scoring APIs. |
| `react` | 19.1.1 | UI/runtime baseline | Required by Next.js 15; keeps the project aligned with the current stable React line. |
| `typescript` | 5.9.2 | Typed content and scoring contracts | Prevents drift between question definitions, answer payloads, derived result shape, and DB schema. |
| `zod` | 4.1.5 | Submission/result validation | Best fit for validating untrusted answer payloads before scoring. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `drizzle-orm` | 0.44.5 | Typed persistence contract | Use for `results` and version fields once the phase includes persistence schema work. |
| `pg` | 8.16.3 | PostgreSQL driver | Use under Drizzle for the canonical server-side DB connection. |
| `drizzle-kit` | 0.31.4 | Schema migration generation | Use when creating the initial results/version schema. |
| `vitest` | 3.2.4 | Fast unit tests for scoring domain | Use for deterministic fixtures around scoring, tie cases, and versioned contracts. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `zod` | handwritten guards | Not worth it; payload validation is easy to get subtly wrong and drifts from TypeScript types. |
| `vitest` | Jest | Jest is viable, but Vitest is lighter for a new TypeScript project and faster for pure-domain tests. |
| code-first content modules | JSON files only | JSON is simpler for non-code editing, but TypeScript modules give safer enums, ids, and derived types in a greenfield codebase. |

**Installation:**
```bash
npm install next@15.5.3 react@19.1.1 react-dom@19.1.1 zod@4.1.5 drizzle-orm@0.44.5 pg@8.16.3
npm install -D typescript@5.9.2 vitest@3.2.4 drizzle-kit@0.31.4 @types/node @types/react @types/react-dom @types/pg
```

**Version verification:** `npm view` did not complete in the sandboxed environment, so current versions were verified against npm package pages on 2026-03-29. Verified publish recency: `next` 15.5.3 published 7 hours ago, `react` 19.1.1 published 7 hours ago, `typescript` 5.9.2 published about 1 month ago, `zod` 4.1.5 published 8 days ago, `drizzle-orm` 0.44.5 published 12 days ago, `drizzle-kit` 0.31.4 published 2 months ago, `pg` 8.16.3 published 2 months ago, `vitest` 3.2.4 published 3 months ago.

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/
│   └── api/
│       └── assessments/
│           └── submit/
│               └── route.ts      # server-authoritative scoring entrypoint
├── domain/
│   └── assessment/
│       ├── definition.ts         # current assessment catalog export
│       ├── scoring.ts            # pure score aggregation and derivation
│       ├── normalization.ts      # raw -> presentation scores
│       ├── mappings.ts           # wing/direction fixed maps
│       └── types.ts              # stable domain contracts
├── content/
│   └── assessments/
│       └── ko/
│           └── v1.ts             # versioned Korean prompts, options, weights
├── db/
│   ├── schema.ts                 # results schema with version fields
│   └── client.ts                 # drizzle connection
└── test/
    └── assessment/
        ├── fixtures.ts           # golden answer sets
        └── scoring.test.ts       # deterministic domain tests
```

### Pattern 1: Pure Scoring Core
**What:** Put all scoring math in a framework-free module that accepts validated inputs and returns a full derived result.
**When to use:** Always. UI, route handlers, and persistence layers should never own scoring logic.
**Example:**
```typescript
type ScoreInput = {
  assessmentVersion: string;
  answers: Array<{ questionId: string; value: 1 | 2 | 3 | 4 | 5 }>;
};

type ScoreResult = {
  assessmentVersion: string;
  scoringVersion: string;
  primaryType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  wingType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  growthType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  stressType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  rawScores: Record<number, number>;
  normalizedScores: Record<number, number>;
  nearbyTypes: Array<{ type: number; score: number; gapFromPrimary: number }>;
};

export function scoreAssessment(input: ScoreInput): ScoreResult {
  // validated input only; no DB or framework calls here
  return deriveResult(input);
}
```
Source: project-specific pattern inferred from [.planning/research/ARCHITECTURE.md](/home/ubuntu/Project/Enneagram/.planning/research/ARCHITECTURE.md) and Next.js Route Handler boundaries at https://nextjs.org/docs/app/api-reference/file-conventions/route

### Pattern 2: Versioned Content Catalog
**What:** Export a single current assessment definition and keep old definitions loadable by version id.
**When to use:** For questions, answer options, score weights, and minimal type metadata.
**Example:**
```typescript
export const likertOptions = [
  { value: 1, label: "전혀 나와 맞지 않는다" },
  { value: 2, label: "별로 맞지 않는다" },
  { value: 3, label: "반반이다" },
  { value: 4, label: "꽤 맞는다" },
  { value: 5, label: "매우 잘 맞는다" },
] as const;

export const assessmentV1 = {
  version: "ko-enneagram-v1",
  locale: "ko-KR",
  options: likertOptions,
  questions: [
    {
      id: "q_001",
      prompt: "나는 갈등보다 원칙을 먼저 떠올리는 편이다.",
      weights: {
        1: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0 },
      },
    },
  ],
} as const;
```
Source: code-first content requirement from [.planning/phases/01-assessment-contract-scoring-core/01-CONTEXT.md](/home/ubuntu/Project/Enneagram/.planning/phases/01-assessment-contract-scoring-core/01-CONTEXT.md) and Drizzle/TypeScript source-of-truth pattern at https://orm.drizzle.team/docs/sql-schema-declaration

### Pattern 3: Thin Route Handler Adapter
**What:** Use a Route Handler only for request parsing, validation, orchestration, and persistence.
**When to use:** For the submit endpoint that Phase 3 will call.
**Example:**
```typescript
import { z } from "zod";

const submissionSchema = z.object({
  assessmentVersion: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = submissionSchema.parse(await request.json());
  const result = scoreAssessment(body);
  return Response.json(result, { status: 200 });
}
```
Source: Next.js `route.ts` handlers at https://nextjs.org/docs/app/api-reference/file-conventions/route and Zod parsing patterns at https://zod.dev/packages/zod

### Pattern 4: Persist Snapshot Fields, Not Just Answers
**What:** Store raw scores and derived fields together with version ids.
**When to use:** As soon as a result table exists, even before public share pages are built.
**Example:**
```typescript
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const assessmentResults = pgTable("assessment_results", {
  id: text("id").primaryKey(),
  assessmentVersion: text("assessment_version").notNull(),
  scoringVersion: text("scoring_version").notNull(),
  copyVersion: text("copy_version").notNull(),
  primaryType: text("primary_type").notNull(),
  wingType: text("wing_type").notNull(),
  growthType: text("growth_type").notNull(),
  stressType: text("stress_type").notNull(),
  rawScores: jsonb("raw_scores").notNull(),
  normalizedScores: jsonb("normalized_scores").notNull(),
  nearbyTypes: jsonb("nearby_types").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```
Source: Drizzle schema declarations at https://orm.drizzle.team/docs/sql-schema-declaration and snapshot-first direction from [.planning/research/ARCHITECTURE.md](/home/ubuntu/Project/Enneagram/.planning/research/ARCHITECTURE.md)

### Anti-Patterns to Avoid

- **Scoring inside React components:** Guarantees drift and makes deterministic testing harder.
- **Using display labels as business values:** Keep answer `value` numeric and label text separate.
- **Inline wing/direction math in multiple files:** Centralize lookup tables so a rule change is one edit.
- **Only storing normalized scores:** Raw totals are needed to re-explain or compare later logic.
- **Single `CURRENT_VERSION` constant with no sub-versions:** Store assessment, scoring, and copy versions separately because they change independently.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request validation | ad hoc `if` trees | `zod` schemas | Less drift, better error handling, typed output. |
| DB diffing | manual SQL rename tracking | `drizzle-kit` migrations | Safer review path for initial result schema and later version fields. |
| Test runner setup | custom assertion scripts | `vitest` | Fast, TypeScript-friendly, good for pure deterministic logic. |
| Adjacent wing resolution | scattered `% 9` arithmetic | explicit adjacency map | Easier to audit and less error-prone for type 1/9 wraparound. |
| Version stamping | setting fields at call sites | central `RESULT_VERSION` object | Prevents partial version writes and inconsistent records. |

**Key insight:** The hard part of this phase is correctness drift, not algorithmic complexity. Centralized schema, lookup, and version objects are more important than clever abstractions.

## Common Pitfalls

### Pitfall 1: Question IDs and weight maps drift apart
**What goes wrong:** Answers submit fine, but scoring silently ignores or misapplies some questions.
**Why it happens:** Question ids live in one file and weights or fixtures live in another with no typed linkage.
**How to avoid:** Export question ids from the same definition module that owns prompt text and weights.
**Warning signs:** Tests need string literals copied into multiple files; missing-key cases only show up at runtime.

### Pitfall 2: Tie handling is left implicit
**What goes wrong:** Two equal top scores can produce unstable primary type or nearby-type ordering depending on object iteration.
**Why it happens:** Highest-score logic is specified, but tie-breaking policy is not.
**How to avoid:** Plan a deterministic secondary ordering rule now, for example "raw score desc, then type asc", and test it explicitly.
**Warning signs:** The same input can reorder nearby types across runtimes or refactors.

### Pitfall 3: Normalization is mixed with raw scoring
**What goes wrong:** UI-oriented scaling contaminates canonical totals, making future logic changes hard to reason about.
**Why it happens:** Teams optimize early for charts instead of preserving domain truth.
**How to avoid:** Return both `rawScores` and `normalizedScores`; raw scores drive derivation, normalized scores drive presentation.
**Warning signs:** Primary type starts depending on percentages rather than totals.

### Pitfall 4: Version fields are added only when persistence arrives
**What goes wrong:** Early test fixtures and result objects omit version metadata, so Phase 2 has to retrofit contracts.
**Why it happens:** Teams treat versioning as storage detail instead of domain contract.
**How to avoid:** Include version fields in the scoring result type and fixtures from the first implementation commit.
**Warning signs:** Tests assert only `primaryType` and ignore `assessmentVersion` or `scoringVersion`.

### Pitfall 5: Korean answer labels become the scoring source
**What goes wrong:** Copy edits accidentally alter scoring or break parsing.
**Why it happens:** The code uses localized label strings instead of numeric option values.
**How to avoid:** Use stable numeric values `1..5` with labels as separate localized presentation data.
**Warning signs:** Payloads or fixtures contain Korean strings instead of normalized values.

## Code Examples

Verified patterns from official sources:

### Zod Request Validation
```typescript
import * as z from "zod";

const submissionSchema = z.object({
  assessmentVersion: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.number().int().min(1).max(5),
    }),
  ),
});

const parsed = submissionSchema.parse(input);
```
Source: https://zod.dev/packages/zod and https://zod.dev/?id=safeparse

### Next.js Route Handler
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ ok: true });
}
```
Source: https://nextjs.org/docs/app/api-reference/file-conventions/route

### Drizzle Schema Declaration
```typescript
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
});
```
Source: https://orm.drizzle.team/docs/sql-schema-declaration

### Drizzle PostgreSQL Client
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool });
```
Source: https://orm.drizzle.team/docs/get-started/postgresql

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sync `cookies()` access in Next pages | async `cookies()` in modern Next docs | documented by Next.js 15 / updated Feb 27, 2026 | Future phases should not plan around sync cookie APIs. |
| untyped request parsing | `zod`-validated route payloads | mainstream current TS practice; Zod 4 stable | Better server safety and less contract drift. |
| recompute results from current logic | snapshot-first result storage | current project architecture decision | Old links remain reproducible after scoring/copy changes. |

**Deprecated/outdated:**
- Planning client-authoritative scoring: contradicts locked project architecture and should be treated as out of bounds.
- Planning DB-backed content authoring in Phase 1: explicitly out of scope per D-02.

## Open Questions

1. **What exact tie-break rule should primary type and nearby types use?**
   - What we know: primary type is "highest score"; nearby types must also be retained.
   - What's unclear: behavior when two or more types share the same raw total.
   - Recommendation: lock a deterministic secondary order in the phase plan and add fixtures for it.

2. **What normalization formula should power score distribution charts?**
   - What we know: normalization is discretionary and should be separate from raw totals.
   - What's unclear: max-based scaling, percentage of sum, or another presentation-only transform.
   - Recommendation: choose one formula, document it in `scoringVersion`, and keep raw totals canonical.

3. **How many nearby types should be stored?**
   - What we know: user wants "근접 상위 유형 정보".
   - What's unclear: top 2 or top 3, and whether ties expand the list.
   - Recommendation: default to top 3 sorted deterministically unless product wants a smaller payload.

4. **Does Phase 1 include actual DB writes or only schema-ready contracts?**
   - What we know: ASMT-06 requires result storage to carry version fields.
   - What's unclear: whether the phase should deliver a working persisted submit flow or just the schema and domain types.
   - Recommendation: plan at minimum for DB schema plus repository contract, even if final user flow arrives in Phase 3.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js / TypeScript runtime | ✓ | 22.22.0 | Upgrade to Node 24 LTS before production alignment |
| npm | package install / scripts | ✓ | 10.9.4 | — |
| pnpm | optional package manager | ✗ | — | Use `npm` |
| Docker | local PostgreSQL or containerized app bootstrap | ✓ | 28.4.0 | — |
| PostgreSQL CLI (`psql`) | manual DB inspection | ✗ | — | Use Drizzle migrations plus Dockerized Postgres |

**Missing dependencies with no fallback:**
- None for planning. Implementation can start with `npm` and Docker.

**Missing dependencies with fallback:**
- `pnpm` missing; use `npm` for this repo.
- `psql` missing; use Drizzle and containerized Postgres instead of local CLI inspection.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 recommended, not yet installed |
| Config file | none — see Wave 0 |
| Quick run command | `npm exec vitest run test/assessment/scoring.test.ts` |
| Full suite command | `npm exec vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASMT-01 | versioned Korean question set exports one authoritative definition | unit | `npm exec vitest run test/assessment/definition.test.ts` | ❌ Wave 0 |
| ASMT-02 | identical answer payload always yields same primary type | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "primary type"` | ❌ Wave 0 |
| ASMT-03 | identical answer payload always yields same type score distribution | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "score distribution"` | ❌ Wave 0 |
| ASMT-04 | wing is derived from adjacent higher-scoring type | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "wing"` | ❌ Wave 0 |
| ASMT-05 | growth/stress directions resolve from primary type mapping | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "directions"` | ❌ Wave 0 |
| ASMT-06 | persisted result contract carries assessment/scoring version fields | unit | `npm exec vitest run test/assessment/result-contract.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm exec vitest run test/assessment/scoring.test.ts`
- **Per wave merge:** `npm exec vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `package.json` and script baseline
- [ ] `tsconfig.json` with `strict: true`
- [ ] `vitest.config.ts`
- [ ] `test/assessment/scoring.test.ts` for deterministic scoring fixtures
- [ ] `test/assessment/definition.test.ts` for versioned catalog contract
- [ ] `test/assessment/result-contract.test.ts` for version field coverage
- [ ] Framework install: `npm install -D vitest@3.2.4`

## Sources

### Primary (HIGH confidence)
- [.planning/phases/01-assessment-contract-scoring-core/01-CONTEXT.md](/home/ubuntu/Project/Enneagram/.planning/phases/01-assessment-contract-scoring-core/01-CONTEXT.md) - locked phase decisions and scope
- [.planning/REQUIREMENTS.md](/home/ubuntu/Project/Enneagram/.planning/REQUIREMENTS.md) - ASMT-01..06 requirement definitions
- [.planning/research/ARCHITECTURE.md](/home/ubuntu/Project/Enneagram/.planning/research/ARCHITECTURE.md) - server-authoritative and snapshot-first architecture
- [.planning/research/STACK.md](/home/ubuntu/Project/Enneagram/.planning/research/STACK.md) - project stack baseline
- https://nextjs.org/docs/app/api-reference/file-conventions/route - Route Handler pattern
- https://nextjs.org/docs/app/api-reference/functions/cookies - current cookie API behavior
- https://orm.drizzle.team/docs/sql-schema-declaration - Drizzle schema source-of-truth pattern
- https://orm.drizzle.team/docs/get-started/postgresql - Drizzle PostgreSQL setup
- https://zod.dev/packages/zod - Zod API and parsing methods
- https://vitest.dev/config/ - Vitest configuration pattern
- https://nodejs.org/en/about/previous-releases - current Node LTS status

### Secondary (MEDIUM confidence)
- https://www.npmjs.com/package/next?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/react?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/typescript?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/zod?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/drizzle-orm?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/drizzle-kit?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/pg?activeTab=versions - current stable package version and publish recency
- https://www.npmjs.com/package/vitest?activeTab=versions - current stable package version and publish recency

### Tertiary (LOW confidence)
- None. Remaining uncertainty is about product policy choices, not source quality.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - stack is already project-directed and current package versions were verified against current package pages.
- Architecture: HIGH - locked project decisions and official framework/database docs align cleanly.
- Pitfalls: MEDIUM - main gaps are product-policy decisions around normalization and tie-handling, not implementation primitives.

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
