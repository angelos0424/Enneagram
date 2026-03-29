---
phase: 03-mobile-assessment-flow
researched: 2026-03-29
status: ready
---

# Phase 03 Research: Mobile Assessment Flow

## Goal

Plan the first real end-user assessment experience: anonymous mobile entry, question answering, draft recovery, and submit-to-result navigation using the Phase 2 persistent snapshot route.

## Current Codebase Reality

- The home page is still a bootstrap placeholder at `src/app/page.tsx`.
- The scoring API already exists at `src/app/api/assessments/score/route.ts` and returns `{ result, publicResult }`.
- Assessment source-of-truth content already exists in `src/content/assessments/ko/v1.ts`.
- Input validation already exists in `src/domain/assessment/schema.ts`.
- Public result rendering already exists at `src/app/results/[publicId]/page.tsx`.
- There is no client-side assessment UI, draft persistence layer, or submit navigation flow yet.
- There are no browser-facing UI tests yet; current tests are domain and route focused with Vitest.

## Phase Boundary

Phase 03 should deliver:

1. A mobile-first anonymous assessment page that loads the authoritative question set.
2. Local draft persistence and recovery for in-progress answers.
3. Progress-aware answering flow for all required questions.
4. Submission that calls the existing score route and navigates to the returned public result URL.

Phase 03 should not deliver:

- Rich result interpretation layout polish beyond what already exists in the public snapshot page.
- Share CTA loops or recommendation modules reserved for Phase 4.
- Authenticated history or multi-device persistence.

## Architectural Findings

### 1. The client flow should consume existing typed content directly

The assessment definition is already locked in code and used by tests. Phase 03 should reuse `assessmentDefinition` and `likertOptions` directly rather than inventing a second JSON transport layer. That keeps the client question order and route payload shape aligned with the Phase 1 contract.

Implication for planning:

- One early plan should expose a typed assessment view model from existing content modules.
- UI and draft persistence should key strictly by `questionId`.

### 2. Draft recovery should stay local and anonymous

The roadmap only requires recovery after refresh or temporary interruption, not cross-device restoration. The cheapest correct boundary is browser storage keyed by assessment version.

Recommended boundary:

- A dedicated client draft module/hook stores `{ assessmentVersion, answers, updatedAt }`.
- Recovery logic must invalidate drafts when the assessment version changes.
- Submission success should clear the stored draft before navigation.

Why this matters:

- It satisfies `FLOW-04` without expanding scope into server-side sessions.
- It avoids mixing incomplete anonymous drafts with the permanent Phase 2 snapshot table.

### 3. Submission should remain server-authoritative

The existing score route already preserves machine-readable 400 responses and returns the permanent public result path. Phase 03 should treat that route as the only write boundary.

Implication for planning:

- The client submits the full answer set only when all required answers exist.
- UI should map route failures into user-facing retry states without changing API semantics.
- Navigation target should be `publicResult.href` from the response, not client-computed URLs.

### 4. The phase is both frontend and workflow-heavy

This phase combines:

- Page-level routing/UI work.
- Stateful client-side answer and progress management.
- Storage and recovery behavior.
- Integration with the Phase 2 API contract.

That likely means at least three plans:

1. Client assessment shell and mobile question flow.
2. Draft persistence and recovery.
3. Submit integration, error states, and redirect to `/results/{publicId}`.

If the planner finds a cleaner dependency split, it should still preserve that contract ordering: UI shell first, local persistence second, server submission last.

## Data And State Model Recommendations

Recommended draft shape:

```ts
type AssessmentDraft = {
  assessmentVersion: string;
  answers: Array<{ questionId: string; value: 1 | 2 | 3 | 4 | 5 }>;
  updatedAt: string;
};
```

Recommended derived UI state:

- `currentQuestionIndex`
- `answeredCount`
- `isComplete`
- `selectedValueByQuestionId`
- `isSubmitting`
- `submitError`

Recommended storage key:

- `enneagram-assessment-draft:${assessmentVersion}`

## UX Constraints For Planning

- Mobile-first means one-question-at-a-time or a very tightly spaced stacked flow, not a desktop-style long dense form.
- Progress must always be visible.
- Resume behavior must be explicit and deterministic: recover when version matches, discard when version mismatches.
- Start without login and without prerequisite setup.
- Submit affordance should remain disabled until all required answers are present.

## Validation Architecture

Existing infrastructure is enough for this phase:

- Vitest for route, state, and component-adjacent tests.
- `npm run typecheck` for compile safety.
- `npm run build` for App Router integration safety.

Recommended test split:

- Add focused tests for draft storage and recovery behavior.
- Add UI-flow tests around progress computation and submit gating.
- Add route-integration tests that assert redirect target uses returned `publicResult.href`.

## Risks And Planning Guards

### Risk: accidentally duplicating assessment shape logic on the client

Guard:

- Reuse `assessmentDefinition`, `likertOptions`, and `questionId` as the canonical source.

### Risk: stale drafts surviving version changes

Guard:

- Draft loader must check `assessmentVersion` before hydrating answers.

### Risk: client computing result URLs incorrectly

Guard:

- Navigation must always use the server response’s `publicResult.href`.

### Risk: Phase 03 bleeding into Phase 4

Guard:

- Keep result-page polish, share CTA loops, and interpretation-heavy enhancements out of this phase.

## Recommended Canonical References For The Planner

- `src/content/assessments/ko/v1.ts` — question order, prompts, likert labels, assessment version.
- `src/domain/assessment/schema.ts` — request payload contract.
- `src/app/api/assessments/score/route.ts` — submit boundary and response shape.
- `src/app/results/[publicId]/page.tsx` — post-submit destination contract.
- `test/assessment/score-route.test.ts` — locked route behavior.
- `.planning/phases/02-persistent-result-snapshots/02-02-SUMMARY.md` — Phase 2 decisions the new flow must consume.

## Planning Recommendation

Proceed with planning. The phase is well-bounded enough to skip discuss/UI-spec for now, as long as the plans explicitly preserve:

- anonymous-only local recovery,
- server-authoritative submit and redirect,
- mobile-first question progression,
- no Phase 4 share-loop scope creep.
