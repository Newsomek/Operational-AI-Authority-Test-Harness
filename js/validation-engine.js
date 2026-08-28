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

        if (
            !Object.prototype.hasOwnProperty.call(
                predicate,
                "comparisonValue"
            )
        ) {
            errors.push(
                "predicate.comparisonValue is required."
            );
        }
        else if (predicate.valueType === "integer") {
            if (!Number.isInteger(predicate.comparisonValue)) {
                errors.push(
                    "predicate.comparisonValue must be an integer."
                );
            }
        }
        else if (predicate.valueType === "string") {
            if (typeof predicate.comparisonValue !== "string") {
                errors.push(
                    "predicate.comparisonValue must be a string."
                );
            }
        }
        else if (predicate.valueType === "boolean") {
            if (typeof predicate.comparisonValue !== "boolean") {
                errors.push(
                    "predicate.comparisonValue must be a boolean."
                );
            }
        }

        if (
            predicate.operator === "IN" &&
            !Array.isArray(predicate.comparisonValue)
        ) {
            errors.push(
                "predicate.comparisonValue must be an array when operator is IN."
            );
        }

        return result(errors.length === 0, errors);
    }

    root.ValidationEngine = Object.freeze({
        VALUE_TYPES: VALUE_TYPES,
        OPERATORS: OPERATORS,
        GROUP_OPERATORS: GROUP_OPERATORS,
        isPlainObject: isPlainObject,
        validateNonEmptyString: validateNonEmptyString,
        validateInteger: validateInteger,
        validateEnum: validateEnum,
        validateTypedPredicate: validateTypedPredicate
    });
}(window));