(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const MATERIALITY_RESULT = Object.freeze({
        MATERIAL: "MATERIAL",
        NON_MATERIAL: "NON_MATERIAL",
        AMBIGUOUS: "AMBIGUOUS"
    });

    const RULE_TYPES = Object.freeze({
        FIELD_TRANSITION: "FIELD_TRANSITION",
        NUMERIC_THRESHOLD_CROSSING: "NUMERIC_THRESHOLD_CROSSING"
    });

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

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function requireResult(result) {
        const allowed = Object.keys(
            MATERIALITY_RESULT
        ).map(function (key) {
            return MATERIALITY_RESULT[key];
        });

        if (!allowed.includes(result)) {
            throw new Error(
                "Unsupported materiality result: " +
                String(result)
            );
        }
    }

    function evaluateFieldTransition(
        rule,
        priorConditions,
        currentConditions
    ) {
        const priorValue =
            priorConditions[rule.field];

        const currentValue =
            currentConditions[rule.field];

        if (
            priorValue === rule.from &&
            currentValue === rule.to
        ) {
            return rule.result;
        }

        return null;
    }

    function evaluateNumericThresholdCrossing(
        rule,
        priorConditions,
        currentConditions
    ) {
        const priorValue =
            priorConditions[rule.field];

        const currentValue =
            currentConditions[rule.field];

        if (
            typeof priorValue !== "number" ||
            typeof currentValue !== "number" ||
            typeof rule.threshold !== "number"
        ) {
            return null;
        }

        if (
            rule.direction === "ABOVE" &&
            priorValue <= rule.threshold &&
            currentValue > rule.threshold
        ) {
            return rule.result;
        }

        if (
            rule.direction === "BELOW" &&
            priorValue >= rule.threshold &&
            currentValue < rule.threshold
        ) {
            return rule.result;
        }

        return null;
    }

    function evaluateRule(
        rule,
        priorConditions,
        currentConditions
    ) {
        if (!isPlainObject(rule)) {
            throw new Error(
                "Materiality rule must be an object."
            );
        }

        requireResult(rule.result);

        if (
            rule.type ===
            RULE_TYPES.FIELD_TRANSITION
        ) {
            return evaluateFieldTransition(
                rule,
                priorConditions,
                currentConditions
            );
        }

        if (
            rule.type ===
            RULE_TYPES.NUMERIC_THRESHOLD_CROSSING
        ) {
            return evaluateNumericThresholdCrossing(
                rule,
                priorConditions,
                currentConditions
            );
        }

        throw new Error(
            "Unsupported materiality rule type: " +
            String(rule.type)
        );
    }

    function evaluateMateriality(input) {
        if (!isPlainObject(input)) {
            throw new Error(
                "Materiality input must be an object."
            );
        }

        if (!isPlainObject(input.priorConditions)) {
            throw new Error(
                "priorConditions must be an object."
            );
        }

        if (!isPlainObject(input.currentConditions)) {
            throw new Error(
                "currentConditions must be an object."
            );
        }

        if (!Array.isArray(input.rules)) {
            throw new Error(
                "rules must be an array."
            );
        }

        const matchedRules = [];

        input.rules.forEach(function (rule) {
            const result = evaluateRule(
                rule,
                input.priorConditions,
                input.currentConditions
            );

            if (result !== null) {
                matchedRules.push({
                    ruleId: rule.ruleId,
                    result: result
                });
            }
        });

        if (matchedRules.length === 0) {
            return deepFreeze({
                result:
                    MATERIALITY_RESULT.NON_MATERIAL,
                matchedRules: []
            });
        }

        const results = matchedRules.map(function (item) {
            return item.result;
        });

        if (
            results.includes(
                MATERIALITY_RESULT.AMBIGUOUS
            )
        ) {
            return deepFreeze({
                result:
                    MATERIALITY_RESULT.AMBIGUOUS,
                matchedRules: matchedRules
            });
        }

        if (
            results.includes(
                MATERIALITY_RESULT.MATERIAL
            )
        ) {
            return deepFreeze({
                result:
                    MATERIALITY_RESULT.MATERIAL,
                matchedRules: matchedRules
            });
        }

        return deepFreeze({
            result:
                MATERIALITY_RESULT.NON_MATERIAL,
            matchedRules: matchedRules
        });
    }

    root.MaterialityEngine = Object.freeze({
        MATERIALITY_RESULT:
            MATERIALITY_RESULT,
        RULE_TYPES:
            RULE_TYPES,
        evaluateMateriality:
            evaluateMateriality
    });
}(window));