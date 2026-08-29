# V1 Independent-Review Remediation External 336-Case Matrix

## Result

PASS

## Matrix

- Total browser cases: 336
- PASS: 224
- EXPECTED_REJECTION: 112
- FAIL: 0

## Matrix design

- 2 reauthorization architectures.
- 3 post-change risk states: LOW, MEDIUM, HIGH.
- 6 governance dispositions.
- 2 technical-validity states.
- 2 money relationships only: BELOW_LIMIT and ABOVE_LIMIT.
- 2 expected-execution predictions.
- CONDITION additionally exercises supervisor confirmation TRUE and FALSE.
- Expected total: 336 cases.

## Corrected oracle discipline

- LOW to LOW is NON_MATERIAL; governance reauthorization is correctly skipped and recorded as EXPECTED_REJECTION. Money BELOW_LIMIT/ABOVE_LIMIT is therefore measured against the still-operative 500-dollar current authority, not against an unapplied disposition-specific proposed boundary.
- LOW to MEDIUM and LOW to HIGH are MATERIAL.
- Strict NARROW preserves the prior LOW-only risk scope and lowers the amount ceiling to 250 dollars; it may not broaden another authority dimension.
- CONDITION explicitly includes the changed risk in its new scope and requires the typed supervisorConfirmation predicate.
- CONDITION TRUE must ALLOW an otherwise-permitted material request; CONDITION FALSE must BLOCK the otherwise-identical request.
- RENEW may reproduce the prior LOW-only boundary and therefore may still BLOCK the elevated-risk request.
- TRANSFER changes decision ownership but does not itself create executable authority.
- SUSPEND and REFUSE do not leave executable authority.
- Expected ALLOW/BLOCK remains a prediction only and must not change actual execution.
- Technical FAIL independently blocks execution.
- The NARROW-only maximum assertion must not leak into other dispositions.
- Same architecture-controlled scenario may legitimately produce the same execution result; no execution difference is manufactured merely to favor separated authority.
- Single-run authority-history and event-log evidence must be present.

## Cross-case invariants

- Prediction-caused execution divergences: 0
- Architecture-caused execution divergences: 0
- CONDITION causal YES/NO pairs tested: 8
- CONDITION causal pair failures: 0

## Issue counts

- none

## Repository

Protected thirteen-file staged remediation candidate remained unchanged.

## Evidence

- matrix-results.json
- matrix-results.ndjson
- this review