(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const materiality =
        root.MaterialityEngine;

    const state =
        root.StateMachine;

    const authority =
        root.AuthorityEngine;

    const boundary =
        root.BoundaryEngine;

    const execution =
        root.ExecutionEngine;

    if (
        !materiality ||
        !state ||
        !authority ||
        !boundary ||
        !execution
    ) {
        throw new Error(
            "Core engines must be loaded before TestRunner."
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

    function invalidateAuthority(
        priorAuthority,
        invalidatedByEventId
    ) {
        const invalidated =
            deepClone(priorAuthority);

        invalidated.status =
            state.AUTHORITY_STATUS.INVALID;

        invalidated.invalidatedByEventId =
            invalidatedByEventId;

        return deepFreeze(invalidated);
    }

    function evaluateConditionChange(input) {
        const materialityResult =
            materiality.evaluateMateriality({
                priorConditions:
                    input.priorConditions,
                currentConditions:
                    input.currentConditions,
                rules:
                    input.materialityRules
            });

        if (
            materialityResult.result ===
            materiality.MATERIALITY_RESULT.NON_MATERIAL
        ) {
            return deepFreeze({
                materiality:
                    materialityResult,
                currentAuthority:
                    deepFreeze(
                        deepClone(
                            input.priorAuthority
                        )
                    ),
                workflowState:
                    state.WORKFLOW_STATE.STABLE,
                executionState:
                    state.EXECUTION_STATE.NOT_ATTEMPTED,
                technicalRevalidation:
                    input.technicalRevalidation
            });
        }

        if (
            materialityResult.result ===
            materiality.MATERIALITY_RESULT.AMBIGUOUS
        ) {
            return deepFreeze({
                materiality:
                    materialityResult,
                currentAuthority:
                    deepFreeze(
                        deepClone(
                            input.priorAuthority
                        )
                    ),
                workflowState:
                    state.WORKFLOW_STATE.DECISION_PENDING,
                executionState:
                    state.EXECUTION_STATE.BLOCKED,
                technicalRevalidation:
                    input.technicalRevalidation
            });
        }

        const invalidAuthority =
            invalidateAuthority(
                input.priorAuthority,
                input.invalidationEventId
            );

        return deepFreeze({
            materiality:
                materialityResult,
            currentAuthority:
                invalidAuthority,
            workflowState:
                state.WORKFLOW_STATE.REAUTHORIZATION_REQUIRED,
            executionState:
                state.EXECUTION_STATE.BLOCKED,
            technicalRevalidation:
                input.technicalRevalidation
        });
    }

    function performReauthorization(input) {
        if (
            input.currentAuthority.status !==
            state.AUTHORITY_STATUS.INVALID
        ) {
            throw new Error(
                "Reauthorization requires INVALID current authority."
            );
        }

        const translation =
            authority.translateDecision(
                input.currentAuthority,
                input.decision
            );

        if (!translation.authorityCreated) {
            return deepFreeze({
                translation: translation,
                boundaryResult: null,
                executionResult: {
                    result: "BLOCK",
                    reason:
                        "No executable authority was created by the governance decision.",
                    boundaryId: null
                }
            });
        }

        const boundaryResult =
            boundary.createBoundary(
                translation.authority
            );

        if (!boundaryResult.boundaryCreated) {
            return deepFreeze({
                translation: translation,
                boundaryResult: boundaryResult,
                executionResult: {
                    result: "BLOCK",
                    reason:
                        "No enforceable boundary was created.",
                    boundaryId: null
                }
            });
        }

        const executionResult =
            execution.evaluateExecution({
                requestedAction:
                    input.requestedAction,
                boundary:
                    boundaryResult.boundary,
                technicalCapability:
                    input.technicalCapability,
                technicalValidity:
                    input.technicalRevalidation,
                conditionValues:
                    input.conditionValues
            });

        return deepFreeze({
            translation: translation,
            boundaryResult:
                boundaryResult,
            executionResult:
                executionResult
        });
    }

    function runCoreExperiment(input) {
        const changedState =
            evaluateConditionChange(input);

        if (
            changedState.materiality.result !==
            materiality.MATERIALITY_RESULT.MATERIAL
        ) {
            return deepFreeze({
                changedState:
                    changedState,
                reauthorization:
                    null
            });
        }

        const reauthorization =
            performReauthorization({
                currentAuthority:
                    changedState.currentAuthority,
                decision:
                    input.decision,
                requestedAction:
                    input.requestedAction,
                technicalCapability:
                    input.technicalCapability,
                technicalRevalidation:
                    input.technicalRevalidation,
                conditionValues:
                    input.currentConditions
            });

        return deepFreeze({
            changedState:
                changedState,
            reauthorization:
                reauthorization
        });
    }

    root.TestRunner = Object.freeze({
        invalidateAuthority:
            invalidateAuthority,
        evaluateConditionChange:
            evaluateConditionChange,
        performReauthorization:
            performReauthorization,
        runCoreExperiment:
            runCoreExperiment
    });
}(window));