# Recorded Lineage vs. Governing Lineage

**Document type:** Independent adversarial attack record  
**Reviewer:** Wojciech  
**Target:** Operational AI Authority Test Harness — Version 2 frozen release  
**Status:** PRESERVED FOR INSPECTION AND EXPERIMENTAL ADJUDICATION  
**Implementation change authorized:** NO

## Question

V2 preserves authority lineage as evidence. The enforceable boundary carries source authority ID, originating decision ID, scenario version, and policy version, and run evidence retains authority history and relevant event sequence.

However, lineage does not appear to be independently consumed by the execution engine as an execution predicate.

At execution, the engine evaluates operative properties such as:

- enforceable status;
- action type;
- scope;
- conditions;
- technical capability/validity inputs.

It does not independently establish whether:

- the source authority remains the legitimate source for this consequence;
- the originating decision was made through a legitimate authority path;
- the scenario version remains the applicable authority context;
- the policy version remains the legitimate governing policy.

## Adversarial Test

Construct two boundaries with identical operative content:

- same `ENFORCEABLE` status;
- same action;
- same scope;
- same conditions;

but different authority lineage.

One lineage is legitimate.

The other is not.

If lineage legitimacy is the only material difference, can the execution layer discriminate between the two?

## Current V2 Observation

The normal governed V2 pipeline may prevent illegitimate lineage upstream. Therefore this finding must **not** automatically be classified as evidence that normal V2 governed runs are defective.

Current classification:

**SURVIVES —** normal governed runs preserve authority lineage.

**SURVIVES —** authority lineage is auditable.

**CANNOT DISCRIMINATE AT EXECUTION —** two otherwise equivalent enforceable boundaries whose only material difference is legitimacy of lineage.

**OPEN RESEARCH QUESTION —** whether lineage legitimacy should be established upstream, independently revalidated at execution, cryptographically/trust-bound into an authorization artifact, or represented through another architecture.

## Distinction From Temporal Attack

**Temporal/currentness attack:**

Was legitimately created authority still legitimate at the time of execution?

**Lineage attack:**

Was the authority that produced this boundary legitimate through the required organizational authority path in the first place?

These may eventually share architectural mechanisms, but they are distinct experimental attacks and should remain separately documented.

## Important Conceptual Distinction

**Recorded lineage is not necessarily governing lineage.**

Preserving provenance proves that the system can show where authority came from.

It does not by itself demonstrate that legitimacy of that provenance is an operative condition of execution.

Plain-language formulation:

> The system checks what the authorization says. It may not independently check whether the authorization itself deserves to be trusted.

This formulation supplements the technical finding; it does not replace it.

## Required Adjudication Sequence

Do **not** change the V2 implementation merely to make this attack pass.

Before any implementation or conceptual-model change:

1. Preserve this attack.
2. Inspect the implementation.
3. Determine experimentally whether the stated attack is accurate.
4. Classify the result.
5. Report whether this is an implementation defect, model limitation, architectural choice, research question, or some combination.
6. Preserve the resulting evidence.
7. Obtain Kelly's authorization before making a conceptual-model change.

## Preservation Rule

This document records an independent adversarial finding against the frozen V2 representation. It is an attack to be tested, not a conceded defect and not an authorized specification change.

It must remain separate from the earlier temporal/currentness attack so that the two questions can be adjudicated independently.
