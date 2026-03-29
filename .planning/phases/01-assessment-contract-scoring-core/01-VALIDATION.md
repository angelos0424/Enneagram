---
phase: 01
slug: assessment-contract-scoring-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm exec vitest run test/assessment/scoring.test.ts` |
| **Full suite command** | `npm exec vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm exec vitest run test/assessment/scoring.test.ts`
- **After every plan wave:** Run `npm exec vitest run`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | ASMT-01 | unit | `npm exec vitest run test/assessment/definition.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | ASMT-02 | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "primary type"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | ASMT-03 | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "score distribution"` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | ASMT-04 | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "wing"` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | ASMT-05 | unit | `npm exec vitest run test/assessment/scoring.test.ts -t "directions"` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | ASMT-06 | unit | `npm exec vitest run test/assessment/result-contract.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — add `vitest` scripts and test command wiring
- [ ] `vitest.config.ts` — baseline Vitest config for TypeScript tests
- [ ] `test/assessment/definition.test.ts` — validates authoritative definition export and version id
- [ ] `test/assessment/scoring.test.ts` — fixture tests for primary type, score distribution, wing, and directions
- [ ] `test/assessment/result-contract.test.ts` — validates result contract carries `assessmentVersion`, `scoringVersion`, `copyVersion`
- [ ] `src/domain/assessment/fixtures.ts` or equivalent — stable fixtures shared by scoring tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean wording sanity check for question/option copy | ASMT-01 | Copy quality and ambiguity are content concerns, not fully automatable in Wave 0 | Read the exported Korean question set and confirm labels and prompts are natural, distinct, and match the agreed 적합도형 tone |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
