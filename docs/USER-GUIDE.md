# V1 User Guide

## Purpose

This guide describes how to operate the browser-native Operational AI Authority Test Harness V1.

For the conceptual and experimental model, read the root `README.md` and the authoritative documents under `/prompts`.

## Start the application

Open `index.html` in a modern browser.

If browser file restrictions interfere with local loading, optionally run:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Load or reset the scenario

Use the default/reset workflow to restore the governed default refund scenario.

The scenario remains visible as raw JSON.

## Modify inputs

Use the structured controls for common changes.

Use the raw JSON editor when full scenario inspection or editing is needed.

Structured controls change scenario inputs. They do not create execution outcomes.

## Run the experiment

Inspect outputs in this order:

1. Baseline control run
2. Recommendation
3. Technical capability
4. Technical validity
5. Materiality
6. Governance decision
7. Authority history
8. Enforceable boundary
9. Execution
10. Expected vs actual
11. Control assertions
12. Event evidence

## Interpret the baseline

The baseline occurs before the material change.

In the default scenario, a `$400` refund is evaluated against the initial `$500` ACTIVE authority boundary under LOW risk and initial technical validity `PASS`.

The default baseline execution result is `ALLOW`.

## Compare architectures

Use the architecture comparison to compare SAME-LAYER REAUTHORIZATION and SEPARATED REAUTHORIZATION while holding the other configured experiment variables constant.

Do not interpret a different approver alone as proof that separated authority is superior.

## Explain

Use the Explain outputs to inspect why authority changed, why a boundary exists or does not exist, and why execution was allowed or blocked.

## Replay

Replay the completed run to recompute the causal chain.

Replay equivalence supports deterministic reproducibility of the formalized harness behavior. It does not prove the broader governance hypothesis.

## Export and import

Export the current scenario as JSON when you want a portable scenario artifact.

Import a compatible scenario JSON file to replace the current scenario inputs.

Malformed JSON and unsupported schema versions are rejected.

After a completed run, export run evidence JSON to preserve the scenario snapshot and resulting evidence.

## Reading result types

`ALLOW` / `BLOCK` describes execution.

`MATCH` / `MISMATCH` describes expected-versus-actual comparison.

`PASS` / `FAIL` describes control assertion evaluation.

These result types are deliberately separate.

## Failure interpretation

A blocked execution, prediction mismatch, failed control assertion, replay divergence, or failed software test should not automatically be classified as the same kind of failure.

Determine whether the result represents an implementation defect, test defect, specification contradiction, invalid assumption, expected experimental result, user prediction error, control assertion failure, or an unresolved issue.

## Accessibility

The application includes keyboard-accessible native controls, visible focus, associated labels, textual status indicators, live status messaging, semantic structure, and skip navigation.

Automated accessibility verification does not replace complete manual assistive-technology testing.
