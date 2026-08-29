(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};
    const validation = root.ValidationEngine;

    if (!validation) {
        throw new Error(
            "ValidationEngine must be loaded before BoundaryEngine."
        );
    }

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

    function validateRequiredConditions(conditions) {
        if (!Array.isArray(conditions)) {
            return {
                enforceable: false,
                reason:
                    "Authority conditions must be represented as an array."
            };
        }

        for (let index = 0; index < conditions.length; index += 1) {
            const condition = conditions[index];

            if (
                condition &&
                condition.required === false
            ) {
                continue;
            }

            const predicate = condition &&
                Object.prototype.hasOwnProperty.call(
                    condition,
                    "predicate"
                )
                ? condition.predicate
                : condition;

            const check =
                validation.validateTypedPredicate(
                    predicate
                );

            if (!check.valid) {
                return {
                    enforceable: false,
                    reason:
                        "Required condition " +
                        index +
                        " is not enforceable: " +
                        check.errors.join(" ")
                };
            }
        }

        return {
            enforceable: true,
            reason: null
        };
    }

    function createBoundary(authority) {
        if (
            authority === null ||
            typeof authority !== "object" ||
            Array.isArray(authority)
        ) {
            throw new Error(
                "authority must be an object."
            );
        }

        if (authority.status !== "ACTIVE") {
            return deepFreeze({
                boundaryCreated: false,
                boundary: null,
                reason:
                    "Only ACTIVE authority can create an executable boundary."
            });
        }

        const scopeCheck =
            validation.normalizeAuthorityScope(
                authority.scope
            );

        if (!scopeCheck.valid) {
            return deepFreeze({
                boundaryCreated: false,
                boundary: null,
                reason:
                    "Active authority scope is not enforceable: " +
                    scopeCheck.errors.join(" ")
            });
        }

        const conditionCheck =
            validateRequiredConditions(
                authority.conditions || []
            );

        if (!conditionCheck.enforceable) {
            return deepFreeze({
                boundaryCreated: false,
                boundary: null,
                reason: conditionCheck.reason
            });
        }

        const boundary = {
            boundaryId:
                "BOUNDARY-" + authority.authorityId,
            sourceAuthorityId:
                authority.authorityId,
            actionType:
                authority.actionType,
            scope:
                Object.assign(
                    deepClone(authority.scope),
                    {
                        constraints:
                            deepClone(scopeCheck.constraints)
                    }
                ),
            enforceableConditions:
                deepClone(authority.conditions || []),
            status:
                "ENFORCEABLE",
            generatedFromDecisionId:
                authority.createdByDecisionId,
            scenarioVersion:
                authority.scenarioVersion,
            policyVersion:
                authority.policyVersion
        };

        return deepFreeze({
            boundaryCreated: true,
            boundary: boundary,
            reason: null
        });
    }

    root.BoundaryEngine = Object.freeze({
        createBoundary: createBoundary
    });
}(window));