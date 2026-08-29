# Roadmap

## Purpose

This document records capabilities deliberately deferred beyond V1.

Their presence here does not constitute a commitment to implement them, and
their absence from V1 is not a defect unless the governing specification later
promotes a capability into the required scope.

## V1 boundary

V1 is intentionally deterministic and browser-native.

The core experiment does not depend on:

- large language models;
- randomness;
- external APIs;
- current time;
- cloud infrastructure;
- a database;
- enterprise identity infrastructure.

## Potential future work

The following capabilities are future candidates:

- AI or model adapters;
- policy-as-code integrations;
- enterprise RBAC;
- signed authority records;
- cryptographic evidence;
- enterprise connectors;
- multi-agent workflows;
- delegated authority trees;
- emergency override or break-glass mechanisms;
- time-limited authority;
- regulatory mappings;
- quorum or multi-party authorization;
- API access;
- CLI access;
- cloud deployment;
- enterprise authentication;
- enterprise audit integrations.

## Research questions

Future experimentation may examine:

- when separation of decision authority produces a meaningful operational
  difference;
- how authority should behave across delegated or federated structures;
- how materiality rules should be established and challenged;
- how evidence quality and evidence provenance affect authorization;
- when fail-closed behavior is appropriate and when it is not;
- how time-limited or emergency authority should interact with normal
  authorization;
- how real organizational authority can be represented without confusing the
  representation with the legitimacy of the authority itself.

## Claims discipline

A roadmap item is not evidence that the corresponding design is correct.

Future implementation should continue to distinguish:

organizational decision
-> authority record
-> enforceable boundary
-> execution consequence

and should preserve the distinctions between capability, recommendation,
technical validity, authority, revalidation, and reauthorization.
