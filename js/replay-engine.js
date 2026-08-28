(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const baseRunner = root.TestRunner;

    if (!baseRunner || !baseRunner.runGovernedExperiment) {
        throw new Error(
            "Governed TestRunner must be loaded before ReplayEngine."
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

    function buildReplayScenarioSnapshot(input) {
        return {
            metadata:
                deepClone(input.scenarioSnapshot || {}),
            scenarioVersion:
                input.scenarioVersion,
            policyVersion:
                input.policyVersion,
            priorConditions:
                deepClone(input.priorConditions),
            materialityRules:
                deepClone(input.materialityRules),
            priorAuthority:
                deepClone(input.priorAuthority),
            technicalCapability:
                deepClone(input.technicalCapability),
            initialTechnicalValidity:
                deepClone(
                    input.initialTechnicalValidity
                ),
            controlExpectedResult:
                deepClone(
                    input.controlExpectedResult
                ),
            reauthorizationArchitecture:
                input.reauthorizationArchitecture ||
                "SAME_LAYER_REAUTHORIZATION",
            operationalActor:
                deepClone(
                    input.operationalActor ||
                    input.decisionActor
                ),
            designatedAuthorityOwner:
                deepClone(
                    input.designatedAuthorityOwner || null
                ),
            separationReason:
                input.separationReason || null,
            decisionActor:
                deepClone(input.decisionActor),
            evidenceItems:
                deepClone(input.evidenceItems),
            requiredEvidenceIds:
                deepClone(input.requiredEvidenceIds),
            allowedDispositions:
                deepClone(input.allowedDispositions),
            controlAssertions:
                deepClone(input.controlAssertions),
            materialityActorId:
                input.materialityActorId || null,
            revalidationActorId:
                input.revalidationActorId || null
        };
    }

    function runPreparedExperiment(input) {
        const prepared =
            deepClone(input);

        prepared.scenarioSnapshot =
            buildReplayScenarioSnapshot(input);

        return baseRunner.runGovernedExperiment(
            prepared
        );
    }

    function findCommand(
        replayInputs,
        commandType
    ) {
        const command =
            replayInputs.find(
                function (item) {
                    return item.commandType ===
                        commandType;
                }
            );

        if (!command) {
            throw new Error(
                "Required replay command is missing: " +
                commandType
            );
        }

        return command;
    }

    function assertNoDerivedReplayCommands(
        replayInputs
    ) {
        const forbidden = [
            "MATERIALITY_EVALUATED",
            "AUTHORITY_INVALIDATED",
            "AUTHORITY_CREATED",
            "BOUNDARY_CREATED",
            "EXECUTION_EVALUATED",
            "EXECUTION_RESULT_SET",
            "CONTROL_ASSERTION_RESULT_SET"
        ];

        replayInputs.forEach(
            function (command) {
                if (
                    forbidden.includes(
                        command.commandType
                    )
                ) {
                    throw new Error(
                        "Derived outcome appears as replay command: " +
                        command.commandType
                    );
                }
            }
        );
    }

    function reconstructInput(runRecord) {
        if (
            !runRecord ||
            typeof runRecord !== "object"
        ) {
            throw new Error(
                "Run record is required for replay."
            );
        }

        const snapshot =
            runRecord.scenarioSnapshot;

        if (
            !snapshot ||
            typeof snapshot !== "object" ||
            !snapshot.priorAuthority ||
            !snapshot.priorConditions
        ) {
            throw new Error(
                "Run scenario snapshot is insufficient for deterministic replay."
            );
        }

        const replayInputs =
            runRecord.replayInputs;

        if (!Array.isArray(replayInputs)) {
            throw new Error(
                "Run replay inputs must be an array."
            );
        }

        assertNoDerivedReplayCommands(
            replayInputs
        );

        const start =
            findCommand(
                replayInputs,
                "START_SCENARIO"
            );

        const conditionChange =
            findCommand(
                replayInputs,
                "CHANGE_CONDITION"
            );

        const revalidation =
            findCommand(
                replayInputs,
                "RECORD_TECHNICAL_REVALIDATION"
            );

        const decision =
            findCommand(
                replayInputs,
                "SUBMIT_GOVERNANCE_DECISION"
            );

        const executionAttempt =
            findCommand(
                replayInputs,
                "ATTEMPT_EXECUTION"
            );

        return {
            runId:
                start.payload.runId ||
                runRecord.runId,
            scenarioVersion:
                snapshot.scenarioVersion,
            policyVersion:
                snapshot.policyVersion,
            scenarioSnapshot:
                deepClone(
                    snapshot.metadata || {}
                ),
            priorConditions:
                deepClone(
                    snapshot.priorConditions
                ),
            currentConditions:
                deepClone(
                    conditionChange.payload.currentConditions
                ),
            materialityRules:
                deepClone(
                    snapshot.materialityRules
                ),
            priorAuthority:
                deepClone(
                    snapshot.priorAuthority
                ),
            invalidationEventId:
                findCommand(
                    replayInputs,
                    "CHANGE_CONDITION"
                ).payload.invalidationEventId ||
                "REPLAY-INVALIDATION",
            materialityActorId:
                snapshot.materialityActorId,
            revalidationActorId:
                snapshot.revalidationActorId,
            technicalRevalidation:
                deepClone(
                    revalidation.payload.technicalRevalidation
                ),
            technicalCapability:
                deepClone(
                    snapshot.technicalCapability
                ),
            initialTechnicalValidity:
                deepClone(
                    snapshot.initialTechnicalValidity
                ),
            controlExpectedResult:
                deepClone(
                    snapshot.controlExpectedResult
                ),
            requestedAction:
                deepClone(
                    executionAttempt.payload.requestedAction
                ),
            reauthorizationArchitecture:
                snapshot.reauthorizationArchitecture ||
                "SAME_LAYER_REAUTHORIZATION",
            operationalActor:
                deepClone(
                    snapshot.operationalActor ||
                    snapshot.decisionActor
                ),
            designatedAuthorityOwner:
                deepClone(
                    snapshot.designatedAuthorityOwner || null
                ),
            separationReason:
                snapshot.separationReason || null,
            decisionActor:
                deepClone(
                    snapshot.decisionActor
                ),
            evidenceItems:
                deepClone(
                    snapshot.evidenceItems
                ),
            requiredEvidenceIds:
                deepClone(
                    snapshot.requiredEvidenceIds
                ),
            allowedDispositions:
                deepClone(
                    snapshot.allowedDispositions
                ),
            decision:
                deepClone(
                    decision.payload.decision
                ),
            expectedResult:
                deepClone(
                    runRecord.expectedResult
                ),
            controlAssertions:
                deepClone(
                    snapshot.controlAssertions
                )
        };
    }

    function comparableEvidence(runRecord) {
        return {
            controlRun:
                runRecord.controlRun,
            authorityHistory:
                runRecord.authorityHistory,
            decisionHistory:
                runRecord.decisionHistory,
            executionAttempts:
                runRecord.executionAttempts,
            actualResult:
                runRecord.actualResult,
            predictionComparison:
                runRecord.predictionComparison,
            controlAssertionResults:
                runRecord.controlAssertionResults,
            eventLog:
                runRecord.eventLog
        };
    }

    function stableStringify(value) {
        return JSON.stringify(value);
    }

    function compareRuns(
        originalRun,
        replayedRun
    ) {
        const original =
            comparableEvidence(originalRun);

        const replayed =
            comparableEvidence(replayedRun);

        const comparisons = {};

        Object.keys(original).forEach(
            function (key) {
                comparisons[key] = (
                    stableStringify(original[key]) ===
                    stableStringify(replayed[key])
                );
            }
        );

        const equivalent =
            Object.keys(comparisons).every(
                function (key) {
                    return comparisons[key] === true;
                }
            );

        return deepFreeze({
            equivalent:
                equivalent,
            comparisons:
                comparisons
        });
    }

    function replay(runRecord) {
        const reconstructedInput =
            reconstructInput(runRecord);

        const replayed =
            runPreparedExperiment(
                reconstructedInput
            );

        const comparison =
            compareRuns(
                runRecord,
                replayed.runRecord
            );

        return deepFreeze({
            reconstructedInput:
                reconstructedInput,
            replayedRun:
                replayed.runRecord,
            comparison:
                comparison
        });
    }

    root.TestRunner = Object.freeze(
        Object.assign(
            {},
            baseRunner,
            {
                runGovernedExperiment:
                    runPreparedExperiment
            }
        )
    );

    root.ReplayEngine = Object.freeze({
        reconstructInput:
            reconstructInput,
        compareRuns:
            compareRuns,
        replay:
            replay
    });
}(window));