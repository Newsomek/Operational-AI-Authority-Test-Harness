(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};
    const validation = root.ValidationEngine;

    if (!validation) {
        throw new Error(
            "ValidationEngine must be loaded before ExecutionEngine."
        );
    }

    const EXECUTION_RESULT = Object.freeze({
        ALLOW: "ALLOW",
        BLOCK: "BLOCK"
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

    function block(reason, boundaryId) {
        return deepFreeze({
            result: EXECUTION_RESULT.BLOCK,
            reason: reason,
            boundaryId: boundaryId || null
        });
    }

    function allow(reason, boundaryId) {
        return deepFreeze({
            result: EXECUTION_RESULT.ALLOW,
            reason: reason,
            boundaryId: boundaryId
        });
    }

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function getContextValue(field, requestedAction, conditionValues) {
        if (
            Object.prototype.hasOwnProperty.call(
                requestedAction,
                field
            )
        ) {
            return requestedAction[field];
        }

        if (
            isPlainObject(conditionValues) &&
            Object.prototype.hasOwnProperty.call(
                conditionValues,
                field
            )
        ) {
            return conditionValues[field];
        }

        return undefined;
    }

    function evaluatePredicate(
        predicate,
        requestedAction,
        conditionValues
    ) {
        const check =
            validation.validateTypedPredicate(
                predicate
            );

        if (!check.valid) {
            return {
                evaluable: false,
                satisfied: false,
                reason:
                    "Condition predicate is malformed: " +
                    check.errors.join(" ")
            };
        }

        const actualValue =
            getContextValue(
                predicate.field,
                requestedAction,
                conditionValues
            );

        if (typeof actualValue === "undefined") {
            return {
                evaluable: false,
                satisfied: false,
                reason:
                    "Required condition field is unavailable: " +
                    predicate.field
            };
        }

        let satisfied = false;

        if (predicate.operator === "EQ") {
            satisfied =
                actualValue === predicate.comparisonValue;
        }
        else if (predicate.operator === "NEQ") {
            satisfied =
                actualValue !== predicate.comparisonValue;
        }
        else if (predicate.operator === "LT") {
            satisfied =
                actualValue < predicate.comparisonValue;
        }
        else if (predicate.operator === "LTE") {
            satisfied =
                actualValue <= predicate.comparisonValue;
        }
        else if (predicate.operator === "GT") {
            satisfied =
                actualValue > predicate.comparisonValue;
        }
        else if (predicate.operator === "GTE") {
            satisfied =
                actualValue >= predicate.comparisonValue;
        }
        else if (predicate.operator === "IN") {
            satisfied =
                Array.isArray(predicate.comparisonValue) &&
                predicate.comparisonValue.includes(actualValue);
        }
        else {
            return {
                evaluable: false,
                satisfied: false,
                reason:
                    "Unsupported condition operator: " +
                    predicate.operator
            };
        }

        return {
            evaluable: true,
            satisfied: satisfied,
            reason: null
        };
    }

    function evaluateConditions(
        conditions,
        requestedAction,
        conditionValues
    ) {
        if (!Array.isArray(conditions)) {
            return {
                satisfied: false,
                reasons: [
                    "Boundary conditions are malformed."
                ]
            };
        }

        const reasons = [];

        conditions.forEach(function (condition) {
            if (condition && condition.required === false) {
                return;
            }

            const predicate =
                condition &&
                Object.prototype.hasOwnProperty.call(
                    condition,
                    "predicate"
                )
                    ? condition.predicate
                    : condition;

            const result = evaluatePredicate(
                predicate,
                requestedAction,
                conditionValues
            );

            if (!result.evaluable) {
                reasons.push(result.reason);
                return;
            }

            if (!result.satisfied) {
                reasons.push(
                    "Required condition was not satisfied: " +
                    predicate.field
                );
            }
        });

        return {
            satisfied: reasons.length === 0,
            reasons: reasons
        };
    }

    function evaluateScope(requestedAction, boundary) {
        const scope = boundary.scope;
        const reasons = [];

        if (!isPlainObject(scope)) {
            return {
                satisfied: false,
                reasons: [
                    "Boundary scope is missing or malformed."
                ]
            };
        }

        if (
            typeof boundary.actionType !== "string" ||
            boundary.actionType.length === 0
        ) {
            reasons.push(
                "Boundary action type is missing."
            );
        }
        else if (
            requestedAction.actionType !==
            boundary.actionType
        ) {
            reasons.push(
                "Requested action type is outside the current boundary."
            );
        }

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "maximumAmountCents"
            )
        ) {
            if (!Number.isInteger(requestedAction.amountCents)) {
                reasons.push(
                    "Requested amount must be represented as integer cents."
                );
            }
            else if (
                requestedAction.amountCents >
                scope.maximumAmountCents
            ) {
                reasons.push(
                    "Requested amount exceeds the current authorized maximum."
                );
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "allowedRiskLevels"
            )
        ) {
            if (!Array.isArray(scope.allowedRiskLevels)) {
                reasons.push(
                    "Allowed risk levels are malformed."
                );
            }
            else if (
                !scope.allowedRiskLevels.includes(
                    requestedAction.customerRisk
                )
            ) {
                reasons.push(
                    "Requested customer risk is outside the current authority scope."
                );
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "maximumTransactionAgeDays"
            )
        ) {
            if (
                !Number.isInteger(
                    requestedAction.transactionAgeDays
                )
            ) {
                reasons.push(
                    "Transaction age must be an integer number of days."
                );
            }
            else if (
                requestedAction.transactionAgeDays >
                scope.maximumTransactionAgeDays
            ) {
                reasons.push(
                    "Transaction age exceeds the current authority scope."
                );
            }
        }

        return {
            satisfied: reasons.length === 0,
            reasons: reasons
        };
    }

    function evaluateExecution(input) {
        if (!isPlainObject(input)) {
            throw new Error(
                "Execution input must be an object."
            );
        }

        const requestedAction =
            input.requestedAction;

        const boundary =
            input.boundary;

        const technicalCapability =
            input.technicalCapability;

        const technicalValidity =
            input.technicalValidity;

        const conditionValues =
            input.conditionValues || {};

        if (!isPlainObject(requestedAction)) {
            return block(
                "Requested action is missing or malformed."
            );
        }

        if (!isPlainObject(boundary)) {
            return block(
                "No current enforceable boundary is available."
            );
        }

        if (boundary.status !== "ENFORCEABLE") {
            return block(
                "Current boundary is not enforceable.",
                boundary.boundaryId
            );
        }

        if (!isPlainObject(technicalCapability)) {
            return block(
                "Technical capability evidence is missing.",
                boundary.boundaryId
            );
        }

        if (technicalCapability.supported !== true) {
            return block(
                "The system is not technically capable of the requested action.",
                boundary.boundaryId
            );
        }

        if (!isPlainObject(technicalValidity)) {
            return block(
                "Technical validity evidence is missing.",
                boundary.boundaryId
            );
        }

        if (technicalValidity.status !== "PASS") {
            return block(
                "Technical validity is not PASS.",
                boundary.boundaryId
            );
        }

        const scopeResult =
            evaluateScope(
                requestedAction,
                boundary
            );

        const conditionResult =
            evaluateConditions(
                boundary.enforceableConditions || [],
                requestedAction,
                conditionValues
            );

        const boundaryViolations =
            scopeResult.reasons.concat(
                conditionResult.reasons
            );

        if (boundaryViolations.length > 0) {
            return block(
                boundaryViolations.join(" "),
                boundary.boundaryId
            );
        }

        return allow(
            "Requested action is within the current enforceable boundary and all required conditions are satisfied.",
            boundary.boundaryId
        );
    }

    root.ExecutionEngine = Object.freeze({
        EXECUTION_RESULT: EXECUTION_RESULT,
        evaluateExecution: evaluateExecution
    });
}(window));