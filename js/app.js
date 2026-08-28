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
        run:
            document.getElementById("run-experiment"),
        replay:
            document.getElementById("run-replay"),
        validation:
            document.getElementById("validation-status"),
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
                    scenario.description
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
                scenario.controlAssertions
        };
    }

    function renderScenarioInputs(scenario) {
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
                "Experiment completed. UI is displaying deterministic engine output."
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
                JSON.parse(text);

                elements.editor.value =
                    text;

                setValidation(
                    "PASS",
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

    elements.loadDefault.addEventListener(
        "click",
        loadDefaultScenario
    );

    elements.run.addEventListener(
        "click",
        runExperiment
    );

    elements.replay.addEventListener(
        "click",
        runReplay
    );

    window.OAATH.App = Object.freeze({
        parseScenario:
            parseScenario,
        buildRunInput:
            buildRunInput,
        runExperiment:
            runExperiment,
        runReplay:
            runReplay,
        loadDefaultScenario:
            loadDefaultScenario
    });

    loadDefaultScenario();
}());