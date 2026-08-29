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
## DECISION-V1.0.2-NARROW-SCOPE-ADAPTATION

**Date:** 2026-08-29

**Project version:** V1.0.2

**Question:** When a material change concerns one scope dimension, can NARROW adapt that changed dimension while still truthfully representing the resulting authority as narrower than the authority it replaces?

**Decision:** NARROW may adapt the scope dimension being reauthorized, but it must impose at least one stricter enforceable boundary than the authority it replaces and must not broaden unrelated scope dimensions.

**Reason:** The default refund experiment changes customer risk from LOW to MEDIUM. Reauthorizing the changed risk dimension can therefore add MEDIUM to the allowed-risk set, but that adaptation alone is not a narrowing. The resulting authority qualifies as NARROW only if another enforceable boundary is genuinely stricter, such as reducing the maximum refund from $500 to $250. This preserves the distinction between adapting the changed condition and broadening authority generally.

**Alternatives considered:** Treat any reduction in one dimension as NARROW regardless of broadening elsewhere; prohibit every form of scope expansion even when the expanded dimension is the material condition being explicitly reauthorized; or leave NARROW undefined across multidimensional scope. These alternatives were rejected because they either permit misleading broadening, prevent the default material-change experiment from representing reauthorization of the changed condition, or leave the experimental semantics ambiguous.

**Consequences:** NARROW decisions must identify any scope dimension intentionally adapted by reauthorization. Broadening an unrelated scope dimension is invalid. At least one enforceable boundary must become stricter. A changed risk set plus an unchanged $500 maximum is not NARROW; changed risk plus a $250 maximum is. Tests must verify this distinction.

## D-020 - Strict multidimensional NARROW semantics

Question:
Can a NARROW decision broaden one authority dimension when another authority dimension becomes stricter?

Decision:
No. NARROW retains its strict meaning: the resulting permissible authority must be a true subset of the authority it replaces. A NARROW decision may make one or more enforceable dimensions stricter, but it may not broaden any enforceable authority dimension.

Reason:
A scope that lowers the monetary maximum while adding a previously unauthorized risk level is not purely narrower. It blocks some actions that were previously permitted while permitting other actions that were previously outside authority. Calling that mixed change NARROW would obscure the actual authority change and weaken the experimental distinction between disposition and enforceable scope.

Alternatives considered:
- Preserve DECISION-V1.0.2-NARROW-SCOPE-ADAPTATION and allow the materially changed dimension to broaden when another dimension narrows.
- Treat any net or intuitively tighter multidimensional scope as NARROW.
- Preserve strict subset semantics and require a different disposition or future authority primitive for mixed broaden-and-restrict changes.

Decision:
Preserve strict subset semantics.

Consequences:
- DECISION-V1.0.2-NARROW-SCOPE-ADAPTATION is superseded by this decision.
- NARROW rejects any new risk level, larger amount ceiling, longer transaction-age ceiling, or other supported scope broadening even when another dimension becomes stricter.
- The default LOW-to-MEDIUM material-change scenario can use NARROW to reduce the amount ceiling while retaining LOW-only risk authority, which means the changed MEDIUM request remains outside that NARROW authority.
- CONDITION may explicitly reauthorize the changed risk scope while adding an enforceable typed predicate; this is not represented as NARROW.
- Tests must include a mixed narrow-plus-broaden rejection case.

Date:
2026-08-29

## D-021 - Version 2 canonical typed authority scope

Question:
How should Version 2 represent authority boundaries across materially different domains without building scenario-specific execution engines?

Decision:
Represent executable authority scope canonically as typed field/operator/value constraints. Preserve the V1 refund scope shape as a backward-compatible input form that is normalized into those constraints before boundary enforcement.

Reason:
The V1 conceptual model is general, but its execution scope implementation directly recognizes refund-specific fields. Version 2 is intended to test whether the authority model generalizes. Domain-specific branches in the execution engine would hide rather than test that question.

Consequences:
- The execution engine evaluates canonical typed constraints rather than refund-specific scope properties.
- Existing V1 refund scope remains accepted and is adapted into canonical constraints.
- New scenarios should primarily add configuration and domain facts, not execution-engine branches.
- Generic set membership requires typed IN predicates to validate arrays whose elements match valueType.

## D-022 - Procurement metric changes are replacement scope, not NARROW

Question:
Can changing procurement authority from equipmentPrice to totalAcquisitionCost be represented as NARROW?

Decision:
No. A change in the governed metric is not demonstrably a subset relationship. Version 2 permits RENEW to create a new authority version with an explicit replacement scope. NARROW remains limited to deterministic, comparable subset relationships.

Reason:
Calling a metric/basis replacement NARROW would weaken strict NARROW semantics and manufacture comparability that the model has not established.

Consequences:
- equipmentPrice -> totalAcquisitionCost is represented as a replacement authority scope under reauthorization.
- The harness does not claim that either procurement metric is economically correct.
- The experiment can observe the consequence of enforcing either configured basis without procurement-specific execution logic.

Date:
2026-08-29

## V2-D04 — Five-scenario catalog uses one shared authority-to-execution model

**Date:** 2026-08-29
**Version:** Version 2 development

**Question**
How should Version 2 add materially different organizational domains without turning the harness into five separately hard-coded governance applications?

**Decision**
Version 2 uses one scenario catalog containing exactly five approved scenarios: Automated Refund, Privileged System Access, Workforce Shift Assignment, Procurement / Total Acquisition Cost, and Customer Account Restriction. Scenario configuration supplies domain facts, typed authority constraints, materiality rules, actors, evidence, default dispositions, presentation text, and domain-specific controls. The shared materiality, authority, boundary, execution, evidence, replay, and architecture engines remain common.

The procurement metric change from `equipmentPriceCents` to `totalAcquisitionCostCents` is represented as a replacement scope created through reauthorization, not falsely classified as NARROW. Strict NARROW remains limited to demonstrable subset/restriction relationships on comparable authority dimensions.

**Reason**
The Version 2 research question is whether the authority model generalizes. A scenario-specific execution engine would hide failure to generalize. Configuration-driven domain variation makes scenario-specific assumptions inspectable and makes any genuinely missing general-purpose authority primitive visible as a research finding.

**Alternatives considered**
- Five independent scenario implementations — rejected because this would not test model generalization.
- Force procurement basis change into NARROW — rejected because changing the governed metric is not necessarily a subset relationship.
- Keep only the refund UI and change raw JSON manually — rejected because Version 2 explicitly requires a first-class scenario selector and scenario-specific controls.

**Consequences**
Scenario switching must clear derived run state, preserve scenario identity in evidence/replay, and never leave stale labels, controls, actors, conditions, or boundaries from another scenario. The five-scenario set is closed for Version 2.

## Decision: Version 2 comprehensive matrix and scenario-schema compatibility

**Date:** 2026-08-29

**Question**

How should Version 2 validate cross-domain generalization before independent external review?

**Decision**

Add a deterministic internal matrix that exercises the same shared authority-to-execution model across all five scenarios, both architectures, all six dispositions where representable, technical PASS/FAIL, material/non-material behavior, typed condition causality, boundary relationships, prediction/confidence independence, replay, import/export, and architecture attribution.

Keep the export envelope at schema version `1.0` for backward compatibility, while accepting and preserving scenario payload schema versions `1.0` and `2.0`.

Make the procurement CONDITION template causally operational by configuring a total-acquisition-cost boundary that includes the example Vendor C total and requiring `financeApproval == true` as the decisive condition.

**Reason**

A five-scenario UI is not sufficient evidence of model generalization. Version 2 needs deterministic cross-domain tests that can distinguish implementation defects, non-causal controls, architecture favoritism, stale state, replay failures, and cases where the system correctly enforces a badly specified authority boundary.

**Alternatives considered**

- Proceed directly to independent review after the five-scenario selector checkpoint.
- Treat the existing scenario-catalog smoke tests as sufficient cross-domain evidence.
- Change the procurement threshold rather than test the governed-metric distinction explicitly.

**Consequences**

Version 2 receives a larger internal evidence base before independent review. The matrix also makes the procurement wrong-boundary result explicit rather than treating every ALLOW under a material change as an implementation defect.
