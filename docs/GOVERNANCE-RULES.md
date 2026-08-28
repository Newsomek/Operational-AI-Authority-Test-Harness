# Governance Rules

## Purpose

This document states the V1 operational governance rules that implementation and tests must preserve.

These rules are derived from the governing specification.

They do not replace GOVERNING_SESSION_INSTRUCTIONS.docx.

If this document conflicts with the governing instructions, the governing instructions control.

## Rule G-001: capability does not create authority

Technical capability may establish that an action can be performed.

It does not establish that the action is permitted.

## Rule G-002: recommendation does not create authority

A recommendation, regardless of source or confidence, does not create execution permission.

## Rule G-003: technical validity does not create authority

Technical validation or revalidation may PASS while current authority remains INVALID.

Execution may therefore remain BLOCKED.

## Rule G-004: execution requires current enforceable authority

Permission derives from the current enforceable authority boundary and enforceable conditions.

The execution engine must not derive permission directly from:

- disposition;
- recommendation;
- confidence;
- technical validity;
- recommendation source;
- human approval;
- previous execution;
- existence of a decision record;
- expected result;
- or UI state.

## Rule G-005: authority is versioned

Prior authority records are never overwritten.

A new governance decision that changes authority creates a new authority version where the disposition calls for one.

## Rule G-006: disposition is separate from authority status

Permitted dispositions:

- RENEW
- NARROW
- CONDITION
- TRANSFER
- SUSPEND
- REFUSE

Permitted V1 authority statuses:

- ACTIVE
- INVALID
- SUSPENDED

REFUSED is not an authority status.

## Rule G-007: RENEW creates new authority

RENEW creates a new authority version.

It does not reactivate the previous invalid authority.

## Rule G-008: NARROW changes scope

NARROW creates a new authority version whose enforceable scope is more restrictive than the authority it replaces.

NARROW does not itself mean BLOCK.

The resulting boundary must be evaluated.

## Rule G-009: CONDITION must be enforceable

A required condition must use a supported typed predicate representation.

Required prose-only or malformed conditions are not enforceable.

Under V1 fail-closed behavior, execution remains blocked when a required authority condition cannot be evaluated.

## Rule G-010: TRANSFER transfers decision authority

TRANSFER assigns the unresolved decision to another authorized decision owner.

It does not create executable authority.

## Rule G-011: SUSPEND creates a new suspended version

SUSPEND creates a new authority version with status SUSPENDED.

The earlier authority remains unchanged in history.

A suspended authority produces no current executable boundary.

## Rule G-012: REFUSE creates no active authority

REFUSE creates no new active authority for the requested consequence.

Execution remains blocked.

No REFUSED authority status is created.

## Rule G-013: material change invalidates prior authority when configured rule says so

Materiality is evaluated from preconfigured rules.

When the applicable result is MATERIAL, the prior authority becomes INVALID.

Materiality does not imply that recommendation or technical validity is wrong.

## Rule G-014: ambiguous materiality does not create permission

AMBIGUOUS remains unresolved until an authorized materiality decision is made.

Under the V1 experimental default, execution remains blocked.

## Rule G-015: required evidence must be available and reviewed when policy requires review

Evidence availability is not equivalent to evidence review.

A governance decision must not be treated as valid when required configured evidence has not been reviewed.

## Rule G-016: decision actor must be authorized

A governance decision is valid only when the configured actor possesses the required experimental capability.

V1 tests configured authorization.

It does not establish real-world identity or legitimate organizational authority.

## Rule G-017: expected results do not control execution

Expected results exist only for predeclared prediction comparison.

They must never participate in execution permission logic.

## Rule G-018: control assertions are independent experimental artifacts

Normative control assertions must be defined before execution and traceable to the governing rule they test.

They must not be generated from the observed result.

## Rule G-019: prediction accuracy is separate from control correctness

Expected-versus-actual produces:

- MATCH
- MISMATCH

Control evaluation produces:

- PASS
- FAIL

These answer different questions.

## Rule G-020: deterministic replay recomputes outcomes

Replay consumes causal inputs and commands.

Previously recorded derived outcomes must not force replayed outcomes.

## Rule G-021: event order is deterministic

Sequence number governs replay order.

Wall-clock timestamps may be displayed for usability but do not govern deterministic behavior.

## Rule G-022: missing valid authority fails closed in V1

Execution is blocked when valid executable authority cannot be established.

Examples include:

- missing authority;
- invalid authority;
- suspended authority;
- ambiguous materiality;
- unauthorized decision-maker;
- missing required evidence;
- evidence required but not reviewed;
- malformed authority;
- stale authority version;
- unenforceable required condition.

This is a V1 experimental default and must not be represented as universally correct governance.