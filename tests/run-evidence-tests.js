(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const evidenceEngine =
        window.OAATH.RunEvidenceEngine;

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

    function priorAuthority() {
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

    function baseInput() {
        return {
            runId: "RUN-001",
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",

            scenarioSnapshot: {
                scenarioId: "REFUND-DEFAULT",
                scenarioVersion: "SCENARIO-1",
                name: "Default Refund Authority Test"
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
                priorAuthority(),

            invalidationEventId:
                "EVENT-INVALIDATE-1",

            materialityActorId:
                "ACTOR-RISK",

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
                    "Technical validation remains successful.",
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

            reauthorizationArchitecture:
                "SAME_LAYER_REAUTHORIZATION",

            operationalActor: {
                actorId:
                    "ACTOR-RISK",
                name:
                    "Risk Officer",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            designatedAuthorityOwner: {
                actorId:
                    "ACTOR-SEPARATED",
                name:
                    "Separated Authority Owner",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            separationReason:
                "Fixture uses same-layer reauthorization unless explicitly changed.",

            decisionActor: {
                actorId: "ACTOR-RISK",
                name: "Risk Officer",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            evidenceItems: [
                {
                    evidenceId: "E-POLICY",
                    type: "POLICY",
                    description: "Refund policy",
                    available: true,
                    reviewed: true
                },
                {
                    evidenceId: "E-RISK",
                    type: "RISK_CHANGE",
                    description: "Customer risk changed to MEDIUM",
                    available: true,
                    reviewed: true
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
                decisionId: "DECISION-3",
                disposition: "NARROW",
            evidenceReviewed: [
                    "E-POLICY",
                    "E-RISK"
                ],
                newScope: {
                    maximumAmountCents: 25000,
                    allowedRiskLevels: [
                        "LOW"
                    ],
                    maximumTransactionAgeDays: 30
                },
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

            controlAssertions: [
                {
                    assertionId:
                        "ASSERT-INVALID-BLOCK",
                    ruleReference:
                        "INVALID_AUTHORITY_BLOCKS",
                    assertionVersion:
                        "1",
                    description:
                        "Material invalidation must block before reauthorization."
                },
                {
                    assertionId:
                        "ASSERT-NARROW-250",
                    ruleReference:
                        "ACTIVE_BOUNDARY_MAXIMUM",
                    assertionVersion:
                        "1",
                    description:
                        "New active boundary maximum is 250 dollars.",
                    parameters: {
                        maximumAmountCents:
                            25000
                    }
                }
            ]
        };
    }

    test(
        "Governed NARROW run produces BLOCK from 250 dollar boundary",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Expected 400 dollar request to be blocked by 250 dollar boundary."
            );
        }
    );

    test(
        "Expected versus actual is MATCH when predeclared BLOCK occurs",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertEqual(
                result.runRecord.predictionComparison.comparison,
                "MATCH",
                "Predeclared prediction should match observed BLOCK."
            );
        }
    );

    test(
        "Prediction mismatch remains distinct from control correctness",
        function () {
            const input =
                baseInput();

            input.expectedResult.expectedExecutionResult =
                "ALLOW";

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.runRecord.predictionComparison.comparison,
                "MISMATCH",
                "Prediction should mismatch."
            );

            assertEqual(
                result.runRecord.controlAssertionResults[1].result,
                "PASS",
                "Narrow-boundary control should still pass."
            );
        }
    );

    test(
        "Invalidation control assertion passes independently",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertEqual(
                result.runRecord.controlAssertionResults[0].result,
                "PASS",
                "Invalid authority block assertion should pass."
            );
        }
    );

    test(
        "Boundary maximum assertion passes independently",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertEqual(
                result.runRecord.controlAssertionResults[1].result,
                "PASS",
                "250 dollar boundary assertion should pass."
            );
        }
    );

    test(
        "Event log is deterministically sequenced",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const events =
                result.runRecord.eventLog;

            events.forEach(
                function (event, index) {
                    assertEqual(
                        event.sequence,
                        index + 1,
                        "Event sequence must be deterministic."
                    );
                }
            );
        }
    );

    test(
        "Event chain contains authority invalidation before authority creation",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const types =
                result.runRecord.eventLog.map(
                    function (event) {
                        return event.eventType;
                    }
                );

            const invalidatedIndex =
                types.indexOf(
                    "AUTHORITY_INVALIDATED"
                );

            const createdIndex =
                types.indexOf(
                    "AUTHORITY_CREATED"
                );

            assertTrue(
                invalidatedIndex >= 0,
                "Expected authority invalidation event."
            );

            assertTrue(
                createdIndex > invalidatedIndex,
                "New authority must follow invalidation."
            );
        }
    );

    test(
        "Event chain contains boundary creation before execution evaluation",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const types =
                result.runRecord.eventLog.map(
                    function (event) {
                        return event.eventType;
                    }
                );

            assertTrue(
                types.indexOf("BOUNDARY_CREATED") <
                types.indexOf("EXECUTION_EVALUATED"),
                "Boundary must exist before execution evaluation."
            );
        }
    );

    test(
        "Run evidence preserves authority history",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertEqual(
                result.runRecord.authorityHistory.length,
                3,
                "Expected original, invalidated, and new authority versions."
            );

            assertEqual(
                result.runRecord.authorityHistory[0].status,
                "ACTIVE",
                "Original authority should remain in history."
            );

            assertEqual(
                result.runRecord.authorityHistory[1].status,
                "INVALID",
                "Invalidated version should remain in history."
            );

            assertEqual(
                result.runRecord.authorityHistory[2].status,
                "ACTIVE",
                "New narrowed authority should be active."
            );
        }
    );

    test(
        "Run evidence identifies boundary used by execution attempt",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertTrue(
                typeof result.runRecord.executionAttempts[0].boundaryId ===
                    "string",
                "Execution attempt must identify evaluated boundary."
            );
        }
    );

    test(
        "Run record is deeply frozen",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            assertTrue(
                Object.isFrozen(
                    result.runRecord
                ),
                "Run record should be frozen."
            );

            assertTrue(
                Object.isFrozen(
                    result.runRecord.eventLog
                ),
                "Event log snapshot should be frozen."
            );
        }
    );

    test(
        "Expected result must be declared before execution",
        function () {
            let threw = false;

            try {
                evidenceEngine.compareExpectedActual(
                    {
                        expectedExecutionResult:
                            "BLOCK",
                        declaredBeforeExecution:
                            false
                    },
                    "BLOCK"
                );
            }
            catch (error) {
                threw = true;
            }

            assertTrue(
                threw,
                "Late expected result must be rejected."
            );
        }
    );

    test(
        "Control assertion with deliberately wrong normative maximum fails",
        function () {
            const input =
                baseInput();

            input.controlAssertions[1].parameters.maximumAmountCents =
                50000;

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.runRecord.controlAssertionResults[1].result,
                "FAIL",
                "Incorrect predefined control rule should fail."
            );
        }
    );

    test(
        "Unauthorized decision produces no authority and remains blocked",
        function () {
            const input =
                baseInput();

            input.decisionActor.capabilities = [
                "OPERATE_SYSTEM"
            ];

            input.operationalActor.capabilities = [
                "OPERATE_SYSTEM"
            ];

            input.controlAssertions = [
                {
                    assertionId:
                        "ASSERT-NO-AUTH",
                    ruleReference:
                        "NO_AUTHORITY_BLOCKS",
                    assertionVersion:
                        "1",
                    description:
                        "Invalid decision creates no authority and remains blocked."
                }
            ];

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.governedResult.decisionResult.valid,
                false,
                "Decision should be invalid."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Execution should remain blocked."
            );

            assertEqual(
                result.runRecord.controlAssertionResults[0].result,
                "PASS",
                "No-authority control assertion should pass."
            );
        }
    );

    test(
        "Replay inputs contain causal commands rather than recorded result commands",
        function () {
            const result =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const commandTypes =
                result.runRecord.replayInputs.map(
                    function (command) {
                        return command.commandType;
                    }
                );

            assertTrue(
                commandTypes.includes(
                    "CHANGE_CONDITION"
                ),
                "Replay inputs should preserve causal condition change."
            );

            assertTrue(
                !commandTypes.includes(
                    "EXECUTION_RESULT_SET"
                ),
                "Replay inputs must not contain forced execution result command."
            );

            assertTrue(
                !commandTypes.includes(
                    "CONTROL_ASSERTION_RESULT_SET"
                ),
                "Replay inputs must not contain forced assertion result command."
            );
        }
    );

    const summary =
        document.getElementById(
            "run-evidence-summary"
        );

    const resultList =
        document.getElementById(
            "run-evidence-results"
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
                "data-run-evidence-test-status",
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
                "data-run-evidence-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " run-evidence tests passed.";

    summary.setAttribute(
        "data-run-evidence-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-run-evidence-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-run-evidence-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());