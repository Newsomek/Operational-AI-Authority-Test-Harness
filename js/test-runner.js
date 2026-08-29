(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const materiality =
        root.MaterialityEngine;

    const controlRunEngine =
        root.ControlRunEngine;

    const architectureEngine =
        root.ArchitectureEngine;

    const state =
        root.StateMachine;

    const governance =
        root.GovernanceDecisionEngine;

    const boundary =
        root.BoundaryEngine;

    const execution =
        root.ExecutionEngine;

    const eventLogFactory =
        root.EventLog;

    const runEvidence =
        root.RunEvidenceEngine;

    if (
        !materiality ||
        !controlRunEngine ||
        !architectureEngine ||
        !state ||
        !governance ||
        !boundary ||
        !execution ||
        !eventLogFactory ||
        !runEvidence
    ) {
        throw new Error(
            "Governed run engines must be loaded before TestRunner."
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

        return deepFreeze({
            materiality:
                materialityResult,
            currentAuthority:
                invalidateAuthority(
                    input.priorAuthority,
                    input.invalidationEventId
                ),
            workflowState:
                state.WORKFLOW_STATE.REAUTHORIZATION_REQUIRED,
            executionState:
                state.EXECUTION_STATE.BLOCKED,
            technicalRevalidation:
                input.technicalRevalidation
        });
    }

    function blockedResult(reason) {
        return deepFreeze({
            result: "BLOCK",
            reason: reason,
            boundaryId: null
        });
    }

    function performStableExecution(input) {
        const boundaryResult =
            boundary.createBoundary(
                input.currentAuthority
            );

        const executionResult =
            boundaryResult.boundaryCreated
                ? execution.evaluateExecution({
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
                })
                : blockedResult(
                    "No enforceable boundary was available for the unchanged authority."
                );

        return deepFreeze({
            decisionResult: {
                valid: true,
                skipped: true,
                reason:
                    "No reauthorization was required because the change was NON_MATERIAL.",
                translation: {
                    disposition:
                        "NO_REAUTHORIZATION_REQUIRED",
                    authorityCreated: false,
                    authority:
                        input.currentAuthority,
                    transferredDecisionOwner: null
                }
            },
            boundaryResult:
                boundaryResult,
            executionResult:
                executionResult
        });
    }

    function performGovernedTransition(input) {
        if (
            input.currentAuthority.status ===
            state.AUTHORITY_STATUS.ACTIVE
        ) {
            return performStableExecution(input);
        }

        return performGovernedReauthorization(input);
    }
    function performGovernedReauthorization(input) {
        if (
            input.currentAuthority.status !==
            state.AUTHORITY_STATUS.INVALID
        ) {
            throw new Error(
                "Reauthorization requires INVALID current authority."
            );
        }

        const decisionResult =
            governance.decide({
                actor:
                    input.actor,
                evidenceItems:
                    input.evidenceItems,
                requiredEvidenceIds:
                    input.requiredEvidenceIds,
                allowedDispositions:
                    input.allowedDispositions,
                currentAuthority:
                    input.currentAuthority,
                decision:
                    input.decision
            });

        if (!decisionResult.valid) {
            return deepFreeze({
                decisionResult:
                    decisionResult,
                boundaryResult:
                    null,
                executionResult:
                    blockedResult(
                        "Governance decision was invalid: " +
                        decisionResult.reason
                    )
            });
        }

        const translation =
            decisionResult.translation;

        if (!translation.authorityCreated) {
            return deepFreeze({
                decisionResult:
                    decisionResult,
                boundaryResult:
                    null,
                executionResult:
                    blockedResult(
                        "No executable authority was created by the governance decision."
                    )
            });
        }

        const boundaryResult =
            boundary.createBoundary(
                translation.authority
            );

        if (!boundaryResult.boundaryCreated) {
            return deepFreeze({
                decisionResult:
                    decisionResult,
                boundaryResult:
                    boundaryResult,
                executionResult:
                    blockedResult(
                        "No enforceable boundary was created."
                    )
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
            decisionResult:
                decisionResult,
            boundaryResult:
                boundaryResult,
            executionResult:
                executionResult
        });
    }

    function buildAssertionEvidence(
        changedState,
        governedResult,
        input
    ) {
        const map =
            Object.create(null);

        input.controlAssertions.forEach(
            function (assertion) {
                if (
                    assertion.ruleReference ===
                    "INVALID_AUTHORITY_BLOCKS"
                ) {
                    map[
                        assertion.assertionId
                    ] = {
                        authorityStatus:
                            changedState.currentAuthority.status,
                        executionResult:
                            changedState.executionState ===
                                state.EXECUTION_STATE.BLOCKED
                                ? "BLOCK"
                                : "ALLOW"
                    };
                }
                else if (
                    assertion.ruleReference ===
                    "ACTIVE_BOUNDARY_MAXIMUM"
                ) {
                    map[
                        assertion.assertionId
                    ] = {
                        boundaryMaximumAmountCents:
                            governedResult.boundaryResult &&
                            governedResult.boundaryResult.boundary
                                ? governedResult.boundaryResult.boundary.scope.maximumAmountCents
                                : null,
                        requestedAmountCents:
                            input.requestedAction.amountCents,
                        executionResult:
                            governedResult.executionResult.result
                    };
                }
                else if (
                    assertion.ruleReference ===
                    "NO_AUTHORITY_BLOCKS"
                ) {
                    map[
                        assertion.assertionId
                    ] = {
                        authorityCreated:
                            governedResult.decisionResult.valid &&
                            governedResult.decisionResult.translation
                                ? governedResult.decisionResult.translation.authorityCreated
                                : false,
                        executionResult:
                            governedResult.executionResult.result
                    };
                }
                else if (
                    assertion.ruleReference ===
                    "SUSPENDED_AUTHORITY_NO_BOUNDARY"
                ) {
                    const translatedAuthority =
                        governedResult.decisionResult.valid &&
                        governedResult.decisionResult.translation
                            ? governedResult.decisionResult.translation.authority
                            : null;

                    map[
                        assertion.assertionId
                    ] = {
                        authorityStatus:
                            translatedAuthority
                                ? translatedAuthority.status
                                : null,
                        boundaryCreated:
                            governedResult.boundaryResult
                                ? governedResult.boundaryResult.boundaryCreated
                                : false,
                        executionResult:
                            governedResult.executionResult.result
                    };
                }
            }
        );

        return map;
    }

    function runGovernedExperiment(input) {
        const log =
            eventLogFactory.create();

        const replayInputs = [];

        function recordCommand(
            eventType,
            actorId,
            payload,
            priorState,
            newState,
            reason,
            evidenceReferences,
            authorityVersion
        ) {
            const replayCommandMap = {
                SCENARIO_STARTED:
                    "START_SCENARIO",
                CONDITION_CHANGED:
                    "CHANGE_CONDITION",
                TECHNICAL_REVALIDATION_RECORDED:
                    "RECORD_TECHNICAL_REVALIDATION",
                GOVERNANCE_DECISION_EVALUATED:
                    "SUBMIT_GOVERNANCE_DECISION",
                EXECUTION_EVALUATED:
                    "ATTEMPT_EXECUTION"
            };

            if (
                Object.prototype.hasOwnProperty.call(
                    replayCommandMap,
                    eventType
                )
            ) {
                replayInputs.push(
                    deepFreeze({
                        commandType:
                            replayCommandMap[eventType],
                        actorId:
                            actorId || null,
                        payload:
                            deepClone(payload || {})
                    })
                );
            }

            return log.append({
                eventType:
                    eventType,
                actorId:
                    actorId || null,
                priorState:
                    deepClone(priorState || null),
                newState:
                    deepClone(newState || null),
                reason:
                    reason || null,
                evidenceReferences:
                    deepClone(
                        evidenceReferences || []
                    ),
                authorityVersion:
                    authorityVersion || null,
                scenarioVersion:
                    input.scenarioVersion,
                policyVersion:
                    input.policyVersion
            });
        }

        recordCommand(
            "SCENARIO_STARTED",
            null,
            {
                runId:
                    input.runId
            },
            null,
            {
                authorityStatus:
                    input.priorAuthority.status,
                workflowState:
                    state.WORKFLOW_STATE.STABLE,
                executionState:
                    state.EXECUTION_STATE.NOT_ATTEMPTED
            },
            "Scenario run started.",
            [],
            input.priorAuthority.authorityVersion
        );

        const controlRun =
            controlRunEngine.run({
                priorAuthority:
                    input.priorAuthority,
                priorConditions:
                    input.priorConditions,
                requestedAction:
                    input.requestedAction,
                technicalCapability:
                    input.technicalCapability,
                initialTechnicalValidity:
                    input.initialTechnicalValidity,
                controlExpectedResult:
                    input.controlExpectedResult
            });

        log.append({
            eventType:
                "CONTROL_BOUNDARY_CREATED",
            actorId:
                null,
            priorState:
                null,
            newState: {
                boundaryId:
                    controlRun.boundaryResult.boundary.boundaryId
            },
            reason:
                "Initial ACTIVE authority produced the baseline enforceable boundary.",
            evidenceReferences: [],
            authorityVersion:
                input.priorAuthority.authorityVersion,
            scenarioVersion:
                input.scenarioVersion,
            policyVersion:
                input.policyVersion
        });

        log.append({
            eventType:
                "CONTROL_EXECUTION_EVALUATED",
            actorId:
                null,
            priorState:
                null,
            newState: {
                executionResult:
                    controlRun.executionResult.result,
                boundaryId:
                    controlRun.executionResult.boundaryId
            },
            reason:
                controlRun.executionResult.reason,
            evidenceReferences: [],
            authorityVersion:
                input.priorAuthority.authorityVersion,
            scenarioVersion:
                input.scenarioVersion,
            policyVersion:
                input.policyVersion
        });

        recordCommand(
            "CONDITION_CHANGED",
            null,
            {
                priorConditions:
                    input.priorConditions,
                currentConditions:
                    input.currentConditions,
                invalidationEventId:
                    input.invalidationEventId
            },
            input.priorConditions,
            input.currentConditions,
            "Configured experimental condition changed.",
            [],
            input.priorAuthority.authorityVersion
        );

        const changedState =
            evaluateConditionChange(input);

        recordCommand(
            "MATERIALITY_EVALUATED",
            input.materialityActorId || null,
            {
                rules:
                    input.materialityRules
            },
            {
                workflowState:
                    state.WORKFLOW_STATE.MATERIALITY_REVIEW_REQUIRED
            },
            {
                materiality:
                    changedState.materiality.result,
                workflowState:
                    changedState.workflowState
            },
            "Materiality evaluated from configured rules.",
            [],
            changedState.currentAuthority.authorityVersion
        );

        if (
            changedState.materiality.result ===
            materiality.MATERIALITY_RESULT.MATERIAL
        ) {
            recordCommand(
                "AUTHORITY_INVALIDATED",
                null,
                {
                    invalidationEventId:
                        input.invalidationEventId
                },
                {
                    authorityStatus:
                        input.priorAuthority.status
                },
                {
                    authorityStatus:
                        changedState.currentAuthority.status
                },
                "Material change invalidated prior authority.",
                [],
                changedState.currentAuthority.authorityVersion
            );
        }

        recordCommand(
            "TECHNICAL_REVALIDATION_RECORDED",
            input.revalidationActorId || null,
            {
                technicalRevalidation:
                    input.technicalRevalidation
            },
            null,
            {
                technicalValidity:
                    input.technicalRevalidation.status
            },
            "Technical revalidation recorded independently of authority.",
            input.technicalRevalidation.evidenceReferences || [],
            changedState.currentAuthority.authorityVersion
        );

        const architectureContext =
            architectureEngine.resolve({
                reauthorizationArchitecture:
                    input.reauthorizationArchitecture,
                operationalActor:
                    input.operationalActor ||
                    input.decisionActor,
                designatedAuthorityOwner:
                    input.designatedAuthorityOwner,
                decisionActor:
                    input.decisionActor,
                separationReason:
                    input.separationReason
            });

        recordCommand(
            "ARCHITECTURE_RESOLVED",
            architectureContext.decisionActor.actorId,
            {
                architecture:
                    architectureContext.architecture,
                topology:
                    architectureContext.topology,
                authorityMoved:
                    architectureContext.authorityMoved,
                movementReason:
                    architectureContext.movementReason
            },
            {
                workflowState:
                    changedState.workflowState
            },
            {
                decisionActorId:
                    architectureContext.decisionActor.actorId
            },
            architectureContext.description,
            [],
            changedState.currentAuthority.authorityVersion
        );

        const governedResult =
            performGovernedTransition({
                currentAuthority:
                    changedState.currentAuthority,
                actor:
                    architectureContext.decisionActor,
                evidenceItems:
                    input.evidenceItems,
                requiredEvidenceIds:
                    input.requiredEvidenceIds,
                allowedDispositions:
                    input.allowedDispositions,
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

        if (!governedResult.decisionResult.skipped) {
        recordCommand(
            "GOVERNANCE_DECISION_EVALUATED",
            architectureContext.decisionActor.actorId,
            {
                decision:
                    input.decision
            },
            {
                workflowState:
                    changedState.workflowState,
                authorityStatus:
                    changedState.currentAuthority.status
            },
            {
                decisionValid:
                    governedResult.decisionResult.valid
            },
            governedResult.decisionResult.valid
                ? "Governance decision validated."
                : governedResult.decisionResult.reason,
            input.decision.evidenceReviewed || [],
            changedState.currentAuthority.authorityVersion
        );
        }

        const translation =
            governedResult.decisionResult.valid
                ? governedResult.decisionResult.translation
                : null;

        if (
            translation &&
            translation.authorityCreated
        ) {
            recordCommand(
                "AUTHORITY_CREATED",
                architectureContext.decisionActor.actorId,
                {
                    disposition:
                        input.decision.disposition
                },
                {
                    authorityStatus:
                        changedState.currentAuthority.status
                },
                {
                    authorityStatus:
                        translation.authority.status,
                    authorityVersion:
                        translation.authority.authorityVersion
                },
                "Governance decision created a new authority version.",
                input.decision.evidenceReviewed || [],
                translation.authority.authorityVersion
            );
        }

        if (
            governedResult.boundaryResult &&
            governedResult.boundaryResult.boundaryCreated
        ) {
            recordCommand(
                "BOUNDARY_CREATED",
                null,
                {
                    authorityId:
                        governedResult.boundaryResult.boundary.sourceAuthorityId
                },
                null,
                {
                    boundaryId:
                        governedResult.boundaryResult.boundary.boundaryId
                },
                "Current authority produced an enforceable boundary.",
                [],
                translation.authority.authorityVersion
            );
        }

        recordCommand(
            "EXECUTION_EVALUATED",
            null,
            {
                requestedAction:
                    input.requestedAction
            },
            null,
            {
                executionResult:
                    governedResult.executionResult.result,
                boundaryId:
                    governedResult.executionResult.boundaryId
            },
            governedResult.executionResult.reason,
            [],
            translation && translation.authority
                ? translation.authority.authorityVersion
                : changedState.currentAuthority.authorityVersion
        );

        const authorityHistory = [
            deepClone(
                input.priorAuthority
            ),
            deepClone(
                changedState.currentAuthority
            )
        ];

        if (
            translation &&
            translation.authorityCreated
        ) {
            authorityHistory.push(
                deepClone(
                    translation.authority
                )
            );
        }

        const decisionHistory = [
            deepClone(
                input.decision
            )
        ];

        const executionAttempts = [
            {
                requestedAction:
                    deepClone(
                        input.requestedAction
                    ),
                boundaryId:
                    governedResult.executionResult.boundaryId,
                technicalCapability:
                    deepClone(
                        input.technicalCapability
                    ),
                technicalValidity:
                    deepClone(
                        input.technicalRevalidation
                    ),
                result:
                    governedResult.executionResult.result,
                reason:
                    governedResult.executionResult.reason
            }
        ];

        const assertionEvidence =
            buildAssertionEvidence(
                changedState,
                governedResult,
                input
            );

        const runRecord =
            runEvidence.createRunRecord({
                runId:
                    input.runId,
                scenarioSnapshot:
                    input.scenarioSnapshot,
                scenarioVersion:
                    input.scenarioVersion,
                policyVersion:
                    input.policyVersion,
                controlRun:
                    controlRun,
                authorityHistory:
                    authorityHistory,
                decisionHistory:
                    decisionHistory,
                eventLog:
                    log.list(),
                executionAttempts:
                    executionAttempts,
                expectedResult:
                    input.expectedResult,
                actualResult:
                    governedResult.executionResult.result,
                controlAssertions:
                    input.controlAssertions,
                assertionEvidence:
                    assertionEvidence,
                replayInputs:
                    replayInputs
            });

        return deepFreeze({
            controlRun:
                controlRun,
            architectureContext:
                architectureContext,
            changedState:
                changedState,
            governedResult:
                governedResult,
            runRecord:
                runRecord
        });
    }

    root.TestRunner = Object.freeze({
        invalidateAuthority:
            invalidateAuthority,
        evaluateConditionChange:
            evaluateConditionChange,
        performGovernedReauthorization:
            performGovernedReauthorization,
        runGovernedExperiment:
            runGovernedExperiment
    });
}(window));
