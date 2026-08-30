# Operational AI Authority Test Harness

**Current release:** `v2.0.0`

**Public application:**
https://newsomek.github.io/Operational-AI-Authority-Test-Harness/

**GitHub release:**
https://github.com/Newsomek/Operational-AI-Authority-Test-Harness/releases/tag/v2.0.0

---

## What this is

The **Operational AI Authority Test Harness** is a browser-native governance research laboratory.

It tests whether a formal organizational governance decision can be translated into a current authority state, then into an enforceable technical boundary, and whether downstream execution actually consumes that boundary.

The core modeled chain is:

`governance decision -> resulting authority -> enforceable boundary -> execution evaluation -> consequence`

The harness is intentionally designed so that this chain can fail.

It is a research and test instrument, not a production authorization platform and not a proof machine.

---

## Governing question

The central question is:

**Does organizational authority actually control system consequences?**

The experiment distinguishes authority from other signals that are often incorrectly treated as permission.

In particular:

- capability != authority
- recommendation != authority
- technical validity != authority
- confidence != authority
- prior approval != current authority
- revalidation != reauthorization
- human presence != governance
- human approval != executable authority
- authority record != enforcement
- expected result != permission
- architecture label != permission

Execution is intended to depend on the **current enforceable authority boundary** plus independently enforceable technical controls.

---

## Version 2.0.0

Version 2 extends the original refund experiment into five materially different organizational domains while retaining one shared authority-to-execution model.

The five selectable scenarios are:

1. **Automated Refund**
2. **Privileged System Access**
3. **Workforce Shift Assignment**
4. **Procurement / Total Acquisition Cost**
5. **Customer Account Restriction**

Version 2 is not simply five demonstrations placed behind one interface.

The research question is whether materially different domains can share the same authority lifecycle and enforcement path without relying on scenario-specific permission shortcuts.

---

## The five scenarios

### Automated Refund

Tests customer-transaction authority using refund amount, customer risk, transaction age, technical validity, and the resulting authority scope.

A `BLOCK` result means:

**Automated refund not authorized.**

It does not necessarily mean that the customer should ultimately be denied a refund.

### Privileged System Access

Tests privileged-access authority after an organizational context change.

The scenario separates:

- technical/security validity;
- recommendation;
- organizational decision authority;
- executable access authority.

A `BLOCK` result means:

**Production administrator access not authorized.**

It does not establish that the person is untrustworthy or can never receive access.

### Workforce Shift Assignment

Tests workforce authority when a proposed assignment changes effective weekly hours and may cross a governed threshold.

A `BLOCK` result means:

**Additional shift assignment not authorized.**

It does not establish that overtime is inherently wrong.

### Procurement / Total Acquisition Cost

Tests not only a threshold change, but potentially a change in the **basis or metric over which authority is defined**.

The scenario distinguishes:

- `equipmentPrice`
- `totalAcquisitionCost`

This creates an important research question:

**Can a system faithfully enforce the wrong organizational boundary?**

The answer can be yes.

Correct enforcement does not guarantee correct organizational specification.

### Customer Account Restriction

Tests customer-impact authority while recommendation and confidence may remain high.

The scenario deliberately attacks the assumption:

`confidence == authority`

It does not.

A `BLOCK` result means:

**Account restriction not authorized.**

It does not prove that the customer is safe.

---

## Materiality and authority lifecycle

A material change can invalidate previously valid authority.

The harness keeps technical revalidation and organizational reauthorization separate.

A typical lifecycle is:

`initial authority -> control run -> condition change -> materiality evaluation -> authority invalidation -> reauthorization workflow -> governance disposition -> resulting authority -> enforceable boundary -> execution evaluation`

Authority history is preserved rather than overwritten.

Current authority status remains separate from governance disposition.

---

## Governance dispositions

Version 2 supports six governance dispositions:

- `RENEW`
- `NARROW`
- `CONDITION`
- `TRANSFER`
- `SUSPEND`
- `REFUSE`

Disposition labels do not directly determine execution.

### RENEW

Creates a new authority version.

Execution is evaluated against the resulting current authority, not against the disposition name.

### NARROW

Creates a more restrictive authority scope.

`NARROW` is not synonymous with `BLOCK`.

A narrowed authority can still produce `ALLOW` if the requested consequence remains inside the resulting boundary.

### CONDITION

Creates executable typed conditions.

Conditions are intended to be operational predicates, not descriptive text.

### TRANSFER

Transfers decision authority.

TRANSFER alone does **not** create executable authority.

### SUSPEND

Makes current authority unavailable for execution.

Historical authority remains reconstructable.

### REFUSE

Creates no new active executable authority for the requested consequence.

---

## Reauthorization architectures

Version 2 supports two neutral architecture choices:

- `SAME-LAYER REAUTHORIZATION`
- `SEPARATED REAUTHORIZATION`

Architecture choice does not itself create permission.

The harness does not assume separation is inherently superior.

If actor attribution changes but the executable result does not, that may be a legitimate experimental result rather than an implementation defect.

---

## Technical validity vs authority

Technical validity remains independent of organizational authority.

A scenario may correctly produce:

`TECHNICAL VALIDITY = PASS`

while:

`AUTHORITY = INVALID`

and:

`EXECUTION = BLOCK`

Technical PASS must not silently restore organizational authority.

Likewise, technical FAIL may independently block execution even where authority would otherwise permit it.

---

## Recommendation and confidence

Recommendation and confidence are inputs to inspect.

They are not permission.

Version 2 specifically tests this distinction in Customer Account Restriction, where a strong recommendation and high confidence can remain present even after authority changes materially.

---

## Expected vs actual

Expected execution is a user prediction.

It does not grant authority.

Changing only the expected result must not change:

- materiality;
- authority;
- actor;
- resulting boundary;
- technical validity;
- recommendation;
- confidence;
- actual execution.

It should affect only the expected-versus-actual comparison.

---

## Authority-to-execution enforcement

The execution layer must not infer permission directly from:

- disposition;
- recommendation;
- confidence;
- technical validity;
- recommendation source;
- human approval;
- previous execution;
- existence of a decision record;
- expected result;
- UI state.

A valid governance decision may create a new authority version.

An ACTIVE authority version may produce an enforceable boundary.

Execution then evaluates the requested consequence against that boundary and independently enforceable technical controls.

---

## Determinism, replay, and evidence

The harness records deterministic ordered evidence.

Replay is intended to be **recomputation**, not redisplay of stored outcomes.

Replay reconstructs the run from preserved scenario inputs and causal commands and recomputes:

- materiality;
- authority;
- boundary;
- execution;
- expected-vs-actual comparison;
- control assertions;
- event evidence.

Recorded derived outcomes do not force replay results.

Run-evidence export preserves the scenario snapshot, control run, authority history, decision history, event log, execution attempts, expected result, actual result, assertion results, replay inputs, and complete run record.

---

## Scenario import and export

Scenarios can be exported and imported as JSON.

Import changes scenario inputs.

It does not manufacture observed execution results.

Malformed JSON and unsupported schema versions are rejected.

---

## Scenario switching

Version 2 includes explicit protection against stale cross-scenario state.

The final focused browser validation exercised all ordered transitions among the five scenarios:

`5 source scenarios x 4 different destination scenarios = 20 transitions`

Observed stale-control failures:

`0`

---

## Independent adversarial review

Version 2 underwent independent public-browser black-box review before final release.

The reviewer was instructed to:

- use the public application first;
- try to falsify the authority-to-execution mechanism;
- preserve case-level evidence;
- distinguish application labels from independent judgment;
- inspect all five scenarios;
- look for circularity, stale state, hidden oracle assumptions, architecture favoritism, non-causal controls, and scenario-specific permission logic.

The preserved Phase 3 review contained **75 browser-observed cases**.

That review did **not** complete the full exhaustive categorical matrix originally requested.

The raw review artifacts are preserved at:

`evidence/v2/independent-review/claude/raw-deliverables`

The source adjudication is preserved at:

`evidence/v2/independent-review/claude/CLAUDE-V2-SOURCE-ADJUDICATION.md`

The successful remediation validation evidence is preserved at:

`evidence/v2/independent-review/claude/remediation-validation`

The original reviewer findings remain preserved even where later adjudication or focused reproduction disagreed with them.

---

## Independent-review remediation

The independent review identified useful UI/evidence issues.

Confirmed remediation included:

- executed "What changed" narrative now reflects the actual executed facts;
- Procurement evidence now distinguishes the observed materiality metric from the resulting executable authority boundary;
- regression coverage was added for scenario-control replacement;
- regression coverage was added for Procurement metric/boundary clarity.

The review remediation did **not** rewrite the core authority semantics merely to agree with the reviewer.

Protected authority/execution semantics remained unchanged during the final review-remediation checkpoint.

---

## Final validation status

The final remediation browser gate reported all required suite summaries as passing.

Important Version 2 validation totals include:

- Scenario Catalog: `14/14`
- Version 2 Matrix: `213/213`
- Negative / Attack: `16/16`
- Accessibility: `8/8`
- UI Interaction: `29/29`

Focused cross-scenario verification:

- ordered transitions: `20/20`
- stale-control failures: `0`

The final public GitHub Pages smoke also passed against the exact `v2.0.0` release commit.

It verified:

- Version 2 identity;
- all five scenarios;
- all 20 ordered scenario transitions;
- zero stale controls;
- dynamic executed-change narrative;
- Procurement metric/boundary clarity.

---

## What Version 2 demonstrates within the harness

Version 2 demonstrates within its modeled assumptions that:

1. a governance decision can produce a resulting authority state;
2. resulting authority can be translated into an enforceable boundary;
3. downstream execution can consume that boundary;
4. technical validity can remain independent of organizational authority;
5. recommendation can remain independent of authority;
6. confidence can remain independent of authority;
7. typed conditions can become causally operational;
8. NARROW can be evaluated from resulting scope rather than from its label;
9. TRANSFER can change decision authority without itself creating executable authority;
10. SUSPEND and REFUSE can leave no executable authority;
11. one shared authority model can operate across five materially different scenarios;
12. replay and evidence can preserve the authority-to-execution chain deterministically;
13. a system can faithfully enforce a questionable organizational specification.

---

## What Version 2 does not demonstrate

Version 2 does not demonstrate that:

- the authority model is universally correct;
- the five scenarios exhaust real organizational authority problems;
- separated reauthorization is inherently superior;
- human approval is inherently effective governance;
- this harness is a production governance architecture;
- the harness can determine the substantively correct organizational policy;
- correct enforcement guarantees a correct organizational outcome;
- passing browser tests prove the governance theory;
- the current implementation is production-ready.

---

## Strongest conclusion

The strongest Version 2 result is not that governance can be automated.

It is that governance becomes operational only when organizational decisions are translated into current enforceable authority that downstream execution actually consumes.

The equally important counterweight is:

> Get the boundary right, and governance can become an operational control.
>
> Get the boundary wrong, and you may have built a highly reliable machine for enforcing a mistake.

This is especially visible in Procurement.

A deterministic, auditable, technically correct system can still operationalize a badly specified organizational rule.

---

## Claims discipline

Use experimental-result language carefully.

Appropriate categories include:

- `OBSERVED`
- `DEMONSTRATED WITHIN THIS HARNESS`
- `SUPPORTED`
- `NOT DEMONSTRATED`
- `RESEARCH QUESTION`

The governance model is not treated as proven merely because the software passes its tests.

Encoding organizational authority into software does not make the authority correct.

It makes it executable.

---

## How to run

### Public application

Open:

https://newsomek.github.io/Operational-AI-Authority-Test-Harness/

No API key, AI model, database, Docker environment, Node runtime, cloud account, or external service is required to use the public experiment.

### Local use

1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Select a scenario.
4. Configure the experiment.
5. Run the experiment.
6. Inspect the baseline, materiality, authority state, governance workflow, resulting authority, enforceable boundary, execution result, control assertions, and evidence.
7. Replay the run where appropriate.

If browser file restrictions interfere with local loading, use a simple static server, for example:

```text
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Testing

The `/tests` directory is part of the research instrument.

Open:

`tests/test-runner.html`

A passing software test verifies declared implementation behavior.

It does not automatically prove the broader governance hypothesis.

The Version 2 test surface includes:

- state transitions;
- authority and boundary translation;
- execution;
- materiality;
- governance controls;
- control runs;
- run evidence;
- replay;
- architecture;
- import/export;
- scenario catalog;
- Version 2 matrix coverage;
- UI behavior;
- negative and attack cases;
- accessibility.

---

## Version 2 release and closure records

Current release:

`v2.0.0`

Release commit:

`bf28fe7cecdc7c406b96b574377abbc220e765d6`

Version 2 closure/handoff record:

`docs/releases/v2.0.0/VERSION_2_CLOSURE_HANDOFF.md`

The closure record documents:

- Version 2 research scope;
- architecture;
- independent review;
- adjudication;
- remediation;
- final validation;
- what Version 2 demonstrates;
- what it does not demonstrate;
- the open research question for any future Version 3.

The `v2.0.0` tag is the immutable Version 2 software release artifact.

Later documentation commits do not move or recreate that tag.

---

## Version history

### Version 2.0.0

Generalized the authority-to-execution model across five domains and added scenario cataloging, generalized authority boundaries, Version 2 matrix testing, public independent review, adjudication, remediation, and final public validation.

### Version 1

Version 1 established the original authority-to-execution experiment using the Customer Refund Authorization scenario.

Historical Version 1 releases remain preserved:

- `v1.0.0`
- `v1.0.1`
- `v1.0.2`
- `v1.0.3`

Version 1 should be treated as historical evidence, not as the current repository state.

---

## Public use and license

The Operational AI Authority Test Harness is publicly available under the repository `LICENSE`.

The project is source-available, not open source.

The license permits specified noncommercial use and redistribution of complete, unmodified copies while reserving commercial use and distribution of modified or derivative versions.

Read `LICENSE` before use or redistribution.

---

## Start here

- `docs/releases/v2.0.0/VERSION_2_CLOSURE_HANDOFF.md` — Version 2 closure and research handoff
- `docs/QUICKSTART.md` — first-run guidance
- `docs/USER-GUIDE.md` — detailed operation
- `docs/TESTING.md` — automated verification and manual experiments
- `docs/V2-INTERNAL-MATRIX.md` — Version 2 internal matrix
- `CHANGELOG.md` — implementation history
- `DECISION_LOG.md` — material conceptual and architectural decisions
- `evidence/v2/independent-review/claude/` — preserved independent-review evidence and adjudication

Some older documentation remains Version-1-specific and should be read as historical material unless explicitly updated for Version 2.

---

## External review

The harness is intended to be challenged, not merely demonstrated.

A successful attack on the experiment is useful evidence.

A failed attack can also be useful when the attempted challenge and observed result are preserved accurately.

Independent reviewers should distinguish among:

- implementation defects;
- conceptual/model defects;
- evidence/test-oracle defects;
- UI/state-propagation defects;
- expected rejections;
- legitimate experimental results;
- research questions.

The application’s own PASS, FAIL, ALLOW, BLOCK, MATCH, and MISMATCH labels are evidence to inspect.

They are not a substitute for independent judgment.

---

## AI-assisted development disclosure

AI tools were used extensively to translate conceptual and product requirements into software, tests, documentation, and validation tooling.

AI-generated code was not treated as correct merely because it executed.

Material behavior was subjected to deterministic tests, negative tests, replay, browser validation, independent review, adjudication, and claims-discipline review.

---

## Contributing

Contributions should preserve the distinctions among:

- recommendation;
- capability;
- technical validity;
- authority;
- governance workflow;
- disposition;
- authority status;
- enforceable boundary;
- execution;
- consequence;
- expected result;
- actual result;
- prediction accuracy;
- control correctness.

Material conceptual changes should be recorded in `DECISION_LOG.md`.

Implementation changes should be recorded in `CHANGELOG.md`.

Do not weaken tests merely to make implementation pass.

---

## Status

**Version 2.0.0 is released.**

The Version 2 implementation, independent review, adjudication, remediation, final validation, public deployment, publication, master advancement, and closure documentation are complete.

The next version should not exist merely to add more scenarios.

Any Version 3 work should begin with a new research question that Version 2 cannot answer.

---

## Authoritative project instructions

The authoritative project specification remains:

`prompts/GOVERNING_SESSION_INSTRUCTIONS.docx`

The startup handoff instructions remain:

`prompts/START_SESSION_PROMPT.docx`

If these documents conflict with this README, `GOVERNING_SESSION_INSTRUCTIONS.docx` governs.
