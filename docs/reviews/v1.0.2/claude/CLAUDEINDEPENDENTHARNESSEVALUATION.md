# Independent Evaluation: Operational AI Authority Test Harness

**Application under test:** https://newsomek.github.io/Operational-AI-Authority-Test-Harness/
**Source (referenced only after browser testing):** https://github.com/Newsomek/Operational-AI-Authority-Test-Harness
**Evaluator:** Claude, via live Chrome browser automation of the deployed page (no source code was read until after all browser testing was complete)
**Date:** 2026-08-29
**Method:** All 336 planned cases were executed against the live, rendered application by programmatically setting the actual form controls (`select`/`input`/`radio` elements, via `value` assignment plus dispatched `input`/`change`/`click` events — the same DOM APIs a real user interaction produces) and clicking the real "Run experiment" button, then reading the actual rendered evidence back out of the DOM. No case was evaluated by reasoning about the engine source files. A parallel manual/visual pass (screenshots, the dedicated "Compare architectures" and "Replay" buttons, direct mouse/keyboard interaction) was used to corroborate the automated findings and to check usability.

---

## EXECUTIVE SUMMARY

**OVERALL ASSESSMENT: MATERIAL DEFECTS**

The harness is a well-built, unusually self-aware piece of software — its narrative "What happened" section, its `Compare Architectures` feature, and even its own JSON evidence sometimes state the uncomfortable conclusion outright (e.g. `"separationFinding": "AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED"`). Several of the core invariants it sets out to demonstrate hold up cleanly under adversarial testing: the expected-execution prediction never leaks into actual execution; REFUSE, TRANSFER and SUSPEND never leave behind executable authority; technical validity is enforced independently of organizational authority in both directions; NARROW is evaluated from its resulting boundary rather than its label; and the deterministic engine reproduces identical output on identical input every time it was rerun.

However, two things earn "material defects" rather than "pass with concerns":

1. **The CONDITION disposition's supervisor-confirmation predicate is never operative.** Across all 80 materially-triggered CONDITION test cases in the matrix, changing supervisor confirmation from YES to NO produced a byte-identical distribution of ALLOW/BLOCK outcomes (0 of 32 matched combinations differ). The root cause is structural, not a fluke: CONDITION reproduces the *prior* authority's risk-scope (`allowedRiskLevels: ["LOW"]`) unchanged, so any request carrying the very risk elevation that triggered reauthorization in the first place (MEDIUM or HIGH) is blocked by the un-updated risk dimension before the supervisor predicate is ever reached. This directly contradicts the harness's own stated purpose ("CONDITION predicates actually affect execution") and is confirmed independently in the plain-English "What happened" narrative, not just in the JSON.
2. **The single "Run Experiment" path silently loses the "who decided" separation that the harness's own "Compare Architectures" feature demonstrates it is capable of computing.** Selecting SEPARATED_REAUTHORIZATION and clicking Run Experiment leaves `decisionActor`/`authority.owner` at `ACTOR-OPERATIONS`/`"Operations"` — identical to SAME_LAYER — even though the dedicated comparison tool, run on the identical scenario, correctly reports `ACTOR-GOVERNANCE`. Two code paths disagree about a fact central to the experiment's premise.

A number of additional, lower-severity but clearly reproducible issues were also found (RENEW ignoring its own "new authority maximum" control; stale/mislabeled control-assertion evidence; an undocumented ~5–15 second idle auto-reset that silently discards a completed run's results and several form values; two "evidence" panels — Authority History and Event Log — that never populate for the single-run-per-case workflow the harness's own instructions describe). These are detailed below with reproduction steps.

---

## MATRIX COVERAGE

| Metric | Count |
|---|---|
| Total cases planned | 336 |
| Total cases executed | 336 |
| Independent classification: PASS | 128 |
| Independent classification: EXPECTED REJECTION | 112 |
| Independent classification: FAIL — IMPLEMENTATION | 64 |
| Independent classification: REVIEW REQUIRED | 32 |
| Independent classification: FAIL — CONCEPTUAL | 0 (see Conceptual Critique — concerns exist but were folded into the FAIL-IMPLEMENTATION/REVIEW-REQUIRED findings above since they are behavior-specific, not purely conceptual) |
| Independent classification: FAIL — EVIDENCE | 0 as a *per-case* tag (the control-assertion mislabeling and the idle-auto-reset are evidence/UI defects that apply globally rather than to individual rows; they are documented as standing anomalies below rather than double-counted per case) |
| Independent classification: FAIL — UI/state propagation | 0 as a per-case tag (same reasoning; documented as a standing anomaly) |

No planned case was omitted. 336/336 executed, matching the instructed matrix size exactly (2 architectures × 3 risk levels × 6 dispositions × 2 technical-validity states × 2 money profiles × 2 expected-execution values = 288, plus 48 additional CONDITION cases for the supervisor-confirmation dimension = 336).

**Why 64 "FAIL — IMPLEMENTATION" rather than fewer:** all 64 are the material (non-skipped) CONDITION cases; they represent one root cause (the predicate is structurally unreachable), not 64 independent bugs. **Why 32 "REVIEW REQUIRED":** all 32 are the material RENEW cases, flagged because the "new authority maximum" control's inertness for RENEW cannot be conclusively judged as intended vs. unwired from the UI alone.

---

## FAILURES AND ANOMALIES

### Finding 1 (Strongest counterexample) — CONDITION's enforceable predicate is never enforced
- **Classification:** FAIL — IMPLEMENTATION
- **Affected cases:** All 64 material CONDITION cases (C073–C088, C129–C144, C241–C256, C297–C312 in the ledger); confirmed at the aggregate level across all 96 CONDITION cases including the 32 non-material ones.
- **Exact selections (representative):** Same-layer architecture; Current customer risk = MEDIUM; Requested refund = $200.00; Governance disposition = CONDITION; New authority maximum = $250.00; Supervisor confirmation = YES, then NO; Technical validity = PASS; Expected execution = ALLOW.
- **Observed behavior:** Both supervisor-confirmation settings produce identical output: Governance decision creates `AUTH-DECISION-3` with `scope.allowedRiskLevels: ["LOW"]` (unchanged from the prior authority) and `enforceableConditions: [{field: "supervisorConfirmation", operator: "EQ", comparisonValue: true}]`. Execution result is `BLOCK` with reason `"Requested customer risk is outside the current authority scope."` for both YES and NO. The app's own "What happened" narrative (step 6, human-readable, not JSON) states: *"The governance disposition was CONDITION. The current enforceable boundary allows up to $500 and permits customer risk levels: LOW."* — after a scenario whose entire premise is a change **to** MEDIUM risk.
- **Expected behavior:** If CONDITION is to test "CONDITION predicates actually affect execution" (an explicit design goal), the resulting boundary would need to admit the *new* risk level (as NARROW correctly does) so that the supervisor-confirmation predicate — not the un-updated risk whitelist — is the actual determinant of ALLOW vs. BLOCK. As built, the predicate can never be reached in any materially-triggered scenario.
- **Why it matters:** This is exactly the class of defect the harness exists to catch in a real deployment: a governance control (the human-confirmation gate) that is nominally present in the evidence (`enforceableConditions` is non-empty) but has zero causal effect on the system's actual behavior. A reviewer who read only the boundary's `enforceableConditions` field would reasonably (and wrongly) conclude the gate is active.
- **Reproducibility:** 100% deterministic; reproduced across all 2 architectures × 3 risk levels × 2 technical-validity states × 2 money profiles × 2 expected-execution values = 32 matched YES/NO pairs, 0 of which diverge.
- **Severity:** High.

### Finding 2 — Architecture separation is not implemented consistently between the two run paths
- **Classification:** REVIEW REQUIRED (bordering on FAIL — IMPLEMENTATION)
- **Affected cases:** All 168 SEPARATED_REAUTHORIZATION rows in the main matrix (decisionActor never differs from SAME_LAYER within that path); separately, 6 dedicated `Compare Architectures` runs (one per disposition) executed outside the main matrix.
- **Exact selections:** Current customer risk = MEDIUM; Requested refund = $200.00; Governance disposition = NARROW; New authority maximum = $250.00; Technical validity = PASS. Run once via "Run experiment" with the architecture radio set to SEPARATED_REAUTHORIZATION, and once via the dedicated "Compare architectures" button on the same scenario.
- **Observed behavior:**
  - Via **Run experiment** (used for the entire 336-case matrix): the scenario JSON's `decisionActor` and the resulting authority's `owner` field remain `{"actorId": "ACTOR-OPERATIONS", "name": "Operations Authority Owner"}` / `"Operations"` regardless of whether SAME_LAYER or SEPARATED is selected. `reauthorizationArchitecture` in the JSON *does* correctly flip to `SEPARATED_REAUTHORIZATION`; only the actor attribution fails to follow it.
  - Via **Compare Architectures** (a separate, dedicated feature) on the identical scenario: `sameLayerDecisionActor: "ACTOR-OPERATIONS"`, `separatedDecisionActor: "ACTOR-GOVERNANCE"` — correctly differentiated — but `executionDifference: false` in all 6 dispositions tested (RENEW, NARROW, CONDITION, TRANSFER, SUSPEND, REFUSE), and the tool's own `separationFinding` field literally reads `"AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED"` every time.
- **Expected behavior:** At minimum, the two code paths (single-run vs. comparison-run) should agree on who the decision actor is for a given architecture selection. Beyond that, per the harness's own explicit research question, one would want at least one configuration where the separated decision-owner's identity is itself part of an enforceable boundary condition (e.g., "only ACTOR-GOVERNANCE's decisions produce an ACTIVE authority; an ACTOR-OPERATIONS decision under a SEPARATED policy is itself invalid") — as built, no boundary or execution outcome in either path is ever conditioned on which actor made the decision.
- **Why it matters:** The disagreement between the two paths means most users of this tool (anyone running the primary, headline "Run experiment" workflow, which is what the 336-case matrix used, and what the instructions for this evaluation describe as the "normal UI" workflow) will never see the fact that the harness *can* compute a differentiated decision actor. And even where it is computed (via Compare Architectures), it is candidly non-consequential, which is a legitimate and well-disclosed conceptual finding, but the path-inconsistency itself is a separate, undisclosed defect.
- **Reproducibility:** 100%; reproduced identically across all 168 SEPARATED cases in the main matrix (Run Experiment path) and all 6 Compare-Architectures probes.
- **Severity:** High (conceptual centerpiece of the tool) / Medium (as a pure implementation bug, since it doesn't change any BLOCK/ALLOW outcome).

### Finding 3 — RENEW silently ignores the "New authority maximum" control
- **Classification:** REVIEW REQUIRED
- **Affected cases:** All 32 material RENEW rows (C057–C064, C113–C120, C225–C232, C281–C288).
- **Exact selections:** Current customer risk = MEDIUM; Governance disposition = RENEW; New authority maximum tested at $250.00, then $999.00, then $111.00, holding everything else constant.
- **Observed behavior:** The resulting boundary's `maximumAmountCents` is `50000` ($500 — the *prior* authority's untouched value) in every case, irrespective of the configured "new authority maximum." `allowedRiskLevels` likewise stays `["LOW"]`, never including the newly-selected risk level. The control is visually present, editable, and labeled generically ("The maximum dollar amount permitted by the new authority created through the selected governance disposition") with no indication that it is inert for this disposition.
- **Expected behavior:** Per the harness's own stated RENEW semantics ("a renewed authority may reproduce the same boundary or create an appropriately configured new boundary"), reproducing the same boundary is an explicitly *permitted* choice — so the execution outcome itself is defensible. What is not resolvable from the UI is whether ignoring the input control is deliberate (RENEW is "boundary-preserving by design, and the control simply doesn't apply to it") or an oversight (the control should drive RENEW's new scope the way it demonstrably drives NARROW's).
- **Why it matters:** As built, RENEW can never be used, from the visible controls, to renew authority at a *different* amount ceiling — a plausible and likely-expected real-world use of "renew." A reviewer following only the UI (not the source) cannot tell defect from design.
- **Severity:** Medium.

### Finding 4 — Control assertion evidence is static and mislabeled for non-NARROW dispositions
- **Classification:** Standing evidence/UI anomaly (not tagged as an independent classification on every row, to avoid over-counting one root cause 336 times; folded into the "reason"/"anomaly" columns of the ledger where relevant)
- **Observed behavior:** Every case, regardless of the selected disposition, displays the same two `controlAssertions` entries: `ASSERT-INVALID-BLOCK` (`ruleReference: INVALID_AUTHORITY_BLOCKS`) and `ASSERT-NARROW-250` (`ruleReference: ACTIVE_BOUNDARY_MAXIMUM`, `parameters.maximumAmountCents: 25000`). For a REFUSE, TRANSFER, SUSPEND, RENEW, or CONDITION case, "ASSERT-NARROW-250" is evaluated (correctly, mechanically, against whatever the real boundary max happens to be) but its *name* and *baked-in $250/NARROW framing* have nothing to do with the disposition actually under test.
- **Why it matters:** A reviewer using the control-assertion evidence as an audit trail (exactly the purpose "Detailed experiment evidence" claims to serve) would see an assertion titled for a scenario that was never run. This is a genuine evidence-traceability defect, independent of whether the underlying PASS/FAIL computation is arithmetically correct (it is).
- **Severity:** Low–Medium.

### Finding 5 — Undocumented idle auto-reset silently discards results and form state
- **Classification:** FAIL — UI/state propagation (standing anomaly, verified 3 separate ways rather than tagged per matrix row, since the main 336-case matrix always read results synchronously and immediately, before this reset could fire)
- **Observed behavior:** After a completed run (via plain "Run experiment", via "Replay Last Run", and via "Compare Architectures" — tested independently in all three cases), if the page is left idle, all displayed evidence ("Execution", "Replay", etc.) silently reverts to "Not run." within roughly 5–15 seconds (confirmed: survives at ~3–5 s elapsed, has already reverted by ~14–16 s elapsed). Several — not all — input controls simultaneously revert to the original default scenario's values (observed: "Requested refund amount" and "Expected execution result" reverted to their defaults; "Current customer risk" and "Governance disposition" did not visibly change in the specific trial run, likely because they coincidentally matched defaults at the time). The status line changes to "Default editable scenario loaded." — the exact message shown by the "Load default" button — strongly suggesting the reset internally re-invokes that same logic on a timer.
- **Why it matters:** The task (and the harness's own instructions) describe a workflow of configuring a scenario, running it, and then reading and recording several fields of evidence — a process that plausibly takes longer than 5–15 seconds for a human. As built, a careful manual reviewer risks having their result silently vanish mid-review, with no warning, dialog, or countdown.
- **Reproducibility:** Confirmed 3 separate times (after Compare Architectures, after Replay, after a plain Run Experiment), each via a live wait-then-read using the browser's own tools (not inferred).
- **Severity:** Medium–High (usability/reliability), does not affect execution correctness itself.

### Finding 6 — "Authority history" and "Event log" do not populate for the single-run-per-case workflow
- **Classification:** FAIL — EVIDENCE (standing anomaly)
- **Observed behavior:** Following the load-default → configure → run pattern used for every one of the 336 matrix cases (and the pattern implied by "record what the application reports" per case), the "Authority history" (Versioned evidence) and "Event log" (Deterministic evidence) sections both display "Not run." even though every other evidence section for the same run (Materiality, Governance decision, Enforceable boundary, Execution, Why-this-boundary-exists, etc.) is fully populated. These two sections were confirmed to populate correctly only after **two or more** Run Experiment clicks in the same uninterrupted session **without** an intervening "Load default"/"Reset" — i.e., they accumulate cross-run history and are not meaningful evidence for an isolated, independently-configured single case.
- **Why it matters:** For the case-by-case, independently-configured testing methodology this evaluation (and the harness's own instructions) call for, two of the harness's named evidence categories are permanently inert. A reviewer following the documented workflow to the letter will never see this evidence populate.
- **Severity:** Low–Medium.

### Finding 7 — Minor: stale reason text under technical-validity FAIL
- **Classification:** Low-severity cosmetic/evidence inconsistency.
- **Observed behavior:** When Technical validity = FAIL is selected, the "Technical validity" evidence block shows `"status": "FAIL"` but `"reason": "Technical behavior remains valid under changed conditions."` — a reason string that contradicts the status it is attached to.
- **Severity:** Low.

### Finding 8 — Reason-precedence masks simultaneous boundary violations
- **Classification:** Evidence completeness note, not a correctness defect.
- **Observed behavior:** For material RENEW/CONDITION cases with money profile ABOVE_LIMIT ($600 against the reproduced $500 boundary, where risk is *also* out of scope), the reported execution reason is always `"Requested amount exceeds the current authorized maximum."`, never mentioning the simultaneously-true risk-scope violation. BLOCK is still the objectively correct outcome either way, but the single-reason evidence field cannot fully reconstruct why, when more than one boundary dimension is violated at once.
- **Severity:** Low.

---

## CROSS-CASE INVARIANT RESULTS

All 15 instructed invariants were tested against the full 336-row dataset (programmatically, from the raw extracted evidence — not from the app's self-reported labels).

1. **Changing only EXPECTED EXECUTION never changes actual execution** — HOLDS. 0 violations across all matched (architecture, risk, disposition, tech, money, supervisor) groups.
2. **Changing only architecture never changes unrelated system variables** — PARTIALLY HOLDS / SEE FINDING 2. Execution and boundary never differ by architecture (0 divergences across 168 matched pairs), but the *decision actor* field is a variable that architecture *should* change and does not, within the Run Experiment path.
3. **Technical PASS alone never creates organizational authority** — HOLDS. Authority-creation and authority-status fields were identical between the tech=PASS and tech=FAIL twin of every matched configuration (0 mismatches across 168 pairs).
4. **Recommendation/confidence never independently grants permission** — HOLDS (recommendation/confidence fields were held constant throughout and never appeared as a factor in any execution reason across all 336 cases).
5. **REFUSE never creates executable authority** — HOLDS. 0 of 32 material REFUSE cases show `authorityCreated: true`.
6. **TRANSFER alone never creates executable authority** — HOLDS. 0 of 32 material TRANSFER cases show `authorityCreated: true`.
7. **SUSPEND never produces an executable active boundary** — HOLDS. 0 of 32 material SUSPEND cases show `boundaryCreated: true`; all show `status: SUSPENDED` and the explicit reason "Only ACTIVE authority can create an executable boundary."
8. **NARROW is evaluated from its resulting boundary, not its disposition label** — HOLDS. NARROW's boundary dynamically reflects the input maximum and the selected risk level (verified distinctly for $111/$250/$999 and for MEDIUM/HIGH), and execution is correctly evaluated against that resulting boundary (8 of 16 tech=PASS money-profile pairs correctly diverge ALLOW/BLOCK; the other 8, under tech=FAIL, correctly do not, since technical invalidity independently dominates).
9. **CONDITION predicates actually affect execution** — **FAILS.** See Finding 1. 0 of 32 matched YES/NO pairs diverge.
10. **ABOVE_LIMIT and BELOW_LIMIT cases diverge when the monetary boundary is the controlling difference** — HOLDS where money is in fact the controlling boundary dimension (NARROW, tech=PASS: diverges in all 8/8 applicable combinations). Does not diverge for RENEW/CONDITION material cases, but correctly so — for those dispositions the controlling difference is the un-updated risk scope, not money, so no divergence is the conceptually correct result, not an invariant violation.
11. **Invalid state transitions are rejected consistently** — HOLDS. All 112 non-material (LOW→LOW) cases, across every disposition and both architectures, were rejected identically and safely (governance skipped, prior authority preserved, explanatory reason given) — no crashes, no silent misconfiguration.
12. **Same inputs produce the same result when rerun** — HOLDS. See Determinism Results below.
13. **Evidence/explanation agrees with the actual state shown elsewhere in the application** — MOSTLY HOLDS, with the exceptions in Findings 4, 7, and 8 (assertion mislabeling, stale FAIL-reason text, and reason-precedence masking).
14. **Displayed current selections agree with the controls actually chosen** — HOLDS during an active session; FAILS after the idle auto-reset (Finding 5), which silently changes displayed selections without user action.
15. **The raw scenario/evidence agrees with the human-readable result** — HOLDS, and in fact the human-readable "What happened" narrative was the clearest and most damning confirmation of Finding 1 (it states in plain English that the boundary "permits customer risk levels: LOW" after a change to MEDIUM).

---

## DETERMINISM RESULTS

An 11-case stratified sample (one representative per disposition, plus 5 additional pseudo-random cases spanning both architectures and multiple risk levels) was rerun immediately after the main matrix pass, using the identical inputs, and compared field-by-field against the originally recorded output: **0 of 11 mismatches.**

The dedicated **Replay** feature was also tested directly (not merely re-invoking Run Experiment): after a Run Experiment call, clicking "Replay Last Run" produced `{"equivalent": true, "comparisons": {"controlRun": true, "authorityHistory": true, "decisionHistory": true, "executionAttempts": true, "actualResult": true, "predictionComparison": true, "controlAssertionResults": true, "eventLog": true}}` — i.e., Replay recomputes from the recorded causal inputs and confirms equivalence field-by-field, rather than simply re-displaying cached output (the "equivalent" flag and its sub-comparisons are themselves computed, not hard-coded, since a mismatched replay would presumably report `false` on the relevant sub-key — this was not separately forced, so it remains an assumption, not a directly observed counter-case, that a genuine mismatch would be correctly flagged).

**No nondeterminism was found.**

---

## ARCHITECTURE COMPARISON

Both architectures were exercised across the full main matrix (168 cases each) and via 6 dedicated `Compare Architectures` runs (one per disposition, all held-constant except architecture).

- Within the **main matrix**, architecture never affected boundary, authority scope, or execution result in any of the 168 matched pairs — nor did it affect the recorded decision actor (a defect; see Finding 2).
- Within the **dedicated comparison feature**, architecture correctly differentiates the decision actor (`ACTOR-OPERATIONS` vs. `ACTOR-GOVERNANCE`) but — across all 6 dispositions tested — never changes the resulting boundary or execution outcome. The tool's own `separationFinding` field states this outright every time: `"AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED"`.
- **Conclusion:** the harness does not demonstrate that "who is authorized to decide" changes the authority-to-execution chain in its current default scenario configuration. This may be the intended lesson of the comparison feature (the harness appears to say so itself), in which case it is a legitimate and well-evidenced conceptual finding rather than a bug — but it does mean the SEPARATED_REAUTHORIZATION architecture, as configured, tests a purely descriptive/cosmetic variable in this scenario, not an operationally enforced one. Neither architecture was found to be "superior"; SEPARATED simply relabels the actor without consequence given the current scenario's rules.

---

## AUTHORITY-TO-EXECUTION ASSESSMENT

The chain **governance decision → resulting authority → enforceable boundary → execution → consequence** is genuinely implemented as separate, inspectable stages for TRANSFER, SUSPEND, REFUSE, and NARROW: each stage's JSON evidence is distinct, internally consistent, and drives the next stage correctly. For RENEW and CONDITION, the chain is present in structure but the "resulting authority" stage does not incorporate the very condition (the changed risk) that made reauthorization necessary, which collapses the chain's practical significance for those two dispositions in every materially-triggered case (both dispositions can only ever reproduce the un-updated LOW-only, $500 boundary, which then deterministically blocks the always-elevated-risk requested action). Technical validity is a properly independent, separately-evaluated gate throughout — it never restores authority (Finding: 0/168 tech-paired mismatches) and never fails to independently block (confirmed: NARROW/MEDIUM/$200/tech=FAIL blocks even though the boundary would otherwise ALLOW).

---

## CONCEPTUAL CRITIQUE

- The "materiality gate" concept (LOW→LOW is non-material and correctly skips reauthorization) is implemented cleanly and is the strongest part of the harness — the state machine "fails safe" exactly as the task's own guidance anticipates, with a legible reason for every rejection.
- The CONDITION and RENEW findings above are not just implementation bugs; they expose a conceptual gap in the *default scenario's decision data*: reauthorization dispositions are not automatically required to touch the dimension that made the change material in the first place. A disposition can "authorize" something while leaving the actually-changed variable outside the new authority's scope, and the harness's evaluation engine has no check that would flag this as internally inconsistent (e.g., "you are RENEWing/CONDITION-ing authority for a MEDIUM-risk request, but the resulting scope still says LOW-only" is never itself surfaced as a warning to the person configuring the scenario).
- The architecture comparison is not circular, but it is inert in its current default configuration: the "separated" actor label is real (the comparison tool computes a different actor) but has been deliberately decoupled from any boundary-construction or execution-gating rule, so the experiment's headline question ("does changing who decides change what happens") is answered "no" by construction of the current default scenario, not because the concept was tested and failed — a subtle but important distinction. A reviewer could easily read the dramatic self-reported "NOT OPERATIONALLY DEMONSTRATED" finding as proof that authority separation is inherently theatrical, when it may simply be that this particular scenario never wires the decision-owner identity into any enforceable rule.
- Outcomes are **not** implicitly predetermined by disposition *names* in the cases that matter most (NARROW, TRANSFER, SUSPEND, REFUSE all genuinely depend on their resulting data, not their label) — but RENEW and CONDITION's practical outcomes in this default scenario are effectively predetermined by the *prior authority's frozen scope*, which is a related but distinct failure mode from name-based predetermination.

---

## EVIDENCE / TRACEABILITY ASSESSMENT

Most evidence is traceable and internally consistent: a reviewer can reconstruct why execution was ALLOWed or BLOCKed from the `Execution`, `Enforceable boundary`, and `Why execution was allowed or blocked` sections in the overwhelming majority of cases. The exceptions are documented above: stale/mislabeled control assertions (Finding 4), a stale reason string under technical FAIL (Finding 7), reason-precedence masking of simultaneous violations (Finding 8), and two evidence categories (Authority History, Event Log) that never populate under the single-run workflow (Finding 6). None of these evidence gaps changed any ALLOW/BLOCK outcome, but they do reduce the tool's audit value below what its own "Detailed experiment evidence" framing promises.

---

## UI / USABILITY OBSERVATIONS

- No broken/overlapping controls, clipped text, or layout failures were observed at standard desktop width; the "What happened" narrative section in particular is clean, well laid out, and (helpfully) restates key facts in plain English that corroborate the JSON evidence.
- The idle auto-reset (Finding 5) is the most significant usability defect found: it is silent, undisclosed, and directly works against the tool's stated purpose of careful manual inspection.
- Several controls remain visible and editable for dispositions where they have no effect (New authority maximum for RENEW; the general appearance is that all "advanced" fields are always shown rather than conditionally hidden per disposition) — this is a minor discoverability issue rather than a functional bug, since nothing was observed to *misfire* as a result, but it does make it harder for a user to know which inputs are live for their current selection.
- Status messaging ("Default editable scenario loaded.") reappearing after the idle reset, with no visual distinction from an intentional "Load default" click, could mislead a user into believing they, rather than a timer, caused the reset.

---

## WHAT THE HARNESS DEMONSTRATES

- **OBSERVED / DEMONSTRATED WITHIN THIS HARNESS:** a materiality gate that correctly distinguishes material from non-material changes and fails safe on the latter; technical validity enforced as a genuinely independent gate in both directions; TRANSFER, SUSPEND, and REFUSE each correctly producing no executable authority/boundary; NARROW correctly deriving its enforceable boundary from live inputs rather than its label; a user's stated expectation having zero causal effect on the actual computed result; deterministic, reproducible output on rerun and on Replay.
- **NOT DEMONSTRATED:** that a CONDITION-style human/supervisory gate can be relied upon to actually govern execution in this tool's current default scenario (Finding 1); that separating who decides (architecture) changes what is permitted, in this tool's current default scenario (architecture comparison); that RENEW can be used, from the visible UI, to renew authority at an operator-chosen new ceiling (Finding 3).

---

## STRONGEST COUNTEREXAMPLE FOUND

**CONDITION's enforceable supervisor-confirmation predicate never determines execution.** Across all 64 material CONDITION test cases (32 matched YES/NO pairs spanning both architectures, all 2 risk-elevation levels, both technical-validity states, and both money profiles), toggling supervisor confirmation produced **zero** change in ALLOW/BLOCK outcome. This is fully reproducible (see Appendix C) and is corroborated in three independent places: the raw `boundary` JSON (`allowedRiskLevels` never includes the new risk), the raw `execution` JSON (`reason` is always the risk-scope reason, never a condition-not-satisfied reason — and no such reason string exists anywhere in the 336-case dataset), and the application's own plain-English "What happened" narrative.

---

## MOST IMPORTANT UNRESOLVED QUESTION

Is RENEW's (and CONDITION's) reuse of the prior authority's exact, un-updated scope an intentional design choice meant to illustrate that "renewing" or "conditionally re-authorizing" is not the same as "adapting to the new risk" — or is it an oversight where the engine should have incorporated the changed risk dimension the way NARROW demonstrably does? The harness's own written RENEW semantics ("may reproduce the same boundary") permit the former reading, but the CONDITION predicate's consequent total inertness is difficult to read as anything but unintended, since a supervisor-confirmation gate that can never be reached serves no evaluable purpose in the tool as configured. Resolving this would very likely resolve Finding 1 and Finding 3 simultaneously.

---

## RECOMMENDATIONS

1. For CONDITION, incorporate the changed risk dimension into the resulting boundary's `allowedRiskLevels` (as NARROW already does), so the supervisor-confirmation predicate becomes the actual controlling factor for materially-changed requests, and add a dedicated test case where YES allows and NO blocks an otherwise-identical request.
2. Make the "Run Experiment" path compute `decisionActor`/`authority.owner` from the selected architecture the same way "Compare Architectures" already does, so the two paths agree.
3. Either wire the decision-owner identity into an enforceable rule somewhere in the default scenario (so architecture separation has at least one demonstrable consequence), or reframe the comparison feature's messaging so "not operationally demonstrated" reads as a designed conclusion about *this* scenario rather than an implicit claim about separation in general.
4. Regenerate `controlAssertions` per the disposition actually under test, or clearly label them as scenario-level (not disposition-specific) invariants.
5. Disclose or eliminate the idle auto-reset; at minimum, warn the user before it fires and preserve the last completed run's evidence until they explicitly reset or rerun.
6. Either make Authority History/Event Log populate meaningfully after a single run, or relabel them as "cross-run session history" so their emptiness after one run is not mistaken for a missing feature.
7. Fix the stale "reason" string that still claims technical validity "remains valid" when status is FAIL.
8. Consider surfacing *all* violated boundary dimensions in the execution reason (or as a list), not only the first/precedence-winning one, to avoid masking co-occurring violations.

---

## APPENDIX A — Complete Case Ledger

See the accompanying `CLAUDE-HARNESS-CASE-LEDGER.csv` (336 data rows, one per executed case, all columns specified in the task instructions). Classification totals recomputed directly from that file: PASS 128, EXPECTED REJECTION 112, FAIL — IMPLEMENTATION 64, REVIEW REQUIRED 32. Total 336, matching the count reported above and the number of cases in the JSON evidence file.

## APPENDIX B — Failed / Questionable Cases Only

- All 64 material CONDITION cases (case IDs ending in the CONDITION block for risk=MEDIUM/HIGH: C073–C088, C129–C144, C241–C256, C297–C312) — Finding 1, FAIL — IMPLEMENTATION.
- All 32 material RENEW cases (C057–C064, C113–C120, C225–C232, C281–C288) — Finding 3, REVIEW REQUIRED.
- Global/standing anomalies not tied to a single case ID but applicable across the dataset: Finding 2 (architecture/decisionActor path inconsistency, all 168 SEPARATED rows), Finding 4 (control-assertion mislabeling, all non-NARROW rows), Finding 5 (idle auto-reset, verified outside the main matrix), Finding 6 (Authority History/Event Log, verified outside the main matrix), Finding 7 (stale FAIL reason text), Finding 8 (reason-precedence masking, the RENEW/CONDITION material + ABOVE_LIMIT + tech=PASS subset).

## APPENDIX C — Reproduction Steps

**General pattern used for every case (per the ledger's `reproduction_notes` column):** open the harness, click "Load default", set each control listed for that case_id in the ledger, click "Apply controls to JSON", click "Run experiment", then read the "Execution", "Enforceable boundary", "Governance decision", and "Materiality" sections.

**Finding 1 (strongest counterexample), minimal reproduction:**
1. Load default.
2. Current customer risk → MEDIUM.
3. Requested refund amount → 200.00.
4. Governance disposition → CONDITION.
5. New authority maximum → 250.00.
6. Supervisor confirmation present? → YES. Technical validity → PASS.
7. Click "Apply controls to JSON", then "Run experiment". Record the "Execution" and "Enforceable boundary" JSON.
8. Change only Supervisor confirmation present? → NO. Click "Apply controls to JSON", then "Run experiment" again.
9. Compare: both runs show `execution.result: "BLOCK"` with an identical reason, and `boundary.allowedRiskLevels: ["LOW"]` in both cases.

**Finding 2, minimal reproduction:**
1. Load default. Current customer risk → MEDIUM. Requested refund amount → 200.00. Governance disposition → NARROW. New authority maximum → 250.00.
2. Select "Same-layer reauthorization". Apply controls, Run experiment. Note the scenario JSON's `decisionActor.actorId`.
3. Select "Separated reauthorization" instead (same other inputs). Apply controls, Run experiment. Note `decisionActor.actorId` is unchanged (`ACTOR-OPERATIONS`).
4. Now click "Compare architectures" instead (same scenario). Observe the `Observed comparison` JSON: `sameLayerDecisionActor: "ACTOR-OPERATIONS"`, `separatedDecisionActor: "ACTOR-GOVERNANCE"` — a different, correctly-differentiated result from step 3's single-run path.

**Finding 5, minimal reproduction:**
1. Load default, run any experiment (e.g. accept all defaults, click "Run experiment").
2. Confirm the "Execution" section is populated.
3. Wait roughly 15 seconds without touching the page.
4. Reload the "Execution" section (or simply look again) — it now reads "Not run.", and the "Requested refund amount" / "Expected execution result" fields have reverted to their original default values.

---

### Methodology notes and limitations

- All 336 cases were driven through the live, rendered DOM via the same `value`-assignment-plus-dispatched-event mechanism a browser automation tool uses to simulate user input, and the real "Run experiment" button was clicked for each one; no case's result was inferred from source code. Source files were opened only afterward, to sanity-check terminology, and did not change any classification in this report.
- Because the tool's own output size limits made pulling 336 fully-verbose JSON blobs back out of the browser impractical within this session, each case's evidence was captured as a structured, compact record (materiality result, authority-creation/status, full boundary scope, execution result and reason, expected/actual comparison, and control-assertion results) rather than the full pretty-printed text of every evidence panel; the JSON evidence file preserves these structured fields per case rather than the raw HTML/whitespace-formatted text. A stratified sample of cases was additionally captured and cross-checked against full, unabridged panel text (including the "Why authority changed"/"Why this boundary exists"/"Why execution was allowed or blocked" narrative sections and the human-readable "What happened" steps) to confirm the compact records accurately reflect what a human reviewer would see on screen; no discrepancy between the compact records and the full panel text was found in that sample.
- The idle-auto-reset (Finding 5) was discovered mid-session and is the reason the main 336-case matrix was executed with immediate, synchronous evidence capture (read within the same script execution as the triggering click, never after a delay) — this was verified not to affect the validity of the captured data, since the reset was independently confirmed to fire only after several seconds of *subsequent* inactivity, not immediately.
- The "Compare Architectures" feature was kept out of the main 336-case loop after an early anomaly was traced to its interaction with the idle-reset timer contaminating a rapid sequence of unrelated calls; it was instead used separately, with each invocation immediately read before any further action, for the 6 dedicated architecture-comparison probes reported above. This is disclosed as a methodology adjustment, not a hidden data-quality issue.
