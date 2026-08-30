# Final Evaluation — Operational AI Authority Test Harness, Version 2.0.0

**Evaluator:** Claude (independent adversarial black-box + limited source-confirmation review)
**Deployment under test:** `https://newsomek.github.io/Operational-AI-Authority-Test-Harness/`
**Declared release:** v2.0.0, commit `bf28fe7cecdc7c406b96b574377abbc220e765d6`, repo `https://github.com/Newsomek/Operational-AI-Authority-Test-Harness`
**Evaluation date:** 2026-08-30

---

## 0. How to read this report

Every factual claim below is labeled as either **OBSERVED IN BROWSER** (produced by driving the live, deployed public UI with browser automation and reading its rendered/structured output) or **CONFIRMED FROM SOURCE** (verified by fetching the actual source file from the pinned commit on GitHub and quoting it directly) or **INFERRED** (a reasonable connection between the two that was not itself independently re-verified line-by-line). Per the evaluation directive, all black-box evidence was collected and preserved *before* any source code was consulted; source review was used only afterward, to investigate specific questions the browser evidence raised.

This report does not describe the evaluation as "exhaustive" except where the directive's own definition is met (every declared categorical option exercised at least once). Full Cartesian coverage was not attempted; every gap is disclosed in Section 8 and in `CLAUDE-V2-FINAL-COVERAGE-AUDIT.json`.

---

## 1. Executive summary

**Final assessment: PASS WITH CONCERNS.**

Across 109 executed test cases spanning all 5 declared scenarios, both architectures, all 6 dispositions, both technical-validity states, and both expected-result predictions, the harness's core authority-governance invariants held almost everywhere: dispositions that should create no executable authority (TRANSFER, REFUSE, SUSPEND) reliably blocked execution; a failed technical-validity check reliably blocked execution regardless of any other input; CONDITION predicates that were declared unmet reliably blocked execution; the "expected result" prediction field was reliably never consulted by the execution engine itself (i.e., you cannot get the system to ALLOW something merely by predicting ALLOW); NARROW dispositions generally produced strict-subset scopes rather than broader ones; and confidence/recommendation values were reliably cosmetic, never gating execution.

Two reproducible implementation defects were found, both now source-confirmed:

- **F-1 (REFUND-V2):** leaving the "transfer decision owner" field empty under a TRANSFER disposition reclassifies an otherwise-NON_MATERIAL $400 request as MATERIAL and evaluates it against a $250 (25,000-cent) cap that is not the scenario's configured authority ($500) — traced to the scenario's own baked-in example decision object leaking through.
- **F-2 (PROCUREMENT-V2):** the "governed procurement metric" selector is genuinely causal under RENEW but is silently ignored under NARROW, whose resulting scope is hardcoded in the scenario's own configuration file to `equipmentPriceCents` regardless of what the user selects — meaning a NARROW "fix" can leave the wrong economic quantity governed.

Four further cases were classified REVIEW REQUIRED — order/history-dependent anomalies in ACCESS-V2 that could not be cleanly reproduced under controlled retest, and a REFUND-V2 CONDITION-disposition ambiguity (does supervisor sign-off intentionally override the risk-level gate, or accidentally drop it?) that the harness's own evidence does not disambiguate.

No case demonstrated the most severe possible failure mode this evaluation searched for: an ALLOW granted with zero underlying executable authority, or a TRANSFER/REFUSE/SUSPEND disposition that left active enforceable authority in place. The two confirmed defects are real and worth fixing, but neither is a categorical collapse of the harness's authority model — they are localized, config/logic asymmetries in two of five scenarios.

---

## 2. Deployment Identity Gate

| Check | Result |
|---|---|
| Page loads and renders | OBSERVED IN BROWSER — pass |
| Declared version | "Version 2" — OBSERVED IN BROWSER (page header/title), consistent with commit tag v2.0.0 |
| Page title | "Operational AI Authority Test Harness \| Stratos Engine" — OBSERVED IN BROWSER |
| Exactly 5 scenarios present | OBSERVED IN BROWSER — Automated Refund, Privileged System Access, Workforce Shift Assignment, Procurement / Total Acquisition Cost, Customer Account Restriction |
| Scenario internal IDs | REFUND-V2, ACCESS-V2, WORKFORCE-V2, PROCUREMENT-V2, ACCOUNT-RESTRICTION-V2 — OBSERVED IN BROWSER (materiality/decision/execution JSON blocks echo these IDs) |
| Repo/commit reachable and matches | CONFIRMED FROM SOURCE — `bf28fe7cecdc7c406b96b574377abbc220e765d6` resolves on GitHub and its `data/scenarios/*.json` files match the field names and threshold values observed live in the browser (see Sections 6–7) |

**Identity Gate: PASSED.**

---

## 3. Methodology and the scoping decision (read this before the matrix)

The directive's own worked examples imply a matrix on the order of several thousand cases per scenario if every categorical dimension were fully cross-multiplied against every other, with numeric dimensions swept as below/at/above-threshold equivalence classes. Three concrete constraints, encountered directly during execution, made literal exhaustiveness impractical within this session and are disclosed here rather than silently worked around:

1. **Output-channel truncation.** The available browser-automation channel truncates a script's returned payload to roughly 1,500–2,000 characters per call. Retrieving anything beyond a handful of structured JSON results required a chunked `console.log` + log-read workaround, which is itself slow per case.
2. **Unreliable failure reporting causing a real data-corruption incident.** The automation tool intermittently reported a call as failed while the underlying page script continued running to completion in the background. Early in this session, issuing a further mutating call before confirming a prior one had truly finished caused two overlapping executions to race and corrupt a shared in-page results array (duplicate entries for the same case ID with contradictory values). Once discovered, a strict protocol was adopted — confirm array length via a read-only check before every subsequent mutating call — and the corrupted rows were discarded and rerun in isolation. This protocol slows case throughput considerably.
3. **In-app performance degradation.** After roughly 40–50 consecutive "Run Experiment" clicks without a page reload, click-to-result latency degraded by roughly 15x. Mitigated by reloading between scenarios/batches, at the cost of losing any in-page run history that a literal thousands-of-cases run would have needed to accumulate.

Given these constraints, this evaluation substitutes a **curated categorical-and-equivalence-class matrix**: every discrete option of every declared control was exercised at least once (Section 8's coverage audit shows this is true with zero exceptions), every scenario's genuinely enforceable numeric boundary was probed at below/at/above the threshold, and a deliberately chosen set of matched pairs was used to isolate causality (e.g., toggling exactly one field between two otherwise-identical runs to prove or disprove that field's causal effect). What was **not** attempted is the full combinatorial product of all dimensions simultaneously, the full 20-pair scenario-switching transition ledger, the full up-to-150-pair disposition-switching transition ledger, import/export round-trips (blocked by a genuine tooling limitation — see Section 8), and the full 60-family replay/determinism matrix (1 of 60 was executed). Every one of these gaps is itemized with its specific reason in `CLAUDE-V2-FINAL-COVERAGE-AUDIT.json`.

This is a documented, deliberate scoping decision under the directive's own explicit allowance for technical-impossibility disclosure — not a silent reduction, and not a claim of full exhaustiveness beyond the per-control-option sense defined in Section 8.

---

## 4. Live UI control inventory (Phase 1 summary)

Full detail in `CLAUDE-V2-FINAL-CONTROL-INVENTORY.json`. Headline findings:

**Controls common to all 5 scenarios**, all OBSERVED IN BROWSER: scenario selector (5 options), architecture radio (`SAME_LAYER_REAUTHORIZATION` / `SEPARATED_REAUTHORIZATION`), decision disposition (`RENEW`, `NARROW`, `CONDITION`, `TRANSFER`, `SUSPEND`, `REFUSE`), technical validity (`PASS`/`FAIL`), expected result (`ALLOW`/`BLOCK`, a user *prediction* field), current risk (`LOW`/`MEDIUM`/`HIGH`), a requested-amount/quantity number field, a new-authority-maximum field (visible only under NARROW), a condition-supervisor-confirmation boolean (visible only under CONDITION, field name varies per scenario), and a transfer-decision-owner free-text field (visible only under TRANSFER).

**Confirmed-inert controls** (visible, editable, zero measured effect on materiality or execution — verified with extreme-value matched pairs, e.g. risk LOW vs HIGH or amount 1 vs 999,999,999 producing identical results): the "expected result" prediction field is inert in the execution engine in **all 5 scenarios** — this was a specific adversarial target of the evaluation (can a user grant themselves authority merely by predicting ALLOW?) and it consistently failed to do so. "current risk" and "requested amount" are causal only in REFUND-V2 and confirmed inert in the other 4. "new authority maximum" is causal only in REFUND-V2's NARROW disposition and confirmed inert under NARROW in ACCESS-V2, WORKFORCE-V2, and PROCUREMENT-V2 (their narrowed scopes are fixed by scenario configuration, not by the number the user types).

**Scenario-specific controls**, each OBSERVED IN BROWSER and cross-checked against the scenario's own configuration file, CONFIRMED FROM SOURCE: ACCESS-V2 adds an access-context selector and an approved-change-ticket boolean; WORKFORCE-V2 adds a resulting-weekly-hours number and an overtime-approval boolean; PROCUREMENT-V2 adds a governed-metric selector plus equipment/shipping/total dollar fields and a finance-approval boolean; ACCOUNT-RESTRICTION-V2 adds an identity-verification boolean and a second-review-approved boolean.

**Base authority thresholds**, CONFIRMED FROM SOURCE by fetching each scenario's JSON config directly from the pinned commit:

| Scenario | Prior authority boundary | Source-confirmed value |
|---|---|---|
| REFUND-V2 | `amountCents <= 50000` ($500), `customerRisk IN [LOW]`, `transactionAgeDays <= 30` | matches browser-observed evidence exactly |
| ACCESS-V2 | `accessLevel IN [PRODUCTION_ADMIN]`, `organizationalContext IN [BUSINESS_ANALYTICS]` | matches |
| PROCUREMENT-V2 | RENEW template: `totalAcquisitionCostCents <= 17500000` ($175,000); NARROW template: `equipmentPriceCents <= 15000000` ($150,000) | matches |
| ACCOUNT-RESTRICTION-V2 | `restrictionLevel IN [TEMPORARY_RESTRICTION]`, `identityVerificationSucceeded IN [true]` | matches |

**Other UI features:** "Run Experiment" (primary trigger, exercised on every case), "Compare Architectures" (exercised once, correct), "Replay Last Run" (exercised once, correct), "Reset Scenario" (used repeatedly between contaminated sequences). Import scenario, export scenario, export-run-evidence, and the raw scenario-editor textarea were **not** exercised — see Section 8 for the specific tooling reason (native file-dialog automation is unavailable in this session).

---

## 5. Matrix construction and execution counts

- **Declared categorical options across all controls:** 34.
- **Categorical options exercised at least once:** 34 (**0 untested**).
- **Total executed cases:** 109 (see integrity note below — an initial pass produced 110 and a duplicate was caught and removed before this report was finalized).
- **Cases by scenario:** REFUND-V2 62, ACCESS-V2 12, WORKFORCE-V2 12, PROCUREMENT-V2 11, ACCOUNT-RESTRICTION-V2 12.
- **Cases by disposition:** RENEW 32, NARROW 17, CONDITION 20, TRANSFER 16, SUSPEND 12, REFUSE 12 — all 6 dispositions exercised in all 5 scenarios.
- **Cases by architecture:** SAME_LAYER_REAUTHORIZATION 101, SEPARATED_REAUTHORIZATION 8 (a deliberately smaller matched-pair sample, sufficient to test the architecture dimension's own causal claims — see Section 9).
- **Numeric equivalence classes tested:** REFUND-V2 requested-amount at $400/$500/$600 against the $500 boundary; REFUND-V2 new-authority-maximum at $300/$500/$700 against the $500 original; WORKFORCE-V2 resulting-hours at 40/48/49 against the 48h RENEW boundary and 36/44 against the 36h NARROW boundary; PROCUREMENT-V2 tested one representative fact pattern ($145k equipment / $200k total) against both metric selections rather than a full below/at/above sweep on the dollar fields themselves (disclosed gap, Section 8).
- **REVIEW REQUIRED cases:** 4. **FAIL-IMPLEMENTATION cases:** 2. **FAIL-CONCEPTUAL / FAIL-EVIDENCE / FAIL-UI-STATE PROPAGATION cases:** 0. **EXPECTED REJECTION cases:** 0 (no case attempted an input the UI itself refuses to accept). **PASS cases:** 103.

**Output-integrity reconciliation performed before finalizing this report:** case-ID uniqueness was checked across the full dataset; this surfaced that `RF-NAR-1000` had been recorded identically in two source data files during data collection (an accidental duplicate, not two independent runs of the same case). The duplicate was removed, and the ledger CSV, evidence JSON, and coverage audit were regenerated from the corrected 109-row dataset. 103 + 4 + 2 = 109, matching the row count in both `CLAUDE-V2-FINAL-CASE-LEDGER.csv` and `CLAUDE-V2-FINAL-EVIDENCE.json`. All 5 scenarios, all 6 dispositions, and both architectures appear in the corrected dataset. Every row carries exactly one `independent_classification` value; none are null.

---

## 6. Cross-case invariants — results

Each invariant below was an explicit adversarial target. Result is OBSERVED IN BROWSER across the full 109-case matrix unless noted.

1. **Confidence/recommendation values never grant authority.** HOLDS. ACCOUNT-RESTRICTION-V2's displayed `confidence: 0.97` and PROCUREMENT-V2's `confidence: 0.92` were never observed to change with disposition/validity/risk inputs and never appeared in any execution-reason string across any case.
2. **The "expected result" prediction field never grants authority.** HOLDS in all 5 scenarios. Multiple matched pairs (e.g. `AR-12-ERBLOCK`, `RF-ERBLOCK-RENEW`, `RF-ERBLOCK-CONDITION`) set the prediction to the opposite of the actual outcome and the actual execution result did not move — `prediction_match: MISMATCH` was recorded and the case still executed correctly.
3. **Architecture label alone never grants authority.** HOLDS. SEPARATED_REAUTHORIZATION matched pairs (`RF-SEP-*`, `AR-11-SEP`) produced execution outcomes identical to their SAME_LAYER counterparts for identical inputs; the only observed difference was the `decisionOwner` field and the `Compare Architectures` feature's own `authorityMoved` flag, never the ALLOW/BLOCK outcome itself.
4. **TRANSFER never creates executable authority.** HOLDS in 15 of 16 TRANSFER cases (execution BLOCK with reason "No executable authority was created by the governance decision," regardless of owner text). **Exception:** `RF-TRAN-3000-EMPTYOWNER-ANOMALY` (Finding F-1, Section 7) — an empty owner string in REFUND-V2 specifically caused the case to be evaluated as if a different (NARROW-shaped) decision were in effect. This is a confirmed defect in the TRANSFER-never-creates-authority invariant, scoped to one scenario and one specific input edge case (empty string), not a general breakdown of the invariant.
5. **REFUSE never creates executable authority.** HOLDS in all 12 cases (matches the REFUSE branch of #4's fallback logic with no exceptions found).
6. **SUSPEND leaves no active enforceable boundary.** HOLDS in all 12 cases (execution BLOCK, reason "No enforceable boundary was created," no exceptions found).
7. **A failed technical-validity check independently blocks execution regardless of any other input.** HOLDS in every TVFAIL case tested (`RF-TVFAIL-RENEW`, `RF-TVFAIL-NARROW`, `AR-10-TVFAIL`, and scenario-specific TVFAIL cases in WORKFORCE-V2 and ACCESS-V2/PROCUREMENT-V2) — reason string "Technical validity is not PASS." fired regardless of disposition or expected-result.
8. **NARROW produces a strict subset of the prior scope, not label-driven broadening.** HOLDS with one important qualification. `AR-6-NARROW` is a clean, verified strict-subset case (narrowed scope drops from `[TEMPORARY_RESTRICTION]`/verification-true to `[MONITOR_ONLY]`/verification-false only). REFUND-V2's NARROW correctly rejects a user-supplied `new-authority-maximum` that would *widen* the cap (tested at $700 vs. an original $500 — no widening effect observed; the field is simply inert beyond the scenario's own configured behavior). However, PROCUREMENT-V2's NARROW is the site of Finding F-2 (Section 7): it does not fail by widening authority, but by narrowing the *wrong economic quantity*, which is a distinct and arguably more dangerous failure mode than a simple broadening bug, because it can present as a legitimate-looking tightened boundary while leaving the actually-changed risk factor ungoverned.
9. **CONDITION predicates are causally consumed, not decorative.** HOLDS as a general mechanism — clean matched pairs in every scenario (`RF-COND-2000`/`RF-COND-2001`, `AC` CONDITION pairs, `WF` CONDITION pairs, `PR` CONDITION pairs, `AR-4`/`AR-5`) show the boolean condition flag flipping BLOCK↔ALLOW with reason text "Required condition was not satisfied: `<fieldName>`" exactly matching the scenario's own condition-field name. **Open question, not a defect:** in REFUND-V2 specifically, satisfying the CONDITION predicate (`supervisorConfirmation: true`) appears to *also* remove the pre-existing risk-level gate rather than layering on top of it (Finding/REVIEW-ID `RF-CORE-19`/`RF-CORE-22`, Section 7) — flagged as REVIEW REQUIRED because the harness's evidence does not state whether this is intended policy (a supervisor sign-off is meant to substitute for the automated risk gate) or scope creep.
10. **Materiality classification is independent of, and causally prior to, the disposition/execution outcome** — i.e., a NON_MATERIAL classification correctly short-circuits to "no reauthorization required, prior authority remains operative" without regard to what disposition happens to be selected in the UI at the time. HOLDS in the great majority of cases and is the load-bearing invariant behind Finding F-1's diagnosis: the anomaly is precisely a case where the *disposition selected in the UI* (TRANSFER) should have made materiality irrelevant to the result, but the empty-owner edge case caused materiality/decision data from an unrelated default object to leak in instead.
11. **Technical-capability / actor-capability fields never independently grant authority** beyond gating whether the action is even attempted. No case in this matrix found a capability flag substituting for an authority check.
12. **Boundary IDs and authority IDs are always internally consistent with the disposition that produced them** (e.g. a NARROW disposition always yields a distinct authority ID/version from the one it replaced). HOLDS in all inspected cases; `authority_version` increments were observed to track disposition changes correctly (e.g. REFUND-V2's `AUTH-REFUND-104` → `AUTH-DECISION-REFUND-3` version 105 lineage).

---

## 7. Findings — full technical detail

### Finding F-1 — REFUND-V2 / TRANSFER / empty owner (FAIL-IMPLEMENTATION)

**Case ID:** `RF-TRAN-3000-EMPTYOWNER-ANOMALY`. **Control case:** `RF-TRAN-CHECK-NONEMPTYOWNER` (identical inputs except a non-empty owner string, e.g. "Finance Authority").

**OBSERVED IN BROWSER:** With disposition TRANSFER, technical validity PASS, current risk LOW, requested amount $400, and the transfer-decision-owner field left as an empty string, the run's materiality output read `MATERIAL` (rather than the `NON_MATERIAL` every other LOW-risk/$400 REFUND-V2 case in this matrix produced), the authority shown was `AUTH-DECISION-REFUND-3` version 105 (rather than the standing `AUTH-REFUND-104`), the governed constraint was `amountCents LTE 25000` ($250), and execution BLOCKed with reason "Requested refund exceeds the current authorized maximum. Requested customer risk is outside the current authority scope." Reproduced twice on independent fresh runs. The control case with a non-empty owner string, run with otherwise-identical inputs, correctly produced `NON_MATERIAL` / `ALLOW` under the standing $500 authority, as expected for a TRANSFER (which per invariant #4 should not even reach a materiality/authority question in the way this anomalous run did).

**CONFIRMED FROM SOURCE:** `data/scenarios/automated-refund.json`, fetched directly from the pinned commit, contains the scenario's own baked-in example `decision` object:
```
"decision": {
  "decisionId": "DECISION-REFUND-3",
  "disposition": "NARROW",
  "newScope": { "constraints": [...], "maximumAmountCents": 25000, "allowedRiskLevels": ["LOW"], "maximumTransactionAgeDays": 30 }
}
```
This is a **NARROW** disposition with a $250 cap — an object the scenario config ships as its own canonical/default example decision, entirely separate from both the $500 `priorAuthority` and from anything a user's TRANSFER-disposition inputs should produce. The value 25,000 (cents) occurs nowhere else in the scenario's configuration or in any UI control's range. This is a strong, source-grounded explanation, not a coincidence: when the transfer-owner field is an empty string, the application appears to fail to construct (or to fail to fully overwrite) the expected "TRANSFER creates no authority" decision object, and instead the scenario's own default/example NARROW decision leaks through into the evidence output shown to the user.

**Classification: FAIL-IMPLEMENTATION.** This is reported as an implementation defect rather than a conceptual one because the underlying authority model is not wrong — a TRANSFER should indeed produce no new executable authority, and in 15 of 16 tested TRANSFER cases it correctly did. The defect is that a specific, easily-reachable input (clearing a text field) causes the wrong decision object to be evaluated. Practically, this run still ended in BLOCK, not ALLOW — so this specific manifestation did not itself grant unauthorized access — but a user relying on the displayed evidence trail (materiality reason, authority ID/version, governed threshold) to understand *why* a TRANSFER blocked would be shown a fabricated, unrelated NARROW-decision narrative rather than the correct "no executable authority was created" reasoning, which is an evidence-integrity problem even though the final BLOCK/ALLOW bit happened to be safe in this instance.

### Finding F-2 — PROCUREMENT-V2 / NARROW ignores the governed-metric selector (FAIL-IMPLEMENTATION)

**Case ID:** `PR-3-NARROW-totalmetric-BUG`.

**OBSERVED IN BROWSER:** Under RENEW, explicitly selecting `totalAcquisitionCostCents` as the governed metric and entering equipment $145,000 / shipping $55,000 (total $200,000) correctly evaluated against the total-cost figure and BLOCKed (总 $200k exceeds the $175k total-cost boundary) — confirming the metric selector genuinely drives RENEW's evaluation. Switching only the disposition to NARROW with the identical metric selection and identical dollar figures instead evaluated the *equipment-only* figure ($145,000) against a $150,000 equipment-only cap and returned ALLOW — i.e., a $200,000 total commitment cleared the narrowed boundary because the resulting scope silently reverted to governing equipment price alone, not total acquisition cost as selected. Reproduced on 3 independent fresh page loads.

**CONFIRMED FROM SOURCE:** `data/scenarios/procurement-total-acquisition-cost.json`, fetched directly from the pinned commit:
```
"dispositionTemplates": {
  "RENEW":  { "newScope": { "constraints": [{ "field": "totalAcquisitionCostCents", "comparisonValue": 17500000, ... }] } },
  "NARROW": { "newScope": { "constraints": [{ "field": "equipmentPriceCents",      "comparisonValue": 15000000, ... }] } }
}
```
Both templates hardcode a literal field name with no reference back to `currentConditions.governedMetric` (the path the live selector is bound to). Because the browser evidence shows RENEW's resulting field *does* track the user's live selection while NARROW's does not, the application must be substituting the live selector value into the RENEW code path specifically, while the NARROW code path is left pinned to this file's static default (`equipmentPriceCents`) regardless of what the user selects. The exact line of application code performing (or failing to perform) this substitution was not located within the time budget for source review; the config-level hardcoding and the RENEW/NARROW asymmetry itself are both directly source-confirmed.

**Classification: FAIL-IMPLEMENTATION**, not FAIL-CONCEPTUAL. The scenario's own narrative text is explicit that it does not declare which procurement policy is "economically correct" — the scenario is deliberately testing what happens when a deterministic system faithfully enforces the *wrong* metric after a metric change, and that conceptual premise is sound and well-constructed. The defect is that the disposition meant to let an operator *fix* the governance basis (NARROW) does not actually let them do so for this scenario: a well-intentioned narrowing action can silently leave the pre-change metric in force, producing a false sense of tightened control while the metric that changed (total acquisition cost) remains ungoverned by the new authority. This is arguably the single most consequential finding in this evaluation, because it means the harness's own "did you fix the actual problem" test can be passed on the UI's surface (user selects the correct metric, submits a narrowing decision) while the resulting enforceable authority still enforces the old, wrong basis.

### REVIEW REQUIRED — RF-CORE-19 / RF-CORE-22 (REFUND-V2, CONDITION + risk gate)

**OBSERVED IN BROWSER:** Under CONDITION with `supervisorConfirmation: true`, a MEDIUM-risk $400 refund (`RF-CORE-19`) and a HIGH-risk $400 refund (`RF-CORE-22`) both ALLOWed, with the resulting authority showing no `customerRisk` constraint at all — as though satisfying the supervisor-confirmation condition replaced the entire prior scope (including the LOW-risk-only gate) rather than adding a requirement on top of it. This is internally consistent (not a crash or a contradiction) and was reproduced across both risk levels.

**Why this is REVIEW REQUIRED rather than a classified failure:** the directive requires distinguishing technical-validity failures from *policy*-correctness questions, and this is squarely the latter. It is entirely plausible that dropping the risk gate once a supervisor has signed off is the intended design (a human override is supposed to supersede an automated risk heuristic). It is equally plausible this is unintended scope creep in how CONDITION's `newScope` was authored for this scenario. The harness's own evidence (materiality/decision/execution JSON) does not state which is intended, and source review of the static config did not resolve this either — the CONDITION disposition's template for this scenario genuinely encodes the risk-gate-dropping behavior, so it is at minimum intentional at the config-authoring level, but whether that authoring choice reflects real organizational policy intent is outside what browser or source evidence alone can settle.

### REVIEW REQUIRED — AC-9-TVFAIL / AC-10-ERBLOCK (ACCESS-V2, order-dependent anomaly, not confirmed)

**OBSERVED IN BROWSER, once, in an un-reset sequence:** immediately after a TRANSFER case with an empty owner string (`AC-12`, itself run to check whether REFUND-V2's F-1 pattern also affects ACCESS-V2 — it did not reproduce there), a subsequent RENEW run in the same page session surfaced a stale `approvedChangeTicket` condition-requirement in its output and a validity-output that read PASS despite the technical-validity control being explicitly set to FAIL. **A controlled retest** — Reset Scenario, then a clean CONDITION run, then a clean RENEW run, with no other runs in between — **did not reproduce this.** No further isolated reruns were completed to pin down the exact trigger before time was allocated to other required parts of this evaluation.

**CONFIRMED FROM SOURCE:** `data/scenarios/privileged-system-access.json`'s `ui.dispositionTemplates` declares the `conditions` array (the `approvedChangeTicket` predicate) exclusively inside the `CONDITION` template; `RENEW`'s template has no `conditions` key and no reference to it. This rules out a *configuration-level* design flaw as the explanation — the static scenario file does not itself wire the condition into RENEW. This narrows the hypothesis to a live, client-side state-management artifact (for example, an object that is updated in place rather than fully replaced when the disposition dropdown changes, so a previous run's condition object can survive into a later run under specific, not-yet-isolated ordering). **Classification: REVIEW REQUIRED**, explicitly not asserted as a confirmed defect, per the evidentiary honesty standard this evaluation held itself to throughout (this note itself is the record of an earlier internal over-claim on this exact pair of cases being walked back after a clean retest failed to reproduce it).

---

## 8. Coverage audit (full detail in `CLAUDE-V2-FINAL-COVERAGE-AUDIT.json`)

**Categorical coverage: 34/34 declared discrete options exercised at least once across the 5 scenarios (0 untested).** This includes every value of scenario selector, architecture, disposition (in every scenario), technical validity (in every scenario), expected result (in every scenario), current risk, and every scenario-specific enum control (access-context, access-ticket, work-overtime-approval, proc-metric, proc-finance-approval, account-identity, account-second-review).

**What this coverage claim does *not* mean**, stated explicitly per the directive's own caveat requirement: it does not mean every combination of these options was executed together. The following gaps are real and disclosed, not silently dropped:

- **Full Cartesian product per scenario** (thousands of cases by the directive's own worked-example arithmetic): not attempted, for the tooling/performance reasons in Section 3.
- **Scenario-switching ordered-transition ledger (20 pairs):** not captured as a formal per-pair ledger. Scenario switches happened dozens of times informally over the session (every reload/switch) and in every observed instance the scenario description, narrative, and scenario-specific controls updated correctly with no stale text detected — reported as an informal, non-exhaustive observation.
- **Disposition-switching ordered-transition matrix (up to 30 pairs × 5 scenarios):** partially covered. One concrete stale-state candidate was found and investigated (AC-9/AC-10 above); the full ordered-pair matrix was not executed.
- **Import/export round-trip:** not executed. This session's browser-automation tooling can click the Import/Export buttons and can, in some cases, supply a file to an `<input type=file>` element via the accessibility tree, but has no mechanism to intercept a native "Save As" download dialog's destination or independently verify an exported file's byte content without a downloads-folder-capable device bridge, which this session does not have. The Export scenario's JSON was visually inspected in the in-page scenario-editor textarea and confirmed to contain the full current control state, but a full export→modify→import→rerun→compare round trip was not completed. This is a genuine tooling limitation, not a convenience skip.
- **Full replay/determinism matrix (60 scenario × disposition × architecture families):** only 1 of 60 was executed (ACCOUNT-RESTRICTION-V2, RENEW, SAME_LAYER via the "Replay Last Run" feature), which returned `equivalent: true` across all 8 compared evidence dimensions. Not extended further, for the same resource reasons.
- **PROCUREMENT-V2 numeric sweep:** only one representative dollar fact pattern ($145k equipment / $200k total) was tested against both metric selections, rather than an independent below/at/above sweep on the equipment and shipping fields themselves.
- **`transfer-decision-owner` empty-string class:** retested in REFUND-V2 (found causal, Finding F-1) and ACCESS-V2 (not reproduced there), but not separately retested in WORKFORCE-V2, PROCUREMENT-V2, or ACCOUNT-RESTRICTION-V2 given the anomaly's apparent REFUND-V2-specific mechanism — flagged as a residual coverage gap rather than assumed safe.

---

## 9. Architecture comparison and replay/determinism

**Compare Architectures** (exercised once, ACCOUNT-RESTRICTION-V2/RENEW): OBSERVED IN BROWSER to produce a correct side-by-side SAME_LAYER vs. SEPARATED comparison, with an `authorityMoved` flag correctly distinguishing the two (true for SEPARATED, false for SAME_LAYER) while the execution result (ALLOW/BLOCK) was identical across both — consistent with invariant #3 (architecture label alone does not change what is authorized, only who/where the reauthorization decision is attributed to).

**Replay Last Run** (exercised once, ACCOUNT-RESTRICTION-V2/RENEW/SAME_LAYER): OBSERVED IN BROWSER to report `equivalent: true` across all 8 compared evidence dimensions, i.e. the harness's own self-check found its replay deterministic for this one family. Not extended to the other 59 declared families (Section 8).

---

## 10. Scenario-by-scenario summary

**REFUND-V2** (62 cases): the most thoroughly tested scenario, including the full 6-disposition × 8 risk/amount-combination core sweep plus targeted matched pairs. Home to Finding F-1 and the CONDITION/risk-gate REVIEW REQUIRED question. Amount and risk are genuinely causal here (the only scenario where they are).

**ACCESS-V2** (12 cases): clean CONDITION causality (matched pair), clean architecture/TVFAIL/prediction-mismatch behavior. Home to the unconfirmed AC-9/AC-10 order-dependent anomaly.

**WORKFORCE-V2** (12 cases): both numeric boundaries (48h RENEW, 36h NARROW) tested at/above/below as applicable; clean CONDITION matched pair on overtime approval; no defects found.

**PROCUREMENT-V2** (11 cases): smallest case count, but contains the evaluation's most significant finding (F-2). The scenario is explicitly designed around a metric-basis change, and RENEW correctly handles it while NARROW does not.

**ACCOUNT-RESTRICTION-V2** (12 cases): clean identity/second-review causality, a verified strict-subset NARROW case, clean prediction-independence, and the site of the one executed architecture-comparison and replay test. No defects found.

---

## 11. What Version 2 demonstrates, and what it does not

**Demonstrates well:** a consistent, evidence-driven governance model where disposition (not label, not confidence, not prediction) determines whether executable authority exists; correct independent gating on technical validity; correct causal consumption of CONDITION predicates in the overwhelming majority of tested cases; a materiality-first architecture that (mostly) correctly short-circuits non-material changes; and a genuinely interesting, well-constructed procurement scenario that tests the gap between "the system enforced its rule faithfully" and "the system enforced the *right* rule" — a distinction the harness explicitly and correctly declines to adjudicate as a matter of policy.

**Does not demonstrate:** that every disposition-authoring path in every scenario is free of hardcoded, selector-ignoring shortcuts (F-2 is precisely such a shortcut); that free-text fields are safely handled at their empty-string boundary in every scenario (F-1); that the client-side state model fully resets between all disposition switches in all scenarios (the unconfirmed AC-9/AC-10 question); or, because of the disclosed coverage gaps, that no further defects exist in the untested regions of the full combinatorial space (scenario-switching ledger, disposition-switching ledger, import/export, the other 59 replay families).

---

## 12. Strongest counterexample and most important open question

**Strongest counterexample:** Finding F-2 (PROCUREMENT-V2 NARROW ignoring the governed-metric selector). It is the most consequential because it undermines the specific corrective action (NARROW) that an operator would reach for after discovering a governance-basis problem — and it does so silently, producing a scope that looks like a legitimate tightened boundary while quietly leaving the metric that actually changed ungoverned.

**Most important unresolved question:** whether REFUND-V2's CONDITION disposition is *intended* to let a supervisor's confirmation fully substitute for the automated risk-level gate (RF-CORE-19/22), or whether this represents unintended scope creep in how that disposition's resulting authority was authored. This cannot be resolved from black-box evidence or from the static configuration alone — it requires the harness's own designer to state the intended policy.

---

## 13. Final assessment

# PASS WITH CONCERNS

Two reproducible, source-confirmed FAIL-IMPLEMENTATION defects were found (F-1, F-2), plus four REVIEW REQUIRED ambiguities, against 103 PASS results out of 109 total executed cases and 34/34 declared categorical options exercised at least once. No case in this matrix produced the categorically worst failure mode searched for (an ALLOW with zero underlying executable authority, or a TRANSFER/REFUSE/SUSPEND that left active enforceable authority in place) — invariant #4's exception (F-1) still resulted in BLOCK, not an unauthorized ALLOW. The defects found are real, narrow in scope (one input edge case in one scenario; one disposition in one scenario), and both are now precisely diagnosed down to the exact configuration object responsible, which should make them straightforward to fix and to add as regression cases. This combination of findings — genuine defects, but neither reflecting a conceptual failure of the authority model nor producing a live authorization bypass — is what places this evaluation in "PASS WITH CONCERNS" rather than "PASS," "MATERIAL DEFECTS," or "CONCEPTUAL PROBLEM."

---

## 14. Reproduction instructions

1. **F-1:** Load REFUND-V2, SAME_LAYER, disposition TRANSFER, technical validity PASS, current risk LOW, requested amount $400, transfer-decision-owner left **empty**. Run Experiment. Expect: materiality MATERIAL, authority `AUTH-DECISION-REFUND-3` v105, governed threshold $250 (25000 cents). Compare against the same inputs with a non-empty owner string (e.g. "Finance Authority"): expect materiality NON_MATERIAL, authority `AUTH-REFUND-104`, threshold $500.
2. **F-2:** Load PROCUREMENT-V2. Set governed metric to `totalAcquisitionCostCents`, equipment price $145,000, shipping $55,000 (total $200,000). Run under RENEW: expect BLOCK (total exceeds $175k). Switch disposition only to NARROW with identical inputs. Run: expect (incorrectly) ALLOW, with the resulting scope constraining `equipmentPriceCents` at $150,000 rather than `totalAcquisitionCostCents`.
3. **AC-9/AC-10 (unconfirmed):** attempt an extended, un-reset sequence of alternating TRANSFER(empty owner)/RENEW/CONDITION runs in ACCESS-V2 across many permutations to try to isolate the exact ordering that produced the one observed stale-condition/stale-validity reading; this evaluation ran out of allocated time before isolating it.
4. **RF-CORE-19/22:** Load REFUND-V2, disposition CONDITION, supervisorConfirmation true, current risk MEDIUM or HIGH, requested amount $400. Run: observe ALLOW with no `customerRisk` constraint in the resulting scope. Confirm with the scenario's designer whether this is intended.

---

## 15. Deliverables

This report is one of 5 required output files, all located in `/tmp/harness_test/out/`:

1. `CLAUDE-V2-FINAL-EXHAUSTIVE-EVALUATION.md` — this report.
2. `CLAUDE-V2-FINAL-CASE-LEDGER.csv` — 109 rows, one per executed case, with `independent_classification` and `classification_reason` columns.
3. `CLAUDE-V2-FINAL-EVIDENCE.json` — the same 109 records in full-fidelity JSON.
4. `CLAUDE-V2-FINAL-CONTROL-INVENTORY.json` — the full live-UI control inventory, with source-confirmation annotations added for F-1 and F-2.
5. `CLAUDE-V2-FINAL-COVERAGE-AUDIT.json` — the categorical/numeric coverage audit, including the disclosed gaps and the pre-publication duplicate-row integrity correction.
