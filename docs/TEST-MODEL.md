# Test Model

## Research purpose

The core experiment examines whether a material change in organizational authority can cause a corresponding change in permissible execution while relevant controlled inputs remain fixed.

## Core controlled comparison

For the strict comparison, hold constant where applicable:

- scenario;
- system capability;
- recommendation;
- evidence;
- requested action;
- technical validity;
- policy version;
- and all decision inputs not intentionally varied.

The intentionally varied treatment is the governance decision and resulting authority where the test definition calls for it.

## Decision-to-boundary control

Independent variable:

A predefined governance decision record, including disposition and decision inputs.

Dependent variables:

- resulting authority version;
- resulting enforceable boundary.

The normative expected authority and boundary must be established independently before execution.

They must not be derived from the production translation result being tested.

## Boundary-to-execution control

Independent variable:

A predefined enforceable boundary.

Dependent variable:

Permissible system behavior.

The normative expected execution result must be established before execution.

It must not be generated from the production execution result being tested.

## End-to-end chain

The complete chain must also be tested:

GOVERNANCE DECISION
-> AUTHORITY VERSION
-> ENFORCEABLE BOUNDARY
-> EXECUTION EVALUATION
-> CONSEQUENCE

An end-to-end passing result is a composite control result.

It is not independent proof that every component is conceptually correct.

## Expected versus actual

Expected-versus-actual answers whether the predeclared prediction matched observed behavior.

Results:

MATCH
MISMATCH

A mismatch does not automatically mean the software is defective.

## Control assertion

A control assertion evaluates whether behavior satisfied a predefined governance-control rule.

Results:

PASS
FAIL

Control assertions must be defined and versioned before execution.

They must not be reverse-engineered from actual results.

## Broader hypothesis

PASS and FAIL apply to defined assertions.

MATCH and MISMATCH apply to prediction comparison.

Neither automatically means:

HYPOTHESIS PROVEN
HYPOTHESIS DISPROVEN

The harness should report observed behavior and appropriately bounded evidence.