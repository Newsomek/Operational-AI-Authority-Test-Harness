(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const actors =
        root.ActorEngine;

    const evidence =
        root.EvidenceEngine;

    const authority =
        root.AuthorityEngine;

    if (!actors || !evidence || !authority) {
        throw new Error(
            "ActorEngine, EvidenceEngine, and AuthorityEngine must be loaded before GovernanceDecisionEngine."
        );
    }

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function validateDecision(input) {
        if (!isPlainObject(input)) {
            return {
                valid: false,
                reason:
                    "Governance decision input must be an object."
            };
        }

        const decision = input.decision;

        if (!isPlainObject(decision)) {
            return {
                valid: false,
                reason:
                    "Governance decision is missing or malformed."
            };
        }

        if (
            typeof decision.decisionId !== "string" ||
            decision.decisionId.trim().length === 0
        ) {
            return {
                valid: false,
                reason:
                    "decisionId is required."
            };
        }

        const authorization =
            actors.requireCapability(
                input.actor,
                actors.CAPABILITIES.REAUTHORIZE
            );

        if (!authorization.authorized) {
            return {
                valid: false,
                reason:
                    authorization.reason
            };
        }

        const evidenceCheck =
            evidence.validateRequiredEvidence({
                evidenceItems:
                    input.evidenceItems,
                requiredEvidenceIds:
                    input.requiredEvidenceIds,
                reviewedEvidenceIds:
                    decision.evidenceReviewed
            });

        if (!evidenceCheck.valid) {
            return {
                valid: false,
                reason:
                    evidenceCheck.reason
            };
        }

        const allowedDispositions =
            Array.isArray(input.allowedDispositions)
                ? input.allowedDispositions
                : [];

        if (
            !allowedDispositions.includes(
                decision.disposition
            )
        ) {
            return {
                valid: false,
                reason:
                    "Disposition is not permitted by the configured policy: " +
                    String(decision.disposition)
            };
        }

        return {
            valid: true,
            reason: null
        };
    }

    function decide(input) {
        const validation =
            validateDecision(input);

        if (!validation.valid) {
            return Object.freeze({
                valid: false,
                reason:
                    validation.reason,
                translation:
                    null
            });
        }

        const translation =
            authority.translateDecision(
                input.currentAuthority,
                input.decision
            );

        return Object.freeze({
            valid: true,
            reason: null,
            translation: translation
        });
    }

    root.GovernanceDecisionEngine = Object.freeze({
        validateDecision:
            validateDecision,
        decide:
            decide
    });
}(window));