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