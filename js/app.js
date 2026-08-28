(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const replay =
        window.OAATH.ReplayEngine;

    if (!runner || !replay) {
        throw new Error(
            "TestRunner and ReplayEngine must load before app.js."
        );
    }

    const elements = {
        editor:
            document.getElementById("scenario-editor"),
        loadDefault:
            document.getElementById("load-default"),
        reset:
            document.getElementById("reset-scenario"),
        run:
            document.getElementById("run-experiment"),
        replay:
            document.getElementById("run-replay"),
        applyControls:
            document.getElementById("apply-controls"),
        validation:
            document.getElementById("validation-status"),

        sameLayer:
            document.getElementById("architecture-same-layer"),
        separated:
            document.getElementById("architecture-separated"),
        currentRisk:
            document.getElementById("current-risk"),
        requestedAmount:
            document.getElementById("requested-amount"),
        disposition:
            document.getElementById("decision-disposition"),
        expectedResult:
            document.getElementById("expected-result"),
        newAuthorityMaximum:
            document.getElementById("new-authority-maximum"),
        technicalValidity:
            document.getElementById("technical-validity"),

        architectureOutput:
            document.getElementById("architecture-output"),
        recommendation:
            document.getElementById("recommendation-output"),
        capability:
            document.getElementById("capability-output"),
        validity:
            document.getElementById("validity-output"),
        materiality:
            document.getElementById("materiality-output"),
        decision:
            document.getElementById("decision-output"),
        boundary:
            document.getElementById("boundary-output"),
        execution:
            document.getElementById("execution-output"),
        prediction:
            document.getElementById("prediction-output"),
        assertions:
            document.getElementById("assertion-output"),
        replayOutput:
            document.getElementById("replay-output"),
        authorityHistory:
            document.getElementById("authority-history-output"),
        eventLog:
            document.getElementById("event-log-output")
    };

    let lastRunRecord = null;
    let loadedDefaultText = null;

    function pretty(value) {
        return JSON.stringify(
            value,
            null,
            2
        );
    }

    function setValidation(status, message) {
        elements.validation.textContent =
            message;

        elements.validation.setAttribute(
            "data-status",
            status
        );
    }

    function parseScenario() {
        try {
            const scenario =
                JSON.parse(
                    elements.editor.value
                );

            setValidation(
                "PASS",
                "Scenario JSON parsed successfully."
            );

            return scenario;
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Scenario JSON is invalid: " +
                error.message
            );

            throw error;
        }
    }

    function selectedArchitecture() {
        if (elements.separated.checked) {
            return "SEPARATED_REAUTHORIZATION";
        }

        return "SAME_LAYER_REAUTHORIZATION";
    }

    function syncControlsFromScenario(scenario) {
        const architecture =
            scenario.reauthorizationArchitecture ||
            "SAME_LAYER_REAUTHORIZATION";

        elements.sameLayer.checked =
            architecture ===
            "SAME_LAYER_REAUTHORIZATION";

        elements.separated.checked =
            architecture ===
            "SEPARATED_REAUTHORIZATION";

        elements.currentRisk.value =
            scenario.currentConditions.customerRisk;

        elements.requestedAmount.value =
            String(
                scenario.requestedAction.amountCents
            );

        elements.disposition.value =
            scenario.decision.disposition;

        elements.expectedResult.value =
            scenario.expectedResult.expectedExecutionResult;

        elements.technicalValidity.value =
            scenario.technicalRevalidation.status;

        if (
            scenario.decision.newScope &&
            Number.isInteger(
                scenario.decision.newScope.maximumAmountCents
            )
        ) {
            elements.newAuthorityMaximum.value =
                String(
                    scenario.decision.newScope.maximumAmountCents
                );
        }
        else {
            elements.newAuthorityMaximum.value =
                "";
        }
    }

    function applyControlsToScenarioObject(scenario) {
        scenario.reauthorizationArchitecture =
            selectedArchitecture();

        scenario.currentConditions.customerRisk =
            elements.currentRisk.value;

        scenario.requestedAction.customerRisk =
            elements.currentRisk.value;

        scenario.requestedAction.amountCents =
            Number(
                elements.requestedAmount.value
            );

        scenario.currentConditions.refundAmountCents =
            Number(
                elements.requestedAmount.value
            );

        scenario.decision.disposition =
            elements.disposition.value;

        scenario.expectedResult.expectedExecutionResult =
            elements.expectedResult.value;

        scenario.technicalRevalidation.status =
            elements.technicalValidity.value;

        if (
            scenario.decision.disposition === "NARROW"
        ) {
            if (!scenario.decision.newScope) {
                scenario.decision.newScope = {};
            }

            scenario.decision.newScope.maximumAmountCents =
                Number(
                    elements.newAuthorityMaximum.value
                );

            if (
                !Array.isArray(
                    scenario.decision.newScope.allowedRiskLevels
                )
            ) {
                scenario.decision.newScope.allowedRiskLevels = [
                    "LOW",
                    "MEDIUM"
                ];
            }

            if (
                !Number.isInteger(
                    scenario.decision.newScope.maximumTransactionAgeDays
                )
            ) {
                scenario.decision.newScope.maximumTransactionAgeDays =
                    30;
            }
        }

        return scenario;
    }

    function applyControls() {
        try {
            const scenario =
                parseScenario();

            const updated =
                applyControlsToScenarioObject(
                    scenario
                );

            elements.editor.value =
                pretty(
                    updated
                );

            setValidation(
                "PASS",
                "Structured controls applied to scenario JSON."
            );
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Unable to apply controls: " +
                error.message
            );
        }
    }

    function buildRunInput(scenario) {
        return {
            runId:
                "UI-RUN-1",
            scenarioVersion:
                scenario.scenarioVersion,
            policyVersion:
                scenario.policyVersion,
            scenarioSnapshot: {
                scenarioId:
                    scenario.scenarioId,
                scenarioVersion:
                    scenario.scenarioVersion,
                name:
                    scenario.name,
                description:
                    scenario.description,
                reauthorizationArchitecture:
                    scenario.reauthorizationArchitecture
            },
            priorConditions:
                scenario.priorConditions,
            currentConditions:
                scenario.currentConditions,
            materialityRules:
                scenario.materialityRules,
            priorAuthority:
                scenario.priorAuthority,
            invalidationEventId:
                "UI-INVALIDATION-1",
            materialityActorId:
                scenario.decisionActor.actorId,
            revalidationActorId:
                "ACTOR-TECH",
            technicalRevalidation:
                scenario.technicalRevalidation,
            technicalCapability:
                scenario.technicalCapability,
            requestedAction:
                scenario.requestedAction,
            decisionActor:
                scenario.decisionActor,
            evidenceItems:
                scenario.evidenceItems,
            requiredEvidenceIds:
                scenario.requiredEvidenceIds,
            allowedDispositions:
                scenario.allowedDispositions,
            decision:
                scenario.decision,
            expectedResult:
                scenario.expectedResult,
            controlAssertions:
                scenario.controlAssertions,
            reauthorizationArchitecture:
                scenario.reauthorizationArchitecture,
            operationalActor:
                scenario.operationalActor ||
                scenario.decisionActor,
            designatedAuthorityOwner:
                scenario.designatedAuthorityOwner,
            separationReason:
                scenario.separationReason
        };
    }

    function renderScenarioInputs(scenario) {
        elements.architectureOutput.textContent =
            scenario.reauthorizationArchitecture;

        elements.recommendation.textContent =
            pretty(
                scenario.recommendation
            );

        elements.capability.textContent =
            pretty(
                scenario.technicalCapability
            );

        elements.validity.textContent =
            pretty(
                scenario.technicalRevalidation
            );
    }

    function explainRun(result) {
        const translation =
            result.governedResult.decisionResult.valid
                ? result.governedResult.decisionResult.translation
                : null;

        const boundaryResult =
            result.governedResult.boundaryResult;

        const executionResult =
            result.governedResult.executionResult;

        elements.authorityExplain.textContent =
            pretty({
                architecture:
                    result.architectureContext.architecture,
                decisionActor:
                    result.architectureContext.decisionActor.actorId,
                authorityMoved:
                    result.architectureContext.authorityMoved,
                movementReason:
                    result.architectureContext.movementReason,
                materiality:
                    result.changedState.materiality.result,
                priorAuthorityStatus:
                    result.changedState.currentAuthority.status,
                disposition:
                    translation
                        ? translation.disposition
                        : null,
                newAuthorityCreated:
                    translation
                        ? translation.authorityCreated
                        : false
            });

        elements.boundaryExplain.textContent =
            pretty({
                boundaryCreated:
                    boundaryResult
                        ? boundaryResult.boundaryCreated
                        : false,
                sourceAuthorityId:
                    boundaryResult &&
                    boundaryResult.boundary
                        ? boundaryResult.boundary.sourceAuthorityId
                        : null,
                scope:
                    boundaryResult &&
                    boundaryResult.boundary
                        ? boundaryResult.boundary.scope
                        : null,
                reason:
                    boundaryResult
                        ? boundaryResult.reason
                        : "No boundary was created."
            });

        elements.executionExplain.textContent =
            pretty({
                result:
                    executionResult.result,
                reason:
                    executionResult.reason,
                evaluatedBoundary:
                    executionResult.boundaryId,
                technicalValidity:
                    result.runRecord.executionAttempts[0].technicalValidity,
                technicalCapability:
                    result.runRecord.executionAttempts[0].technicalCapability
            });
    }

    function renderRun(result) {
        const run =
            result.runRecord;

        lastRunRecord =
            run;

        elements.materiality.textContent =
            pretty(
                result.changedState.materiality
            );

        elements.decision.textContent =
            pretty(
                result.governedResult.decisionResult
            );

        elements.boundary.textContent =
            pretty(
                result.governedResult.boundaryResult
            );

        elements.execution.textContent =
            pretty(
                result.governedResult.executionResult
            );

        elements.prediction.textContent =
            pretty(
                run.predictionComparison
            );

        elements.assertions.textContent =
            pretty(
                run.controlAssertionResults
            );

        elements.authorityHistory.textContent =
            pretty(
                run.authorityHistory
            );

        elements.eventLog.textContent =
            pretty(
                run.eventLog
            );

        explainRun(
            result
        );

        elements.replayOutput.textContent =
            "Run available for deterministic replay.";

        document.body.setAttribute(
            "data-last-run-result",
            run.actualResult
        );

        document.body.setAttribute(
            "data-prediction-comparison",
            run.predictionComparison.comparison
        );
    }

    function runExperiment() {
        try {
            applyControls();

            const scenario =
                parseScenario();

            renderScenarioInputs(
                scenario
            );

            const input =
                buildRunInput(
                    scenario
                );

            const result =
                runner.runGovernedExperiment(
                    input
                );

            renderRun(result);

            setValidation(
                "PASS",
                "Experiment completed through deterministic governed engines."
            );
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Experiment failed: " +
                error.message
            );
        }
    }

    function architectureComparisonSummary(
        sameResult,
        separatedResult
    ) {
        return {
            heldConstant: [
                "scenario",
                "recommendation",
                "technical capability",
                "technical revalidation",
                "evidence",
                "requested action",
                "governance disposition"
            ],
            changedVariable:
                "reauthorization architecture",
            sameLayerDecisionActor:
                sameResult.architectureContext.decisionActor.actorId,
            separatedDecisionActor:
                separatedResult.architectureContext.decisionActor.actorId,
            sameLayerExecution:
                sameResult.runRecord.actualResult,
            separatedExecution:
                separatedResult.runRecord.actualResult,
            executionDifference:
                sameResult.runRecord.actualResult !==
                separatedResult.runRecord.actualResult,
            sameLayerBoundary:
                sameResult.governedResult.executionResult.boundaryId,
            separatedBoundary:
                separatedResult.governedResult.executionResult.boundaryId,
            interpretation:
                sameResult.runRecord.actualResult ===
                separatedResult.runRecord.actualResult
                    ? "No execution-outcome difference was observed for this controlled scenario. That is a valid experimental result."
                    : "An execution-outcome difference was observed. Inspect actor, authority, boundary, and event evidence before interpreting why."
        };
    }

    function compareArchitectures() {
        try {
            applyControls();

            const scenario =
                parseScenario();

            const sameScenario =
                JSON.parse(
                    JSON.stringify(scenario)
                );

            const separatedScenario =
                JSON.parse(
                    JSON.stringify(scenario)
                );

            sameScenario.reauthorizationArchitecture =
                "SAME_LAYER_REAUTHORIZATION";

            separatedScenario.reauthorizationArchitecture =
                "SEPARATED_REAUTHORIZATION";

            const sameResult =
                runner.runGovernedExperiment(
                    buildRunInput(
                        sameScenario
                    )
                );

            const separatedResult =
                runner.runGovernedExperiment(
                    buildRunInput(
                        separatedScenario
                    )
                );

            elements.sameComparison.textContent =
                pretty({
                    architecture:
                        sameResult.architectureContext,
                    execution:
                        sameResult.governedResult.executionResult,
                    boundary:
                        sameResult.governedResult.boundaryResult
                });

            elements.separatedComparison.textContent =
                pretty({
                    architecture:
                        separatedResult.architectureContext,
                    execution:
                        separatedResult.governedResult.executionResult,
                    boundary:
                        separatedResult.governedResult.boundaryResult
                });

            elements.comparisonSummary.textContent =
                pretty(
                    architectureComparisonSummary(
                        sameResult,
                        separatedResult
                    )
                );

            setValidation(
                "PASS",
                "Controlled architecture comparison completed."
            );
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Architecture comparison failed: " +
                error.message
            );
        }
    }

    function runReplay() {
        if (!lastRunRecord) {
            setValidation(
                "FAIL",
                "No completed run is available for replay."
            );

            return;
        }

        try {
            const result =
                replay.replay(
                    lastRunRecord
                );

            elements.replayOutput.textContent =
                pretty(
                    result.comparison
                );

            document.body.setAttribute(
                "data-replay-equivalent",
                String(
                    result.comparison.equivalent
                )
            );

            setValidation(
                result.comparison.equivalent
                    ? "PASS"
                    : "FAIL",
                result.comparison.equivalent
                    ? "Replay recomputation is equivalent to the original run."
                    : "Replay recomputation diverged from the original run evidence."
            );
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Replay failed: " +
                error.message
            );
        }
    }

    function clearOutputs() {
        [
            elements.architectureOutput,
            elements.recommendation,
            elements.capability,
            elements.validity,
            elements.materiality,
            elements.decision,
            elements.boundary,
            elements.execution,
            elements.prediction,
            elements.assertions,
            elements.replayOutput,
            elements.authorityHistory,
            elements.eventLog
        ].forEach(function (element) {
            element.textContent =
                "Not run.";
        });

        lastRunRecord = null;

        document.body.removeAttribute(
            "data-last-run-result"
        );

        document.body.removeAttribute(
            "data-prediction-comparison"
        );

        document.body.removeAttribute(
            "data-replay-equivalent"
        );
    }

    function loadScenarioText(text, message) {
        const scenario =
            JSON.parse(text);

        loadedDefaultText =
            text;

        elements.editor.value =
            pretty(
                scenario
            );

        syncControlsFromScenario(
            scenario
        );

        clearOutputs();

        setValidation(
            "PASS",
            message
        );
    }

    function loadDefaultScenario() {
        fetch(
            "data/default-scenario.json",
            {
                cache: "no-store"
            }
        )
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        "Unable to load default scenario."
                    );
                }

                return response.text();
            })
            .then(function (text) {
                loadScenarioText(
                    text,
                    "Default editable scenario loaded."
                );
            })
            .catch(function (error) {
                setValidation(
                    "FAIL",
                    error.message
                );
            });
    }

    function resetScenario() {
        if (loadedDefaultText !== null) {
            loadScenarioText(
                loadedDefaultText,
                "Scenario reset to the loaded default."
            );

            return;
        }

        loadDefaultScenario();
    }

    elements.loadDefault.addEventListener(
        "click",
        loadDefaultScenario
    );

    elements.reset.addEventListener(
        "click",
        resetScenario
    );

    elements.applyControls.addEventListener(
        "click",
        applyControls
    );

    elements.run.addEventListener(
        "click",
        runExperiment
    );

    elements.compareArchitectures.addEventListener(
        "click",
        compareArchitectures
    );

    elements.replay.addEventListener(
        "click",
        runReplay
    );

    window.OAATH.App = Object.freeze({
        parseScenario:
            parseScenario,
        selectedArchitecture:
            selectedArchitecture,
        syncControlsFromScenario:
            syncControlsFromScenario,
        applyControlsToScenarioObject:
            applyControlsToScenarioObject,
        buildRunInput:
            buildRunInput,
        runExperiment:
            runExperiment,
        compareArchitectures:
            compareArchitectures,
        architectureComparisonSummary:
            architectureComparisonSummary,
        runReplay:
            runReplay,
        resetScenario:
            resetScenario,
        loadDefaultScenario:
            loadDefaultScenario
    });

    loadDefaultScenario();
}());