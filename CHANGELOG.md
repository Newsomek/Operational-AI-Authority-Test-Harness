# Changelog

This file records material implementation changes to the Operational AI Authority Test Harness.

## 2026-08-28 - Initial repository bootstrap

- Established the repository foundation at D:\Operational-AI-Authority-Test-Harness.
- Preserved the original authoritative GOVERNING_SESSION_INSTRUCTIONS.docx and START_SESSION_PROMPT.docx files.
- Recorded SHA-256 hashes before relocation.
- Moved the original DOCX packages byte-for-byte into the prompts directory.
- Verified destination SHA-256 hashes matched the original source hashes.
- Verified both destination files remained valid DOCX packages.
- Created the initial repository directory structure.
- Created the initial README, CHANGELOG, DECISION_LOG, CONCEPT, TEST-MODEL, and prompts README documentation.
- No application implementation was created during bootstrap.

## 2026-08-28 - Data and state model foundation

- Added docs/DATA-MODEL.md.
- Added docs/STATE-MODEL.md.
- Added docs/GOVERNANCE-RULES.md.
- Formalized the V1 authority, boundary, decision, evidence, execution, run, and replay records before engine implementation.
- Formalized separate authority-status, governance-workflow, and execution-state dimensions.
- Recorded legal disposition semantics without encoding disposition names as execution outcomes.
- Defined the execution engine contract around the current enforceable boundary.
- Defined replay as deterministic recomputation from causal inputs rather than playback of recorded outcomes.
- No application execution engine or UI behavior was implemented in this change.

## 2026-08-28 - Deterministic state foundation

- Committed the verified governed pre-code repository baseline before application logic was introduced.
- Added js/validation-engine.js.
- Added js/state-machine.js.
- Added tests/test-runner.html.
- Added tests/state-tests.js.
- Added strict validation for typed predicates and integer-valued monetary inputs.
- Implemented explicit authority-status, governance-workflow, and execution-state transition guards.
- Prevented invalidated or suspended authority records from being reactivated in place.
- Prevented blocked execution from transitioning directly to executed.
- Kept disposition logic and execution permission logic out of the state-machine foundation.
- Added browser-executed positive and negative state tests.
- Verified 16 of 16 foundation tests passed in a browser.
- No authority-decision translation engine, enforceable-boundary engine, or execution-permission engine has yet been implemented.

## 2026-08-28 - Initial Git history correction

- The intended separate pre-code baseline commit did not successfully occur before the deterministic state foundation was created.
- The failure was identified before any authority-to-boundary or boundary-to-execution engine implementation began.
- No earlier Git commit has been reconstructed or fabricated.
- The first actual repository commit therefore preserves the complete verified foundation as it truly existed at commit time: governing documents, project documentation, conceptual and experimental models, deterministic validation logic, deterministic state-machine logic, and the initial passing state-foundation tests.
- The state-foundation browser tests were re-run before the first actual commit and passed 16 of 16 tests.
- This correction preserves actual repository history rather than implying a pre-code commit that never existed.

## 2026-08-28 - Authority and boundary translation foundation

- Added js/authority-engine.js.
- Added js/boundary-engine.js.
- Added tests/authority-tests.js.
- Extended tests/test-runner.html to execute authority and boundary translation tests.
- Implemented deterministic governance-decision-to-authority translation for RENEW, NARROW, CONDITION, TRANSFER, SUSPEND, and REFUSE.
- RENEW creates a new ACTIVE authority version rather than reactivating the prior version.
- NARROW creates a new authority version with explicitly supplied narrower scope and does not itself create an execution outcome.
- CONDITION creates a new authority version containing typed conditions.
- TRANSFER creates no executable authority and records only the transferred decision owner.
- SUSPEND creates a new SUSPENDED authority version and no executable boundary.
- REFUSE creates no authority record.
- Added explicit authority-to-enforceable-boundary translation as a separate implementation layer.
- Malformed required conditions do not produce an enforceable boundary.
- Authority records and boundaries are deeply frozen after creation to protect experimental history from accidental mutation.
- Existing deterministic state tests remain 16 of 16 passing.
- Authority and boundary translation tests pass 16 of 16.
- Combined browser software-verification suite passes 32 of 32.
- No boundary-to-execution evaluation engine has yet been implemented.
- These results are software verification and control-behavior foundation checks, not evidence proving the broader authority hypothesis.

## 2026-08-28 - Boundary-to-execution evaluation foundation

- Committed the previously verified authority and boundary translation foundation.
- Added js/execution-engine.js.
- Added tests/execution-tests.js.
- Extended tests/test-runner.html to execute boundary-to-execution tests.
- Implemented deterministic execution evaluation against the current enforceable boundary.
- Execution permission does not consume governance disposition, recommendation, confidence, human approval, previous execution, expected result, or decision identifier.
- Requested action type, amount, customer risk, and transaction age are evaluated against the current boundary scope where configured.
- Technical capability must support the requested action but does not itself create authority.
- Technical validity must be PASS but does not itself create authority.
- Technical validity PASS does not override an insufficient authority boundary.
- Missing or non-enforceable authority boundaries fail closed.
- Required typed conditions must be evaluable and satisfied.
- Missing, malformed, or unsatisfied required conditions fail closed.
- Execution results identify the authority boundary actually evaluated.
- Execution results are frozen after creation.
- Existing state tests remain 16 of 16 passing.
- Existing authority/boundary tests remain 16 of 16 passing.
- Execution tests pass 18 of 18.
- Combined browser software-verification suite passes 50 of 50.
- These tests verify implementation behavior against declared V1 rules; they do not prove the broader organizational-authority hypothesis.

## 2026-08-28 - Materiality and core end-to-end orchestration

- Committed the previously verified boundary-to-execution foundation.
- Added js/materiality-engine.js.
- Added js/test-runner.js as a deterministic orchestration layer over the independently tested engines.
- Added tests/materiality-tests.js.
- Added tests/end-to-end-tests.js.
- Extended the browser test runner to execute materiality and core end-to-end tests.
- Implemented explicit materiality evaluation from configured rules.
- Default LOW to MEDIUM customer-risk transition can be configured as MATERIAL.
- AMBIGUOUS remains a distinct materiality result and does not silently create permission.
- Material change invalidates prior authority while technical revalidation may independently remain PASS.
- Material change moves the modeled workflow to REAUTHORIZATION_REQUIRED and blocks execution pending renewed authority.
- Reauthorization continues through the existing authority-to-boundary-to-execution chain rather than bypassing it.
- TRANSFER and REFUSE create no executable authority.
- SUSPEND creates no executable boundary.
- Core end-to-end tests hold the requested action, technical capability, and technical revalidation constant while varying governance disposition and resulting authority.
- State tests remain 16 of 16 passing.
- Authority/boundary tests remain 16 of 16 passing.
- Execution tests remain 18 of 18 passing.
- Materiality tests pass 10 of 10.
- Core end-to-end tests pass 8 of 8.
- Combined browser software-verification suite passes 68 of 68.
- Actor authorization and substantive evidence-review controls are not yet represented by this orchestration layer and remain required before claiming the complete V1 governance workflow is implemented.
- Core end-to-end results remain control-behavior testing within the formalized harness and do not prove real-world organizational authority or the broader hypothesis.

## 2026-08-28 - Governance decision control foundation

- Committed the previously verified materiality and core orchestration layer.
- Added js/actor-engine.js.
- Added js/evidence-engine.js.
- Added js/governance-decision-engine.js.
- Added js/event-log.js.
- Added tests/governance-control-tests.js.
- Extended tests/test-runner.html to execute governance-control tests.
- Added configured actor capability enforcement for reauthorization decisions.
- Added required-evidence availability and evidence-review validation.
- Required evidence existing is not treated as equivalent to required evidence being reviewed.
- Added configured allowed-disposition validation before authority translation occurs.
- Invalid governance decisions do not invoke the authority translation engine.
- Added deterministic append-only-in-use event sequencing beginning at sequence 1.
- Caller-supplied sequence values cannot override the event-log sequence.
- Stored event records and returned event listings are frozen to reduce accidental mutation.
- State tests remain 16 of 16 passing.
- Authority/boundary tests remain 16 of 16 passing.
- Execution tests remain 18 of 18 passing.
- Materiality tests remain 10 of 10 passing.
- Core end-to-end tests remain 8 of 8 passing.
- Governance-control tests pass 16 of 16.
- Combined browser software-verification suite passes 84 of 84.
- Configured actor authorization remains an experimental input and does not establish real-world identity or legitimate organizational authority.
- Browser-side event logging remains logically append-only during use and is not represented as cryptographically immutable or tamper-resistant.

## 2026-08-28 - Complete run-evidence foundation

- Committed the previously verified governance-decision control layer.
- Added js/control-assertion-engine.js.
- Added js/run-evidence-engine.js.
- Integrated governance-decision validation into js/test-runner.js.
- Added tests/run-evidence-tests.js.
- Extended tests/test-runner.html with complete run-evidence tests.
- The governed orchestration path now validates actor authorization, evidence review, and configured disposition before authority translation.
- Deterministic events are emitted across scenario start, condition change, materiality evaluation, authority invalidation, technical revalidation, governance decision evaluation, authority creation, boundary creation, and execution evaluation as applicable.
- Authority history preserves original, invalidated, and newly created authority records rather than overwriting prior versions.
- Execution attempts identify the boundary actually evaluated.
- Expected-versus-actual comparison reports MATCH or MISMATCH and requires the expected result to have been declared before execution.
- Prediction comparison remains separate from governance control assertion results.
- Added independent control assertion evaluation with PASS and FAIL results.
- The control assertion engine does not call the production AuthorityEngine or ExecutionEngine as its test oracle.
- A prediction may MISMATCH while the relevant governance control assertion still PASSes.
- A deliberately incorrect predefined control assertion can FAIL even when production execution behaves consistently with its implemented boundary.
- Run records preserve scenario snapshot, authority history, decision history, event log, execution attempts, expected result, actual result, prediction comparison, control assertion definitions/results, and causal replay inputs.
- Replay inputs preserve causal commands and do not contain forced execution-result or control-assertion-result commands.
- State tests remain 16 of 16 passing.
- Authority/boundary tests remain 16 of 16 passing.
- Execution tests remain 18 of 18 passing.
- Materiality tests remain 10 of 10 passing.
- Core end-to-end tests remain 8 of 8 passing.
- Governance-control tests remain 16 of 16 passing.
- Run-evidence tests pass 15 of 15.
- Combined browser software-verification suite passes 99 of 99.
- Deterministic replay itself is not yet implemented and remains the next required layer.

## 2026-08-28 - Replay-input causal-command correction

- Corrected the run-evidence replay-input representation before committing the run-evidence foundation.
- Replay inputs now retain only causal commands required to reproduce a run.
- Derived events such as MATERIALITY_EVALUATED, AUTHORITY_INVALIDATED, AUTHORITY_CREATED, and BOUNDARY_CREATED remain in the event evidence but are not replay commands.
- EXECUTION_EVALUATED remains an observed event, while ATTEMPT_EXECUTION is the causal replay command.
- Governance decision evaluation remains an observed event, while SUBMIT_GOVERNANCE_DECISION is the causal replay command.
- Re-ran the complete existing 99-test suite using a fresh Microsoft Edge user-data profile and disabled browser cache.
- Fresh-profile verification passed 99 of 99 tests before the run-evidence foundation commit.

## 2026-08-28 - Deterministic causal replay foundation

- Added js/replay-engine.js.
- Added tests/replay-tests.js.
- Extended the browser test runner with deterministic replay tests.
- Expanded preserved scenario snapshots with the initial configuration required to reconstruct governed runs.
- Replay reconstructs a run from the preserved scenario snapshot plus causal commands.
- Replay commands are limited to START_SCENARIO, CHANGE_CONDITION, RECORD_TECHNICAL_REVALIDATION, SUBMIT_GOVERNANCE_DECISION, and ATTEMPT_EXECUTION.
- Derived materiality, authority, boundary, execution, and control results are recomputed rather than replayed as commands.
- Replay re-enters the governed orchestration path and recomputes materiality, authority transitions, enforceable boundaries, execution outcomes, prediction comparison, and control assertions.
- Replay compares recomputed authority history, decision history, execution attempts, actual result, prediction comparison, control assertion results, and deterministic event evidence against the original run.
- Tampering with a recorded actual result does not force the replayed execution result.
- Tampering with a recorded control assertion result does not force the replayed assertion result.
- Such tampering creates replay evidence divergence instead.
- The complete browser suite was run with a fresh Microsoft Edge user-data profile and browser cache disabled.
- All 108 tests passed.
- Replay equivalence demonstrates deterministic recomputation of the formalized harness behavior; it does not independently validate the conceptual governance model or prove the broader hypothesis.

## 2026-08-28 - Initial browser-native V1 application shell

- Committed the previously verified deterministic replay foundation.
- Added index.html.
- Added css/app.css.
- Added js/app.js.
- Added data/default-scenario.json.
- Added tests/ui-smoke-tests.js.
- Extended the browser test runner with UI contract tests.
- Added an editable default refund authority scenario.
- The application shell exposes scenario inputs, recommendation, technical capability, technical validity, materiality, governance decision, authority history, enforceable boundary, execution result, expected-versus-actual comparison, control assertions, event evidence, and replay result as separate visible artifacts.
- The UI controller invokes the governed deterministic orchestration engine and does not independently infer permission from disposition.
- The UI controller invokes the deterministic replay engine rather than simulating replay locally.
- Recommendation is displayed as an input artifact but is not passed as an execution-authorizing input.
- Authority history and enforceable boundary remain separate visible outputs.
- Expected-versus-actual and control assertion results remain separate visible outputs.
- Added responsive browser-native presentation and keyboard-focus styling.
- Existing deterministic and replay suites remain 108 of 108 passing.
- UI contract tests pass 8 of 8.
- Combined browser software-verification suite passes 116 of 116 using a fresh Edge profile with browser cache disabled.
- The application shell is an interface over the deterministic engines; it is not an alternate source of authority, execution state, or experimental truth.

## 2026-08-28 - V1 interaction and architecture-selection layer

- Committed the previously verified initial browser-native V1 application shell.
- Added reauthorizationArchitecture to the editable default scenario.
- Added explicit SAME-LAYER REAUTHORIZATION and SEPARATED REAUTHORIZATION controls.
- Architecture selection is preserved as an experimental scenario input and does not directly create authority or execution permission.
- Added structured controls for current risk, requested amount, disposition, expected execution result, new authority maximum, and technical validity.
- Structured controls update scenario JSON rather than bypassing it.
- Raw scenario JSON remains visible and editable.
- Added explicit Apply Controls, Reset, Run Experiment, and Replay Last Run workflow.
- Reset clears prior displayed run state and restores the loaded default scenario.
- Added visible architecture output as a separate experiment artifact.
- Added UI tests proving neither architecture option manufactures execution results.
- Existing deterministic and replay tests remain 108 of 108 passing.
- UI interaction tests pass 10 of 10.
- Combined browser software-verification suite passes 118 of 118 using a fresh Edge profile with browser cache disabled.

## 2026-08-28 - Architecture topology and controlled comparison

- Committed the previously verified V1 interaction and architecture-selection layer.
- Added js/architecture-engine.js.
- Added tests/architecture-tests.js.
- Implemented SAME-LAYER REAUTHORIZATION as an authorized decision occurring within the operational layer.
- Implemented SEPARATED REAUTHORIZATION as a topology in which the operational layer detects/classifies change, invalidates authority, and blocks, while the reauthorization decision moves to a distinct designated authority owner.
- Separated reauthorization requires a designated authority owner distinct from the operational actor.
- Architecture resolution creates no authority record, enforceable boundary, or execution result.
- Architecture terminology remains neutral; neither architecture is labeled weak or superior.
- Added architecture topology to replay-preserved scenario inputs.
- Added a visible controlled comparison that holds scenario, recommendation, capability, technical revalidation, evidence, requested action, and disposition constant while varying reauthorization architecture.
- A comparison may legitimately show no execution-outcome difference.
- Added Explain views for authority change, enforceable boundary formation, and execution evaluation.
- Explain views present observed/recomputed evidence and do not become an alternate execution oracle.
- Existing deterministic and replay tests remain 108 of 108 passing.
- Architecture topology tests pass 10 of 10.
- UI interaction/comparison tests pass 14 of 14.
- Combined fresh-profile browser suite passes 132 of 132.

## 2026-08-28 - Scenario and run-evidence import/export

- Committed the previously verified architecture-topology and controlled-comparison layer.
- Added js/import-export.js.
- Added tests/import-export-tests.js.
- Added schemaVersion 1.0 to the default scenario.
- Added plain-JSON scenario export.
- Scenario exports preserve schema version, scenario version, conditions, materiality rules, actors, authority rules, evidence requirements, decision criteria, expected result, and policy configuration.
- Scenario exports also preserve the complete compatible scenario object for round-trip import without reconstructing it from a partial representation.
- Added compatible plain-JSON scenario import.
- Malformed JSON and unsupported schema versions are rejected.
- Imported scenarios update scenario inputs and do not create observed execution results.
- Added plain-JSON complete run-evidence export.
- Run export preserves scenario snapshot, scenario version, policy version, authority history, decision history, event log, execution attempts, expected result, actual result, expected-versus-actual comparison, control assertions, control assertion results, and replay inputs.
- MATCH/MISMATCH remains separate from control PASS/FAIL in exported evidence.
- Added deterministic scenario and run-evidence filenames.
- Added browser controls for Import Scenario, Export Scenario, and Export Run Evidence.
- Import/export functionality remains browser-native and requires no server-side application logic.
- Import/export tests pass 12 of 12.
- UI tests pass 18 of 18.
- Combined fresh-profile browser suite passes 148 of 148.

## 2026-08-28 - V1 accessibility and negative/attack hardening

- Committed the previously verified scenario and run-evidence import/export layer.
- Added tests/negative-tests.js.
- Added tests/accessibility-tests.js.
- Implemented the governing-required negative/attack test pass.
- Attack coverage includes invalid authority, required separation, original-owner bypass attempts, missing disposition, unauthorized authority modification, stale prior-authority reuse, missing required evidence, unreviewed evidence, narrowed-boundary enforcement, recommendation bypass attempts, confidence escalation, technical revalidation PASS while authority remains invalid, disposition shortcut resistance, replay-result tampering, unsupported imported schemas, and separation claims discipline.
- NARROW was explicitly tested with a resulting boundary that still permits the requested action; execution ALLOW confirms that the execution engine evaluates the boundary rather than the disposition label.
- Recommendation-confidence variation does not alter authority or permission.
- Technical revalidation PASS while authority remains INVALID leaves execution BLOCKED.
- Added skip navigation to the application.
- Added explicit visible focus styling for select and input controls in addition to existing button/textarea focus styling.
- Added semantic and screen-reader-oriented accessibility verification.
- Accessibility verification covers landmarks, keyboard accessibility, associated labels, live status messaging, textual status representation, body contrast, accessible button names, and heading structure.
- Existing suites remain 148 of 148 passing.
- Required negative/attack tests pass 16 of 16.
- Accessibility tests pass 8 of 8.
- Combined fresh-profile browser suite passes 172 of 172.
- Automated accessibility verification is not represented as a complete substitute for manual assistive-technology testing.

## 2026-08-28 - Required baseline control-run correction

- Committed the previously verified V1 accessibility and negative/attack hardening layer.
- Final readiness review identified a V1-blocking implementation omission: the governed run did not yet execute the governing-required baseline control run before material change.
- Added js/control-run-engine.js.
- Added tests/control-run-tests.js.
- Added explicit initialTechnicalValidity and controlExpectedResult inputs to the default scenario.
- The baseline control run now executes before CONDITION_CHANGED.
- The control run creates an enforceable boundary from the initial ACTIVE authority.
- The default baseline evaluates AUTO_REFUND 400 dollars under LOW risk, 20-day transaction age, 500-dollar authority, supported capability, and initial technical validity PASS.
- The default baseline result is ALLOW.
- The predeclared baseline expected result is ALLOW and therefore produces MATCH in the default scenario.
- A separately evaluated initial-boundary control assertion produces PASS.
- The changed-authority experiment continues only after the baseline reference point is established.
- Run evidence now preserves the complete baseline control-run evidence.
- Run-evidence export now includes the control run.
- Deterministic replay now reconstructs and compares the baseline control run.
- The application now displays the baseline control run as a separate visible artifact.
- Added 10 baseline control-run tests.
- Previous 172 tests remain passing.
- Combined fresh-profile browser suite passes 182 of 182.
## 2026-08-28 - V1 public-release preparation

- Added source-available noncommercial license.
- Added first-run quick-start instructions.
- Added independent automated and manual testing instructions.
- Added V1 roadmap for explicitly deferred capabilities and research questions.
- Added V1 readiness record pending final publication verification.
- Added README public-use, testing, licensing, and start-here guidance.
- Retained the verified pre-publication browser-suite baseline of 182/182 tests
  before this documentation pass.
## 2026-08-28 - Final V1 browser verification

- During final publication verification, a real interactive browser run exposed an implementation defect that earlier verification had not reliably established.
- Restored the missing `compareArchitectures` DOM reference used by the application controller.
- Removed an accidental nested duplicate `main` element from `tests/test-runner.html`.
- Re-ran the complete test instrument in a fresh browser profile.
- Observed **182/182 tests passing**.
- Confirmed zero FAIL status markers.
- Confirmed no remaining "Tests have not run" markers.
- Confirmed strict UTF-8 integrity and `git diff --cached --check`.
- Finalized `docs/V1-READINESS.md` as V1 READY for publication.
- No claim is made that the passing software suite proves the broader governance hypothesis.
## 2026-08-28 - External review infrastructure

- Added `docs/EXTERNAL-REVIEW-PROTOCOL.md` for structured independent review of the fixed V1 experimental baseline.
- Added GitHub issue templates for experimental findings, implementation defects, and conceptual challenges.
- Added GitHub issue-template configuration linking reviewers to the external review protocol.
- Added a README invitation for structured criticism and reproducible attack testing.
- Preserved `v1.0.0` as the fixed first public experimental baseline.
- No V1 experimental implementation, authority rule, execution rule, state model, or test behavior was changed by this documentation and review-infrastructure update.
