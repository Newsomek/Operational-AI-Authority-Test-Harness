# State Model

## Purpose

This document defines the V1 state dimensions and permitted conceptual transitions.

Authority status, governance workflow state, and execution state are separate dimensions.

The implementation must not collapse them into a generic application status.

## State dimension 1: authority status

Permitted V1 values:

ACTIVE

The current authority version is valid and may produce an enforceable boundary.

INVALID

The authority version remains part of history but is not currently usable for execution.

SUSPENDED

The authority version is the current superseding authority record but produces no current executable boundary.

REFUSED is not an authority status.

REFUSE is a governance disposition that produces no new active authority.

## State dimension 2: governance workflow state

Permitted V1 values:

STABLE

No currently unresolved materiality or reauthorization workflow exists.

MATERIALITY_REVIEW_REQUIRED

A condition change requires materiality evaluation.

REAUTHORIZATION_REQUIRED

Prior authority is invalid or otherwise insufficient and a new governance decision is required.

DECISION_PENDING

An authorized decision owner has been assigned and the decision remains unresolved.

DECISION_COMPLETE

The governance decision for the current reauthorization step has been completed.

## State dimension 3: execution state

Permitted V1 values:

NOT_ATTEMPTED

No execution evaluation has yet been performed for the current point in the run.

ALLOWED

The execution engine determined that the requested action is permitted under the current enforceable boundary.

BLOCKED

The execution engine determined that the requested action is not permitted.

EXECUTED

A previously allowed requested action has been recorded as executed within the simulation.

## Initial default state

Default refund scenario:

Authority status:
ACTIVE

Governance workflow:
STABLE

Execution:
NOT_ATTEMPTED

## Control-run transition

Precondition:

- current authority is ACTIVE;
- current enforceable boundary exists;
- requested action falls within boundary;
- required enforceable conditions are satisfied;
- technical capability supports the action;
- technical validity is PASS.

Execution attempt:

NOT_ATTEMPTED
-> ALLOWED

If the simulated consequence is then performed:

ALLOWED
-> EXECUTED

Authority remains ACTIVE.

Governance workflow remains STABLE.

## Condition-change transition

A changed condition does not itself automatically invalidate authority.

First:

STABLE
-> MATERIALITY_REVIEW_REQUIRED

The materiality engine evaluates configured rules.

## Non-material change

If result is NON_MATERIAL:

MATERIALITY_REVIEW_REQUIRED
-> STABLE

Authority remains unchanged unless another configured rule requires otherwise.

Execution permission must still be evaluated against the current boundary when execution is attempted.

## Material change

If result is MATERIAL:

Current ACTIVE authority
-> INVALID

Governance workflow:

MATERIALITY_REVIEW_REQUIRED
-> REAUTHORIZATION_REQUIRED

Execution state for a new attempt:

BLOCKED

The block arises because no valid current executable authority boundary covers the changed state.

It must not arise merely because the materiality result string equals MATERIAL.

## Ambiguous materiality

If result is AMBIGUOUS:

Governance workflow:

MATERIALITY_REVIEW_REQUIRED
-> DECISION_PENDING

Execution remains blocked under the V1 fail-closed experimental default.

An authorized materiality decision owner must resolve the ambiguity.

AMBIGUOUS must not silently create permission.

## Revalidation

Technical revalidation is evaluated independently of authority.

A valid state is:

Technical revalidation:
PASS

Authority:
INVALID

Governance workflow:
REAUTHORIZATION_REQUIRED

Execution:
BLOCKED

Technical revalidation PASS must not reactivate authority.

## Reauthorization workflow

When reauthorization is required:

REAUTHORIZATION_REQUIRED
-> DECISION_PENDING

A decision may be submitted only by an actor configured with the required decision authority.

Missing required evidence or missing evidence review prevents valid decision completion where configured policy requires it.

## RENEW

RENEW creates a new authority version.

Prior authority remains INVALID.

New authority status:

ACTIVE

Governance workflow:

DECISION_PENDING
-> DECISION_COMPLETE

The new authority produces a new enforceable boundary.

Execution remains NOT_ATTEMPTED until a new execution attempt occurs.

RENEW does not itself produce ALLOWED.

## NARROW

NARROW creates a new ACTIVE authority version with a more restrictive scope.

Prior authority remains unchanged in history.

Governance workflow:

DECISION_PENDING
-> DECISION_COMPLETE

The new authority produces a new enforceable boundary.

Execution result is determined only after the requested action is evaluated against that boundary.

NARROW does not itself mean BLOCK.

## CONDITION

CONDITION creates a new ACTIVE authority version with enforceable conditions.

Governance workflow:

DECISION_PENDING
-> DECISION_COMPLETE

The new authority produces an enforceable boundary containing the configured typed conditions.

Execution may be ALLOWED or BLOCKED depending on whether the requested action and current conditions satisfy that boundary.

CONDITION does not itself mean ALLOW or BLOCK.

## TRANSFER

TRANSFER changes who possesses decision authority.

It does not create executable authority.

Governance workflow remains unresolved:

DECISION_PENDING
-> DECISION_PENDING

The assigned decision owner changes.

Execution remains blocked until a later valid governance decision produces executable authority where applicable.

TRANSFER does not itself create an ACTIVE authority version.

## SUSPEND

SUSPEND creates a new authority version with:

status:
SUSPENDED

The previous authority record remains unchanged in history.

The suspended authority produces no current executable boundary.

Governance workflow:

DECISION_PENDING
-> DECISION_COMPLETE

Execution remains blocked for actions requiring that authority.

SUSPEND must not mutate or reactivate the previous authority record.

## REFUSE

REFUSE creates no new authority version for the requested consequence.

Governance workflow:

DECISION_PENDING
-> DECISION_COMPLETE

Current executable authority:

NONE

Execution:

BLOCKED

No authority record with status REFUSED is created.

## Restoring authority after suspension

A SUSPENDED authority record must not simply become ACTIVE again.

Restoration requires:

new governance decision
-> new authority version
-> new enforceable boundary where applicable

## Invalid decision attempts

The underlying state logic must reject invalid transitions even if the UI would normally disable the control.

Examples:

- unauthorized actor attempts reauthorization;
- decision submitted without required evidence;
- evidence required but not reviewed;
- prior invalid authority reused;
- execution attempted against stale authority version;
- execution attempted without a current enforceable boundary;
- TRANSFER treated as executable authorization;
- REFUSE treated as authority creation;
- SUSPENDED record reactivated directly;
- expected result used to set execution state.

A disabled UI button is not a governance control.

## Execution state reset discipline

A new causal change that requires reevaluation should not retain a previous ALLOWED or EXECUTED result as though it remains current permission.

Historical execution attempts remain preserved.

Current execution state for the changed decision point should return to the appropriate unevaluated or blocked condition based on the governing workflow and available authority.

## Deterministic ordering

State transitions are governed by explicit commands and deterministic sequence numbers.

Wall-clock time must not determine legal transition order.

## Replay

Replay restores:

- scenario snapshot;
- policy configuration;
- causal commands and inputs.

Replay recomputes:

- materiality results;
- authority transitions;
- boundaries;
- execution results;
- assertion results.

Replay must not use previously recorded derived outcomes to force the recomputed state.