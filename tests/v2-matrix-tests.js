(function () {
    "use strict";

    const catalog = window.OAATH.ScenarioCatalog;
    const runner = window.OAATH.TestRunner;
    const replay = window.OAATH.ReplayEngine;
    const io = window.OAATH.ImportExport;
    const list = document.getElementById("v2-matrix-results");
    const summary = document.getElementById("v2-matrix-summary");

    const results = [];
    const dispositions = [
        "RENEW",
        "NARROW",
        "CONDITION",
        "TRANSFER",
        "SUSPEND",
        "REFUSE"
    ];
    const architectures = [
        "SAME_LAYER_REAUTHORIZATION",
        "SEPARATED_REAUTHORIZATION"
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function record(caseId, name, passed, detail) {
        const row = {
            caseId: caseId,
            name: name,
            passed: passed === true,
            detail: detail || null
        };
        results.push(row);

        const item = document.createElement("li");
        item.textContent = caseId + " | " + name + ": " +
            (row.passed ? "PASS" : "FAIL") +
            (row.detail ? " - " + row.detail : "");
        item.setAttribute("data-v2-matrix-test-status", row.passed ? "PASS" : "FAIL");
        item.setAttribute("data-v2-matrix-case-id", caseId);
        list.appendChild(item);
    }

    function deepEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function baseInput(scenario, architecture) {
        const selected = clone(scenario);
        selected.reauthorizationArchitecture = architecture;
        selected.decisionActor = architecture === "SEPARATED_REAUTHORIZATION"
            ? clone(selected.designatedAuthorityOwner)
            : clone(selected.operationalActor);

        return {
            runId: "V2-MATRIX-" + selected.scenarioId + "-" + architecture,
            scenarioVersion: selected.scenarioVersion,
            policyVersion: selected.policyVersion,
            scenarioSnapshot: {
                scenarioId: selected.scenarioId,
                scenarioType: selected.scenarioType,
                scenarioVersion: selected.scenarioVersion,
                name: selected.name,
                reauthorizationArchitecture: architecture,
                recommendationConfidence: selected.recommendation
                    ? selected.recommendation.confidence
                    : null
            },
            priorConditions: clone(selected.priorConditions),
            currentConditions: clone(selected.currentConditions),
            materialityRules: clone(selected.materialityRules),
            priorAuthority: clone(selected.priorAuthority),
            invalidationEventId: "V2-MATRIX-INVALIDATION",
            materialityActorId: selected.decisionActor.actorId,
            revalidationActorId: "ACTOR-TECH",
            initialTechnicalValidity: clone(selected.initialTechnicalValidity),
            controlExpectedResult: clone(selected.controlExpectedResult),
            controlRequestedAction: clone(selected.controlRequestedAction),
            controlAssertion: clone(selected.controlAssertion),
            technicalRevalidation: clone(selected.technicalRevalidation),
            technicalCapability: clone(selected.technicalCapability),
            requestedAction: clone(selected.requestedAction),
            recommendation: clone(selected.recommendation || null),
            decisionActor: clone(selected.decisionActor),
            evidenceItems: clone(selected.evidenceItems),
            requiredEvidenceIds: clone(selected.requiredEvidenceIds),
            allowedDispositions: clone(selected.allowedDispositions),
            decision: clone(selected.decision),
            expectedResult: clone(selected.expectedResult),
            controlAssertions: clone(selected.controlAssertions),
            reauthorizationArchitecture: architecture,
            operationalActor: clone(selected.operationalActor),
            designatedAuthorityOwner: clone(selected.designatedAuthorityOwner),
            separationReason: selected.separationReason
        };
    }

    function refundTemplate(disposition) {
        if (disposition === "RENEW") {
            return {
                newScope: {
                    constraints: [
                        { field: "amountCents", operator: "LTE", comparisonValue: 50000, valueType: "integer" },
                        { field: "customerRisk", operator: "IN", comparisonValue: ["MEDIUM"], valueType: "string" },
                        { field: "transactionAgeDays", operator: "LTE", comparisonValue: 30, valueType: "integer" }
                    ]
                }
            };
        }
        if (disposition === "NARROW") {
            return {
                newScope: {
                    constraints: [
                        { field: "amountCents", operator: "LTE", comparisonValue: 25000, valueType: "integer" },
                        { field: "customerRisk", operator: "IN", comparisonValue: ["LOW"], valueType: "string" },
                        { field: "transactionAgeDays", operator: "LTE", comparisonValue: 30, valueType: "integer" }
                    ]
                }
            };
        }
        if (disposition === "CONDITION") {
            return {
                newScope: {
                    constraints: [
                        { field: "amountCents", operator: "LTE", comparisonValue: 50000, valueType: "integer" },
                        { field: "customerRisk", operator: "IN", comparisonValue: ["MEDIUM"], valueType: "string" },
                        { field: "transactionAgeDays", operator: "LTE", comparisonValue: 30, valueType: "integer" }
                    ]
                },
                conditions: [
                    {
                        required: true,
                        predicate: {
                            field: "manualReviewApproved",
                            operator: "EQ",
                            comparisonValue: true,
                            valueType: "boolean"
                        }
                    }
                ]
            };
        }
        if (disposition === "TRANSFER") {
            return { newDecisionOwner: "ACTOR-GOVERNANCE" };
        }
        return {};
    }

    function templateFor(scenario, disposition) {
        if (scenario.scenarioId === "REFUND-V2") {
            return refundTemplate(disposition);
        }

        const templates = scenario.ui && scenario.ui.dispositionTemplates
            ? scenario.ui.dispositionTemplates
            : {};
        return clone(templates[disposition] || {});
    }

    function decisionFor(scenario, disposition, caseId) {
        const decision = {
            decisionId: "DECISION-" + caseId,
            disposition: disposition,
            evidenceReviewed: clone(scenario.decision.evidenceReviewed || []),
            scenarioVersion: scenario.scenarioVersion,
            policyVersion: scenario.policyVersion
        };
        Object.assign(decision, templateFor(scenario, disposition));
        return decision;
    }

    function expectedMaterialOutcome(scenario, disposition, technicalStatus) {
        if (technicalStatus !== "PASS") {
            return "BLOCK";
        }
        if (disposition === "RENEW") {
            return scenario.scenarioId === "PROCUREMENT-V2" ? "BLOCK" : "ALLOW";
        }
        if (disposition === "NARROW") {
            return scenario.scenarioId === "PROCUREMENT-V2" ? "ALLOW" : "BLOCK";
        }
        return "BLOCK";
    }

    function conditionField(scenario) {
        const map = {
            "REFUND-V2": "manualReviewApproved",
            "ACCESS-V2": "approvedChangeTicket",
            "WORKFORCE-V2": "overtimeApproval",
            "PROCUREMENT-V2": "financeApproval",
            "ACCOUNT-RESTRICTION-V2": "secondReviewApproved"
        };
        return map[scenario.scenarioId];
    }

    function conditionAllowTemplate(scenario) {
        const template = templateFor(scenario, "CONDITION");
        if (scenario.scenarioId === "PROCUREMENT-V2") {
            template.newScope.constraints[0].comparisonValue = 20000000;
        }
        return template;
    }

    function authorityAllowInput(scenario, architecture, caseId) {
        const input = baseInput(scenario, architecture);
        input.runId = caseId;
        input.decision = decisionFor(scenario, "RENEW", caseId);
        if (scenario.scenarioId === "PROCUREMENT-V2") {
            input.decision.newScope.constraints[0].comparisonValue = 20000000;
        }
        input.expectedResult.expectedExecutionResult = "ALLOW";
        return input;
    }

    function outsideAction(scenario, input) {
        const action = clone(input.requestedAction);
        if (scenario.scenarioId === "REFUND-V2") {
            action.amountCents = 50001;
        }
        else if (scenario.scenarioId === "ACCESS-V2") {
            action.accessLevel = "READ_ONLY";
        }
        else if (scenario.scenarioId === "WORKFORCE-V2") {
            action.resultingWeeklyHours = 49;
        }
        else if (scenario.scenarioId === "PROCUREMENT-V2") {
            action.totalAcquisitionCostCents = 20000001;
        }
        else if (scenario.scenarioId === "ACCOUNT-RESTRICTION-V2") {
            action.restrictionLevel = "MONITOR_ONLY";
        }
        return action;
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
            const scenarios = await loadAll();

            // 120 material disposition/architecture/technical-state cases.
            for (const scenario of scenarios) {
                for (const architecture of architectures) {
                    for (const disposition of dispositions) {
                        for (const technicalStatus of ["PASS", "FAIL"]) {
                            const caseId = [
                                "MATERIAL",
                                scenario.scenarioId,
                                architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED",
                                disposition,
                                technicalStatus
                            ].join("-");
                            const input = baseInput(scenario, architecture);
                            input.runId = caseId;
                            input.decision = decisionFor(scenario, disposition, caseId);
                            input.technicalRevalidation.status = technicalStatus;
                            input.technicalRevalidation.reason = technicalStatus === "PASS"
                                ? "Matrix technical validation PASS."
                                : "Matrix technical validation FAIL.";
                            input.expectedResult.expectedExecutionResult =
                                expectedMaterialOutcome(scenario, disposition, technicalStatus);
                            if (disposition === "CONDITION" && scenario.scenarioId === "REFUND-V2") {
                                input.currentConditions.manualReviewApproved = false;
                            }

                            const result = runner.runGovernedExperiment(input);
                            const expected = expectedMaterialOutcome(
                                scenario,
                                disposition,
                                technicalStatus
                            );
                            const actual = result.runRecord.actualResult;
                            const actorId = result.architectureContext.decisionActor.actorId;
                            const expectedActorId = architecture === "SEPARATED_REAUTHORIZATION"
                                ? scenario.designatedAuthorityOwner.actorId
                                : scenario.operationalActor.actorId;

                            record(
                                caseId,
                                scenario.name + " | " + disposition + " | " + technicalStatus,
                                result.controlRun.executionResult.result === "ALLOW" &&
                                    result.changedState.materiality.result === "MATERIAL" &&
                                    actual === expected &&
                                    actorId === expectedActorId &&
                                    result.runRecord.predictionComparison.comparison === "MATCH",
                                "control=" + result.controlRun.executionResult.result +
                                    "; materiality=" + result.changedState.materiality.result +
                                    "; actual=" + actual +
                                    "; expected=" + expected +
                                    "; actor=" + actorId
                            );
                        }
                    }
                }
            }

            // 20 non-material cases: reauthorization is skipped and technical state remains independently decisive.
            for (const scenario of scenarios) {
                for (const architecture of architectures) {
                    for (const technicalStatus of ["PASS", "FAIL"]) {
                        const caseId = [
                            "NONMATERIAL",
                            scenario.scenarioId,
                            architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED",
                            technicalStatus
                        ].join("-");
                        const input = baseInput(scenario, architecture);
                        input.runId = caseId;
                        input.currentConditions = clone(scenario.priorConditions);
                        input.requestedAction = clone(scenario.controlRequestedAction);
                        input.technicalRevalidation.status = technicalStatus;
                        input.expectedResult.expectedExecutionResult = technicalStatus === "PASS" ? "ALLOW" : "BLOCK";

                        const result = runner.runGovernedExperiment(input);
                        const expected = technicalStatus === "PASS" ? "ALLOW" : "BLOCK";

                        record(
                            caseId,
                            scenario.name + " non-material change skips reauthorization",
                            result.changedState.materiality.result === "NON_MATERIAL" &&
                                result.governedResult.decisionResult.skipped === true &&
                                result.runRecord.actualResult === expected,
                            "materiality=" + result.changedState.materiality.result +
                                "; skipped=" + String(result.governedResult.decisionResult.skipped) +
                                "; actual=" + result.runRecord.actualResult +
                                "; expected=" + expected
                        );
                    }
                }
            }

            // 10 typed CONDITION causal-pair cases.
            for (const scenario of scenarios) {
                for (const architecture of architectures) {
                    const caseId = [
                        "CONDITION-CAUSAL",
                        scenario.scenarioId,
                        architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED"
                    ].join("-");
                    const field = conditionField(scenario);
                    const falseInput = baseInput(scenario, architecture);
                    falseInput.runId = caseId + "-FALSE";
                    falseInput.decision = {
                        decisionId: "DECISION-" + caseId,
                        disposition: "CONDITION",
                        evidenceReviewed: clone(scenario.decision.evidenceReviewed || []),
                        scenarioVersion: scenario.scenarioVersion,
                        policyVersion: scenario.policyVersion
                    };
                    Object.assign(falseInput.decision, conditionAllowTemplate(scenario));
                    falseInput.currentConditions[field] = false;
                    falseInput.expectedResult.expectedExecutionResult = "BLOCK";

                    const trueInput = clone(falseInput);
                    trueInput.runId = caseId + "-TRUE";
                    trueInput.currentConditions[field] = true;
                    trueInput.expectedResult.expectedExecutionResult = "ALLOW";

                    const falseResult = runner.runGovernedExperiment(falseInput);
                    const trueResult = runner.runGovernedExperiment(trueInput);

                    record(
                        caseId,
                        scenario.name + " typed CONDITION is causally decisive",
                        falseResult.runRecord.actualResult === "BLOCK" &&
                            trueResult.runRecord.actualResult === "ALLOW" &&
                            falseResult.governedResult.boundaryResult.boundaryCreated === true &&
                            trueResult.governedResult.boundaryResult.boundaryCreated === true,
                        "false=" + falseResult.runRecord.actualResult +
                            "; true=" + trueResult.runRecord.actualResult
                    );
                }
            }

            // 10 boundary relationship pairs using a deliberately authorizing RENEW scope.
            for (const scenario of scenarios) {
                for (const architecture of architectures) {
                    const caseId = [
                        "BOUNDARY-RELATIONSHIP",
                        scenario.scenarioId,
                        architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED"
                    ].join("-");
                    const insideInput = authorityAllowInput(scenario, architecture, caseId + "-IN");
                    const outsideInput = clone(insideInput);
                    outsideInput.runId = caseId + "-OUT";
                    outsideInput.requestedAction = outsideAction(scenario, outsideInput);
                    outsideInput.expectedResult.expectedExecutionResult = "BLOCK";

                    const inside = runner.runGovernedExperiment(insideInput);
                    const outside = runner.runGovernedExperiment(outsideInput);

                    record(
                        caseId,
                        scenario.name + " enforceable boundary distinguishes inside from outside",
                        inside.runRecord.actualResult === "ALLOW" &&
                            outside.runRecord.actualResult === "BLOCK",
                        "inside=" + inside.runRecord.actualResult +
                            "; outside=" + outside.runRecord.actualResult
                    );
                }
            }

            // 10 prediction-independence cases: intentionally wrong prediction must not change execution.
            for (const scenario of scenarios) {
                for (const architecture of architectures) {
                    const caseId = [
                        "PREDICTION-INDEPENDENCE",
                        scenario.scenarioId,
                        architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED"
                    ].join("-");
                    const input = authorityAllowInput(scenario, architecture, caseId);
                    input.expectedResult.expectedExecutionResult = "BLOCK";
                    const result = runner.runGovernedExperiment(input);

                    record(
                        caseId,
                        scenario.name + " expected-result prediction does not control execution",
                        result.runRecord.actualResult === "ALLOW" &&
                            result.runRecord.predictionComparison.comparison === "MISMATCH",
                        "actual=" + result.runRecord.actualResult +
                            "; prediction=" + result.runRecord.predictionComparison.comparison
                    );
                }
            }

            // 2 confidence-independence cases on the account restriction scenario.
            const account = scenarios.find(function (scenario) {
                return scenario.scenarioId === "ACCOUNT-RESTRICTION-V2";
            });
            for (const architecture of architectures) {
                const caseId = "CONFIDENCE-INDEPENDENCE-ACCOUNT-" +
                    (architecture === "SAME_LAYER_REAUTHORIZATION" ? "SAME" : "SEPARATED");
                const high = baseInput(account, architecture);
                high.runId = caseId + "-HIGH";
                high.scenarioSnapshot.recommendationConfidence = 0.97;
                high.recommendation.confidence = 0.97;
                high.decision = decisionFor(account, "CONDITION", caseId + "-HIGH");
                high.expectedResult.expectedExecutionResult = "BLOCK";

                const low = clone(high);
                low.runId = caseId + "-LOW";
                low.scenarioSnapshot.recommendationConfidence = 0.01;
                low.recommendation.confidence = 0.01;

                const highResult = runner.runGovernedExperiment(high);
                const lowResult = runner.runGovernedExperiment(low);

                record(
                    caseId,
                    "Account restriction confidence does not create or preserve authority",
                    highResult.runRecord.actualResult === "BLOCK" &&
                        lowResult.runRecord.actualResult === "BLOCK" &&
                        highResult.runRecord.actualResult === lowResult.runRecord.actualResult,
                    "highConfidence=" + highResult.runRecord.actualResult +
                        "; lowConfidence=" + lowResult.runRecord.actualResult
                );
            }

            // 5 import/export identity + execution equivalence cases.
            for (const scenario of scenarios) {
                const caseId = "IMPORT-EXPORT-" + scenario.scenarioId;
                const exported = io.exportScenario(scenario);
                const imported = io.importScenario(exported);
                const originalInput = baseInput(scenario, "SAME_LAYER_REAUTHORIZATION");
                originalInput.runId = caseId + "-ORIGINAL";
                const importedInput = baseInput(imported, "SAME_LAYER_REAUTHORIZATION");
                importedInput.runId = caseId + "-IMPORTED";
                const original = runner.runGovernedExperiment(originalInput);
                const importedResult = runner.runGovernedExperiment(importedInput);

                record(
                    caseId,
                    scenario.name + " import/export preserves scenario identity and governed result",
                    imported.scenarioId === scenario.scenarioId &&
                        imported.scenarioType === scenario.scenarioType &&
                        importedResult.runRecord.actualResult === original.runRecord.actualResult &&
                        importedResult.runRecord.scenarioSnapshot.metadata.scenarioId === scenario.scenarioId,
                    "importedId=" + imported.scenarioId +
                        "; original=" + original.runRecord.actualResult +
                        "; imported=" + importedResult.runRecord.actualResult
                );
            }

            // 5 replay cases drawn from each domain's default scenario.
            for (const scenario of scenarios) {
                const caseId = "REPLAY-DOMAIN-" + scenario.scenarioId;
                const input = baseInput(scenario, "SAME_LAYER_REAUTHORIZATION");
                input.runId = caseId;
                const original = runner.runGovernedExperiment(input);
                const replayed = replay.replay(original.runRecord);

                record(
                    caseId,
                    scenario.name + " domain replay remains equivalent",
                    replayed.comparison.equivalent === true &&
                        replayed.replayedRun.scenarioSnapshot.metadata.scenarioId === scenario.scenarioId,
                    "equivalent=" + String(replayed.comparison.equivalent)
                );
            }

            // 30 architecture-attribution pair checks across all dispositions.
            for (const scenario of scenarios) {
                for (const disposition of dispositions) {
                    const caseId = "ARCHITECTURE-PAIR-" + scenario.scenarioId + "-" + disposition;
                    const sameInput = baseInput(scenario, "SAME_LAYER_REAUTHORIZATION");
                    sameInput.runId = caseId + "-SAME";
                    sameInput.decision = decisionFor(scenario, disposition, caseId + "-SAME");
                    if (disposition === "CONDITION" && scenario.scenarioId === "REFUND-V2") {
                        sameInput.currentConditions.manualReviewApproved = false;
                    }
                    const separatedInput = baseInput(scenario, "SEPARATED_REAUTHORIZATION");
                    separatedInput.runId = caseId + "-SEPARATED";
                    separatedInput.decision = decisionFor(scenario, disposition, caseId + "-SEPARATED");
                    if (disposition === "CONDITION" && scenario.scenarioId === "REFUND-V2") {
                        separatedInput.currentConditions.manualReviewApproved = false;
                    }

                    const same = runner.runGovernedExperiment(sameInput);
                    const separated = runner.runGovernedExperiment(separatedInput);

                    record(
                        caseId,
                        scenario.name + " " + disposition + " architecture attribution is explicit without manufactured execution difference",
                        same.architectureContext.decisionActor.actorId === scenario.operationalActor.actorId &&
                            separated.architectureContext.decisionActor.actorId === scenario.designatedAuthorityOwner.actorId &&
                            same.runRecord.actualResult === separated.runRecord.actualResult,
                        "sameActor=" + same.architectureContext.decisionActor.actorId +
                            "; separatedActor=" + separated.architectureContext.decisionActor.actorId +
                            "; sameResult=" + same.runRecord.actualResult +
                            "; separatedResult=" + separated.runRecord.actualResult
                    );
                }
            }

            // Procurement-specific wrong-boundary research result.
            const procurement = scenarios.find(function (scenario) {
                return scenario.scenarioId === "PROCUREMENT-V2";
            });
            const procurementNarrow = baseInput(procurement, "SAME_LAYER_REAUTHORIZATION");
            procurementNarrow.runId = "PROCUREMENT-WRONG-METRIC-NARROW";
            procurementNarrow.decision = decisionFor(
                procurement,
                "NARROW",
                "PROCUREMENT-WRONG-METRIC-NARROW"
            );
            procurementNarrow.expectedResult.expectedExecutionResult = "ALLOW";
            const procurementNarrowResult = runner.runGovernedExperiment(procurementNarrow);
            record(
                "PROCUREMENT-WRONG-METRIC-NARROW",
                "Procurement can faithfully narrow the wrong metric and still authorize Vendor C",
                procurementNarrowResult.runRecord.actualResult === "ALLOW" &&
                    procurementNarrowResult.governedResult.boundaryResult.boundary.scope.constraints[0].field === "equipmentPriceCents",
                "actual=" + procurementNarrowResult.runRecord.actualResult +
                    "; field=" + procurementNarrowResult.governedResult.boundaryResult.boundary.scope.constraints[0].field
            );
        }
        catch (error) {
            record(
                "V2-MATRIX-HARNESS",
                "Version 2 comprehensive matrix harness completed",
                false,
                error && error.stack ? error.stack : String(error)
            );
        }

        const passed = results.filter(function (result) {
            return result.passed;
        }).length;

        summary.textContent = passed + "/" + results.length + " Version 2 matrix tests passed.";
        summary.setAttribute("data-status", passed === results.length ? "PASS" : "FAIL");
        summary.setAttribute("data-passed", String(passed));
        summary.setAttribute("data-total", String(results.length));
    }

    run();
}());
