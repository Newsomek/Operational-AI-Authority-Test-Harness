(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const ASSERTION_RESULT = Object.freeze({
        PASS: "PASS",
        FAIL: "FAIL"
    });

    const RULES = Object.freeze({
        INVALID_AUTHORITY_BLOCKS:
            "INVALID_AUTHORITY_BLOCKS",

        ACTIVE_BOUNDARY_MAXIMUM:
            "ACTIVE_BOUNDARY_MAXIMUM",

        NO_AUTHORITY_BLOCKS:
            "NO_AUTHORITY_BLOCKS",

        SUSPENDED_AUTHORITY_NO_BOUNDARY:
            "SUSPENDED_AUTHORITY_NO_BOUNDARY"
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

    function result(assertion, passed, observed) {
        return deepFreeze({
            assertionId:
                assertion.assertionId,
            ruleReference:
                assertion.ruleReference,
            assertionVersion:
                assertion.assertionVersion,
            result:
                passed
                    ? ASSERTION_RESULT.PASS
                    : ASSERTION_RESULT.FAIL,
            observed:
                deepClone(observed)
        });
    }

    function evaluateInvalidAuthorityBlocks(
        assertion,
        evidence
    ) {
        const observed = {
            authorityStatus:
                evidence.authorityStatus,
            executionResult:
                evidence.executionResult
        };

        const passed =
            evidence.authorityStatus === "INVALID" &&
            evidence.executionResult === "BLOCK";

        return result(
            assertion,
            passed,
            observed
        );
    }

    function evaluateActiveBoundaryMaximum(
        assertion,
        evidence
    ) {
        const expectedMaximum =
            assertion.parameters.maximumAmountCents;

        const requestedAmount =
            evidence.requestedAmountCents;

        const expectedExecution =
            requestedAmount <= expectedMaximum
                ? "ALLOW"
                : "BLOCK";

        const observed = {
            boundaryMaximumAmountCents:
                evidence.boundaryMaximumAmountCents,
            requestedAmountCents:
                requestedAmount,
            executionResult:
                evidence.executionResult,
            normativeExpectedExecution:
                expectedExecution
        };

        const passed =
            evidence.boundaryMaximumAmountCents ===
                expectedMaximum &&
            evidence.executionResult ===
                expectedExecution;

        return result(
            assertion,
            passed,
            observed
        );
    }

    function evaluateNoAuthorityBlocks(
        assertion,
        evidence
    ) {
        const observed = {
            authorityCreated:
                evidence.authorityCreated,
            executionResult:
                evidence.executionResult
        };

        const passed =
            evidence.authorityCreated === false &&
            evidence.executionResult === "BLOCK";

        return result(
            assertion,
            passed,
            observed
        );
    }

    function evaluateSuspendedNoBoundary(
        assertion,
        evidence
    ) {
        const observed = {
            authorityStatus:
                evidence.authorityStatus,
            boundaryCreated:
                evidence.boundaryCreated,
            executionResult:
                evidence.executionResult
        };

        const passed =
            evidence.authorityStatus === "SUSPENDED" &&
            evidence.boundaryCreated === false &&
            evidence.executionResult === "BLOCK";

        return result(
            assertion,
            passed,
            observed
        );
    }

    function evaluate(assertion, evidence) {
        if (
            !assertion ||
            typeof assertion !== "object"
        ) {
            throw new Error(
                "Control assertion must be an object."
            );
        }

        if (
            !evidence ||
            typeof evidence !== "object"
        ) {
            throw new Error(
                "Control assertion evidence must be an object."
            );
        }

        if (
            assertion.ruleReference ===
            RULES.INVALID_AUTHORITY_BLOCKS
        ) {
            return evaluateInvalidAuthorityBlocks(
                assertion,
                evidence
            );
        }

        if (
            assertion.ruleReference ===
            RULES.ACTIVE_BOUNDARY_MAXIMUM
        ) {
            return evaluateActiveBoundaryMaximum(
                assertion,
                evidence
            );
        }

        if (
            assertion.ruleReference ===
            RULES.NO_AUTHORITY_BLOCKS
        ) {
            return evaluateNoAuthorityBlocks(
                assertion,
                evidence
            );
        }

        if (
            assertion.ruleReference ===
            RULES.SUSPENDED_AUTHORITY_NO_BOUNDARY
        ) {
            return evaluateSuspendedNoBoundary(
                assertion,
                evidence
            );
        }

        throw new Error(
            "Unsupported control assertion rule: " +
            String(assertion.ruleReference)
        );
    }

    root.ControlAssertionEngine = Object.freeze({
        ASSERTION_RESULT:
            ASSERTION_RESULT,
        RULES:
            RULES,
        evaluate:
            evaluate
    });
}(window));