# Operational AI Authority Test Harness

## What this is

The Operational AI Authority Test Harness is a small browser-native governance laboratory.

It tests whether a formalized organizational authority decision can be translated into an enforceable technical boundary that changes what a system is permitted to do.

It is a test harness, not a proof machine.

## Governing question

Does organizational authority actually control system consequences?

The modeled V1 chain is:

SCENARIO CONFIGURATION
-> INITIAL AUTHORITY
-> INITIAL ENFORCEABLE BOUNDARY
-> CONTROL RUN
-> INITIAL EXECUTION EVALUATION
-> CONDITION CHANGE
-> MATERIALITY EVALUATION
-> AUTHORITY INVALIDATION
-> EXECUTION BLOCK
-> INDEPENDENT TECHNICAL REVALIDATION
-> REAUTHORIZATION REQUIRED
-> APPROPRIATE DECISION OWNER
-> EVIDENCE REVIEW
-> DISPOSITION
-> NEW AUTHORITY VERSION WHERE APPLICABLE
-> NEW ENFORCEABLE BOUNDARY WHERE APPLICABLE
-> EXECUTION EVALUATION
-> OBSERVED RESULT
-> EXPECTED-VS-ACTUAL COMPARISON
-> CONTROL ASSERTION
-> EVIDENCE
-> DETERMINISTIC REPLAY

## Why it exists

AI-enabled systems can move from recommendation toward consequential action.

The primary hypothesis is:

**Governance is operational only when a governance decision that changes authority can actually change what the system is permitted to do.**

The experiment is designed so that the hypothesis can fail.

## What it is not

This is not a production authorization platform, enterprise GRC system, policy-as-code platform, identity system, model benchmark, or proof that a governance architecture is universally correct.

It does not prove that configured actors possess legitimate real-world organizational authority, that evidence was genuinely understood, or that a governance decision was substantively correct.

## How to run

1. Open `index.html` in a modern browser.
2. Load or edit the scenario.
3. Run the experiment and inspect the evidence.

No Docker environment, database, Node installation, npm dependency, cloud account, API key, external API, or AI model is required.

If browser file restrictions interfere with local loading, an optional static server may be used:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Default scenario

V1 uses a Customer Refund Authorization scenario.

- Requested action: `AUTO_REFUND`
- Requested amount: `$400`
- Initial customer risk: `LOW`
- Initial transaction age: `20 days`
- Technical capability: supported
- Initial technical validity: `PASS`
- Initial authority status: `ACTIVE`
- Initial authority maximum: `$500`

The default material change changes customer risk from `LOW` to `MEDIUM`.

## Control run

Before the material change, the harness establishes a baseline.

The initial ACTIVE authority creates an enforceable boundary. The `$400` refund is evaluated against the initial `$500` boundary, LOW-risk conditions, supported technical capability, and initial technical validity `PASS`.

The predeclared expected result is `ALLOW`. The default observed baseline result is `ALLOW`, producing `MATCH`.

Only after this reference point is established does the experiment introduce the material change.

## Capability vs authority

Capability answers whether the system can technically perform an action.

Authority answers whether the system is currently permitted to perform that consequence under the modeled governance structure.

Capability does not create authority.

## Recommendation vs authority

A recommendation proposes an action. It does not create permission.

Recommendation source and confidence do not independently authorize execution.

## Technical validity vs authority

Technical validity and authority remain separate.

Technical revalidation may be `PASS` while authority remains `INVALID` and execution remains `BLOCKED`.

Successful technical revalidation does not reactivate authority.

## Authority record vs enforcement

An authority record is not itself an enforcement mechanism.

The modeled chain is:

ORGANIZATIONAL DECISION
-> AUTHORITY RECORD
-> ENFORCEABLE BOUNDARY
-> EXECUTION EVALUATION
-> CONSEQUENCE

The execution engine consumes the current enforceable boundary.

## Revalidation vs reauthorization

Revalidation asks whether technical behavior remains valid.

Reauthorization asks whether organizational authority should exist after a material change.

They are not interchangeable.

## Organizational authority vs technical enforcement

The harness formalizes configured actors, decision ownership, evidence requirements, governance decisions, authority records, and enforceable boundaries.

This allows the experiment to test how a configured organizational decision becomes software-enforced permission.

The harness does not independently establish that a configured actor possesses legitimate real-world organizational authority.

## Authority-to-execution control chain

Execution must not infer permission directly from disposition, recommendation, confidence, technical validity, recommendation source, human approval, previous execution, existence of a decision record, expected result, or UI state.

A valid governance decision may create a new authority version. An ACTIVE authority version may create an enforceable boundary. Execution evaluates the requested action against that boundary.

Disposition labels do not directly determine execution. For example, `NARROW` can still produce `ALLOW` if the resulting boundary permits the requested action.

## Authority versioning

Authority history is preserved rather than overwritten.

- `RENEW` creates a new authority version.
- `NARROW` creates a new authority version with more restrictive scope.
- `CONDITION` creates enforceable typed conditions.
- `TRANSFER` transfers decision authority and creates no executable authority.
- `SUSPEND` creates a new `SUSPENDED` authority version and no executable boundary.
- `REFUSE` creates no active authority and does not create a `REFUSED` authority status.

## Materiality

Materiality is evaluated from explicit editable scenario rules.

A material change can invalidate current authority.

The default LOW-to-MEDIUM risk transition is material.

`AMBIGUOUS` remains distinct and fails closed in V1 rather than silently creating permission. This is an experimental V1 default, not a universal governance claim.

## Policy in V1

Policy in V1 means scenario configuration and governance rules relevant to the experiment.

V1 does not require a separate policy engine.

## Reauthorization architectures

V1 supports neutral architecture choices:

- `SAME-LAYER REAUTHORIZATION`
- `SEPARATED REAUTHORIZATION`

Architecture selection does not itself create authority or execution permission.

The comparison does not treat separation as inherently better.

## Evidence review

Required evidence must exist and be recorded as reviewed when review is required.

Evidence availability is not equivalent to evidence review.

A recorded review is evidence of harness state; it is not proof that a real person genuinely understood the evidence.

## How to modify a scenario

Use the structured controls for common scenario changes or edit the raw scenario JSON directly.

Raw JSON remains visible so the experimental inputs remain inspectable.

## How to run a test

1. Load or edit a scenario.
2. Inspect the scenario inputs.
3. Run the experiment.
4. Inspect the baseline control run.
5. Inspect materiality and authority invalidation.
6. Inspect the governance decision.
7. Inspect authority history and the enforceable boundary.
8. Inspect execution.
9. Compare expected and actual execution.
10. Inspect control assertions.
11. Inspect event evidence.
12. Replay the run.

## Expected vs actual

Expected execution is declared before execution.

Prediction comparison produces `MATCH` or `MISMATCH`.

Prediction accuracy is separate from governance-control correctness.

## Control assertion

Control assertions evaluate predefined governance-control rules and produce `PASS` or `FAIL`.

Control assertion results remain separate from `MATCH` or `MISMATCH`.

The control-assertion engine does not use the production authority or execution engine as its oracle.

## Event log

The harness records deterministic ordered event evidence.

Browser-side event logging is logically append-only during use but is not represented as cryptographically immutable or tamper-resistant.

## Explain views

The application provides deterministic explanations for authority change, boundary formation, and execution evaluation.

Explain output derives from model records and rules and does not become an alternate permission engine.

## Scenario import and export

Scenarios can be exported and imported as plain JSON.

Malformed JSON and unsupported schema versions are rejected.

Import changes scenario inputs and does not manufacture observed execution results.

## Run-evidence export

Completed run evidence can be exported as JSON.

The export preserves the scenario snapshot, baseline control run, authority history, decision history, event log, execution attempts, expected result, actual result, prediction comparison, control assertions, assertion results, replay inputs, and complete run record.

## Replay

Replay is deterministic recomputation, not redisplay of saved outcomes.

Replay reconstructs the run from preserved scenario inputs and causal commands and recomputes derived materiality, authority, boundary, execution, comparison, assertion, and event evidence.

Recorded derived outcomes do not force replay results.

## Tests

The `/tests` directory is part of the research instrument.

The current verified browser suite contains 182 tests covering state, authority and boundary translation, execution, materiality, orchestration, governance controls, run evidence, replay, architecture, import/export, UI behavior, negative and attack cases, accessibility, and the required baseline control run.

A passing software test verifies declared implementation behavior. It does not automatically prove the broader governance hypothesis.

## Accessibility

V1 includes semantic structure, keyboard-accessible native controls, visible focus, associated labels, textual result states, live status messaging, skip navigation, and automated accessibility checks.

Automated accessibility verification is not a substitute for complete manual assistive-technology testing.

## Claims and limitations

Use experimental-result language carefully.

Appropriate categories include:

- `OBSERVED`
- `DEMONSTRATED`
- `SUPPORTED`
- `NOT DEMONSTRATED`
- `RESEARCH QUESTION`

V1 can demonstrate behavior of the formalized authority-to-execution chain within the assumptions of this harness.

V1 does not by itself demonstrate legitimate real-world organizational authority, genuine evidence understanding, substantive correctness of governance decisions, universal superiority of either architecture, universal appropriateness of fail-closed behavior, or universal validity of the conceptual model.

The broader governance hypothesis is not treated as proven merely because the software passes its tests.

## AI-assisted development disclosure

AI tools have been used extensively to translate the conceptual and product requirements into software, tests, and documentation.

AI-generated code is not treated as correct merely because it executes.

Material behavior is subjected to deterministic tests, negative tests, replay, inspection, and claims-discipline review.

## Contributing

Contributions should preserve the distinctions among recommendation, capability, technical validity, authority, governance workflow, disposition, authority status, enforceable boundary, execution, consequence, expected result, actual result, prediction accuracy, and control correctness.

Material conceptual changes should be recorded in `DECISION_LOG.md`.

Implementation changes should be recorded in `CHANGELOG.md`.

Do not weaken tests merely to make implementation pass.

## Status

V1 implementation is feature-complete for the currently governed V1 scope and has a recorded software-verification baseline of 182/182 passing browser tests.

Final V1 readiness has not yet been issued.

The remaining step is the final documentation, claims, repository, and fresh-profile verification audit.

## Authoritative project instructions

The authoritative project specification is:

`prompts/GOVERNING_SESSION_INSTRUCTIONS.docx`

The startup handoff instructions are:

`prompts/START_SESSION_PROMPT.docx`

If these documents conflict with this README, `GOVERNING_SESSION_INSTRUCTIONS.docx` governs.
---

## Try It Yourself

No installation, API key, AI model, database, Docker environment, Node.js
runtime, cloud account, or external service is required for the V1 experiment.

1. Download or clone this repository.
2. Open `index.html`.
3. Run the default control experiment.
4. Follow `docs/QUICKSTART.md` for the guided first run.
5. Follow `docs/USER-GUIDE.md` for detailed operation.
6. Follow `docs/TESTING.md` to independently test the implementation.

The verified pre-publication V1 baseline is **182 / 182 tests passing**.

To run the automated verification yourself, open:

`tests/test-runner.html`

A passing suite demonstrates conformance with the defined V1 tests. It does
not prove the project's research hypothesis.

## Public Use and License

The Operational AI Authority Test Harness is publicly available under the
repository `LICENSE`.

The project is source-available, not open source.

The license permits specified noncommercial use and redistribution of complete,
unmodified copies while reserving commercial use and distribution of modified
or derivative versions.

Read `LICENSE` before use or redistribution.

## Start Here

- `docs/QUICKSTART.md` - download and first-run instructions
- `docs/USER-GUIDE.md` - complete operating guide
- `docs/TESTING.md` - automated verification and manual experiments
- `docs/ROADMAP.md` - capabilities deliberately deferred beyond V1
- `docs/V1-READINESS.md` - verification and release-readiness record
## External Review

The V1 release is intended to be challenged, not merely demonstrated.

Reviewers are invited to attack the authority-to-execution dependency,
materiality behavior, reauthorization logic, boundary enforcement, evidence
requirements, replay determinism, state model, architecture comparison, test
design, and the claims made from the experiment.

Start with
[`docs/EXTERNAL-REVIEW-PROTOCOL.md`](docs/EXTERNAL-REVIEW-PROTOCOL.md).

The protocol explains what to test, how to report a reproducible finding, and
how findings are distinguished among implementation defects, test defects,
specification contradictions, invalid assumptions, expected experimental
results, user prediction errors, control-assertion failures, and findings
requiring further investigation.

GitHub issue templates are provided for:

- experimental findings;
- implementation defects;
- conceptual challenges.

A successful attack on the experiment is useful evidence. A failed attack can
also be useful when the attempted challenge and observed result are documented
accurately.

`v1.0.0` remains the fixed first public experimental baseline. Findings
against that release should be preserved as findings against that historical
version rather than rewriting or moving the tag.
