# Operational AI Authority Test Harness

## What this is

The Operational AI Authority Test Harness is a small browser-based governance laboratory.

It exists to test whether changes in organizational authority can produce corresponding changes in what an AI-enabled or automated system is permitted to do.

It is a test harness, not a proof machine.

## Governing question

Does organizational authority actually control system consequences?

The core modeled chain is:

ORGANIZATIONAL DECISION
-> AUTHORITY RECORD
-> ENFORCEABLE BOUNDARY
-> EXECUTION EVALUATION
-> CONSEQUENCE

The implementation must keep recommendation, technical validity, technical capability, authority, governance workflow, and execution conceptually separate.

## Core experimental discipline

The execution engine must derive permission from the current enforceable authority boundary and enforceable conditions.

It must not derive permission directly from:

- disposition;
- recommendation;
- model confidence;
- technical validity;
- recommendation source;
- human approval;
- previous execution;
- the existence of a decision record;
- or an expected test result.

A passing software test does not by itself prove the broader governance hypothesis.

## V1 implementation direction

V1 is intended to be:

- browser-native;
- deterministic;
- inspectable;
- editable;
- replayable;
- evidence-producing;
- portable;
- and proportionate.

The preferred implementation is plain HTML, CSS, and modern JavaScript with no required database, Docker environment, cloud account, external API, or AI model.

## Authoritative project instructions

The authoritative project specification is:

prompts/GOVERNING_SESSION_INSTRUCTIONS.docx

The startup handoff instructions are:

prompts/START_SESSION_PROMPT.docx

If they conflict, GOVERNING_SESSION_INSTRUCTIONS.docx governs.

## Project history

The documented project repository history begins with the two authoritative starting documents above and proceeds through source control, CHANGELOG.md, DECISION_LOG.md, tests, documentation, and other durable project artifacts.

Earlier nonexistent project artifacts must not be reconstructed or implied.

## AI-assisted development

AI tools are being used extensively to help translate Kelly Newsome's requirements, conceptual model, hypotheses, constraints, and decisions into architecture, code, tests, documentation, data structures, and an executable application.

AI assistance does not lower the required engineering or experimental standard.

"It runs" does not mean "it works."

## Status

Initial repository bootstrap.
Application implementation has not yet begun.