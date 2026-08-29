# External Review Protocol

## Purpose

The Operational AI Authority Test Harness is intended to be criticized.

V1 provides a deterministic experimental implementation of a formalized
authority-to-execution control chain. The public release is not a claim that
the broader governance hypothesis has been proven, that the model is
universally valid, or that the implemented governance architecture is the
best or correct architecture.

External review is therefore part of the experiment.

The purpose of this protocol is to make criticism more useful, reproducible,
and distinguishable from differences in terminology, alternative governance
designs, implementation defects, and actual failures of the experimental
model.

The fixed public V1 baseline is:

- release: `v1.0.0`
- verified V1 commit:
  `7c9ea5733bb62ec2881823d7966bdfb638f1cd41`
- final V1 browser-test baseline: `182/182 PASS`

Reviewers should identify the version or commit they evaluated.

---

## Core Question

The central experimental question is:

**CAN WE BUILD SOMETHING THAT ACTUALLY TESTS WHETHER ORGANIZATIONAL AUTHORITY
CHANGES WHAT AN AI-ENABLED OR AUTOMATED SYSTEM IS PERMITTED TO DO?**

The V1 hypothesis is:

**Governance is operational only when a governance decision that changes
authority can actually change what the system is permitted to do.**

A useful review should challenge the implementation, the formalization, the
assumptions, or the inference that the experiment supports.

---

## What V1 Attempts to Formalize

The V1 authority-to-execution chain is:

WHO CAN DECIDE

→ WHAT THEY CAN DECIDE

→ WHAT DECISION THEY MADE

→ HOW THE DECISION IS REPRESENTED

→ AUTHORITY RECORD

→ ENFORCEABLE BOUNDARY

→ EXECUTION ENGINE CONSUMES BOUNDARY

→ CONSEQUENCE

The implementation intentionally distinguishes:

- capability from authority;
- recommendation from authority;
- technical validity from authority;
- organizational decision from authority record;
- authority record from enforceable boundary;
- enforceable boundary from execution;
- revalidation from reauthorization;
- human presence from human control;
- prediction accuracy from governance-control assertions.

A challenge that shows one of these distinctions is not actually maintained
in execution is particularly important.

---

## What Reviewers Should Try to Break

### 1. Authority-to-execution dependency

Try to find a path where execution can occur without the execution engine
being constrained by the current enforceable authority boundary.

Examples include:

- stale authority being reused;
- invalid authority permitting execution;
- suspended authority permitting execution;
- a disposition directly causing execution without a boundary;
- recommendation being treated as permission;
- model confidence being treated as permission;
- technical validity being treated as permission;
- prior successful execution being treated as current permission;
- a UI state implying permission that the execution engine does not
  independently establish.

If such a path exists, provide exact reproduction steps.

### 2. Authority integrity

Try to make an actor perform a decision outside that actor's configured
decision authority.

Try to bypass escalation.

Try to reuse authority invalidated by material change.

Try to execute while a required governance decision is still pending.

Try to alter an authority record without the actor authority required by the
scenario.

### 3. Materiality

Challenge the distinction between:

- MATERIAL;
- NON_MATERIAL;
- AMBIGUOUS.

V1 uses fail-closed handling of AMBIGUOUS materiality as an experimental
default. It is not presented as a universal governance requirement.

Useful challenges include cases where:

- materiality classification produces an incoherent state transition;
- a material change does not invalidate authority when the configured rules
  say that it should;
- a non-material change unnecessarily destroys authority;
- ambiguous materiality silently becomes permission;
- materiality ownership is bypassed.

### 4. Revalidation versus reauthorization

Try to demonstrate that technical revalidation can improperly restore
organizational authority.

In V1:

**technical validity does not itself grant authority.**

A PASS from technical revalidation should therefore not independently restore
execution permission when authority remains invalid.

### 5. Boundary enforcement

Try to make the system execute outside the current boundary.

For example:

- authority maximum is narrowed to $250;
- requested action remains $400;
- execution should be blocked even if recommendation remains REFUND and
  technical validity remains PASS.

Look for discrepancies between the authority record, generated boundary, and
execution result.

### 6. Architecture comparison

V1 compares:

- SAME-LAYER REAUTHORIZATION;
- SEPARATED REAUTHORIZATION.

The names are intentionally neutral.

The experiment must not assume that separated reauthorization is superior.

Where a different approver exists but does not produce meaningful downstream
authority-to-execution control, the governed finding is:

**AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED**

Reviewers should challenge whether the implementation actually supports that
finding and whether the comparison measures meaningful operational
separation rather than merely actor identity.

### 7. Evidence integrity

Try to obtain reauthorization when required evidence:

- does not exist;
- exists but has not been reviewed;
- is associated with the wrong decision;
- is stale or otherwise inconsistent with the current run.

Also challenge whether the V1 evidence model is sufficient for the claims
made about the experiment.

### 8. Replay and determinism

Repeat the same governed run.

Export it.

Import it.

Replay it.

Look for any change in:

- authority state;
- authority version;
- boundary;
- decision;
- execution result;
- expected-versus-actual result;
- control assertion;
- retained evidence.

The deterministic V1 core should not depend on:

- an LLM;
- randomness;
- current time;
- an external API;
- a database;
- network availability.

### 9. Expected versus actual

V1 intentionally separates:

**MATCH / MISMATCH**

from:

**PASS / FAIL**

MATCH/MISMATCH concerns the user's prediction.

PASS/FAIL concerns a defined governance-control assertion.

Try to find any path where these concepts are collapsed or where one is
incorrectly treated as proof of the other.

### 10. Test circularity

Review the tests themselves.

Ask whether a test merely restates the implementation rather than
independently asserting a meaningful control property.

Look for:

- shared incorrect assumptions between implementation and test;
- missing negative cases;
- assertions against presentation rather than engine behavior;
- tests that cannot fail when the control is broken;
- fixtures that encode the expected answer rather than test the rule;
- important execution paths that are never exercised.

A green test suite is evidence about the implemented test instrument. It is
not proof that the conceptual model is correct.

### 11. State-model integrity

V1 separates:

AUTHORITY STATUS

- ACTIVE
- INVALID
- SUSPENDED

GOVERNANCE WORKFLOW

- STABLE
- MATERIALITY_REVIEW_REQUIRED
- REAUTHORIZATION_REQUIRED
- DECISION_PENDING
- DECISION_COMPLETE

EXECUTION STATE

- NOT_ATTEMPTED
- ALLOWED
- BLOCKED

Try to produce contradictory combinations or transitions that the model
should prohibit.

`REFUSED` is a disposition, not an authority status.

### 12. Claims discipline

Challenge the documentation as well as the code.

Report language that implies V1 has established more than the experiment
supports.

Appropriate claim levels include:

- OBSERVED;
- DEMONSTRATED;
- SUPPORTED;
- NOT DEMONSTRATED;
- RESEARCH QUESTION.

V1 does not establish:

- universal organizational legitimacy;
- universal validity of the authority model;
- substantive correctness of a governance decision;
- that evidence was understood correctly by a real decision-maker;
- that separated authority is inherently superior;
- that the broader governance hypothesis has been proven.

---

## Review Procedure

A strong review should contain enough information for another person to
reproduce the finding.

Please record:

1. V1 release or commit tested.
2. Browser and operating system where relevant.
3. Scenario configuration.
4. Initial authority state and boundary.
5. Actors and decision authority involved.
6. Materiality configuration.
7. Evidence requirements.
8. Exact sequence of actions.
9. Expected result.
10. Actual result.
11. Whether the result is reproducible.
12. Why the result matters to the authority-to-execution experiment.
13. Any proposed interpretation or correction.

Screenshots can be useful, but textual reproduction steps are preferred
because UI appearance alone does not establish engine behavior.

Exported scenario or run JSON may also be useful where it contains no
sensitive information.

---

## Finding Classification

Maintainers should classify a submitted finding using the following scheme.

### A - IMPLEMENTATION DEFECT

The implementation violates an intended V1 rule or documented behavior.

Examples:

- invalid authority allows execution;
- the execution engine consumes the wrong boundary;
- the application fails to initialize;
- replay produces a different governed result from the retained run.

### B - TEST DEFECT

The test instrument is missing, incorrect, circular, misleading, or unable to
detect the control failure it claims to test.

### C - SPECIFICATION CONTRADICTION

Two governing requirements cannot both be satisfied as written, or the
formalized model contains contradictory requirements.

### D - INVALID ASSUMPTION

The implementation behaves as specified, but an assumption required by the
experiment is challenged as invalid, unsupported, or unrealistic.

### E - EXPECTED EXPERIMENTAL RESULT

The reported behavior is an intentional consequence of the configured
experiment and does not represent a defect.

### F - USER PREDICTION ERROR

The system behaved according to the formalized control model, but the user's
expected result was incorrect.

This is distinct from a control assertion failure.

### G - CONTROL ASSERTION FAILURE

A defined governance-control assertion failed.

This does not automatically establish why it failed.

The cause may still require classification as an implementation defect,
specification problem, invalid assumption, or another category.

### H - UNKNOWN / REQUIRES INVESTIGATION

The available evidence is insufficient to classify the finding reliably.

Do not force uncertain findings into another category merely to close them.

---

## Finding Disposition

After investigation, a finding may be recorded as:

- CONFIRMED;
- NOT REPRODUCED;
- EXPECTED BEHAVIOR;
- DOCUMENTATION CLARIFICATION;
- DEFERRED RESEARCH QUESTION;
- ACCEPTED FOR V1.1;
- ACCEPTED FOR FUTURE VERSION;
- REJECTED WITH RATIONALE.

Classification and disposition are different.

For example:

**A - IMPLEMENTATION DEFECT**

may have the disposition:

**ACCEPTED FOR V1.1**

A research question should not be converted into an implementation defect
simply because it challenges the current model.

---

## Version Discipline

`v1.0.0` is the fixed first public experimental baseline.

Do not move or rewrite the `v1.0.0` tag.

A defect discovered in V1 should normally remain observable in that historical
release and be corrected in a subsequent version.

Suggested version discipline:

- V1.0.x: narrowly scoped defects that do not materially alter the
  experimental model;
- V1.1: compatible improvements to the V1 instrument, tests, documentation,
  or experimental usability;
- V2: material changes to the conceptual model, state model,
  authority-to-execution chain, or experimental question.

Version classification should follow the substance of a change rather than
the amount of code changed.

---

## What Makes Criticism Valuable

The objective is not to defend the harness.

A finding is valuable when it helps determine:

- where the formal model is incomplete;
- where implementation diverges from the model;
- where tests fail to measure what they claim to measure;
- where assumptions do not survive realistic challenge;
- where terminology hides a conceptual problem;
- where the experiment supports a narrower claim than initially believed;
- where another governance architecture produces an important counterexample.

A successful attack on the experiment is useful evidence.

So is a failed attack, provided the attempted challenge and observed behavior
are documented accurately.

---

## Scope of External Review

Review of the public repository is welcomed subject to the repository
LICENSE.

The project is source-available rather than represented as OSI open source.

Review, criticism, testing, evaluation, and permitted private noncommercial
modification should follow the terms in `LICENSE`.

Commercial use and distribution of modified versions require permission as
specified there.

---

## Reporting

Use the GitHub issue template that best matches the finding:

- Experimental Finding;
- Implementation Defect;
- Conceptual Challenge.

When uncertain, use Experimental Finding.

Do not feel obligated to diagnose the root cause before reporting a
reproducible observation.

A precise unexplained failure is more useful than a confident but unsupported
diagnosis.