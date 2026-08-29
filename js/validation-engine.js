(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const VALUE_TYPES = Object.freeze([
        "string",
        "integer",
        "boolean"
    ]);

    const OPERATORS = Object.freeze([
        "EQ",
        "NEQ",
        "LT",
        "LTE",
        "GT",
        "GTE",
        "IN"
    ]);

    const GROUP_OPERATORS = Object.freeze([
        "ALL",
        "ANY"
    ]);

    function result(valid, errors) {
        return Object.freeze({
            valid: valid,
            errors: Object.freeze(errors.slice())
        });
    }

    function isPlainObject(value) {
        if (value === null || typeof value !== "object") {
            return false;
        }

        const prototype = Object.getPrototypeOf(value);

        return prototype === Object.prototype || prototype === null;
    }

    function validateNonEmptyString(value, fieldName) {
        const errors = [];

        if (typeof value !== "string" || value.trim().length === 0) {
            errors.push(fieldName + " must be a non-empty string.");
        }

        return result(errors.length === 0, errors);
    }

    function validateInteger(value, fieldName, options) {
        const errors = [];
        const settings = options || {};

        if (!Number.isInteger(value)) {
            errors.push(fieldName + " must be an integer.");
            return result(false, errors);
        }

        if (
            Object.prototype.hasOwnProperty.call(settings, "minimum") &&
            value < settings.minimum
        ) {
            errors.push(
                fieldName + " must be greater than or equal to " +
                settings.minimum + "."
            );
        }

        if (
            Object.prototype.hasOwnProperty.call(settings, "maximum") &&
            value > settings.maximum
        ) {
            errors.push(
                fieldName + " must be less than or equal to " +
                settings.maximum + "."
            );
        }

        return result(errors.length === 0, errors);
    }

    function validateEnum(value, allowedValues, fieldName) {
        const errors = [];

        if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
            errors.push(fieldName + " validation has no allowed values.");
            return result(false, errors);
        }

        if (!allowedValues.includes(value)) {
            errors.push(
                fieldName + " must be one of: " +
                allowedValues.join(", ") + "."
            );
        }

        return result(errors.length === 0, errors);
    }

    function validateComparisonValue(predicate, errors) {
        if (
            !Object.prototype.hasOwnProperty.call(
                predicate,
                "comparisonValue"
            )
        ) {
            errors.push(
                "predicate.comparisonValue is required."
            );
            return;
        }

        const comparisonValue = predicate.comparisonValue;

        if (predicate.operator === "IN") {
            if (!Array.isArray(comparisonValue)) {
                errors.push(
                    "predicate.comparisonValue must be an array when operator is IN."
                );
                return;
            }

            comparisonValue.forEach(function (value, index) {
                if (
                    predicate.valueType === "integer" &&
                    !Number.isInteger(value)
                ) {
                    errors.push(
                        "predicate.comparisonValue[" +
                        index +
                        "] must be an integer."
                    );
                }
                else if (
                    predicate.valueType === "string" &&
                    typeof value !== "string"
                ) {
                    errors.push(
                        "predicate.comparisonValue[" +
                        index +
                        "] must be a string."
                    );
                }
                else if (
                    predicate.valueType === "boolean" &&
                    typeof value !== "boolean"
                ) {
                    errors.push(
                        "predicate.comparisonValue[" +
                        index +
                        "] must be a boolean."
                    );
                }
            });

            return;
        }

        if (
            predicate.valueType === "integer" &&
            !Number.isInteger(comparisonValue)
        ) {
            errors.push(
                "predicate.comparisonValue must be an integer."
            );
        }
        else if (
            predicate.valueType === "string" &&
            typeof comparisonValue !== "string"
        ) {
            errors.push(
                "predicate.comparisonValue must be a string."
            );
        }
        else if (
            predicate.valueType === "boolean" &&
            typeof comparisonValue !== "boolean"
        ) {
            errors.push(
                "predicate.comparisonValue must be a boolean."
            );
        }
    }

    function validateTypedPredicate(predicate) {
        const errors = [];

        if (!isPlainObject(predicate)) {
            return result(false, [
                "Predicate must be a plain object."
            ]);
        }

        const fieldCheck = validateNonEmptyString(
            predicate.field,
            "predicate.field"
        );

        errors.push.apply(errors, fieldCheck.errors);

        const operatorCheck = validateEnum(
            predicate.operator,
            OPERATORS,
            "predicate.operator"
        );

        errors.push.apply(errors, operatorCheck.errors);

        const typeCheck = validateEnum(
            predicate.valueType,
            VALUE_TYPES,
            "predicate.valueType"
        );

        errors.push.apply(errors, typeCheck.errors);

        if (
            Object.prototype.hasOwnProperty.call(
                predicate,
                "groupOperator"
            )
        ) {
            const groupCheck = validateEnum(
                predicate.groupOperator,
                GROUP_OPERATORS,
                "predicate.groupOperator"
            );

            errors.push.apply(errors, groupCheck.errors);
        }

        validateComparisonValue(predicate, errors);

        return result(errors.length === 0, errors);
    }

    function legacyScopeConstraints(scope) {
        const constraints = [];

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "maximumAmountCents"
            )
        ) {
            constraints.push({
                field: "amountCents",
                operator: "LTE",
                comparisonValue: scope.maximumAmountCents,
                valueType: "integer",
                legacyField: "maximumAmountCents",
                failureReason:
                    "Requested amount exceeds the current authorized maximum."
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "allowedRiskLevels"
            )
        ) {
            constraints.push({
                field: "customerRisk",
                operator: "IN",
                comparisonValue:
                    Array.isArray(scope.allowedRiskLevels)
                        ? scope.allowedRiskLevels.slice()
                        : scope.allowedRiskLevels,
                valueType: "string",
                legacyField: "allowedRiskLevels",
                failureReason:
                    "Requested customer risk is outside the current authority scope."
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "maximumTransactionAgeDays"
            )
        ) {
            constraints.push({
                field: "transactionAgeDays",
                operator: "LTE",
                comparisonValue:
                    scope.maximumTransactionAgeDays,
                valueType: "integer",
                legacyField: "maximumTransactionAgeDays",
                failureReason:
                    "Transaction age exceeds the current authority scope."
            });
        }

        return constraints;
    }

    function normalizeAuthorityScope(scope) {
        const errors = [];

        if (!isPlainObject(scope)) {
            return Object.freeze({
                valid: false,
                errors: Object.freeze([
                    "Authority scope must be a plain object."
                ]),
                constraints: Object.freeze([])
            });
        }

        let constraints;

        if (
            Object.prototype.hasOwnProperty.call(
                scope,
                "constraints"
            )
        ) {
            if (!Array.isArray(scope.constraints)) {
                return Object.freeze({
                    valid: false,
                    errors: Object.freeze([
                        "scope.constraints must be an array."
                    ]),
                    constraints: Object.freeze([])
                });
            }

            constraints = scope.constraints.map(function (constraint) {
                return Object.assign({}, constraint);
            });
        }
        else {
            constraints = legacyScopeConstraints(scope);
        }

        constraints.forEach(function (constraint, index) {
            const check = validateTypedPredicate(constraint);

            check.errors.forEach(function (error) {
                errors.push(
                    "scope.constraints[" + index + "]: " + error
                );
            });
        });

        return Object.freeze({
            valid: errors.length === 0,
            errors: Object.freeze(errors.slice()),
            constraints: Object.freeze(
                constraints.map(function (constraint) {
                    return Object.freeze(
                        Object.assign({}, constraint)
                    );
                })
            )
        });
    }

    root.ValidationEngine = Object.freeze({
        VALUE_TYPES: VALUE_TYPES,
        OPERATORS: OPERATORS,
        GROUP_OPERATORS: GROUP_OPERATORS,
        isPlainObject: isPlainObject,
        validateNonEmptyString: validateNonEmptyString,
        validateInteger: validateInteger,
        validateEnum: validateEnum,
        validateTypedPredicate: validateTypedPredicate,
        normalizeAuthorityScope: normalizeAuthorityScope
    });
}(window));