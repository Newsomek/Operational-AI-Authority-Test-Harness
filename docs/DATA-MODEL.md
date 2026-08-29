# Data Model

## Purpose

This document defines the V1 experimental data model for the Operational AI Authority Test Harness.

The model exists to preserve the conceptual distinctions required by the governing specification.

It is not intended to become a general enterprise governance data model.

## Modeling rules

The implementation must preserve the distinction among:

- scenario;
- policy;
- actor;
- evidence;
- recommendation;
- technical capability;
- technical validity;
- materiality result;
- governance decision;
- authority version;
- enforceable boundary;
- governance workflow state;
- execution attempt;
- expected result;
- actual result;
- prediction comparison;
- control assertion;
- event;
- and consequence.

No single generic status field may replace these concepts.

## Scenario

A scenario describes the experimental world being tested.

Minimum fields:

- scenarioId
- scenarioVersion
- name
- description
- actionDefinition
- requestedAction
- conditions
- materialityRules
- policyVersion
- actors
- evidence
- initialAuthority
- expectedResult
- controlAssertions

A scenario snapshot used for a run must be preserved.

Editing a scenario after a run must not rewrite the prior run snapshot.

## Action definition

Defines an action the modeled system is technically capable of attempting.

Minimum fields:

- actionType
- parameters
- technicalMaximum or other applicable capability boundary

Default V1 action:

AUTO_REFUND

## Requested action

Represents the actual consequence requested during execution evaluation.

Default example:

- actionType: AUTO_REFUND
- amountCents: 40000

Money should be represented as integer cents in V1 to avoid floating-point ambiguity.

## Conditions

Represents current environmental or business conditions relevant to authority and materiality.

Default example fields:

- customerRisk
- transactionAgeDays
- refundAmountCents

Condition values are experimental inputs.

## Recommendation

Represents what the recommendation source suggests.

Minimum fields:

- recommendationId
- actionType
- parameters
- confidence if configured
- source

Recommendation is not authority.

Recommendation does not create permission.

## Technical capability

Represents whether the system can technically perform the requested action.

Minimum fields:

- supported
- actionType
- technicalLimit where applicable

Technical capability is not authority.

## Technical validity

Represents the result of technical validation or revalidation.

Minimum fields:

- status
- reason
- evidenceReferences

Permitted V1 values:

- PASS
- FAIL

Technical validity is not authority.

## Actor

Represents a configured experimental actor.

Minimum fields:

- actorId
- name
- capabilities

Capabilities may include:

- OPERATE_SYSTEM
- DETECT_CHANGE
- DETERMINE_MATERIALITY
- OWN_CONSEQUENCE
- REVALIDATE
- REAUTHORIZE
- EXECUTE

Configured actor capability does not prove real-world organizational legitimacy.

## Evidence item

Evidence is first-class data.

Minimum fields:

- evidenceId
- type
- description
- value
- source
- required
- available
- reviewed
- reviewedBy
- relatedCondition
- relatedDecision
- version

Available evidence is not the same as reviewed evidence.

A governance decision must reference evidence actually considered when the configured rule requires review.

## Materiality rule

Represents a preconfigured rule for determining whether a condition change is material.

Minimum fields:

- ruleId
- field
- operator
- comparisonValue
- result

Permitted results:

- MATERIAL
- NON_MATERIAL
- AMBIGUOUS

Materiality rules must be established before the run in which they are evaluated.

## Materiality evaluation

Represents the observed application of configured materiality rules to a change.

Minimum fields:

- evaluationId
- priorConditions
- currentConditions
- applicableRules
- result
- decisionOwner if result is AMBIGUOUS

## Governance decision

Represents an organizational decision modeled by the experiment.

Minimum fields:

- decisionId
- actorId
- decisionType
- disposition
- evidenceReviewed
- rationale
- inputs
- policyVersion
- sequence

Permitted reauthorization dispositions:

- RENEW
- NARROW
- CONDITION
- TRANSFER
- SUSPEND
- REFUSE

Disposition is not authority status.

Disposition is not an execution rule.

## Authority version

Authority records are immutable historical versions.

Minimum fields:

- authorityId
- authorityVersion
- actionType
- purpose
- status
- owner
- scope
- conditions
- createdByDecisionId
- replacesAuthorityId
- invalidatedByEventId
- scenarioVersion
- policyVersion

Permitted V1 authority status values:

- ACTIVE
- INVALID
- SUSPENDED

REFUSED is not an authority status.

A prior authority version must never be overwritten or reactivated.

## Authority scope

Authority scope is testable data defining what consequence is permitted.

Version 2 introduces a canonical typed-constraint representation so the execution engine does not need domain-specific knowledge of refund, access, workforce, procurement, or account-risk fields. Each canonical scope constraint uses:

- field
- operator
- comparisonValue
- valueType

The V1 refund shape remains accepted as a backward-compatible input representation:

- maximumAmountCents
- allowedRiskLevels
- maximumTransactionAgeDays

Before execution, that legacy representation is normalized into the same canonical typed constraints consumed by Version 2 scenarios. The legacy field names do not grant permission by themselves.

Scope must not exist only as descriptive prose.

## Enforceable condition

A V1 enforceable condition uses a typed predicate.

Minimum fields:

- field
- operator
- comparisonValue
- valueType

Compound conditions also include:

- groupOperator

Permitted group operators:

- ALL
- ANY

Unsupported or malformed required conditions are unenforceable.

Under the V1 fail-closed rule, execution remains blocked when required authority conditions cannot be evaluated.

## Enforceable boundary

The enforceable boundary is a separate artifact derived from the current authority version.

Minimum fields:

- boundaryId
- sourceAuthorityId
- actionType
- scope
- enforceableConditions
- status
- generatedFromDecisionId
- scenarioVersion
- policyVersion

The execution engine consumes the current enforceable boundary.

It must not infer permission directly from disposition.

## Governance workflow state

Minimum V1 values:

- STABLE
- MATERIALITY_REVIEW_REQUIRED
- REAUTHORIZATION_REQUIRED
- DECISION_PENDING
- DECISION_COMPLETE

Governance workflow state is separate from authority status.

## Execution state

Minimum V1 values:

- NOT_ATTEMPTED
- ALLOWED
- BLOCKED
- EXECUTED

Execution state is separate from authority status and governance workflow state.

## Execution attempt

Minimum fields:

- executionAttemptId
- requestedAction
- boundaryId
- technicalCapability
- technicalValidity
- result
- reason
- sequence

The decision rule must evaluate the requested action against the current enforceable boundary.

The execution engine must not receive disposition as a permission input.

## Expected result

Represents the prediction declared before execution.

Minimum fields:

- expectedExecutionResult
- declaredBeforeExecution
- scenarioVersion
- policyVersion

Expected results must not participate in production execution logic.

## Actual result

Represents what the execution engine actually determined.

Minimum fields:

- actualExecutionResult
- reason
- executionAttemptId

## Prediction comparison

Permitted values:

- MATCH
- MISMATCH

This compares expected result with actual result.

It does not determine control correctness.

## Control assertion

Represents a normative rule declared before execution.

Minimum fields:

- assertionId
- ruleReference
- assertionVersion
- description
- expectedControlBehavior
- scenarioVersion or policyVersion

Control assertions must not be generated from actual execution results.

## Control assertion result

Permitted values:

- PASS
- FAIL

This is separate from MATCH and MISMATCH.

A PASS does not prove the broader governance hypothesis.

## Event

Events are logically append-only within a run.

Minimum fields:

- sequence
- eventType
- actorId
- priorState
- newState
- reason
- evidenceReferences
- authorityVersion
- scenarioVersion
- policyVersion

Sequence number governs deterministic replay order.

A wall-clock timestamp may be displayed but must not govern replay ordering.

## Run record

A run record preserves the complete experimental evidence bundle.

Minimum fields:

- runId
- scenarioSnapshot
- scenarioVersion
- policyVersion
- authorityHistory
- decisionHistory
- eventLog
- executionAttempts
- expectedResult
- actualResult
- predictionComparison
- controlAssertions
- controlAssertionResults
- replayInputs

## Replay input

Replay input contains causal commands and inputs only.

It must not include derived outcomes as commands.

Examples of valid replay inputs:

- start scenario
- change condition
- evaluate materiality
- perform revalidation
- record evidence review
- submit governance decision
- attempt execution

Previously recorded ALLOWED, BLOCKED, authority state, boundary state, or assertion-result events must not force replay outcomes.

## Immutability discipline

Historical experimental records should be treated as immutable once created.

In particular:

- prior authority versions are never overwritten;
- prior decisions are never rewritten;
- prior run snapshots are never silently updated;
- prior events are never reordered;
- derived boundaries are linked to their source authority version;
- derived execution results are linked to the boundary actually evaluated.

The browser implementation may use ordinary JavaScript objects internally, but experimental history must preserve these semantic constraints.