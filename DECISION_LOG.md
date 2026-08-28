# Decision Log

This file records material conceptual and architectural decisions.

Ordinary implementation choices should not be recorded here unless they materially affect the conceptual model, experimental design, authority semantics, state semantics, or architecture.

## D-001 - Separate state dimensions

Decision:
Authority status, governance workflow state, and execution state are separate dimensions.

Reason:
Collapsing them would obscure whether technical execution, governance workflow, and current authority are actually distinct.

## D-002 - Neutral architecture names

Decision:
Use SAME-LAYER REAUTHORIZATION and SEPARATED REAUTHORIZATION.

Reason:
The experiment must not encode a conclusion that one architecture is inherently stronger.

## D-003 - TRANSFER semantics

Decision:
TRANSFER transfers decision authority to another authorized decision owner.

It does not automatically create executable authority.

## D-004 - Disposition and authority status remain separate

Decision:
Governance disposition is not the same as current authority validity or status.

## D-005 - REFUSE semantics

Decision:
REFUSE is a governance disposition.

It does not create an authority record with status REFUSED.

## D-006 - RENEW semantics

Decision:
RENEW creates a new authority version.

It does not reactivate or overwrite an invalidated authority record.

## D-007 - NARROW semantics

Decision:
NARROW creates a new authority version with a more restrictive enforceable scope.

## D-008 - Explicit enforceable boundary

Decision:
The enforceable boundary is an explicit artifact between authority and execution.

## D-009 - Execution dependency

Decision:
The execution engine evaluates enforceable boundaries rather than governance disposition labels.

## D-010 - Non-authorizing signals

Decision:
Recommendation, model confidence, technical validity, and recommendation source do not independently create permission.

## D-011 - Experimental-result language

Decision:
Experimental results describe observed behavior rather than embed predetermined interpretive conclusions.

## D-012 - Expected versus actual

Decision:
Expected-versus-actual comparison is separate from governance-control assertion.

## D-013 - Tests are part of the research instrument

Decision:
The tests directory and required tests are V1 requirements.

## D-014 - Browser-side event-log limitation

Decision:
Browser-side append-only logging must not be represented as cryptographically immutable or tamper-resistant.

## D-015 - Fail-closed scope

Decision:
Fail-closed behavior is a V1 experimental default, not a universal governance claim.

## D-016 - Policy in V1

Decision:
Policy in V1 means configured governance rules relevant to the experiment.

V1 does not require a separate policy-as-code engine.

## D-017 - Governing documents retained in repository

Decision:
The current governing session instructions and startup prompt are maintained in the repository for continuity and transparency.

## D-018 - Repository baseline preservation

Question:
How should the authoritative starting documents be moved from the initial repository root to their normal prompts locations?

Decision:
Move the actual DOCX packages without content transformation and verify SHA-256 equality before and after relocation.

Reason:
The repository baseline must preserve the authoritative starting record exactly and must not introduce content normalization, re-encoding, rewriting, or reconstruction from extracted text.

Consequences:
The initial bootstrap records source and destination SHA-256 hashes and validates the DOCX package structure before and after relocation.

Date:
2026-08-28

## D-019 - Preserve actual initial Git history

Question:
How should repository history be recorded after the intended pre-code baseline commit was discovered not to have been created?

Decision:
Do not reconstruct or fabricate a historical pre-code commit.

Create the first actual Git commit from the current verified repository foundation and explicitly record that it includes both the governed pre-code materials and the deterministic state-validation foundation.

Reason:
Project history must reflect what actually occurred. Creating a retroactive commit and representing it as an earlier repository state would manufacture history contrary to the governing instructions.

Alternatives considered:
- Reconstruct the pre-code state from current files and create an artificial earlier commit.
- Continue without recording the failed checkpoint.
- Preserve the current real state as the first commit and document the failed intended checkpoint.

Decision:
Preserve the current real state as the first commit and document the failed intended checkpoint.

Consequences:
- The first Git commit includes the deterministic state and validation implementation rather than only documentation.
- The repository still preserves a clear documented distinction between the governed model and the first implementation layer.
- No false historical continuity is introduced.
- Later commits can proceed normally from this truthful baseline.

Date:
2026-08-28