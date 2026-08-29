# V1 Readiness Record

## Operational AI Authority Test Harness

Date: 2026-08-28

## Status

**V1 READY - VERIFIED FOR PUBLICATION**

This record documents the state reached before the final publication
verification and release commit.

It does not itself replace the test evidence.

## Authoritative specification

The authoritative project instructions are retained under `prompts/`.

The verified SHA-256 values at the final readiness audit were:

### START_SESSION_PROMPT.docx

`8A66E4854F4FE2F69556B9DB6401F5FD5C5E0D07183107CA508540C69339D90B`

### GOVERNING_SESSION_INSTRUCTIONS.docx

`06601943879541161F14FFD7D7495A2547384D482B38FB80A6E3BC079C36FEC9`

## Final verified implementation state

The final real-browser verification was executed from the repository test runner in a fresh browser profile after correction of the browser-initialization defect.

Observed result:

**182 / 182 PASS**

The final verification also established:

- no FAIL status markers;
- no remaining "Tests have not run" markers;
- the corrected architecture-comparison test executed;
- the governed separation finding remained present;
- strict UTF-8 verification passed;
- no replacement characters were detected;
- `git diff --cached --check` passed;
- no unexpected unstaged or untracked repository files were present.

The browser-initialization defect discovered during final verification was classified as an implementation defect. The missing architecture-comparison DOM reference was restored, the accidental nested duplicate `main` element in the test runner was removed, and the complete browser suite was rerun successfully.

## Governed separation finding

V1 includes the required finding:

`AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED`

for the defined controlled comparison where a different decision actor
participates but downstream execution behavior does not operationally
demonstrate the separation.

This finding does not claim that separated reauthorization is universally
ineffective or inferior.

## V1 experimental scope

V1 is a deterministic browser-based governance laboratory for examining whether
a represented organizational authority decision can change what an automated
or AI-enabled system is permitted to do.

The core chain is:

WHO CAN DECIDE
-> WHAT THEY CAN DECIDE
-> WHAT DECISION THEY MADE
-> HOW THE DECISION IS REPRESENTED
-> AUTHORITY RECORD
-> ENFORCEABLE BOUNDARY
-> EXECUTION ENGINE CONSUMES BOUNDARY
-> CONSEQUENCE

## Claims boundary

V1 does not prove universal governance validity.

V1 does not establish that represented authority is legally or normatively
legitimate.

V1 does not establish that a recommendation is correct.

V1 does not establish that technical validity creates authority.

V1 does not establish that human participation automatically creates human
control.

V1 does not establish that separated reauthorization is inherently superior.

## Publication status

The V1 implementation and publication documentation have completed the required pre-release verification.

The remaining release operations are repository publication actions rather than application-development work:

1. create the verified V1 Git commit;
2. create the V1 tag;
3. push the repository and tag to the intended GitHub repository;
4. make the GitHub repository public;
5. create the public V1 release.

No additional V1 application feature work is required unless publication reveals a new defect or governing inconsistency.

## License

V1 is intended for public source-available noncommercial use under the
repository `LICENSE`.

The project is not represented as open-source software.
