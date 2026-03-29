---
phase: 01
slug: assessment-contract-scoring-core
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
updated: 2026-03-29
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm exec vitest run test/assessment/definition.test.ts` |
| **Full suite command** | `npm exec vitest run` |
| **Typecheck command** | `npm run typecheck` |
| **Estimated runtime** | ~15-25 seconds |

---

## Sampling Rate

- **After Plan 01:** Run `npm run typecheck && npm exec vitest run --passWithNoTests`
- **After Plan 02:** Run `npm exec vitest run test/assessment/definition.test.ts && npm run typecheck`
- **After Plan 03:** Run `npm exec vitest run test/assessment/scoring.test.ts && npm run typecheck`
- **After Plan 04:** Run `npm exec vitest run test/assessment/result-contract.test.ts && npm run typecheck`
- **Before `$gsd-verify-work`:** Run `npm exec vitest run && npm run typecheck`
- **Max feedback latency:** 30 seconds

---

## Plan And Wave Graph

| Plan | Wave | Depends On | Scope | Primary Automated Commands |
|------|------|------------|-------|-----------------------------|
| `01-01` | 1 | none | Next.js/Vitest bootstrap | `npm run typecheck`, `npm exec vitest run --passWithNoTests` |
| `01-02` | 2 | `01-01` | assessment contracts, constants, fixtures, definition tests | `npm exec vitest run test/assessment/definition.test.ts`, `npm run typecheck` |
| `01-03` | 3 | `01-02` | scoring engine, mappings, score route | `npm exec vitest run test/assessment/scoring.test.ts`, `npm run typecheck` |
| `01-04` | 4 | `01-03` | snapshot contract, Drizzle schema, repository boundary | `npm exec vitest run test/assessment/result-contract.test.ts`, `npm run typecheck` |

Execution order is strictly sequential because each plan produces contracts or fixtures consumed by the next plan.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Automated Command | Status |
|---------|------|------|-------------|-------------------|--------|
| 01-01-01 | 01-01 | 1 | ASMT-01 | `npm run typecheck && npm exec vitest run --passWithNoTests` | ⬜ pending |
| 01-02-01 | 01-02 | 2 | ASMT-01 | `npm run typecheck` | ⬜ pending |
| 01-02-02 | 01-02 | 2 | ASMT-01 | `npm exec vitest run test/assessment/definition.test.ts` | ⬜ pending |
| 01-03-01 | 01-03 | 3 | ASMT-02, ASMT-03, ASMT-04, ASMT-05 | `npm exec vitest run test/assessment/scoring.test.ts` | ⬜ pending |
| 01-03-02 | 01-03 | 3 | ASMT-02, ASMT-03, ASMT-04, ASMT-05 | `npm exec vitest run test/assessment/scoring.test.ts` | ⬜ pending |
| 01-03-03 | 01-03 | 3 | ASMT-02, ASMT-03, ASMT-04, ASMT-05 | `npm exec vitest run test/assessment/scoring.test.ts && npm run typecheck` | ⬜ pending |
| 01-04-01 | 01-04 | 4 | ASMT-06 | `npm run typecheck` | ⬜ pending |
| 01-04-02 | 01-04 | 4 | ASMT-06 | `npm run typecheck` | ⬜ pending |
| 01-04-03 | 01-04 | 4 | ASMT-06 | `npm exec vitest run test/assessment/result-contract.test.ts && npm run typecheck` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Validation Prerequisites

- [x] `package.json` includes `typecheck`, `test`, and `test:assessment`
- [x] `vitest.config.ts` is planned in `01-01`
- [x] `test/assessment/definition.test.ts` is planned in `01-02`
- [x] `test/assessment/scoring.test.ts` is planned in `01-03`
- [x] `test/assessment/result-contract.test.ts` is planned in `01-04`
- [x] `test/assessment/fixtures.ts` is planned before scoring tests consume it

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean wording sanity check for question/option copy | ASMT-01 | Copy quality and ambiguity are content concerns, not fully automatable | Read the exported Korean question set and confirm labels and prompts are natural, distinct, and match the agreed 적합도형 tone |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verification commands
- [x] Sampling continuity is preserved across all four plans
- [x] The validation graph matches the actual multi-plan dependency chain
- [x] No watch-mode flags are used
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** ready
