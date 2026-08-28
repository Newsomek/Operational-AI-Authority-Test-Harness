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