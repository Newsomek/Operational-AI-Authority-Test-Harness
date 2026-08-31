# Recorded Lineage vs. Governing Lineage

**Document type:** Independent adversarial attack and expanded research-context record  
**Revision:** EXPANDED RESEARCH CONTEXT — 2026-08-30  
**Reviewer:** Wojciech, with additional research framing from Kelly  
**Target:** Operational AI Authority Test Harness — Version 2 frozen release  
**Status:** PRESERVED FOR INSPECTION AND EXPERIMENTAL ADJUDICATION  
**Implementation change authorized:** NO  
**Relationship to other attacks:** Related to, but distinct from, the temporal/currentness attack. Do not merge them.

---

## 1. Core Question

V2 appears to preserve authority lineage well as **evidence**.

The enforceable boundary carries information including:

- source authority ID;
- originating decision ID;
- scenario version;
- policy version.

The run record also retains:

- authority history;
- relevant event sequence.

However, lineage does not appear to be independently consumed by the execution engine as an execution predicate.

At execution, the engine appears to evaluate operative properties such as:

- boundary enforceability/status;
- action type;
- scope;
- conditions;
- technical capability;
- technical validity.

It does not appear independently to establish whether:

- the source authority remains the legitimate source for this consequence;
- the originating decision was made through a legitimate authority path;
- the scenario version remains the applicable authority context;
- the policy version remains the legitimate governing policy.

This produces a specific adversarial question:

> If two enforceable boundaries are operationally identical but differ only in the legitimacy of the authority lineage that produced them, can V2 discriminate between them at execution?

---

## 2. Recorded Lineage vs. Governing Lineage

A useful conceptual distinction is:

**RECORDED LINEAGE**

versus

**GOVERNING LINEAGE**

Preserving provenance demonstrates that the system can show where authority came from.

It does not necessarily demonstrate that the legitimacy of that provenance is itself an operative condition of execution.

Plain-language formulation:

> The system checks what the authorization says. It may not independently check whether the authorization itself deserves to be trusted.

This formulation supplements the technical finding; it does not replace it.

---

## 3. Adversarial Test

Construct two boundaries with identical operative content:

- same `ENFORCEABLE` status;
- same action;
- same scope;
- same conditions;

but different authority lineage.

### Boundary A

Legitimate authority lineage.

### Boundary B

Illegitimate authority lineage.

If lineage legitimacy is the **only** material difference, can the execution layer discriminate between them?

The test should determine whether lineage is merely retained for audit or whether lineage legitimacy is causally relevant to executability.

---

## 4. Current V2 Observation

The normal governed V2 pipeline may prevent illegitimate lineage upstream.

Therefore this finding must **not** automatically be classified as evidence that normal V2 governed runs are defective.

Current provisional classification:

**SURVIVES —** normal governed runs preserve authority lineage.

**SURVIVES —** authority lineage is auditable.

**CANNOT DISCRIMINATE AT EXECUTION —** two otherwise equivalent enforceable boundaries whose only material difference is legitimacy of lineage.

**OPEN RESEARCH QUESTION —** whether lineage legitimacy should be established upstream, independently revalidated at execution, cryptographically or trust-bound into an authorization artifact, or represented through another architecture.

This classification remains provisional until the implementation and adversarial test are inspected directly.

---

## 5. Distinction From the Temporal / Currentness Attack

These attacks are related but distinct.

### Temporal / Currentness Attack

Authority was legitimately created.

Question:

> Is that authority still legitimate or current at the time the consequence is executed?

Shorthand:

**CURRENTNESS:** Having legitimately come into existence, does the authority still legitimately exist?

### Lineage Attack

Authority appears operative now.

Question:

> Did that authority originate through a legitimate organizational authority path in the first place?

Shorthand:

**LINEAGE:** Did this authority legitimately come into existence?

These may eventually share architectural mechanisms, but they are separate experimental attacks and must remain separately documented.

---

## 6. Kelly's Recursion Objection

A simple response to the lineage attack might be:

> The execution engine should verify the entire authority lineage.

That creates a potentially infinite or operationally impractical recursion.

For example:

Was Kelly authorized?

Bob authorized Kelly.

Was Bob authorized to authorize Kelly?

Alice authorized Bob.

Was Alice authorized to authorize Bob?

And so on.

If every authority grant must recursively establish the legitimacy of the authority above it without a stopping rule, authority verification never terminates.

Therefore:

**Do not assume that indefinite recursive lineage verification is the correct response to the attack.**

This exposes another research question:

> Where does authority validation legitimately terminate?

---

## 7. Trust-Anchor Hypothesis

A possible solution is analogous to a root of trust or configured trust anchor.

Conceptually:

```text
CONFIGURED AUTHORITY TRUST ANCHOR
    ↓
VALID DELEGATION
    ↓
VALID DELEGATION
    ↓
CURRENT AUTHORITY GRANT
    ↓
ENFORCEABLE BOUNDARY
    ↓
EXECUTION
```

Under this hypothesis, the system would not claim that the trust anchor is universally, philosophically, legally, or metaphysically legitimate.

It would make a narrower claim:

> For purposes of this configured organizational authority model, this source is accepted as an authority trust anchor.

A possible future demonstrable proposition might therefore be:

> Under the configured organizational authority model, this executable boundary has a currently valid authority path to a configured trust anchor.

That is materially different from claiming:

> This action is objectively or universally legitimately authorized.

**Do not adopt this architecture yet.**

Treat the trust-anchor concept as a hypothesis to investigate.

A required question is whether a configured trust anchor actually solves the recursion problem or merely relocates it.

---

## 8. FBI / Attorney General Continuity Example

An upstream authority change does not necessarily invalidate all downstream authority.

Consider an FBI agent.

The agent's authority exists within an institutional, statutory, delegated, and role-based authority structure.

A new Attorney General taking office does not ordinarily imply that every existing FBI agent immediately loses all authority and must be individually reauthorized.

This suggests that authority may belong partly to enduring:

- institutions;
- offices;
- roles;
- statutory structures;
- delegations;

rather than merely to the individual occupying a superior office at a particular moment.

Conceptually:

```text
Attorney General changes
    ↓
Institutional FBI authority continues
    ↓
Valid subordinate delegations may continue
    ↓
Individual FBI agent authority remains current
unless another relevant termination or revocation condition occurs
```

Therefore:

**UPSTREAM CHANGE != AUTOMATIC DOWNSTREAM INVALIDATION**

The relevant question is whether the upstream change is **material to the continuing validity** of the downstream authority.

---

## 9. White House Chief of Staff Termination Example

Now consider the contrasting case.

A White House Chief of Staff may have authority to enter and operate within the White House because of a particular office, appointment, and administration.

Assume the President's term ends and there is no continuation or reappointment preserving that Chief of Staff's authority.

The outgoing Chief of Staff's authority should not continue indefinitely simply because the physical credential or authority record still appears operational.

The credential could still say:

```text
STATUS = ACTIVE
ACCESS = WEST_WING
ROLE = CHIEF_OF_STAFF
TECHNICALLY_VALID = TRUE
```

Yet the organizational authority represented by that credential may have terminated because the appointment or administration context to which it was bound has ended.

This contrasts with the FBI continuity example.

### FBI / Attorney General Succession

Upstream officeholder changes.

Downstream authority may **CONTINUE**.

### White House Chief of Staff / End of Administration

Governing appointment context ends.

Authority may **TERMINATE**.

Therefore:

**CHANGE ALONE IS INSUFFICIENT.**

The model needs some way to determine the authority consequence of the change.

---

## 10. Authority Continuity and Termination

These examples expose a possible concept of **AUTHORITY CONTINUITY**.

An authority grant may eventually need rules describing what causes it to:

- CONTINUE;
- INVALIDATE;
- SUSPEND;
- EXPIRE;
- REQUIRE REAUTHORIZATION.

Possible examples for investigation include:

- VALID UNTIL REVOKED;
- VALID UNTIL DATE;
- VALID WHILE ACTOR HOLDS ROLE;
- VALID WHILE ORGANIZATIONAL CONTEXT EXISTS;
- VALID UNTIL MATERIAL CHANGE;
- VALID THROUGH SUCCESSION OF OFFICEHOLDER;
- VALID ONLY DURING SPECIFIC ADMINISTRATION OR APPOINTMENT;
- VALID UNTIL SOURCE AUTHORITY TERMINATES.

These are **examples for investigation, not an authorized V2 schema**.

The conceptual question is:

> Has something changed that the configured organizational authority model defines as material to the continuing validity of this authority?

---

## 11. Possible Expanded Authority Chain

The current project has emphasized:

```text
WHO CAN DECIDE
→ WHAT THEY CAN DECIDE
→ WHAT DECISION THEY MADE
→ HOW DECISION IS REPRESENTED
→ AUTHORITY RECORD
→ ENFORCEABLE BOUNDARY
→ EXECUTION ENGINE CONSUMES BOUNDARY
→ CONSEQUENCE
```

The new attacks suggest possible additional concepts somewhere in or around that chain:

- LEGITIMATE AUTHORITY LINEAGE;
- CURRENT AUTHORITY;
- VALIDITY CONTEXT;
- CONTINUITY / TERMINATION RULES;
- TRUST ANCHOR.

A possible research model to evaluate is:

```text
CONFIGURED TRUST ANCHOR
→ LEGITIMATE AUTHORITY PATH
→ AUTHORITY GRANT
→ VALIDITY CONTEXT
→ CONTINUITY / TERMINATION
→ CURRENT AUTHORITY
→ ENFORCEABLE BOUNDARY
→ EXECUTION
→ CONSEQUENCE
```

**THIS IS A RESEARCH HYPOTHESIS, NOT AN AUTHORIZED MODEL CHANGE.**

Do not rewrite the governing conceptual chain until V2 has been inspected and the attacks have been experimentally adjudicated.

---

## 12. Three Questions Now Exposed

### Question 1 — Origin / Lineage

Did this authority legitimately come into existence through the configured organizational authority structure?

### Question 2 — Currentness / Continuity

Having legitimately come into existence, is the authority still valid under the conditions that govern its continuation?

### Question 3 — Termination of Validation

How far up the authority chain must legitimacy be established, and where does the system legitimately stop asking:

> Who authorized the authorizer?

The trust-anchor hypothesis is one possible answer to Question 3.

It has not yet been established as the correct architecture.

---

## 13. Important Limit on Claims

No technical authority system can necessarily establish the ultimate legitimacy of its own root authority.

An organizational authority system should not be required to recursively establish:

- whether the corporate charter was legitimate;
- whether the legislature was legitimate;
- whether the constitution was legitimate;
- whether the founders possessed legitimate authority;
- and so forth.

That would make operational authority verification impossible to terminate.

The harness should therefore remain proportionate in its claims.

A potentially testable proposition is:

> Given configured authority sources, delegation rules, validity conditions, and material-change rules, can the system determine whether this consequence currently has a valid authority path?

That is testable.

> Prove this authority is ultimately legitimate.

is not.

---

## 14. Required Investigation Before Any Model Change

Before changing V2:

1. Preserve this attack document.
2. Inspect the actual current implementation.
3. Determine exactly what lineage information V2 records.
4. Determine exactly what the execution engine consumes.
5. Determine whether lineage legitimacy is enforced anywhere upstream.
6. Determine whether the normal governed pipeline can actually construct an enforceable boundary with illegitimate lineage.
7. If necessary, construct an adversarial test outside the normal UI path that creates two otherwise identical boundaries differing only in lineage legitimacy.
8. Determine whether execution can discriminate them.
9. Separately test the temporal/currentness attack.
10. Determine whether V2 already contains any implicit continuity, expiration, revocation, version, materiality, or validity-context behavior.
11. Determine whether lineage and currentness are genuinely separate failure dimensions in the implementation.
12. Determine whether a configured trust anchor would solve the recursion problem or merely relocate it.
13. Determine whether authority-continuity semantics are required for a useful operational model.
14. Preserve the evidence.
15. Classify the findings.
16. Report findings to Kelly **before** making a material conceptual-model change.

Possible classifications include:

- IMPLEMENTATION DEFECT;
- CONCEPTUAL / MODEL DEFECT;
- ARCHITECTURAL CHOICE;
- MODEL LIMITATION;
- EVIDENCE / TEST-ORACLE DEFECT;
- EXPECTED REJECTION;
- LEGITIMATE EXPERIMENTAL RESULT;
- RESEARCH QUESTION.

Multiple classifications may apply.

---

## 15. Do Not Rescue V2

The purpose of these attacks is to discover what V2 actually demonstrates and where its model stops.

Do **not** modify V2 simply so that it can claim to survive the attacks.

If V2 cannot discriminate authority-lineage legitimacy at execution, preserve that result.

If V2 cannot determine continuing authority after an external validity-context change, preserve that result.

If the normal governed pipeline prevents these conditions upstream, preserve **that** result too.

If the architecture intentionally treats an enforceable boundary as a trusted authorization artifact, state that explicitly and evaluate the consequences.

A limitation discovered by the experiment is a research result.

Do not turn the harness into a proof machine by continually changing the implementation until every adversarial question returns PASS.

---

## 16. Plain-Language Explanation

A badge can say you're authorized.

There are still several questions:

- Who gave you the badge?
- Were they allowed to give it to you?
- Has anything happened since then that makes the badge stop counting?
- How far back do we have to keep asking who authorized whom before we reach something the organization accepts as authoritative?

The FBI example shows why every change above you cannot automatically cancel your authority.

The White House Chief of Staff example shows why some changes absolutely can end authority even when the credential itself has not changed.

Therefore the deeper question is not simply:

> Is the badge valid?

It is:

> Under the organization's authority rules, does this badge represent authority that legitimately arose and continues to exist now?

---

## 17. Broader Research Question

The combined finding can be expressed as:

> What is the minimum authority lineage that must be operationally validated for execution, where does that validation terminate, and what changes are material enough to break an otherwise continuing authority chain?

This is now an explicit research question arising from V2.

Do not assume the answer in advance.

---

## 18. Preservation Rule

This document records an independent adversarial finding and associated research questions against the frozen V2 representation.

It is:

- an attack to be tested;
- a research context to be preserved;
- not a conceded implementation defect;
- not an authorized V2 schema change;
- not an authorized conceptual-model change;
- not a replacement for the separate temporal/currentness attack.

The next step is experimental inspection and classification against frozen V2.
