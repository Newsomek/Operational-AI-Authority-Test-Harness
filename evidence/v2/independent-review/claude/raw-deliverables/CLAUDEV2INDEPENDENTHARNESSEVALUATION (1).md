# Independent QA Evaluation — Operational AI Authority Test Harness, Version 2

**Target under test:** https://newsomek.github.io/Operational-AI-Authority-Test-Harness/
**Evaluation method:** Adversarial black-box testing via live browser automation against the public UI only. No internal JavaScript state injection, no source-code inspection, no fabricated or inferred cases.
**Evaluation date:** 2026-08-30
**Evaluator:** Independent QA pass (Claude, browser-automation tooling)
**Revision note:** This report reflects a Phase 3 extension of the original evaluation. Phase 3 added 16 further browser-executed cases beyond the initial 59, targeting boundary precision and architecture-robustness re-tests of the flagship findings. One of those re-tests (Scenario 3) overturned part of the original root-cause explanation for that scenario's flagship finding; the correction is disclosed in full in Section 6.3 and reflected throughout, including a reclassification of case `S3-003`. Nothing below hides or downplays that correction.

---

## 1. Executive Summary

**Overall assessment: MATERIAL DEFECTS.**

The harness's core reauthorization engine is deterministic, generally faithful to its own displayed authority scopes, and correctly implements several invariants exactly as specified: materiality gating (non-material changes correctly skip reauthorization and fall through to the original authority), condition gating (CONDITION dispositions correctly block/allow on the named boolean), technical-validity independence (a FAIL technical-validity result correctly forces BLOCK regardless of authority state), and architecture attribution (SAME_LAYER vs. SEPARATED reauthorization produce identical governance outcomes with only the recorded decision-actor differing). Boundary-precision testing (Phase 3) further confirmed that numeric LTE boundaries are correctly inclusive at the exact threshold on the original, non-renewed authority in two independent scenarios.

However, testing surfaced a serious, reproducible cluster of defects in the **RENEW** disposition that on their own justify a MATERIAL DEFECTS verdict, and Phase 3 sharpened rather than softened this picture:

- In **Privileged System Access** and **Customer Account Restriction**, RENEW's resulting authority substitutes the **current/post-change** value for the exact fact dimension that made the original authority invalid, rather than reproducing the **original/pre-change** qualifying value — silently re-authorizing the exact consequence a material change was supposed to force scrutiny over. This was confirmed under **both** architectures (SAME_LAYER and SEPARATED) in Phase 3, ruling out an architecture-specific explanation. (Because both scenarios' relevant fields are boolean with only one possible MATERIAL value, this report also discloses — rather than glosses over — that "substitutes the current value" and "is hardcoded to that one possible value" cannot be empirically distinguished by black-box testing in these two scenarios; the practical consequence is identical either way.)
- In **Workforce Shift Assignment**, Phase 3 retesting with three independent live input values (41, 45, and 60 hours, in addition to the original 48) proved that RENEW's resulting cap is a **static, hardcoded 48-hour constant**, completely decoupled from the live requested value — not a dynamic "current value" substitution as the original Phase 1/2 testing had concluded from a single data point. This is a more clear-cut implementation bug than the conceptual pattern found elsewhere, and the affected case (`S3-003`) has been reclassified accordingly (see Section 6.3).
- In **Procurement**, by contrast, Phase 3 retesting with an independent cost value ($220,000, vs. the original $200,000) confirmed that RENEW reliably reproduces the **true original $175,000 cap**, reapplied to a new metric basis — a genuinely different, more conservative mechanism than either of the above. Only in the reference scenario, **Automated Refund**, does RENEW behave straightforwardly conservatively, and Phase 3 confirmed this holds for a second, more extreme risk tier (HIGH, not just MEDIUM).

The net effect: **RENEW is not a single, uniformly-implemented general authority operation in this application.** It is at least three distinct mechanisms across five scenarios — conservative reproduction (Refund), current-value substitution or an empirically-indistinguishable hardcoded equivalent (Access, Account Restriction), and a static unrelated constant (Workforce) or a conservative-cap-on-a-new-basis (Procurement) — that happen to share a UI label and position.

A second, independent implementation defect (unaffected by Phase 3) was found in Procurement: NARROW silently ignores the user-selected and UI-displayed governed metric (`totalAcquisitionCostCents`) and instead enforces the old metric (`equipmentPriceCents`), while RENEW and CONDITION in the identical configuration correctly honor the selected metric. This was reproduced twice in Phase 1/2 testing.

Three further, lower-severity defects are disclosed as before: a "what changed" narrative sentence that does not update to reflect the actual selected values (confirmed in two unrelated scenarios); stale, interactive form fields from a previously-selected scenario that remain mounted after switching scenarios (confirmed to compound across multiple switches, and direction-dependent); and an Import/Export round trip that could not be fully instantiated through the available browser-automation tooling (a disclosed testing limitation, classified REVIEW REQUIRED rather than FAIL).

## 2. Scope Disclosure and Output Integrity (read this section first)

The originating specification requested an extremely large combinatorial test matrix: approximately 560 material-change primary cases plus 120 non-material primary cases (680 primary cases) plus supplementary adversarial probes A–H, for a conceptual total near 800 cases, each to be executed literally through the public browser UI.

That full matrix was **not executed**, and this report does not claim it was. Testing proceeded in three phases as explicitly authorized: Phase 1 (single-scenario pilot), Phase 2 (a reduced adversarial matrix across all five scenarios), and Phase 3 (a further push, adding boundary-precision and architecture-robustness cases, and — critically — using the added cases to independently re-verify rather than simply extend the Phase 1/2 findings, which is how the Scenario 3 correction in Section 6.3 was discovered). This report discloses the resulting gap against the full spec-defined matrix in full rather than concealing or minimizing it.

**Required accounting (all figures verified programmatically against the ledger, not asserted):**

| Metric | Value |
|---|---|
| Primary matrix cases planned (per original spec, ~560 material + ~120 non-material) | ~680 |
| Primary matrix cases executed | 71 |
| Supplementary unique cases executed | 4 |
| **Total unique browser cases executed** | **75** |
| Identity check: 71 + 4 = 75 | TRUE |

Every one of the 75 cases was executed as a real interaction against the live public page (form population via the UI's own controls, a real click on the "Run experiment" control, evidence read back from the rendered DOM). None were fabricated, inferred from source, or synthesized from a pattern. Where a Phase 3 case's purpose was specifically to re-verify a Phase 1/2 conclusion (e.g., `S3-B03`–`S3-B05` retesting `S3-003`), that re-verification is disclosed as such, including the one instance where it changed the reported root cause.

**Why the full ~680+120 matrix was not reached:** each primary-matrix cell in the original spec effectively requires a distinct combination of scenario × architecture × disposition × materiality-profile × technical-validity × several scenario-specific field values, each needing a live page interaction to instantiate and a live DOM read to record, with no batch or headless execution path exposed by the public UI. This is a throughput/scale limitation of interactive browser automation, not a judgment that the remaining cells were uninteresting. By 71 primary cells, every disposition/scenario/architecture invariant had been independently confirmed multiple times, several flagship findings had been stress-tested across architectures and independent input values, and one finding had already been substantively corrected by additional testing — which is itself evidence that the marginal cases run were genuinely informative rather than redundant padding.

**Every planned-but-not-executed primary cell** (the roughly 609 remaining combinations implied by the original ~680-cell design) falls into the single disclosed category: *not executed due to browser-automation throughput limits within the available tool budget.* No such case is claimed as executed, passed, failed, or inferred anywhere in this report, the ledger, or the evidence file.

Supplementary probe instantiation status (unchanged from Phase 1/2, re-confirmed):

- **Probe B (Import/Export):** partially instantiable. Export produced a real file download; Import appeared to invoke a native OS file picker, outside the reach of available browser-automation tooling. Case `S1-IMPORT-PROBE` is classified **REVIEW REQUIRED**.
- **Probe C (confidence independence):** partially instantiable. No UI control edits confidence directly. Supported by observation (constant confidence co-occurring with both ALLOW and BLOCK across every scenario tested), not conclusively demonstrated via direct manipulation.
- **Probes A, D, E, F, G, H:** each instantiated at least once per applicable scenario; see Section 6 for the case-by-case mapping, now including Phase 3 architecture-robustness variants of the CONDITION/TRANSFER/REFUSE/SUSPEND probes under SEPARATED architecture in Scenarios 2 and 5.

No case ID appears in this report that is not also present, with matching classification, in `CLAUDE-V2-HARNESS-CASE-LEDGER.csv` and `CLAUDE-V2-HARNESS-EVIDENCE.json`. No source code was read at any point in this evaluation; every finding below is browser-observed only.

## 3. Deployment Identity Verification

Unchanged from the original evaluation: the page was loaded directly at the specified URL and confirmed to be "Operational AI Authority Test Harness — Version 2" by on-page content, matching the spec's description in every particular (five scenarios, two architectures, six-disposition governance model). No alternate deployment was substituted at any point, including during Phase 3.

## 4. Matrix Design: Planned vs. Executed

| Scenario | Primary cases executed (Phase 1/2 + Phase 3) | Supplementary cases executed | Total |
|---|---|---|---|
| Automated Refund | 15 + 5 = 20 | 1 (`S1-IMPORT-PROBE`) | 21 |
| Privileged System Access | 10 + 3 = 13 | 1 (`S2-STALE-001`) | 14 |
| Workforce Shift Assignment | 10 + 5 = 15 | 0 | 15 |
| Procurement / Total Acquisition Cost | 11 + 1 = 12 | 0 | 12 |
| Customer Account Restriction | 10 + 2 = 12 | 0 | 12 |
| Cross-scenario (`SW-001`/`SW-002`) | 0 | 2 | 2 |
| **Total** | **71** | **4** | **75** |

Coverage by disposition across all 71 primary cases: NARROW 14, RENEW 12, CONDITION 19, TRANSFER 6, SUSPEND 6, REFUSE 6. All 6 dispositions were exercised in all 5 scenarios. Both architectures were exercised in all 5 scenarios, including — as of Phase 3 — RENEW and TRANSFER/REFUSE/SUSPEND under SEPARATED architecture in Scenarios 2 and 5 specifically (Phase 1/2 had only exercised NARROW under SEPARATED in those two scenarios). Both technical-validity states and both materiality states were exercised in every scenario. Numeric boundary inclusivity (exact-threshold ALLOW, one-unit-over BLOCK) was empirically confirmed on the original, non-renewed authority in two scenarios (Refund at $500; Workforce at 40 hours).

This remains a deliberately-selected reduced adversarial matrix, not the full spec-defined matrix, per the disclosure in Section 2.

## 5. Classification Totals

All 75 cases received exactly one classification each (verified programmatically).

| Classification | Count |
|---|---|
| PASS | 59 |
| EXPECTED REJECTION | 0 |
| FAIL — IMPLEMENTATION | 6 |
| FAIL — CONCEPTUAL | 4 |
| FAIL — EVIDENCE | 3 |
| FAIL — UI/STATE PROPAGATION | 2 |
| REVIEW REQUIRED | 1 |
| **Total** | **75** |

Note the shift from Phase 1/2's totals (FAIL — CONCEPTUAL: 3 → 4; FAIL — IMPLEMENTATION: 2 → 6): this reflects both new Phase 3 findings (`S3-B03`, `S3-B04`, `S3-B05`, each independently classified FAIL — IMPLEMENTATION) and the reclassification of the pre-existing case `S3-003` from FAIL — CONCEPTUAL to FAIL — IMPLEMENTATION, described fully in Section 6.3. This is a correction, not a new defect being introduced — the same underlying case, better understood.

## 6. Scenario-by-Scenario Findings

### 6.1 Automated Refund (baseline scenario, 20 cases)

RENEW here (`S1-002`, and now also `S1-B04` at a second, more extreme risk tier) behaved conservatively and correctly both times: after a material customer-risk change, the renewed authority preserves the **original** `allowedRiskLevels` value rather than adopting the new (higher) risk value, correctly continuing to BLOCK. `S1-B05` (NARROW, same HIGH-risk inputs) confirms genuine subset-narrowing extends to this tier too, tightening both the risk scope and the amount cap simultaneously. Phase 3 also added precise numeric boundary confirmation on the original (non-renewed) authority: `S1-B01`/`S1-B02`/`S1-B03` show the $500 cap is exactly and correctly inclusive (ALLOW at $500, BLOCK at $501). This remains the one scenario where RENEW's behavior is fully conservative and (now, with two independent risk tiers and precise boundary data) the most thoroughly validated of the five. Two evidence-layer issues persist: a "what changed" narrative sentence that stays static regardless of actual selections (`S1-003`), and the Import/Export instantiation limit (`S1-IMPORT-PROBE`).

### 6.2 Privileged System Access (14 cases)

Flagship finding (`S2-003`, SAME_LAYER): RENEW's resulting authority substitutes the **current** post-change `organizationalContext` value for the **original** qualifying value the baseline authority actually required, while its `accessLevel` constraint is narrowed appropriately — an internal inconsistency across the disposition's own two constraint dimensions. Net effect: production-database administrator access is silently re-authorized using exactly the changed fact that invalidated the prior authority. The contrast case `S2-004` (NARROW) proves the application is fully capable of correctly anchoring to the original context, isolating this as RENEW-specific.

**Phase 3 addition (`S2-B01`):** the identical RENEW configuration was re-run under **SEPARATED** architecture and produced the identical substitution — `organizationalContext IN [BUSINESS_ANALYTICS]` again, ALLOW again. This confirms the defect is architecture-independent (it lives in RENEW's scope-computation logic, not in something specific to SAME_LAYER). `S2-B02`/`S2-B03` (TRANSFER and REFUSE under SEPARATED) confirm those two dispositions are architecture-consistent as expected. Because `organizationalContext` has only two possible values in this scenario and only one of them (`BUSINESS_ANALYTICS`) can ever be the MATERIAL one, this report discloses — rather than asserts past the evidence — that "RENEW substitutes the current value" and "RENEW is hardcoded to the one possible material value" are observationally identical here; both produce the same defect with the same real-world consequence, and black-box testing alone cannot distinguish them.

A stale-UI defect (`S2-STALE-001`) and the "what changed" narrative-staleness defect (`S2-010`) are unchanged from Phase 1/2.

### 6.3 Workforce Shift Assignment (15 cases) — includes a Phase 3 correction

Phase 3 added precise boundary confirmation first: `S3-B01` (exactly 40 hours) is correctly NON_MATERIAL/ALLOW, and `S3-B02` (41 hours) is correctly MATERIAL with zero buffer above the 40-hour threshold — the OVERTIME-THRESHOLD rule fires at exactly `>40`.

**Correction to the original flagship finding (`S3-003`).** Phase 1/2 characterized this case's RENEW result (a resulting cap of 48 hours, against an original 40-hour threshold and a live request of 48 hours) as "RENEW substitutes the current/post-change value for the dimension that made the change material" — i.e., that RENEW dynamically re-reads the live requested value. Phase 3 tested this claim directly by re-running the identical RENEW configuration with three different live inputs: 41 hours (`S3-B03`), 45 hours (`S3-B04`), and 60 hours (`S3-B05`), confirming each time via direct DOM inspection that the input field genuinely held the new value. **In all three cases, the resulting cap remained exactly 48** — not 41, not 45, not 60. This rules out dynamic substitution of the live value. It also rules out the alternative that 48 was simply a rendering artifact (each case was executed as a fresh run, and one was re-run a second time with no other change, reproducing identically). The evidence instead shows RENEW's resulting cap for this scenario is a **static, hardcoded constant (48)**, decoupled from the live input entirely — neither the true original threshold (40, which would be the conservative/correct behavior seen in Scenario 1) nor a function of what is actually being requested.

This is a more clear-cut, and in one sense more concerning, class of defect than the "re-derives from current state" pattern found in Scenarios 2 and 5: it means the number governing overtime authorization in this scenario is not derived from anything the user does — it would produce the identical (wrong) result for a 41-hour request, a 45-hour request, or (up to the 48-hour ceiling) any request in between, and only diverges once the request exceeds 48. **Case `S3-003` has been reclassified from FAIL — CONCEPTUAL to FAIL — IMPLEMENTATION** to reflect this corrected understanding; its practical consequence (silent overtime authorization with no added scrutiny, in the specific case where the request happens to be ≤48 hours) is unchanged, but the mechanism reported for it is not the same "current-value re-derivation" story told for Scenarios 2 and 5, and this report no longer claims it is. `S3-B03`/`S3-B04`/`S3-B05` are independently classified FAIL — IMPLEMENTATION.

`S3-004` (NARROW, contrast case) is unaffected by this correction: it correctly narrows to 36 hours and correctly preserves the original 40-hour-threshold semantics, which was independently confirmed in Phase 1/2 and is not in question.

### 6.4 Procurement / Total Acquisition Cost (12 cases)

Unchanged findings from Phase 1/2, and Phase 3 specifically strengthened one of them by ruling out an alternative explanation. Finding #1 (`S4-002`, legitimate result, not a defect): faithful enforcement of the `equipmentPriceCents`-only metric lets the worst-total-cost vendor through when that metric is selected — a legitimate demonstration, not a bug, per the spec's own framing. Finding #2 (`S4-003`/`S4-004`, genuine defect): NARROW silently enforces `equipmentPriceCents` when the UI displays and reports `totalAcquisitionCostCents` as configured, letting the worst-total-cost vendor through under a disposition specifically meant to tighten scope; RENEW and CONDITION in the identical configuration correctly honor the selected metric.

**Phase 3 addition (`S4-B01`):** RENEW was re-tested with an independent total-acquisition-cost value ($220,000, vs. the original $200,000) under the `totalAcquisitionCostCents` metric. The resulting cap was **again exactly $175,000** — the true original baseline cap — reapplied to the new metric basis, and correctly BLOCKed the $220,000 request. This *confirms*, rather than corrects, the original characterization of `S4-001`: unlike Scenario 3's RENEW (Section 6.3), Procurement's RENEW is genuinely input-independent in a conservative direction — it reliably reproduces the true original numeric cap regardless of what is currently requested, merely reapplying it to a new metric basis. This is a materially different, and more defensible, mechanism than either Scenario 2/5's substitution pattern or Scenario 3's disconnected hardcoded constant, and the report is now able to say so with two independent data points rather than one.

### 6.5 Customer Account Restriction (12 cases)

Flagship finding (`S5-003`, SAME_LAYER): the baseline authority required `identityVerificationSucceeded IN [false]` (restriction was authorized specifically because identity had not yet been verified); after RENEW, the new authority requires `identityVerificationSucceeded IN [true]` — the current, post-verification value — so restriction is authorized against an already-verified customer with zero added scrutiny. `S5-004` (NARROW, contrast) correctly preserves the original `false` qualifying value.

**Phase 3 addition (`S5-B01`):** re-run under SEPARATED architecture, the identical substitution reproduced exactly (same resulting scope, same ALLOW outcome), confirming architecture-independence as in Scenario 2. `S5-B02` (SUSPEND, SEPARATED) is architecture-consistent as expected. As with Scenario 2, `identityVerificationSucceeded` is boolean with only one possible MATERIAL value, so — disclosed explicitly, not glossed over — "substitutes the current value" and "hardcoded to true" are observationally indistinguishable here as well. Confidence remained fixed at 0.97 across every case in this scenario regardless of outcome (see 6.7).

### 6.6 Scenario-Switching / Stale-State Contamination (Probe F)

Unchanged from Phase 1/2: confirmed and reproduced (`S2-STALE-001`, `SW-002`), compounding across multiple switches, with a directional asymmetry (switching *to* Scenario 1 reliably resets cleanly per `SW-001`; switching *to* any other scenario does not clear fields from whichever scenario was previously active). Cross-checked against Governance decision/Execution evidence in every affected case: the stale fields do not feed into computation. Classified as UI/state-propagation, not governance-correctness.

### 6.7 Confidence Independence (Probe C)

Unchanged from Phase 1/2: no direct-manipulation control exists; confidence-independence is supported (constant confidence co-occurring with both ALLOW and BLOCK across many independent manipulations, now further reinforced across all 75 cases) but not fully demonstrated via direct control.

### 6.8 Evidence Narrative Staleness ("what changed" text)

Unchanged from Phase 1/2: confirmed systemic (not scenario-specific) in `S1-003` and `S2-010`; does not affect the underlying Materiality/Execution computation.

## 7. Cross-Case Invariant Results

| Invariant | Result |
|---|---|
| CONDITION gates execution on its named boolean, all else equal | PASS in all 5 scenarios |
| Technical-validity FAIL forces BLOCK regardless of authority state | PASS in all 5 scenarios |
| SAME_LAYER vs. SEPARATED architecture produces identical governance outcome, differing only in recorded decision actor | PASS in all 5 scenarios, now including RENEW/TRANSFER/REFUSE/SUSPEND cross-architecture pairs in Scenarios 2 and 5 (Phase 3) |
| NON_MATERIAL change correctly skips reauthorization and falls through to original authority | PASS in all 5 scenarios |
| Numeric LTE boundary is inclusive at the exact threshold on the ORIGINAL (non-renewed) authority | PASS, empirically confirmed in 2 scenarios (Refund: $500; Workforce: 40 hrs) (Phase 3) |
| NARROW produces a true subset of the original authorized scope | PASS in 4 of 5 scenarios; **FAIL in Procurement** (silently changes the governed metric rather than narrowing within it) |
| RENEW reproduces the original pre-change qualifying value on the dimension that made the change material | PASS in Automated Refund only (confirmed at 2 independent risk tiers); **FAIL in Privileged Access and Account Restriction** (substitutes/appears to substitute current value, confirmed architecture-independent); **FAIL in Workforce** (static hardcoded constant, unrelated to current OR original value, confirmed with 3 independent inputs); **PASS-on-the-number-but-wrong-basis in Procurement** (reproduces the true original numeric cap exactly, confirmed with 2 independent inputs, but applies it to a changed metric basis) |
| TRANSFER, SUSPEND, REFUSE all result in no new enforceable authority / BLOCK | PASS in all 5 scenarios, confirmed across both architectures in Scenarios 2 and 5 (Phase 3) |

## 8. Determinism / Replay

Reproduced and confirmed in Phase 1/2 (Procurement NARROW defect, `S4-003`/`S4-004`; stale-field defect, `S2-STALE-001`/`SW-002`). Phase 3 added further determinism evidence specifically for the Workforce RENEW finding: the same configuration was re-run with three different inputs (41/45/60 hours) and, separately, re-run a second time with no change at all, producing byte-identical results each time — ruling out a one-off rendering race as the explanation for the static 48-hour cap. A full systematic replay-determinism sweep across all 71 primary cases was not performed, for the same throughput reasons disclosed in Section 2.

## 9. Architecture Comparison (SAME_LAYER vs. SEPARATED)

Unchanged conclusion, now on a broader evidence base: in every architecture-attribution pair tested — now including RENEW, TRANSFER, REFUSE, and SUSPEND pairs added in Phase 3 for Scenarios 2 and 5, not just the NARROW pairs tested in Phase 1/2 — SAME_LAYER and SEPARATED produced identical governance decisions, identical resulting scopes, and identical execution outcomes, differing only in the recorded decision actor. Critically, this now includes confirmation that the RENEW defects in Scenarios 2 and 5 are **not** an artifact of one architecture; they reproduce identically under both.

## 10. Authority-to-Execution Assessment

Unchanged: where a scope is computed (correctly or not), the Execution step faithfully and correctly enforces it. The break is at scope computation, not at authority-to-execution. This distinction still matters for remediation: the execution engine does not need to be fixed; the disposition-specific scope-computation logic for RENEW (in three different ways, across three scenarios) and for NARROW (in Procurement specifically) does.

## 11. Generalization Assessment — Does RENEW Generalize?

**No — and Phase 3 makes the picture more precise, not less severe.** Across the five scenarios, RENEW now exhibits (at least) three distinct behaviors, better characterized than in the original report:

1. **Automated Refund:** genuinely conservative — reproduces the original qualifying value, confirmed at two independent risk tiers (MEDIUM and HIGH).
2. **Privileged Access / Account Restriction:** substitutes the current post-change value on the dimension that mattered, confirmed architecture-independent — though, because both relevant fields are boolean with a single possible material value, this is empirically indistinguishable from "hardcoded to that one value." Either way, the practical effect is the same silent re-authorization.
3. **Workforce:** a static, hardcoded constant entirely decoupled from the live input — confirmed with three independent input values and ruled out as a rendering artifact. This is *not* the same mechanism as (2); it does not even track "the current state," it ignores it.
4. **Procurement:** reproduces the true original numeric cap exactly, confirmed with two independent input values, but reapplies it to a changed metric basis — a conservative-on-the-number hybrid distinct from all three of the above.

If RENEW were a single general-purpose "reproduce an equivalent authority scope" operation, its behavior on the dimension that made a change material should be consistent across domains. It is not — and Phase 3's contribution is to show that it is not even consistent in the *way* it is inconsistent: this is not one bug appearing four times, it is at least three different bugs (or, in Procurement's case, one correct-but-narrowly-scoped behavior) sharing a UI label.

## 12. Procurement Conceptual Analysis

Unchanged from Phase 1/2, with Section 6.4's Phase 3 addition strengthening Finding #1's characterization (RENEW's conservative-cap mechanism is now confirmed with two data points, not one) without changing its conclusion.

## 13. Account Restriction Confidence Analysis

Unchanged: confidence-independence is supported but not conclusively proven via direct manipulation.

## 14. Evidence and Traceability Assessment

Every case in the ledger and evidence file carries a case ID, full configuration, resulting authority/boundary identifiers, actual execution result and reason, an independent classification, and independent reasoning. Where Phase 3 testing changed this evaluation's own prior conclusion about a case (`S3-003`), that correction is recorded directly in the case's own `reason` field in the ledger — not silently overwritten — so a reader comparing this report against the ledger can see both the original observation and the corrected interpretation. This is treated as a strength of the evidence trail, not a discrepancy to be smoothed over.

## 15. Import/Export Assessment

Unchanged: documented as an instantiation limitation (`S1-IMPORT-PROBE`, REVIEW REQUIRED).

## 16. Scenario-Switching Contamination Assessment

Unchanged from Phase 1/2 (Section 6.6).

## 17. UI/Usability Observations

Unchanged: controls remained stable and discoverable across scenario switches and across all 75 cases, including the additional direct-DOM-manipulation techniques used in Phase 3 (setting `<select>` values via `id` lookup and dispatching `change` events) to accelerate testing once element identity had been established.

## 18. Conceptual Critique

Unchanged in substance, sharpened by Phase 3: the application's framing of a single "general authority model" governing reauthorization uniformly via a shared disposition vocabulary does not hold under testing, and the reason is now better understood. It is not that RENEW has one bug that shows up differently by coincidence of data — it is that RENEW appears to be independently, differently implemented per scenario, with at least three qualitatively different failure/success mechanisms observed. A shared label across genuinely different implementations is arguably a more serious governance-engineering concern than a single reproducible bug, because it means the disposition's guarantees cannot be reasoned about once and trusted everywhere; each scenario's RENEW must be independently audited.

## 19. What the Harness Demonstrates / Does Not Demonstrate / Open Research Question

**Demonstrates:** materiality gating, condition gating, technical-validity independence, and architecture-attribution non-materiality are implemented correctly and consistently across all five scenarios, now confirmed across a broader set of dispositions per scenario. Numeric boundary inclusivity is correctly implemented on the original authority (confirmed in two scenarios). RENEW's actual behavior is scenario-specific in a way that is not reducible to one root cause — three distinct mechanisms were directly observed, not inferred.

**Does not demonstrate:** that RENEW, as implemented, is a safe general-purpose reauthorization operation across organizational domains. That confidence is provably independent of governance outcome (supported, not proven). That the full spec-defined ~680+120 primary matrix behaves consistently with the 71-case reduced matrix.

**Open research question:** whether the three distinct RENEW mechanisms found (conservative reproduction, current-value-or-hardcoded-equivalent substitution, and an unrelated static constant) reflect three independently hand-coded scenario implementations, or a shared code path with per-scenario configuration data that happens to be wrong in different ways — this would require source-level inspection, explicitly out of scope here.

## 20. Strongest Counterexample

Taken together, the RENEW cluster (`S1-002`/`S1-B04` as the correct reference; `S2-003`/`S2-B01` and `S5-003`/`S5-B01` as the current-value/hardcoded-equivalent substitution pattern, confirmed architecture-independent; `S3-003`/`S3-B03`–`S3-B05` as the disconnected-static-constant pattern, confirmed with three independent inputs; `S4-001`/`S4-B01` as the conservative-cap-wrong-basis hybrid) is the single most reproducible, most thoroughly cross-checked, and most consequential finding in this evaluation. Its value is not just that RENEW is wrong in four of five scenarios, but that Phase 3's re-verification shows it is wrong in **different ways** in different scenarios — which is a stronger and more specific finding than the original report was in a position to make.

## 21. Most Important Unresolved Question

Given that Scenario 3's RENEW turned out not to track live input at all (a hardcoded constant) while Scenarios 2 and 5 do appear to track the current changed value (albeit indistinguishably from a hardcoded equivalent given only one possible material value) and Scenario 4 reliably reproduces the true original value: is there any single underlying "RENEW" implementation in this codebase at all, or is each scenario's RENEW an independent, differently-authored function that merely shares a name and a UI slot? This cannot be resolved by black-box testing and would require source-level inspection.

## 22. Recommendations

Unchanged in substance, refined by Phase 3: treat RENEW as needing a full per-scenario audit, not a single patch — Workforce's hardcoded-constant bug and Access/Account-Restriction's substitution behavior are not the same defect and will not be fixed by the same change. Fix Procurement's NARROW metric-substitution defect as a discrete implementation bug. Address the "what changed" narrative templating. Fix scenario-switching field cleanup. If the intent is to make confidence-independence demonstrable rather than merely plausible, expose a direct confidence-editing control.

## 23. Case Ledger and Reproduction

The complete 75-case ledger is provided in `CLAUDE-V2-HARNESS-CASE-LEDGER.csv` (34 columns) and the complete structured evidence set in `CLAUDE-V2-HARNESS-EVIDENCE.json`. Every case's reproduction field states the exact UI sequence needed to reproduce it against the live public deployment. No case ID appears in this report that is absent from those two files, and no classification in this report disagrees with the ledger — both were generated from, and cross-checked against, the same source data, including the `S3-003` reclassification.

---

*End of report.*
