(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const boundary =
        root.BoundaryEngine;

    const execution =
        root.ExecutionEngine;

    const assertions =
        root.ControlAssertionEngine;

    const runEvidence =
        root.RunEvidenceEngine;

    if (
        !boundary ||
        !execution ||
        !assertions ||
        !runEvidence
    ) {
        throw new Error(
            "BoundaryEngine, ExecutionEngine, ControlAssertionEngine, and RunEvidenceEngine must load before ControlRunEngine."
        );
    }

    function deepClone(value) {
        return JSON.parse(
            JSON.stringify(value)
        );
    }

    function deepFreeze(value) {
        if (
            value === null ||
            typeof value !== "object"
        ) {
            return value;
        }

        Object.freeze(value);

        Object.keys(value).forEach(
            function (key) {
                if (
                    value[key] !== null &&
                    typeof value[key] === "object" &&
                    !Object.isFrozen(value[key])
                ) {
                    deepFreeze(value[key]);
                }
            }
        );

        return value;
    }

    function buildRequestedAction(
        requestedAction,
        priorConditions
    ) {
        const action =
            deepClone(
                requestedAction
            );

        if (
            typeof priorConditions.refundAmountCents ===
            "number"
        ) {
            action.amountCents =
                priorConditions.refundAmountCents;
        }

        if (
            typeof priorConditions.customerRisk ===
            "string"
        ) {
            action.customerRisk =
                priorConditions.customerRisk;
        }

        if (
            typeof priorConditions.transactionAgeDays ===
            "number"
        ) {
            action.transactionAgeDays =
                priorConditions.transactionAgeDays;
        }

        return action;
    }

    function run(input) {
        if (
            !input.priorAuthority ||
            input.priorAuthority.status !==
                "ACTIVE"
        ) {
            throw new Error(
                "Baseline control run requires ACTIVE initial authority."
            );
        }

        if (
            !input.initialTechnicalValidity ||
            typeof input.initialTechnicalValidity.status !==
                "string"
        ) {
            throw new Error(
                "Baseline control run requires explicit initial technical validity."
            );
        }

        if (!input.controlExpectedResult) {
            throw new Error(
                "Baseline control run requires a predeclared expected result."
            );
        }

        const controlBoundary =
            boundary.createBoundary(
                input.priorAuthority
            );

        if (!controlBoundary.boundaryCreated) {
            throw new Error(
                "Initial ACTIVE authority failed to create the baseline enforceable boundary."
            );
        }

        const requestedAction =
            input.controlRequestedAction
                ? deepClone(input.controlRequestedAction)
                : buildRequestedAction(
                    input.requestedAction,
                    input.priorConditions
                );

        const executionResult =
            execution.evaluateExecution({
                requestedAction:
                    requestedAction,
                boundary:
                    controlBoundary.boundary,
                technicalCapability:
                    input.technicalCapability,
                technicalValidity:
                    input.initialTechnicalValidity,
                conditionValues:
                    input.priorConditions
            });

        const expectedVsActual =
            runEvidence.compareExpectedActual(
                input.controlExpectedResult,
                executionResult.result
            );

        let controlAssertion;

        if (input.controlAssertion) {
            const parameters =
                input.controlAssertion.parameters || {};

            controlAssertion = assertions.evaluate(
                input.controlAssertion,
                {
                    boundaryConstraints:
                        controlBoundary.boundary.scope.constraints || [],
                    actualValue:
                        requestedAction[parameters.field],
                    executionResult:
                        executionResult.result
                }
            );
        }
        else {
            controlAssertion = assertions.evaluate(
                {
                    assertionId:
                        "CONTROL-INITIAL-BOUNDARY",
                    ruleReference:
                        "ACTIVE_BOUNDARY_MAXIMUM",
                    assertionVersion:
                        "1",
                    parameters: {
                        maximumAmountCents:
                            input.priorAuthority.scope.maximumAmountCents
                    }
                },
                {
                    boundaryMaximumAmountCents:
                        controlBoundary.boundary.scope.maximumAmountCents,
                    requestedAmountCents:
                        requestedAction.amountCents,
                    executionResult:
                        executionResult.result
                }
            );
        }

        return deepFreeze({
            authority:
                deepClone(
                    input.priorAuthority
                ),

            boundaryResult:
                controlBoundary,

            requestedAction:
                requestedAction,

            technicalCapability:
                deepClone(
                    input.technicalCapability
                ),

            technicalValidity:
                deepClone(
                    input.initialTechnicalValidity
                ),

            executionResult:
                executionResult,

            expectedResult:
                deepClone(
                    input.controlExpectedResult
                ),

            expectedVsActual:
                expectedVsActual,

            controlAssertion:
                controlAssertion
        });
    }

    root.ControlRunEngine = Object.freeze({
        run:
            run
    });
}(window));