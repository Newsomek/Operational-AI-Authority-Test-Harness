# Version 2 Comprehensive Internal Matrix

## Purpose

This matrix tests whether the Version 2 authority model behaves consistently across all five configured domains without changing the shared authority-to-execution engine for each scenario.

The matrix is an internal deterministic validation gate. It does not prove that the configured organizational policy is correct, optimal, lawful, or economically desirable.

## Scenario coverage

The matrix covers:

1. Automated Refund
2. Privileged System Access
3. Workforce Shift Assignment
4. Procurement / Total Acquisition Cost
5. Customer Account Restriction

## Coverage dimensions

The browser-rendered matrix exercises:

- both reauthorization architectures;
- all six governance dispositions;
- technical PASS and FAIL;
- MATERIAL and NON_MATERIAL behavior;
- typed CONDITION false/true causal pairs;
- inside/outside enforceable-boundary relationships;
- expected-result prediction independence;
- account-restriction confidence independence;
- scenario import/export identity and execution equivalence;
- deterministic replay across all five domains;
- architecture attribution without manufactured execution differences;
- procurement behavior where a narrowed authority can still faithfully enforce the wrong governed metric.

## Independent outcome oracle

Matrix expected outcomes are defined by authority state, disposition semantics, technical state, boundary relationship, and typed-condition truth value. The matrix does not treat the application's displayed expected result as permission to execute.

Changing `expectedResult` is tested explicitly as non-causal: execution must remain unchanged and the prediction comparison must become `MISMATCH` when the prediction is deliberately wrong.

## Procurement research result

The procurement scenario intentionally distinguishes correct implementation from correct organizational specification.

The prior authority is defined over `equipmentPriceCents`. A NARROW disposition can validly make that equipment-price boundary stricter while still leaving Vendor C inside the narrowed boundary. That is a legitimate experimental result: the system can faithfully narrow and enforce the wrong economic metric.

The metric change from equipment price to total acquisition cost is therefore represented through a replacement authority scope, not disguised as NARROW.

The procurement CONDITION template uses a total-acquisition-cost scope that includes the configured Vendor C total so that `financeApproval == true` is causally capable of changing execution from BLOCK to ALLOW. This prevents an editable condition from being merely decorative.

## Import/export compatibility

The export envelope remains schema version `1.0` for backward compatibility. Scenario payloads may be schema version `1.0` or `2.0`, and their scenario schema version must survive export/import without downgrade.

## Success criteria

The internal gate succeeds only if:

- all matrix rows pass;
- all pre-existing rendered tests continue to pass;
- all five scenarios remain replay-equivalent;
- scenario switching does not retain stale controls or evidence;
- browser runtime/log errors remain zero;
- no static-server resource requests fail;
- repository and encoding integrity gates pass.

Independent external review remains required before a Version 2 release or tag is created.
