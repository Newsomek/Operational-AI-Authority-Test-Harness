(function () {
    "use strict";

    const catalog = window.OAATH.ScenarioCatalog;
    const runner = window.OAATH.TestRunner;
    const list = document.getElementById("scenario-catalog-results");
    const summary = document.getElementById("scenario-catalog-summary");

    const results = [];

    function record(name, passed, detail) {
        results.push({ name: name, passed: passed, detail: detail || null });

        const item = document.createElement("li");
        item.textContent = name + ": " + (passed ? "PASS" : "FAIL") +
            (detail ? " - " + detail : "");
        item.setAttribute("data-scenario-catalog-test-status", passed ? "PASS" : "FAIL");
        list.appendChild(item);
    }

    function inputFromScenario(scenario, architecture) {
        const selected = JSON.parse(JSON.stringify(scenario));
        selected.reauthorizationArchitecture = architecture;
        selected.decisionActor = architecture === "SEPARATED_REAUTHORIZATION"
            ? JSON.parse(JSON.stringify(selected.designatedAuthorityOwner))
            : JSON.parse(JSON.stringify(selected.operationalActor));

        return {
            runId: "SCENARIO-CATALOG-" + selected.scenarioId + "-" + architecture,
            scenarioVersion: selected.scenarioVersion,
            policyVersion: selected.policyVersion,
            scenarioSnapshot: {
                scenarioId: selected.scenarioId,
                scenarioType: selected.scenarioType,
                scenarioVersion: selected.scenarioVersion,
                name: selected.name,
                description: selected.description,
                reauthorizationArchitecture: architecture
            },
            priorConditions: selected.priorConditions,
            currentConditions: selected.currentConditions,
            materialityRules: selected.materialityRules,
            priorAuthority: selected.priorAuthority,
            invalidationEventId: "CATALOG-INVALIDATION-1",
            materialityActorId: selected.decisionActor.actorId,
            revalidationActorId: "ACTOR-TECH",
            initialTechnicalValidity: selected.initialTechnicalValidity,
            controlExpectedResult: selected.controlExpectedResult,
            controlRequestedAction: selected.controlRequestedAction,
            controlAssertion: selected.controlAssertion,
            technicalRevalidation: selected.technicalRevalidation,
            technicalCapability: selected.technicalCapability,
            requestedAction: selected.requestedAction,
            decisionActor: selected.decisionActor,
            evidenceItems: selected.evidenceItems,
            requiredEvidenceIds: selected.requiredEvidenceIds,
            allowedDispositions: selected.allowedDispositions,
            decision: selected.decision,
            expectedResult: selected.expectedResult,
            controlAssertions: selected.controlAssertions,
            reauthorizationArchitecture: architecture,
            operationalActor: selected.operationalActor,
            designatedAuthorityOwner: selected.designatedAuthorityOwner,
            separationReason: selected.separationReason
        };
    }

    async function loadAll() {
        const scenarios = [];
        for (const entry of catalog.entries) {
            scenarios.push(await catalog.load(entry.scenarioId));
        }
        return scenarios;
    }

    async function run() {
        try {
            const expectedIds = [
                "REFUND-V2",
                "ACCESS-V2",
                "WORKFORCE-V2",
                "PROCUREMENT-V2",
                "ACCOUNT-RESTRICTION-V2"
            ];

            record(
                "Catalog exposes exactly the five agreed Version 2 scenarios",
                catalog.entries.length === 5 &&
                    expectedIds.every(function (id) {
                        return catalog.entries.some(function (entry) {
                            return entry.scenarioId === id;
                        });
                    })
            );

            const scenarios = await loadAll();
            const sameLayerResults = new Map();

            for (const scenario of scenarios) {
                const input = inputFromScenario(
                    scenario,
                    "SAME_LAYER_REAUTHORIZATION"
                );
                const result = runner.runGovernedExperiment(input);
                sameLayerResults.set(scenario.scenarioId, result);

                const pass =
                    result.controlRun.executionResult.result === "ALLOW" &&
                    result.changedState.materiality.result === "MATERIAL" &&
                    result.runRecord.actualResult ===
                        scenario.expectedResult.expectedExecutionResult &&
                    result.runRecord.predictionComparison.comparison === "MATCH" &&
                    result.runRecord.scenarioSnapshot.metadata.scenarioId === scenario.scenarioId &&
                    result.runRecord.scenarioSnapshot.metadata.scenarioType === scenario.scenarioType;

                record(
                    scenario.name + " runs through the shared same-layer authority pipeline",
                    pass,
                    pass
                        ? null
                        : [
                            "control=" + result.controlRun.executionResult.result,
                            "materiality=" + result.changedState.materiality.result,
                            "actual=" + result.runRecord.actualResult,
                            "expected=" + scenario.expectedResult.expectedExecutionResult,
                            "prediction=" + result.runRecord.predictionComparison.comparison,
                            "snapshotId=" + (
                                result.runRecord.scenarioSnapshot &&
                                result.runRecord.scenarioSnapshot.metadata &&
                                result.runRecord.scenarioSnapshot.metadata.scenarioId
                            ),
                            "snapshotType=" + (
                                result.runRecord.scenarioSnapshot &&
                                result.runRecord.scenarioSnapshot.metadata &&
                                result.runRecord.scenarioSnapshot.metadata.scenarioType
                            )
                        ].join("; ")
                );
            }

            for (const scenario of scenarios) {
                const separated = runner.runGovernedExperiment(
                    inputFromScenario(
                        scenario,
                        "SEPARATED_REAUTHORIZATION"
                    )
                );
                const same = sameLayerResults.get(scenario.scenarioId);

                record(
                    scenario.name + " architecture comparison does not manufacture an execution difference",
                    separated.runRecord.actualResult === same.runRecord.actualResult &&
                        separated.architectureContext.decisionActor.actorId ===
                            scenario.designatedAuthorityOwner.actorId
                );
            }

            const procurement = scenarios.find(function (scenario) {
                return scenario.scenarioId === "PROCUREMENT-V2";
            });
            const procurementResult = sameLayerResults.get("PROCUREMENT-V2");

            record(
                "Procurement old metric faithfully allows Vendor C while renewed total-cost metric blocks it",
                procurementResult.controlRun.executionResult.result === "ALLOW" &&
                    procurement.controlRequestedAction.equipmentPriceCents <= 17500000 &&
                    procurement.controlRequestedAction.totalAcquisitionCostCents > 17500000 &&
                    procurementResult.runRecord.actualResult === "BLOCK"
            );

            const procurementMetricControl = procurement.ui.controls.find(function (control) {
                return control.id === "proc-metric";
            });

            record(
                "Procurement UI distinguishes observed materiality metric from resulting authority metric",
                Boolean(procurementMetricControl) &&
                    procurementMetricControl.help.includes("materiality") &&
                    procurementMetricControl.help.includes("resulting authority boundary") &&
                    procurement.presentation.evidence.includes("selected governance disposition defines the resulting executable authority")
            );

            const account = scenarios.find(function (scenario) {
                return scenario.scenarioId === "ACCOUNT-RESTRICTION-V2";
            });
            const accountResult = sameLayerResults.get("ACCOUNT-RESTRICTION-V2");

            record(
                "Account restriction confidence remains 97 percent while authority still blocks",
                account.recommendation.confidence === 0.97 &&
                    account.technicalRevalidation.status === "PASS" &&
                    accountResult.runRecord.actualResult === "BLOCK"
            );
        }
        catch (error) {
            record("Scenario catalog test harness completed", false, error.message);
        }

        const passed = results.filter(function (result) {
            return result.passed;
        }).length;

        summary.textContent = passed + "/" + results.length + " scenario catalog tests passed.";
        summary.setAttribute("data-status", passed === results.length ? "PASS" : "FAIL");
        summary.setAttribute("data-passed", String(passed));
        summary.setAttribute("data-total", String(results.length));
    }

    run();
}());
