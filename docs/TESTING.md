# Testing the Operational AI Authority Test Harness

## Purpose

This document explains how another person can independently test the V1
implementation and perform manual experiments against the authority-to-execution
model.

A passing software test suite demonstrates that the implementation satisfies
the defined deterministic tests.

It does not prove that the research hypothesis is universally true, that a
particular governance arrangement is legitimate, or that the model represents
every real-world organization.

## Automated verification

### Step 1 - Obtain the repository

Download and extract the repository or clone it from GitHub.

### Step 2 - Open the test runner

Open:

`tests/test-runner.html`

in a modern browser.

### Step 3 - Inspect the result

The verified V1 baseline is:

**182 / 182 tests passing**

A different result should be treated as something requiring investigation.

Do not alter a failing test merely to restore a passing count.

Determine whether the result represents:

- an implementation defect;
- a test defect;
- a specification contradiction;
- an invalid assumption;
- an expected experimental result;
- a prediction error;
- a control assertion failure; or
- an issue requiring investigation.

## What the automated suite covers

The V1 suite includes deterministic behavior, negative/attack cases,
accessibility checks, control-run behavior, authority integrity, evidence
integrity, boundary enforcement, conceptual separation, architecture
comparison, replay, and related application behavior.

## Manual experiment 1 - Baseline control run

Use the default Customer Refund Authorization scenario.

Confirm:

- requested action: AUTO_REFUND;
- requested amount: $400;
- technical capability supports the action;
- technical validity: PASS;
- authority status: ACTIVE;
- authority maximum: $500;
- risk: LOW;
- age: 20 days.

Expected execution:

`ALLOW`

This establishes the baseline.

## Manual experiment 2 - Material change

Change the configured risk condition from LOW to MEDIUM where the default
materiality configuration classifies that change as MATERIAL.

Inspect the resulting governance state.

The prior authority should not silently continue to authorize execution merely
because it previously permitted the action.

Technical capability does not create authority.

Prior approval does not necessarily constitute current authority.

## Manual experiment 3 - Narrow the authority boundary

After the governance process reaches an appropriate reauthorization decision,
use a NARROW disposition that results in a maximum permitted amount of:

`$250`

Keep the requested action at:

`$400`

Expected execution:

`BLOCK`

Now use a current enforceable boundary that permits at least $400 while keeping
the other applicable conditions satisfied.

Expected execution:

`ALLOW`

The purpose is to test that execution follows the enforceable boundary rather
than merely the label NARROW.

## Manual experiment 4 - Technical revalidation is not reauthorization

Create or retain a state in which:

- technical revalidation: PASS;
- authority: INVALID or otherwise insufficient for execution.

Expected execution:

`BLOCK`

Technical validity does not independently restore organizational authority.

## Manual experiment 5 - Model confidence

Increase recommendation or model confidence without changing the current
authority or enforceable boundary.

Expected governance effect:

`NO CHANGE TO AUTHORITY`

If authority remains insufficient, expected execution remains:

`BLOCK`

Confidence is not authority.

## Manual experiment 6 - Required evidence missing

Configure required evidence for reauthorization and remove that evidence.

Attempt the governed process.

Expected result:

The required governance decision must not become executable merely because a
recommendation exists.

Repeat with evidence present but not reviewed.

Expected result:

The evidence requirement remains unsatisfied.

## Manual experiment 7 - Unauthorized actor

Attempt an authority-changing action using an actor that does not possess the
configured decision authority.

Expected result:

`BLOCK`

An interface action or approval click does not itself create authority.

## Manual experiment 8 - Stale authority

After a material change invalidates the relevant prior authority, attempt to
reuse the pre-change authority.

Expected result:

`BLOCK`

The execution engine must consume current enforceable authority rather than
infer permission from historical approval.

## Manual experiment 9 - Recommendation outside authority

Change the recommendation so that the requested consequence falls outside the
current enforceable boundary.

Expected result:

`BLOCK`

Recommendation is not authority.

## Manual experiment 10 - Architecture comparison

Run the controlled comparison between:

`SAME-LAYER REAUTHORIZATION`

and:

`SEPARATED REAUTHORIZATION`

The comparison should hold the defined scenario variables constant while
changing the reauthorization architecture.

Do not assume that separated reauthorization is inherently superior.

Where a different decision actor participates but downstream behavior does not
demonstrate meaningful operational separation, the V1 harness reports:

`AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED`

That is an experimental finding, not a universal judgment about separated
governance architectures.

## Manual experiment 11 - Expected versus actual

Before execution, configure an expected result.

Run the experiment.

Compare:

`EXPECTED`

with:

`ACTUAL`

The harness reports:

`MATCH`

or:

`MISMATCH`

This measures prediction accuracy.

It is distinct from the control assertion result.

## Manual experiment 12 - Control assertion

Inspect the defined control assertion after execution.

The harness reports:

`PASS`

or:

`FAIL`

A PASS means the defined assertion was satisfied.

It does not mean the project's overall hypothesis has been proven.

## Manual experiment 13 - Replay

Export or retain a completed deterministic run and replay it using the
application's replay mechanism.

The replay mechanism should reconstruct behavior from causal inputs and commands
while recomputing derived results.

Replay should not simply trust previously stored derived outcomes.

## Import and export

Use JSON export to retain an experiment.

Import the exported scenario/run data as supported by the application.

Unsupported schema input should be rejected rather than silently interpreted as
valid current data.

## Reporting an unexpected result

When reporting a problem, include:

1. browser and browser version;
2. operating system;
3. scenario or imported JSON if applicable;
4. exact steps performed;
5. expected result;
6. actual result;
7. relevant event-log or run evidence;
8. whether `tests/test-runner.html` reports the verified test count.

Do not report MATCH/MISMATCH as though it were PASS/FAIL.

Do not report ALLOW/BLOCK as though it were a claim that the underlying
organizational decision is substantively correct.

## V1 claims boundary

V1 can demonstrate deterministic behavior of the formalized
authority-to-execution control chain under the assumptions encoded in the
harness.

V1 does not establish:

- legally legitimate organizational authority;
- universal governance validity;
- substantive correctness of a business decision;
- that separated authority is always preferable;
- that human involvement automatically constitutes human control;
- that a passing test suite proves the research hypothesis.
