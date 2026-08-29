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

    function normalizeScopeConstraints(scope) {
        requirePlainObject(scope, "authority scope");

        if (Array.isArray(scope.constraints)) {
            return scope.constraints.map(function (constraint) {
                return deepClone(constraint);
            });
        }

        const constraints = [];

        if (Object.prototype.hasOwnProperty.call(scope, "maximumAmountCents")) {
            constraints.push({
                field: "amountCents",
                operator: "LTE",
                comparisonValue: scope.maximumAmountCents,
                valueType: "integer"
            });
        }

        if (Object.prototype.hasOwnProperty.call(scope, "allowedRiskLevels")) {
            constraints.push({
                field: "customerRisk",
                operator: "IN",
                comparisonValue: Array.isArray(scope.allowedRiskLevels)
                    ? scope.allowedRiskLevels.slice()
                    : scope.allowedRiskLevels,
                valueType: "string"
            });
        }

        if (Object.prototype.hasOwnProperty.call(scope, "maximumTransactionAgeDays")) {
            constraints.push({
                field: "transactionAgeDays",
                operator: "LTE",
                comparisonValue: scope.maximumTransactionAgeDays,
                valueType: "integer"
            });
        }

        return constraints;
    }

    function constraintKey(constraint) {
        return [
            constraint.field,
            constraint.operator,
            constraint.valueType
        ].join("|");
    }

    function compareConstraintNarrowing(priorConstraint, newConstraint) {
        const operator = priorConstraint.operator;
        const priorValue = priorConstraint.comparisonValue;
        const newValue = newConstraint.comparisonValue;

        if (operator === "LTE" || operator === "LT") {
            if (newValue > priorValue) {
                return "BROADEN";
            }
            return newValue < priorValue ? "STRICTER" : "SAME";
        }

        if (operator === "GTE" || operator === "GT") {
            if (newValue < priorValue) {
                return "BROADEN";
            }
            return newValue > priorValue ? "STRICTER" : "SAME";
        }

        if (operator === "IN") {
            if (!Array.isArray(priorValue) || !Array.isArray(newValue)) {
                return "INCOMPARABLE";
            }

            const added = newValue.filter(function (value) {
                return !priorValue.includes(value);
            });

            if (added.length > 0) {
                return "BROADEN";
            }

            return newValue.length < priorValue.length
                ? "STRICTER"
                : "SAME";
        }

        if (operator === "EQ" || operator === "NEQ") {
            return JSON.stringify(newValue) === JSON.stringify(priorValue)
                ? "SAME"
                : "INCOMPARABLE";
        }

        return "INCOMPARABLE";
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
        const authority = createBaseAuthority(
            priorAuthority,
            decision
        );

        if (decision.newScope) {
            requirePlainObject(
                decision.newScope,
                "decision.newScope"
            );
            authority.scope = deepClone(
                decision.newScope
            );
        }

        return authority;
    }

    function validateNarrowScope(
        priorScope,
        newScope
    ) {
        requirePlainObject(priorScope, "priorAuthority.scope");
        requirePlainObject(newScope, "decision.newScope");

        const priorConstraints = normalizeScopeConstraints(priorScope);
        const newConstraints = normalizeScopeConstraints(newScope);
        const priorByKey = Object.create(null);
        const newByKey = Object.create(null);
        let stricter = false;

        priorConstraints.forEach(function (constraint) {
            priorByKey[constraintKey(constraint)] = constraint;
        });

        newConstraints.forEach(function (constraint) {
            newByKey[constraintKey(constraint)] = constraint;
        });

        priorConstraints.forEach(function (priorConstraint) {
            const key = constraintKey(priorConstraint);
            const comparable = newByKey[key];

            if (!comparable) {
                const sameField = newConstraints.some(function (constraint) {
                    return constraint.field === priorConstraint.field;
                });

                if (sameField) {
                    throw new Error(
                        "NARROW may not change the governed operator or value type for field " +
                        priorConstraint.field +
                        "; that change is not demonstrably a narrowing."
                    );
                }

                throw new Error(
                    "NARROW may not remove an existing enforceable constraint for field " +
                    priorConstraint.field +
                    "."
                );
            }

            const relationship = compareConstraintNarrowing(
                priorConstraint,
                comparable
            );

            if (relationship === "BROADEN") {
                throw new Error(
                    "NARROW may not broaden the enforceable constraint for field " +
                    priorConstraint.field +
                    "."
                );
            }

            if (relationship === "INCOMPARABLE") {
                throw new Error(
                    "NARROW cannot prove that the replacement constraint is narrower for field " +
                    priorConstraint.field +
                    "."
                );
            }

            if (relationship === "STRICTER") {
                stricter = true;
            }
        });

        newConstraints.forEach(function (newConstraint) {
            const key = constraintKey(newConstraint);

            if (!priorByKey[key]) {
                const sameField = priorConstraints.some(function (constraint) {
                    return constraint.field === newConstraint.field;
                });

                if (sameField) {
                    throw new Error(
                        "NARROW may not replace an existing constraint with an incomparable constraint for field " +
                        newConstraint.field +
                        "."
                    );
                }

                stricter = true;
            }
        });

        if (!stricter) {
            throw new Error(
                "NARROW must impose at least one stricter enforceable boundary than the authority it replaces."
            );
        }
    }

    function applyNarrow(priorAuthority, decision) {
        requirePlainObject(
            decision.newScope,
            "decision.newScope"
        );

        validateNarrowScope(
            priorAuthority.scope,
            decision.newScope
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

        if (decision.newScope) {
            requirePlainObject(
                decision.newScope,
                "decision.newScope"
            );
            authority.scope = deepClone(
                decision.newScope
            );
        }

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
