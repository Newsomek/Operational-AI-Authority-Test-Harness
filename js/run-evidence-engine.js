(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const assertions =
        root.ControlAssertionEngine;

    if (!assertions) {
        throw new Error(
            "ControlAssertionEngine must be loaded before RunEvidenceEngine."
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

    function compareExpectedActual(
        expectedResult,
        actualResult
    ) {
        if (
            !expectedResult ||
            typeof expectedResult !== "object"
        ) {
            throw new Error(
                "Expected result must be an object."
            );
        }

        if (
            expectedResult.declaredBeforeExecution !== true
        ) {
            throw new Error(
                "Expected result must be declared before execution."
            );
        }

        const comparison =
            expectedResult.expectedExecutionResult ===
            actualResult
                ? "MATCH"
                : "MISMATCH";

        return deepFreeze({
            expected:
                expectedResult.expectedExecutionResult,
            actual:
                actualResult,
            comparison:
                comparison
        });
    }

    function evaluateAssertions(
        assertionDefinitions,
        assertionEvidence
    ) {
        if (!Array.isArray(assertionDefinitions)) {
            throw new Error(
                "Control assertion definitions must be an array."
            );
        }

        return assertionDefinitions.map(
            function (definition) {
                const evidence =
                    assertionEvidence[
                        definition.assertionId
                    ];

                if (!evidence) {
                    throw new Error(
                        "Missing evidence for control assertion: " +
                        definition.assertionId
                    );
                }

                return assertions.evaluate(
                    definition,
                    evidence
                );
            }
        );
    }

    function createRunRecord(input) {
        const predictionComparison =
            compareExpectedActual(
                input.expectedResult,
                input.actualResult
            );

        const controlAssertionResults =
            evaluateAssertions(
                input.controlAssertions,
                input.assertionEvidence
            );

        const record = {
            runId:
                input.runId,
            scenarioSnapshot:
                deepClone(
                    input.scenarioSnapshot
                ),
            scenarioVersion:
                input.scenarioVersion,
            policyVersion:
                input.policyVersion,
            controlRun:
                deepClone(
                    input.controlRun || null
                ),
            authorityHistory:
                deepClone(
                    input.authorityHistory || []
                ),
            decisionHistory:
                deepClone(
                    input.decisionHistory || []
                ),
            eventLog:
                deepClone(
                    input.eventLog || []
                ),
            executionAttempts:
                deepClone(
                    input.executionAttempts || []
                ),
            expectedResult:
                deepClone(
                    input.expectedResult
                ),
            actualResult:
                input.actualResult,
            predictionComparison:
                predictionComparison,
            controlAssertions:
                deepClone(
                    input.controlAssertions
                ),
            controlAssertionResults:
                deepClone(
                    controlAssertionResults
                ),
            replayInputs:
                deepClone(
                    input.replayInputs || []
                )
        };

        return deepFreeze(record);
    }

    root.RunEvidenceEngine = Object.freeze({
        compareExpectedActual:
            compareExpectedActual,
        evaluateAssertions:
            evaluateAssertions,
        createRunRecord:
            createRunRecord
    });
}(window));