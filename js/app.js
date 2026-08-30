(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const replay =
        window.OAATH.ReplayEngine;

    const importExport =
        window.OAATH.ImportExport;

    const scenarioCatalog =
        window.OAATH.ScenarioCatalog;

    const appScriptUrl =
        new URL(document.currentScript.src);

    const defaultScenarioUrl =
        new URL(
            "../data/default-scenario.json",
            appScriptUrl
        ).href;

    if (!runner || !replay || !importExport || !scenarioCatalog) {
        throw new Error(
            "TestRunner, ReplayEngine, ImportExport, and ScenarioCatalog must load before app.js."
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
        scenarioSelector:
            document.getElementById("scenario-selector"),
        scenarioNarrative:
            document.getElementById("scenario-narrative"),
        scenarioSpecificControls:
            document.getElementById("scenario-specific-controls"),
        refundRiskControl:
            document.getElementById("refund-risk-control"),
        refundAmountControl:
            document.getElementById("refund-amount-control"),

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
    let selectedScenarioType = "AUTOMATED_REFUND";

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
        const refundScenario =
            selectedScenarioType === "AUTOMATED_REFUND";

        setDispositionControl(
            elements.newAuthorityMaximumControl,
            elements.newAuthorityMaximum,
            refundScenario && disposition === "NARROW"
        );

        setDispositionControl(
            elements.conditionSupervisorConfirmationControl,
            elements.conditionSupervisorConfirmation,
            refundScenario && disposition === "CONDITION"
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

        selectedScenarioType =
            scenario.scenarioType || "AUTOMATED_REFUND";

        const refundScenario =
            selectedScenarioType === "AUTOMATED_REFUND";

        if (elements.refundRiskControl) {
            elements.refundRiskControl.hidden = !refundScenario;
        }

        if (elements.refundAmountControl) {
            elements.refundAmountControl.hidden = !refundScenario;
        }

        if (elements.scenarioSpecificControls) {
            scenarioCatalog.renderControls(
                elements.scenarioSpecificControls,
                scenario
            );
        }

        if (refundScenario) {
            elements.currentRisk.value =
                scenario.currentConditions.customerRisk;

            elements.requestedAmount.value =
                (
                    scenario.requestedAction.amountCents /
                    100
                ).toFixed(2);
        }

        elements.disposition.value =
            scenario.decision.disposition;

        elements.expectedResult.value =
            scenario.expectedResult.expectedExecutionResult;

        elements.technicalValidity.value =
            scenario.technicalRevalidation.status;

        if (
            refundScenario &&
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

        if (refundScenario) {
            elements.conditionSupervisorConfirmation.value =
                scenario.currentConditions &&
                scenario.currentConditions.supervisorConfirmation === false
                    ? "false"
                    : "true";
        }

        elements.transferDecisionOwner.value =
            scenario.decision.newDecisionOwner ||
            (scenario.designatedAuthorityOwner
                ? scenario.designatedAuthorityOwner.actorId
                : "ACTOR-GOVERNANCE");

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
        const parts = [];

        if (selectedScenarioType === "AUTOMATED_REFUND") {
            parts.push(
                "Risk after change: " + elements.currentRisk.value,
                "Requested refund: " + selectedMoney(elements.requestedAmount.value)
            );
        }
        else if (elements.scenarioSpecificControls) {
            const scenario = elements.editor.value
                ? JSON.parse(elements.editor.value)
                : null;

            scenarioCatalog.summarizeControls(
                elements.scenarioSpecificControls,
                scenario
            ).forEach(function (item) {
                parts.push(item);
            });
        }

        parts.push("Governance disposition: " + disposition);

        if (
            selectedScenarioType === "AUTOMATED_REFUND" &&
            disposition === "NARROW"
        ) {
            parts.push(
                "New authority maximum: " +
                (elements.newAuthorityMaximum.value
                    ? selectedMoney(elements.newAuthorityMaximum.value)
                    : "not set")
            );
        }
        else if (
            selectedScenarioType === "AUTOMATED_REFUND" &&
            disposition === "CONDITION"
        ) {
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
        const scenarioType =
            scenario.scenarioType || "AUTOMATED_REFUND";

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

        if (scenarioType !== "AUTOMATED_REFUND") {
            scenarioCatalog.applyControls(
                elements.scenarioSpecificControls,
                scenario
            );

            scenarioCatalog.applyDispositionTemplate(
                scenario,
                scenario.decision.disposition
            );

            if (scenario.decision.disposition === "TRANSFER") {
                const configuredOwner =
                    elements.transferDecisionOwner.value.trim();

                if (configuredOwner) {
                    scenario.decision.newDecisionOwner =
                        configuredOwner;
                }
            }

            return scenario;
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
                scenarioType:
                    scenario.scenarioType,
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
            controlRequestedAction:
                scenario.controlRequestedAction,
            controlAssertion:
                scenario.controlAssertion,
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

    function describeBoundaryScope(scope) {
        const constraints =
            scope && Array.isArray(scope.constraints)
                ? scope.constraints
                : [];

        if (constraints.length === 0) {
            const legacyParts = [];

            if (typeof scope.maximumAmountCents === "number") {
                legacyParts.push(
                    "maximum " + dollars(scope.maximumAmountCents)
                );
            }

            if (Array.isArray(scope.allowedRiskLevels)) {
                legacyParts.push(
                    "customerRisk IN " +
                    JSON.stringify(scope.allowedRiskLevels)
                );
            }

            if (typeof scope.maximumTransactionAgeDays === "number") {
                legacyParts.push(
                    "transactionAgeDays LTE " +
                    String(scope.maximumTransactionAgeDays)
                );
            }

            return legacyParts.length > 0
                ? legacyParts.join("; ")
                : "no enforceable constraints were recorded";
        }

        return constraints.map(function (constraint) {
            return (
                constraint.field + " " +
                constraint.operator + " " +
                JSON.stringify(constraint.comparisonValue)
            );
        }).join("; ");
    }

    function formatObservedStoryValue(value) {
        if (Array.isArray(value)) {
            return value.join(", ");
        }
        if (typeof value === "boolean") {
            return value ? "TRUE" : "FALSE";
        }
        if (value === null || typeof value === "undefined" || value === "") {
            return "not recorded";
        }
        return String(value);
    }

    function observedChangeText(scenario, fallback) {
        const rules = scenario && Array.isArray(scenario.materialityRules)
            ? scenario.materialityRules
            : [];
        const rule = rules.length > 0 ? rules[0] : null;
        const field = rule && rule.field;

        if (
            !field ||
            !scenario ||
            !scenario.priorConditions ||
            !scenario.currentConditions ||
            typeof scenario.priorConditions[field] === "undefined" ||
            typeof scenario.currentConditions[field] === "undefined"
        ) {
            return fallback;
        }

        const labels = {
            customerRisk: "Customer risk",
            organizationalContext: "Organizational context",
            resultingWeeklyHours: "Resulting weekly hours",
            governedMetric: "Governed procurement metric",
            identityVerificationSucceeded: "Identity verification succeeded"
        };

        return (
            (labels[field] || field) +
            " changed from " +
            formatObservedStoryValue(scenario.priorConditions[field]) +
            " to " +
            formatObservedStoryValue(scenario.currentConditions[field]) +
            "."
        );
    }

    function renderHumanSummary(result, scenario) {
        const control = result.controlRun || {};
        const changed = result.changedState || {};
        const governed = result.governedResult || {};
        const decisionResult = governed.decisionResult || {};
        const translation = decisionResult.valid
            ? decisionResult.translation
            : null;
        const boundaryResult = governed.boundaryResult || {};
        const boundary = boundaryResult.boundary || {};
        const execution = governed.executionResult || {};
        const attempts =
            result.runRecord &&
            Array.isArray(result.runRecord.executionAttempts)
                ? result.runRecord.executionAttempts
                : [];

        const attempt =
            attempts.length > 0
                ? attempts[0]
                : {};

        const controlBoundary =
            control.boundaryResult && control.boundaryResult.boundary
                ? control.boundaryResult.boundary
                : {};

        const controlScope =
            controlBoundary.scope || {};

        const controlRequested =
            control.requestedAction || {};

        const requested =
            attempt.requestedAction || {};

        const legacyPresentation = {
            situation:
                "The requested action was " +
                dollars(requested.amountCents) +
                ". Existing authority allowed up to " +
                dollars(controlScope.maximumAmountCents) +
                ".",
            change:
                "Customer risk changed from " +
                (controlRequested.customerRisk || "not recorded") +
                " to " +
                (requested.customerRisk || "not recorded") +
                ".",
            authorityQuestion:
                "Can the current organizational authority still permit this consequence after the material change?",
            capability:
                "Technical capability is evaluated separately.",
            block:
                "The requested action is " +
                dollars(requested.amountCents) +
                ". The current execution result is BLOCK.",
            allow:
                "The requested action is " +
                dollars(requested.amountCents) +
                ". The current execution result is ALLOW."
        };

        const presentation = scenario && scenario.presentation
            ? scenario.presentation
            : legacyPresentation;
        const architecture = result.architectureContext || {};
        const actor = architecture.decisionActor || {};
        const materiality = changed.materiality || {};
        const currentAuthority = changed.currentAuthority || {};
        const technicalValidity = scenario && scenario.technicalRevalidation
            ? scenario.technicalRevalidation
            : (attempt.technicalValidity || result.technicalRevalidation || {});

        elements.storyBefore.textContent =
            (presentation.situation || "The configured consequence was evaluated.") +
            " Baseline execution was " +
            (control.executionResult ? control.executionResult.result : "not recorded") +
            ".";

        elements.storyChange.textContent =
            observedChangeText(
                scenario,
                presentation.change || "A configured condition changed."
            ) +
            " The materiality engine classified the change as " +
            (materiality.result || "not recorded") + ".";

        elements.storyAuthority.textContent =
            "The prior authority became " +
            (currentAuthority.status || "not recorded") +
            ". " +
            (presentation.authorityQuestion ||
                "Can current authority still permit the consequence after the change?");

        elements.storyTechnical.textContent =
            (presentation.capability || "Technical capability is evaluated separately.") +
            " Technical revalidation is " +
            (technicalValidity.status || "not recorded") +
            ". Technical validity does not itself create organizational authority.";

        elements.storyOwner.textContent =
            (actor.name || actor.actorId || "The configured decision actor") +
            " made the reauthorization decision under " +
            (architecture.architecture || "the selected architecture") + ".";

        elements.storyNewAuthority.textContent =
            "The governance disposition was " +
            (translation && translation.disposition
                ? translation.disposition
                : (scenario && scenario.decision
                    ? scenario.decision.disposition
                    : "no recorded disposition")) +
            ". The resulting enforceable scope contains: " +
            describeBoundaryScope(boundary.scope || {}) + ".";

        const domainResult = execution.result === "ALLOW"
            ? presentation.allow
            : presentation.block;

        elements.storyConsequence.textContent =
            (domainResult || "Execution result: " + (execution.result || "not recorded") + ".") +
            " " +
            (execution.reason || "No execution reason was recorded.") +
            (presentation.consequence
                ? " " + presentation.consequence
                : "");

        const prediction =
            result.runRecord && result.runRecord.predictionComparison
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

        elements.storyPrediction.textContent =
            "You expected " + expectedExecution +
            ". The actual execution result was " + actualExecution +
            ". Prediction comparison: " +
            (prediction.comparison ||
                (expectedExecution === actualExecution ? "MATCH" : "MISMATCH")) +
            ".";

        elements.storyMeaning.textContent =
            (presentation.evidence ||
                "Execution follows the current enforceable authority boundary.") +
            " This run demonstrates configured behavior inside the harness; it does not prove that the organizational rule or architecture is universally correct.";
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

    function renderRun(result, scenario) {
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
            result,
            scenario
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

            renderRun(result, scenario);

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

        const entry =
            scenarioCatalog.getByScenario(scenario);

        if (entry && elements.scenarioSelector) {
            elements.scenarioSelector.value =
                entry.scenarioId;
        }

        if (elements.scenarioNarrative) {
            scenarioCatalog.renderExplanation(
                elements.scenarioNarrative,
                scenario
            );
        }

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
            elements.eventLog,
            elements.authorityExplain,
            elements.boundaryExplain,
            elements.executionExplain,
            elements.sameComparison,
            elements.separatedComparison,
            elements.comparisonSummary
        ].forEach(function (element) {
            if (element) {
                element.textContent = "Not run.";
            }
        });

        [
            elements.storyBefore,
            elements.storyChange,
            elements.storyAuthority,
            elements.storyTechnical,
            elements.storyOwner,
            elements.storyNewAuthority,
            elements.storyConsequence,
            elements.storyMeaning,
            elements.storyPrediction,
            elements.comparisonSameReadable,
            elements.comparisonSeparatedReadable,
            elements.comparisonFindingReadable
        ].forEach(function (element) {
            if (element) {
                element.textContent = "Not run for the selected scenario.";
            }
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

        const entry =
            scenarioCatalog.getByScenario(scenario);

        if (entry && elements.scenarioSelector) {
            elements.scenarioSelector.value =
                entry.scenarioId;
        }

        if (elements.scenarioNarrative) {
            scenarioCatalog.renderExplanation(
                elements.scenarioNarrative,
                scenario
            );
        }

        syncControlsFromScenario(
            scenario
        );

        clearOutputs();

        setValidation(
            "PASS",
            message
        );
    }

    function loadScenarioById(scenarioId) {
        return scenarioCatalog.load(scenarioId)
            .then(function (scenario) {
                loadScenarioText(
                    pretty(scenario),
                    scenario.name + " loaded."
                );
                return scenario;
            })
            .catch(function (error) {
                setValidation(
                    "FAIL",
                    error.message
                );
                throw error;
            });
    }

    function loadDefaultScenario() {
        return loadScenarioById("REFUND-V2");
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

    if (elements.scenarioSelector) {
        scenarioCatalog.entries.forEach(function (entry) {
            const option = document.createElement("option");
            option.value = entry.scenarioId;
            option.textContent = entry.label;
            elements.scenarioSelector.appendChild(option);
        });

        elements.scenarioSelector.addEventListener(
            "change",
            function () {
                loadScenarioById(
                    elements.scenarioSelector.value
                );
            }
        );
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

    if (elements.scenarioSpecificControls) {
        elements.scenarioSpecificControls.addEventListener(
            "input",
            renderCurrentSelections
        );
        elements.scenarioSpecificControls.addEventListener(
            "change",
            renderCurrentSelections
        );
    }

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
            loadDefaultScenario,
        loadScenarioById:
            loadScenarioById
    });

    loadDefaultScenario();
}());
