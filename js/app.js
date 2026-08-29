(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const replay =
        window.OAATH.ReplayEngine;

    const importExport =
        window.OAATH.ImportExport;

    const appScriptUrl =
        new URL(document.currentScript.src);

    const defaultScenarioUrl =
        new URL(
            "../data/default-scenario.json",
            appScriptUrl
        ).href;

    if (!runner || !replay || !importExport) {
        throw new Error(
            "TestRunner, ReplayEngine, and ImportExport must load before app.js."
        );
    }

    const elements = {
        editor:
            document.getElementById("scenario-editor"),
        loadDefault:
            document.getElementById("load-default"),
        importScenario:
            document.getElementById("import-scenario"),
        exportScenario:
            document.getElementById("export-scenario"),
        exportRun:
            document.getElementById("export-run"),
        scenarioFileInput:
            document.getElementById("scenario-file-input"),
        reset:
            document.getElementById("reset-scenario"),
        run:
            document.getElementById("run-experiment"),
        compareArchitectures:
            document.getElementById("compare-architectures"),
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
        newAuthorityMaximumControl:
            document.getElementById("new-authority-maximum-control"),
        newAuthorityMaximum:
            document.getElementById("new-authority-maximum"),
        conditionSupervisorConfirmationControl:
            document.getElementById("condition-supervisor-confirmation-control"),
        conditionSupervisorConfirmation:
            document.getElementById("condition-supervisor-confirmation"),
        transferDecisionOwnerControl:
            document.getElementById("transfer-decision-owner-control"),
        transferDecisionOwner:
            document.getElementById("transfer-decision-owner"),
        technicalValidity:
            document.getElementById("technical-validity"),
        selectionSummary:
            document.getElementById("selection-summary"),

        architectureOutput:
            document.getElementById("architecture-output"),
        controlRun:
            document.getElementById("control-run-output"),
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
            document.getElementById("event-log-output"),
        authorityExplain:
            document.getElementById("authority-explain-output"),
        boundaryExplain:
            document.getElementById("boundary-explain-output"),
        executionExplain:
            document.getElementById("execution-explain-output"),
        sameComparison:
            document.getElementById("same-layer-comparison-output"),
        separatedComparison:
            document.getElementById("separated-comparison-output"),
        comparisonSummary:
            document.getElementById("architecture-comparison-summary"),
        storyBefore:
            document.getElementById("story-before"),
        storyChange:
            document.getElementById("story-change"),
        storyAuthority:
            document.getElementById("story-authority"),
        storyTechnical:
            document.getElementById("story-technical"),
        storyOwner:
            document.getElementById("story-owner"),
        storyNewAuthority:
            document.getElementById("story-new-authority"),
        storyConsequence:
            document.getElementById("story-consequence"),
        storyMeaning:
            document.getElementById("story-meaning"),
        storyPrediction:
            document.getElementById("story-prediction"),
        comparisonSameReadable:
            document.getElementById("comparison-same-readable"),
        comparisonSeparatedReadable:
            document.getElementById("comparison-separated-readable"),
        comparisonFindingReadable:
            document.getElementById("comparison-finding-readable")
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

    function setDispositionControl(wrapper, control, applicable) {
        if (!wrapper || !control) {
            return;
        }

        wrapper.hidden = !applicable;
        wrapper.classList.toggle("is-applicable", applicable);
        control.disabled = !applicable;
    }

    function updateDispositionControls() {
        const disposition = elements.disposition.value;

        setDispositionControl(
            elements.newAuthorityMaximumControl,
            elements.newAuthorityMaximum,
            disposition === "NARROW"
        );

        setDispositionControl(
            elements.conditionSupervisorConfirmationControl,
            elements.conditionSupervisorConfirmation,
            disposition === "CONDITION"
        );

        setDispositionControl(
            elements.transferDecisionOwnerControl,
            elements.transferDecisionOwner,
            disposition === "TRANSFER"
        );
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
            (
                scenario.requestedAction.amountCents /
                100
            ).toFixed(2);

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
                (
                    scenario.decision.newScope.maximumAmountCents /
                    100
                ).toFixed(2);
        }
        else {
            elements.newAuthorityMaximum.value = "";
        }

        elements.conditionSupervisorConfirmation.value =
            scenario.currentConditions &&
            scenario.currentConditions.supervisorConfirmation === false
                ? "false"
                : "true";

        elements.transferDecisionOwner.value =
            scenario.decision.newDecisionOwner || "ACTOR-GOVERNANCE";

        updateDispositionControls();
        renderCurrentSelections();
    }

    function readableArchitecture(value) {
        if (value === "SEPARATED_REAUTHORIZATION") {
            return "Separated reauthorization";
        }

        return "Same-layer reauthorization";
    }

    function selectedMoney(value) {
        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "not set";
        }

        return "$" + number.toFixed(2);
    }

    function renderCurrentSelections() {
        if (!elements.selectionSummary) {
            return;
        }

        const disposition = elements.disposition.value;
        const parts = [
            "Risk after change: " + elements.currentRisk.value,
            "Requested refund: " + selectedMoney(elements.requestedAmount.value),
            "Governance disposition: " + disposition
        ];

        if (disposition === "NARROW") {
            parts.push(
                "New authority maximum: " +
                (
                    elements.newAuthorityMaximum.value
                        ? selectedMoney(elements.newAuthorityMaximum.value)
                        : "not set"
                )
            );
        }
        else if (disposition === "CONDITION") {
            parts.push(
                "Required condition: supervisor confirmation"
            );
            parts.push(
                "Supervisor confirmation present: " +
                (elements.conditionSupervisorConfirmation.value === "true"
                    ? "YES"
                    : "NO")
            );
        }
        else if (disposition === "TRANSFER") {
            parts.push(
                "New decision owner: " +
                (elements.transferDecisionOwner.value.trim() || "not set")
            );
        }

        parts.push(
            "Technical validity: " + elements.technicalValidity.value,
            "Expected execution: " + elements.expectedResult.value,
            "Reauthorization architecture: " +
                readableArchitecture(selectedArchitecture()) + "."
        );

        elements.selectionSummary.textContent =
            parts.join(" | ");
    }
    function applyControlsToScenarioObject(scenario) {
        scenario.reauthorizationArchitecture =
            selectedArchitecture();

        if (
            scenario.reauthorizationArchitecture ===
            "SEPARATED_REAUTHORIZATION"
        ) {
            scenario.decisionActor = JSON.parse(
                JSON.stringify(
                    scenario.designatedAuthorityOwner
                )
            );
        }
        else {
            scenario.decisionActor = JSON.parse(
                JSON.stringify(
                    scenario.operationalActor ||
                    scenario.decisionActor
                )
            );
        }

        scenario.currentConditions.customerRisk =
            elements.currentRisk.value;

        scenario.requestedAction.customerRisk =
            elements.currentRisk.value;

        const priorRisk =
            scenario.priorConditions &&
            scenario.priorConditions.customerRisk
                ? scenario.priorConditions.customerRisk
                : null;

        const selectedRisk =
            elements.currentRisk.value;

        if (
            priorRisk &&
            selectedRisk &&
            priorRisk !== selectedRisk
        ) {
            if (!Array.isArray(scenario.materialityRules)) {
                scenario.materialityRules = [];
            }

            const transitionExists =
                scenario.materialityRules.some(
                    function (rule) {
                        return (
                            rule &&
                            rule.type === "FIELD_TRANSITION" &&
                            rule.field === "customerRisk" &&
                            rule.from === priorRisk &&
                            rule.to === selectedRisk &&
                            rule.result === "MATERIAL"
                        );
                    }
                );

            if (!transitionExists) {
                scenario.materialityRules.push({
                    ruleId:
                        "RISK-" +
                        priorRisk +
                        "-" +
                        selectedRisk,
                    type: "FIELD_TRANSITION",
                    field: "customerRisk",
                    from: priorRisk,
                    to: selectedRisk,
                    result: "MATERIAL"
                });
            }
        }

        const requestedAmountCents =
            Math.round(
                Number(elements.requestedAmount.value) * 100
            );

        scenario.requestedAction.amountCents =
            requestedAmountCents;

        scenario.currentConditions.refundAmountCents =
            requestedAmountCents;

        scenario.decision.disposition =
            elements.disposition.value;

        scenario.expectedResult.expectedExecutionResult =
            elements.expectedResult.value;

        scenario.technicalRevalidation.status =
            elements.technicalValidity.value;

        scenario.technicalRevalidation.reason =
            elements.technicalValidity.value === "PASS"
                ? "Technical behavior remains valid under changed conditions."
                : "Technical revalidation failed under changed conditions.";

        delete scenario.decision.newScope;
        delete scenario.decision.conditions;
        delete scenario.decision.newDecisionOwner;
        delete scenario.decision.reauthorizedScopeDimensions;

        if (
            scenario.decision.disposition !== "CONDITION" &&
            Object.prototype.hasOwnProperty.call(
                scenario.currentConditions,
                "supervisorConfirmation"
            )
        ) {
            delete scenario.currentConditions.supervisorConfirmation;
        }

        if (scenario.decision.disposition === "NARROW") {
            const maximumDollars =
                Number(elements.newAuthorityMaximum.value);

            if (
                !Number.isFinite(maximumDollars) ||
                maximumDollars < 0
            ) {
                throw new Error(
                    "NARROW requires a valid new authority maximum."
                );
            }

            const priorScope =
                scenario.priorAuthority &&
                scenario.priorAuthority.scope
                    ? JSON.parse(
                        JSON.stringify(
                            scenario.priorAuthority.scope
                        )
                    )
                    : {};

            scenario.decision.newScope = {
                maximumAmountCents:
                    Math.round(maximumDollars * 100),
                allowedRiskLevels:
                    Array.isArray(priorScope.allowedRiskLevels)
                        ? priorScope.allowedRiskLevels.slice()
                        : [],
                maximumTransactionAgeDays:
                    Number.isInteger(
                        priorScope.maximumTransactionAgeDays
                    )
                        ? priorScope.maximumTransactionAgeDays
                        : 30
            };
        }
        else if (
            scenario.decision.disposition === "CONDITION"
        ) {
            scenario.decision.conditions = [
                {
                    required: true,
                    predicate: {
                        field: "supervisorConfirmation",
                        operator: "EQ",
                        comparisonValue: true,
                        valueType: "boolean"
                    }
                }
            ];

            scenario.currentConditions.supervisorConfirmation =
                elements.conditionSupervisorConfirmation.value ===
                "true";

            const priorScope =
                scenario.priorAuthority &&
                scenario.priorAuthority.scope
                    ? JSON.parse(
                        JSON.stringify(
                            scenario.priorAuthority.scope
                        )
                    )
                    : {};

            const conditionRiskLevels =
                Array.isArray(priorScope.allowedRiskLevels)
                    ? priorScope.allowedRiskLevels.slice()
                    : [];

            if (!conditionRiskLevels.includes(selectedRisk)) {
                conditionRiskLevels.push(selectedRisk);
            }

            scenario.decision.newScope = {
                maximumAmountCents:
                    priorScope.maximumAmountCents,
                allowedRiskLevels:
                    conditionRiskLevels,
                maximumTransactionAgeDays:
                    priorScope.maximumTransactionAgeDays
            };
        }
        else if (
            scenario.decision.disposition === "TRANSFER"
        ) {
            const newDecisionOwner =
                elements.transferDecisionOwner.value.trim();

            if (!newDecisionOwner) {
                throw new Error(
                    "TRANSFER requires an explicit new decision owner."
                );
            }

            scenario.decision.newDecisionOwner =
                newDecisionOwner;
        }

        if (Array.isArray(scenario.controlAssertions)) {
            scenario.controlAssertions =
                scenario.controlAssertions.filter(
                    function (assertion) {
                        return (
                            assertion.ruleReference !==
                                "ACTIVE_BOUNDARY_MAXIMUM" ||
                            scenario.decision.disposition ===
                                "NARROW"
                        );
                    }
                );

            scenario.controlAssertions.forEach(
                function (assertion) {
                    if (
                        assertion.ruleReference ===
                            "ACTIVE_BOUNDARY_MAXIMUM" &&
                        scenario.decision.newScope
                    ) {
                        assertion.parameters =
                            assertion.parameters || {};
                        assertion.parameters.maximumAmountCents =
                            scenario.decision.newScope.maximumAmountCents;
                    }
                }
            );
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
            initialTechnicalValidity:
                scenario.initialTechnicalValidity,
            controlExpectedResult:
                scenario.controlExpectedResult,
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

    function dollars(cents) {
        if (typeof cents !== "number") {
            return "not recorded";
        }

        return "$" + (cents / 100).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
    }

    function renderHumanSummary(result) {
        const control =
            result.controlRun || {};

        const controlBoundary =
            control.boundaryResult &&
            control.boundaryResult.boundary
                ? control.boundaryResult.boundary
                : {};

        const controlScope =
            controlBoundary.scope || {};

        const changed =
            result.changedState || {};

        const materiality =
            changed.materiality || {};

        const currentAuthority =
            changed.currentAuthority || {};

        const governed =
            result.governedResult || {};

        const decisionResult =
            governed.decisionResult || {};

        const translation =
            decisionResult.valid
                ? decisionResult.translation
                : null;

        const boundaryResult =
            governed.boundaryResult || {};

        const boundary =
            boundaryResult.boundary || {};

        const scope =
            boundary.scope || {};

        const execution =
            governed.executionResult || {};

        const attempts =
            result.runRecord &&
            Array.isArray(result.runRecord.executionAttempts)
                ? result.runRecord.executionAttempts
                : [];

        const attempt =
            attempts.length > 0
                ? attempts[0]
                : {};

        const technicalValidity =
            attempt.technicalValidity ||
            result.technicalRevalidation ||
            {};

        const requested =
            attempt.requestedAction ||
            result.requestedAction ||
            {};

        const priorConditions =
            control.requestedAction ||
            {};

        const currentConditions =
            attempt.requestedAction ||
            {};

        const architecture =
            result.architectureContext || {};

        const actor =
            architecture.decisionActor || {};

        const baselineResult =
            control.executionResult &&
            typeof control.executionResult.result ===
                "string"
                ? control.executionResult.result
                : "not recorded";

        const baselineMaximum =
            typeof controlScope.maximumAmountCents === "number"
                ? controlScope.maximumAmountCents
                : null;

        const requestedAmount =
            typeof requested.amountCents === "number"
                ? requested.amountCents
                : typeof currentConditions.refundAmountCents === "number"
                    ? currentConditions.refundAmountCents
                    : null;

        elements.storyBefore.textContent =
            "The requested action was " +
            dollars(requestedAmount) +
            ". Existing authority allowed up to " +
            dollars(baselineMaximum) +
            ", and baseline execution was " +
            baselineResult +
            ".";

        const priorRisk =
            priorConditions.customerRisk || "not recorded";

        const currentRisk =
            currentConditions.customerRisk || "not recorded";

        elements.storyChange.textContent =
            "Customer risk changed from " +
            priorRisk +
            " to " +
            currentRisk +
            ". The configured materiality rules classified that change as " +
            (materiality.result || "not recorded") +
            ".";

        elements.storyAuthority.textContent =
            "The prior authority became " +
            (currentAuthority.status || "not recorded") +
            ". The material change did not automatically preserve the old permission.";

        const baselineTechnicalStatus =
            control.technicalValidity &&
            control.technicalValidity.status
                ? control.technicalValidity.status
                : "not recorded";

        const currentTechnicalStatus =
            technicalValidity.status ||
            "not recorded";

        elements.storyTechnical.textContent =
            "Before the material change, initial technical validation was " +
            baselineTechnicalStatus +
            ". Technical revalidation is currently " +
            currentTechnicalStatus +
            ". Technical validity is recorded independently and does not itself create or restore organizational authority.";
        elements.storyOwner.textContent =
            (actor.name || actor.actorId || "The configured decision actor") +
            " made the reauthorization decision under " +
            (architecture.architecture || "the selected architecture") +
            ".";

        const disposition =
            translation && translation.disposition
                ? translation.disposition
                : "no recorded disposition";

        const allowedRiskLevels =
            Array.isArray(scope.allowedRiskLevels)
                ? scope.allowedRiskLevels.join(", ")
                : "not recorded";

        elements.storyNewAuthority.textContent =
            "The governance disposition was " +
            disposition +
            ". The current enforceable boundary allows up to " +
            dollars(scope.maximumAmountCents) +
            " and permits customer risk levels: " +
            allowedRiskLevels +
            ".";

        elements.storyConsequence.textContent =
            "The requested action is " +
            dollars(requestedAmount) +
            ". The current execution result is " +
            (execution.result || "not recorded") +
            ": " +
            (execution.reason || "no reason recorded") +
            (
                execution.result === "BLOCK"
                    ? " This does not determine the customer's ultimate refund outcome. It means only that this automated execution is not authorized under the authority currently in force; a separate escalation or authority path may exist outside this experiment."
                    : ""
            );
        const prediction =
            result.runRecord &&
            result.runRecord.predictionComparison
                ? result.runRecord.predictionComparison
                : {};

        const expectedExecution =
            prediction.expected ||
            prediction.expectedExecutionResult ||
            "not recorded";

        const actualExecution =
            prediction.actual ||
            execution.result ||
            "not recorded";

        const predictionComparison =
            prediction.comparison ||
            (
                expectedExecution === actualExecution
                    ? "MATCH"
                    : "MISMATCH"
            );

        elements.storyPrediction.textContent =
            "You expected " +
            expectedExecution +
            ". The actual execution result was " +
            actualExecution +
            ". Prediction comparison: " +
            predictionComparison +
            ".";
        const technicalStatus =
            technicalValidity.status || "not recorded";

        elements.storyMeaning.textContent =
            (
                technicalStatus === "PASS"
                    ? "Technical revalidation passed, but technical validity did not itself create or restore organizational authority. "
                    : technicalStatus === "FAIL"
                        ? "Technical revalidation failed, which is independently relevant to execution in addition to the organizational authority state. "
                        : "Technical revalidation status was not recorded. "
            ) +
            "Execution followed the current enforceable authority boundary and the configured technical controls. " +
            "This run demonstrates the configured authority-to-execution behavior; it does not establish that one governance architecture is universally superior.";
    }

    function renderReadableArchitectureComparison(
        sameResult,
        separatedResult,
        summary
    ) {
        const sameActor =
            sameResult.architectureContext.decisionActor;

        const separatedActor =
            separatedResult.architectureContext.decisionActor;

        const sameBoundary =
            (sameResult.governedResult.boundaryResult ? sameResult.governedResult.boundaryResult.boundary : null);

        const separatedBoundary =
            (separatedResult.governedResult.boundaryResult ? separatedResult.governedResult.boundaryResult.boundary : null);

        elements.comparisonSameReadable.textContent =
            (sameActor.name || sameActor.actorId) +
            " made the reauthorization decision. The resulting maximum was " +
            dollars(
                sameBoundary &&
                sameBoundary.scope
                    ? sameBoundary.scope.maximumAmountCents
                    : null
            ) +
            ", and execution was " +
            sameResult.runRecord.actualResult +
            ".";

        elements.comparisonSeparatedReadable.textContent =
            (separatedActor.name || separatedActor.actorId) +
            " made the reauthorization decision. The resulting maximum was " +
            dollars(
                separatedBoundary &&
                separatedBoundary.scope
                    ? separatedBoundary.scope.maximumAmountCents
                    : null
            ) +
            ", and execution was " +
            separatedResult.runRecord.actualResult +
            ".";

        if (summary.separationFinding) {
            elements.comparisonFindingReadable.textContent =
                "Changing the decision owner did not change the execution consequence in this controlled run. " +
                "The evidence therefore does not demonstrate that separation itself produced different operational control. " +
                "Formal finding: " +
                summary.separationFinding +
                ".";
        }
        else if (summary.executionDifference) {
            elements.comparisonFindingReadable.textContent =
                "The two controlled runs produced different execution outcomes. Inspect the authority, boundary, actor, and event evidence below before attributing the difference to the architecture.";
        }
        else {
            elements.comparisonFindingReadable.textContent =
                "No execution-outcome difference was observed in this controlled run. That is a valid experimental result and does not establish that either architecture is superior.";
        }
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

        elements.controlRun.textContent =
            pretty(
                result.controlRun
            );

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

        renderHumanSummary(
            result
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
            separationFinding:
                sameResult.architectureContext.decisionActor.actorId !==
                separatedResult.architectureContext.decisionActor.actorId &&
                sameResult.runRecord.actualResult ===
                separatedResult.runRecord.actualResult
                    ? "AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED"
                    : null,
            interpretation:
                sameResult.architectureContext.decisionActor.actorId !==
                separatedResult.architectureContext.decisionActor.actorId &&
                sameResult.runRecord.actualResult ===
                separatedResult.runRecord.actualResult
                    ? "AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED"
                    : sameResult.runRecord.actualResult ===
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

            const summary =
                architectureComparisonSummary(
                    sameResult,
                    separatedResult
                );

            elements.comparisonSummary.textContent =
                pretty(
                    summary
                );

            renderReadableArchitectureComparison(
                sameResult,
                separatedResult,
                summary
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

    function downloadJson(
        fileName,
        text
    ) {
        const blob =
            new Blob(
                [text],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            fileName;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );
    }

    function exportScenario() {
        try {
            applyControls();

            const scenario =
                parseScenario();

            const text =
                importExport.exportScenario(
                    scenario
                );

            downloadJson(
                importExport.scenarioFileName(
                    scenario
                ),
                text
            );

            setValidation(
                "PASS",
                "Scenario JSON exported."
            );

            return text;
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Scenario export failed: " +
                error.message
            );

            return null;
        }
    }

    function exportRunEvidence() {
        if (!lastRunRecord) {
            setValidation(
                "FAIL",
                "Run the experiment before exporting run evidence."
            );

            return null;
        }

        try {
            const text =
                importExport.exportRun(
                    lastRunRecord
                );

            downloadJson(
                importExport.runFileName(
                    lastRunRecord
                ),
                text
            );

            setValidation(
                "PASS",
                "Complete run evidence exported."
            );

            return text;
        }
        catch (error) {
            setValidation(
                "FAIL",
                "Run evidence export failed: " +
                error.message
            );

            return null;
        }
    }

    function importScenarioText(text) {
        const scenario =
            importExport.importScenario(
                text
            );

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
            "Compatible scenario JSON imported."
        );

        return scenario;
    }

    function requestScenarioImport() {
        elements.scenarioFileInput.value =
            "";

        elements.scenarioFileInput.click();
    }

    function handleScenarioFile(event) {
        const files =
            event.target.files;

        if (
            !files ||
            files.length === 0
        ) {
            return;
        }

        const file =
            files[0];

        const reader =
            new FileReader();

        reader.addEventListener(
            "load",
            function () {
                try {
                    importScenarioText(
                        String(
                            reader.result
                        )
                    );
                }
                catch (error) {
                    setValidation(
                        "FAIL",
                        "Scenario import failed: " +
                        error.message
                    );
                }
            }
        );

        reader.addEventListener(
            "error",
            function () {
                setValidation(
                    "FAIL",
                    "Scenario file could not be read."
                );
            }
        );

        reader.readAsText(
            file,
            "UTF-8"
        );
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
            elements.controlRun,
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
            defaultScenarioUrl,
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

    elements.importScenario.addEventListener(
        "click",
        requestScenarioImport
    );

    elements.exportScenario.addEventListener(
        "click",
        exportScenario
    );

    elements.exportRun.addEventListener(
        "click",
        exportRunEvidence
    );

    elements.scenarioFileInput.addEventListener(
        "change",
        handleScenarioFile
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

    [
        elements.sameLayer,
        elements.separated,
        elements.currentRisk,
        elements.requestedAmount,
        elements.disposition,
        elements.expectedResult,
        elements.newAuthorityMaximum,
        elements.technicalValidity
    ].forEach(function (element) {
        if (!element) {
            return;
        }

        element.addEventListener(
            element.type === "number"
                ? "input"
                : "change",
            renderCurrentSelections
        );
    });

    elements.disposition.addEventListener(
        "change",
        function () {
            updateDispositionControls();
            renderCurrentSelections();
        }
    );

    updateDispositionControls();
    renderCurrentSelections();
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
        renderHumanSummary:
            renderHumanSummary,
        runExperiment:
            runExperiment,
        compareArchitectures:
            compareArchitectures,
        architectureComparisonSummary:
            architectureComparisonSummary,
        importScenarioText:
            importScenarioText,
        exportScenario:
            exportScenario,
        exportRunEvidence:
            exportRunEvidence,
        runReplay:
            runReplay,
        resetScenario:
            resetScenario,
        loadDefaultScenario:
            loadDefaultScenario
    });

    loadDefaultScenario();
}());
