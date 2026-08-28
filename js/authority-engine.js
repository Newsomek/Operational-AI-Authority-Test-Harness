(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const DISPOSITIONS = Object.freeze({
        RENEW: "RENEW",
        NARROW: "NARROW",
        CONDITION: "CONDITION",
        TRANSFER: "TRANSFER",
        SUSPEND: "SUSPEND",
        REFUSE: "REFUSE"
    });

    const AUTHORITY_STATUS = Object.freeze({
        ACTIVE: "ACTIVE",
        INVALID: "INVALID",
        SUSPENDED: "SUSPENDED"
    });

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
        if (value === null || typeof value !== "object") {
            return value;
        }

        Object.freeze(value);

        Object.keys(value).forEach(function (key) {
            if (
                value[key] !== null &&
                typeof value[key] === "object" &&
                !Object.isFrozen(value[key])
            ) {
                deepFreeze(value[key]);
            }
        });

        return value;
    }

    function requirePlainObject(value, label) {
        if (
            value === null ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            throw new Error(label + " must be an object.");
        }
    }

    function requireString(value, label) {
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error(label + " must be a non-empty string.");
        }
    }

    function requireDisposition(value) {
        const allowed = Object.keys(DISPOSITIONS).map(function (key) {
            return DISPOSITIONS[key];
        });

        if (!allowed.includes(value)) {
            throw new Error(
                "Unsupported disposition: " + String(value)
            );
        }
    }

    function createAuthorityId(priorAuthority, decision) {
        requireString(decision.decisionId, "decision.decisionId");

        return (
            "AUTH-" +
            decision.decisionId.replace(/[^A-Za-z0-9_-]/g, "_")
        );
    }

    function createBaseAuthority(priorAuthority, decision) {
        return {
            authorityId: createAuthorityId(
                priorAuthority,
                decision
            ),
            authorityVersion:
                Number(priorAuthority.authorityVersion) + 1,
            actionType: priorAuthority.actionType,
            purpose: priorAuthority.purpose,
            status: AUTHORITY_STATUS.ACTIVE,
            owner:
                decision.newOwner ||
                priorAuthority.owner,
            scope: deepClone(priorAuthority.scope),
            conditions: deepClone(
                priorAuthority.conditions || []
            ),
            createdByDecisionId: decision.decisionId,
            replacesAuthorityId:
                priorAuthority.authorityId,
            invalidatedByEventId: null,
            scenarioVersion:
                decision.scenarioVersion ||
                priorAuthority.scenarioVersion,
            policyVersion:
                decision.policyVersion ||
                priorAuthority.policyVersion,
            originatingDisposition:
                decision.disposition
        };
    }

    function applyRenew(priorAuthority, decision) {
        return createBaseAuthority(
            priorAuthority,
            decision
        );
    }

    function applyNarrow(priorAuthority, decision) {
        requirePlainObject(
            decision.newScope,
            "decision.newScope"
        );

        const authority = createBaseAuthority(
            priorAuthority,
            decision
        );

        authority.scope = deepClone(
            decision.newScope
        );

        return authority;
    }

    function applyCondition(priorAuthority, decision) {
        if (!Array.isArray(decision.conditions)) {
            throw new Error(
                "decision.conditions must be an array for CONDITION."
            );
        }

        const authority = createBaseAuthority(
            priorAuthority,
            decision
        );

        authority.conditions = deepClone(
            decision.conditions
        );

        return authority;
    }

    function applySuspend(priorAuthority, decision) {
        const authority = createBaseAuthority(
            priorAuthority,
            decision
        );

        authority.status =
            AUTHORITY_STATUS.SUSPENDED;

        return authority;
    }

    function translateDecision(priorAuthority, decision) {
        requirePlainObject(
            priorAuthority,
            "priorAuthority"
        );

        requirePlainObject(
            decision,
            "decision"
        );

        requireString(
            priorAuthority.authorityId,
            "priorAuthority.authorityId"
        );

        if (!Number.isInteger(priorAuthority.authorityVersion)) {
            throw new Error(
                "priorAuthority.authorityVersion must be an integer."
            );
        }

        requireDisposition(
            decision.disposition
        );

        if (
            decision.disposition ===
            DISPOSITIONS.TRANSFER
        ) {
            requireString(
                decision.newDecisionOwner,
                "decision.newDecisionOwner"
            );

            return deepFreeze({
                disposition: DISPOSITIONS.TRANSFER,
                authorityCreated: false,
                authority: null,
                transferredDecisionOwner:
                    decision.newDecisionOwner
            });
        }

        if (
            decision.disposition ===
            DISPOSITIONS.REFUSE
        ) {
            return deepFreeze({
                disposition: DISPOSITIONS.REFUSE,
                authorityCreated: false,
                authority: null,
                transferredDecisionOwner: null
            });
        }

        let authority;

        if (
            decision.disposition ===
            DISPOSITIONS.RENEW
        ) {
            authority = applyRenew(
                priorAuthority,
                decision
            );
        }
        else if (
            decision.disposition ===
            DISPOSITIONS.NARROW
        ) {
            authority = applyNarrow(
                priorAuthority,
                decision
            );
        }
        else if (
            decision.disposition ===
            DISPOSITIONS.CONDITION
        ) {
            authority = applyCondition(
                priorAuthority,
                decision
            );
        }
        else if (
            decision.disposition ===
            DISPOSITIONS.SUSPEND
        ) {
            authority = applySuspend(
                priorAuthority,
                decision
            );
        }
        else {
            throw new Error(
                "Disposition translation not implemented."
            );
        }

        return deepFreeze({
            disposition: decision.disposition,
            authorityCreated: true,
            authority: authority,
            transferredDecisionOwner: null
        });
    }

    root.AuthorityEngine = Object.freeze({
        DISPOSITIONS: DISPOSITIONS,
        AUTHORITY_STATUS: AUTHORITY_STATUS,
        translateDecision: translateDecision
    });
}(window));