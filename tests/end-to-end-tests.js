(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const tests = [];

    function test(name, fn) {
        tests.push({
            name: name,
            fn: fn
        });
    }

    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(
                message +
                " Expected: " +
                String(expected) +
                " Actual: " +
                String(actual)
            );
        }
    }

    function assertTrue(value, message) {
        if (value !== true) {
            throw new Error(message);
        }
    }

    function defaultAuthority() {
        return {
            authorityId: "AUTH-104",
            authorityVersion: 104,
            actionType: "AUTO_REFUND",
            purpose: "CUSTOMER_REFUND",
            status: "ACTIVE",
            owner: "Operations",
            scope: {
                maximumAmountCents: 50000,
                allowedRiskLevels: ["LOW"],
                maximumTransactionAgeDays: 30
            },
            conditions: [],
            createdByDecisionId: "DECISION-2",
            replacesAuthorityId: "AUTH-103",
            invalidatedByEventId: null,
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1"
        };
    }

    function defaultInput(disposition) {
        return {
            runId:
                "END-TO-END-RUN-1",

            scenarioVersion:
                "SCENARIO-1",

            policyVersion:
                "POLICY-1",

            scenarioSnapshot: {
                scenarioId:
                    "REFUND-END-TO-END",
                scenarioVersion:
                    "SCENARIO-1",
                name:
                    "End-to-End Authority Test"
            },

            priorConditions: {
                customerRisk: "LOW",
                refundAmountCents: 40000,
                transactionAgeDays: 20
            },

            currentConditions: {
                customerRisk: "MEDIUM",
                refundAmountCents: 40000,
                transactionAgeDays: 20
            },

            materialityRules: [
                {
                    ruleId: "RISK-LOW-MEDIUM",
                    type: "FIELD_TRANSITION",
                    field: "customerRisk",
                    from: "LOW",
                    to: "MEDIUM",
                    result: "MATERIAL"
                }
            ],

            priorAuthority:
                defaultAuthority(),

            invalidationEventId:
                "EVENT-17",

            materialityActorId:
                "ACTOR-OPERATIONS",

            revalidationActorId:
                "ACTOR-TECH",

            initialTechnicalValidity: {
                status:
                    "PASS",
                reason:
                    "Initial technical validation passed before material change.",
                evidenceReferences: [
                    "E-TECH-INITIAL"
                ]
            },

            controlExpectedResult: {
                expectedExecutionResult:
                    "ALLOW",
                declaredBeforeExecution:
                    true,
                scenarioVersion:
                    "SCENARIO-1",
                policyVersion:
                    "POLICY-1"
            },

            technicalRevalidation: {
                status: "PASS",
                reason:
                    "Technical behavior remains valid.",
                evidenceReferences: [
                    "E-TECH"
                ]
            },

            technicalCapability: {
                supported: true,
                actionType: "AUTO_REFUND",
                technicalLimitCents: 500000
            },

            requestedAction: {
                actionType: "AUTO_REFUND",
                amountCents: 40000,
                customerRisk: "MEDIUM",
                transactionAgeDays: 20
            },

            decisionActor: {
                actorId:
                    "ACTOR-OPERATIONS",
                name:
                    "Operations Decision Owner",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            operationalActor: {
                actorId:
                    "ACTOR-OPERATIONS",
                name:
                    "Operations Decision Owner",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            designatedAuthorityOwner: {
                actorId:
                    "ACTOR-RISK",
                name:
                    "Risk Authority Owner",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            reauthorizationArchitecture:
                "SAME_LAYER_REAUTHORIZATION",

            separationReason:
                "Not used for same-layer end-to-end tests.",

            evidenceItems: [
                {
                    evidenceId:
                        "E-POLICY",
                    type:
                        "POLICY",
                    description:
                        "Refund policy",
                    available:
                        true,
                    reviewed:
                        true
                },
                {
                    evidenceId:
                        "E-RISK",
                    type:
                        "RISK_CHANGE",
                    description:
                        "Customer risk changed to MEDIUM",
                    available:
                        true,
                    reviewed:
                        true
                }
            ],

            requiredEvidenceIds: [
                "E-POLICY",
                "E-RISK"
            ],

            allowedDispositions: [
                "RENEW",
                "NARROW",
                "CONDITION",
                "TRANSFER",
                "SUSPEND",
                "REFUSE"
            ],

            decision: {
                decisionId:
                    "DECISION-3",
                disposition:
                    disposition || "RENEW",
                evidenceReviewed: [
                    "E-POLICY",
                    "E-RISK"
                ],
                scenarioVersion:
                    "SCENARIO-1",
                policyVersion:
                    "POLICY-1"
            },

            expectedResult: {
                expectedExecutionResult:
                    "BLOCK",
                declaredBeforeExecution:
                    true,
                scenarioVersion:
                    "SCENARIO-1",
                policyVersion:
                    "POLICY-1"
            },

            controlAssertions: []
        };
    }

    /*
     * These are manually declared expectations.
     * The tests do not use production behavior to generate
     * their expected results.
     */

    test(
        "Material change invalidates prior authority while revalidation may remain PASS",
        function () {
            const input =
                defaultInput("RENEW");

            const state =
                runner.evaluateConditionChange(
                    input
                );

            assertEqual(
                state.materiality.result,
                "MATERIAL",
                "Expected material change."
            );

            assertEqual(
                state.currentAuthority.status,
                "INVALID",
                "Prior authority must become invalid."
            );

            assertEqual(
                state.technicalRevalidation.status,
                "PASS",
                "Technical revalidation remains independently PASS."
            );

            assertEqual(
                state.executionState,
                "BLOCKED",
                "Execution must remain blocked after invalidation."
            );
        }
    );

    test(
        "Material change routes workflow to REAUTHORIZATION_REQUIRED",
        function () {
            const state =
                runner.evaluateConditionChange(
                    defaultInput("RENEW")
                );

            assertEqual(
                state.workflowState,
                "REAUTHORIZATION_REQUIRED",
                "Expected reauthorization workflow."
            );
        }
    );

    test(
        "RENEW restores a 500 dollar authority but blocks MEDIUM-risk action outside unchanged scope",
        function () {
            const result =
                runner.runGovernedExperiment(
                    defaultInput("RENEW")
                );

            assertEqual(
                result.governedResult.decisionResult.translation.authority.status,
                "ACTIVE",
                "Renewed authority should be ACTIVE."
            );

            assertEqual(
                result.governedResult.boundaryResult.boundary.scope.maximumAmountCents,
                50000,
                "Expected renewed 500 dollar boundary."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Medium risk remains outside unchanged renewed LOW-risk scope."
            );
        }
    );

    test(
        "NARROW to 250 dollars blocks the same 400 dollar requested action",
        function () {
            const input =
                defaultInput("NARROW");

            input.decision.newScope = {
                maximumAmountCents: 25000,
                allowedRiskLevels: [
                    "LOW",
                    "MEDIUM"
                ],
                maximumTransactionAgeDays: 30
            };

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.governedResult.decisionResult.translation.authority.scope.maximumAmountCents,
                25000,
                "Expected manually specified narrowed scope."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "400 dollar request must be blocked by 250 dollar boundary."
            );
        }
    );

    test(
        "RENEW with changed authority covering MEDIUM risk permits same 400 dollar action",
        function () {
            const input =
                defaultInput("NARROW");

            input.decision.newScope = {
                maximumAmountCents: 50000,
                allowedRiskLevels: [
                    "LOW",
                    "MEDIUM"
                ],
                maximumTransactionAgeDays: 30
            };

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.governedResult.executionResult.result,
                "ALLOW",
                "Same action should be allowed when new boundary explicitly covers it."
            );
        }
    );

    test(
        "SUSPEND creates no executable boundary and remains blocked",
        function () {
            const result =
                runner.runGovernedExperiment(
                    defaultInput("SUSPEND")
                );

            assertEqual(
                result.governedResult.decisionResult.translation.authority.status,
                "SUSPENDED",
                "Expected suspended authority."
            );

            assertEqual(
                result.governedResult.boundaryResult.boundaryCreated,
                false,
                "Suspended authority must create no executable boundary."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Suspension must leave execution blocked."
            );
        }
    );

    test(
        "REFUSE creates no new authority and execution remains blocked",
        function () {
            const result =
                runner.runGovernedExperiment(
                    defaultInput("REFUSE")
                );

            assertEqual(
                result.governedResult.decisionResult.translation.authorityCreated,
                false,
                "REFUSE must create no authority."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "REFUSE must leave execution blocked."
            );
        }
    );

    test(
        "TRANSFER creates no executable authority and remains blocked",
        function () {
            const input =
                defaultInput("TRANSFER");

            input.decision.newDecisionOwner =
                "Risk Officer";

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.governedResult.decisionResult.translation.authorityCreated,
                false,
                "TRANSFER must not create executable authority."
            );

            assertEqual(
                result.governedResult.decisionResult.translation.transferredDecisionOwner,
                "Risk Officer",
                "Expected transferred decision owner."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "TRANSFER must remain blocked until another governance decision."
            );
        }
    );

    const summary =
        document.getElementById(
            "end-to-end-summary"
        );

    const resultList =
        document.getElementById(
            "end-to-end-results"
        );

    let passed = 0;

    tests.forEach(function (item) {
        const row =
            document.createElement("li");

        try {
            item.fn();

            row.textContent =
                item.name + ": PASS";

            row.setAttribute(
                "data-end-to-end-test-status",
                "PASS"
            );

            passed += 1;
        }
        catch (error) {
            row.textContent =
                item.name +
                ": " +
                error.message;

            row.setAttribute(
                "data-end-to-end-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " core end-to-end tests passed.";

    summary.setAttribute(
        "data-end-to-end-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-end-to-end-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-end-to-end-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());