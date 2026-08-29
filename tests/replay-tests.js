(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const replay =
        window.OAATH.ReplayEngine;

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

    function baseInput() {
        return {
            runId: "REPLAY-RUN-1",
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",

            scenarioSnapshot: {
                scenarioId: "REFUND-DEFAULT",
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

            priorAuthority: {
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
            },

            invalidationEventId:
                "EVENT-INVALIDATE-REPLAY",

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
                reason: "Technical validation remains successful.",
                evidenceReferences: ["E-TECH"]
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
                capabilities: ["REAUTHORIZE"]
            },

            evidenceItems: [
                {
                    evidenceId: "E-POLICY",
                    type: "POLICY",
                    available: true,
                    reviewed: true
                },
                {
                    evidenceId: "E-RISK",
                    type: "RISK_CHANGE",
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
                scenarioVersion: "SCENARIO-1",
                policyVersion: "POLICY-1"
            },

            expectedResult: {
                expectedExecutionResult: "BLOCK",
                declaredBeforeExecution: true,
                scenarioVersion: "SCENARIO-1",
                policyVersion: "POLICY-1"
            },

            controlAssertions: [
                {
                    assertionId: "ASSERT-INVALID-BLOCK",
                    ruleReference: "INVALID_AUTHORITY_BLOCKS",
                    assertionVersion: "1",
                    description: "Invalid authority blocks before reauthorization."
                },
                {
                    assertionId: "ASSERT-NARROW-250",
                    ruleReference: "ACTIVE_BOUNDARY_MAXIMUM",
                    assertionVersion: "1",
                    description: "New boundary maximum is 250 dollars.",
                    parameters: {
                        maximumAmountCents: 25000
                    }
                }
            ]
        };
    }

    test(
        "Replay inputs contain only the permitted causal command vocabulary",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const allowed = [
                "START_SCENARIO",
                "CHANGE_CONDITION",
                "RECORD_TECHNICAL_REVALIDATION",
                "SUBMIT_GOVERNANCE_DECISION",
                "ATTEMPT_EXECUTION"
            ];

            original.runRecord.replayInputs.forEach(
                function (command) {
                    assertTrue(
                        allowed.includes(
                            command.commandType
                        ),
                        "Unexpected replay command: " +
                        command.commandType
                    );
                }
            );
        }
    );

    test(
        "Replay recomputes the same actual execution result",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertEqual(
                result.replayedRun.actualResult,
                original.runRecord.actualResult,
                "Replay actual result should match recomputation."
            );
        }
    );

    test(
        "Replay recomputes authority history equivalently",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.comparisons.authorityHistory,
                "Authority history should recompute equivalently."
            );
        }
    );

    test(
        "Replay recomputes execution attempts equivalently",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.comparisons.executionAttempts,
                "Execution attempts should recompute equivalently."
            );
        }
    );

    test(
        "Replay recomputes prediction comparison equivalently",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.comparisons.predictionComparison,
                "Prediction comparison should recompute equivalently."
            );
        }
    );

    test(
        "Replay recomputes control assertion results equivalently",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.comparisons.controlAssertionResults,
                "Control assertions should recompute equivalently."
            );
        }
    );

    test(
        "Complete deterministic evidence comparison reports equivalent",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.equivalent,
                "Recomputed deterministic evidence should be equivalent."
            );
        }
    );

    test(
        "Recorded actual result is not used as replay command",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const tampered =
                JSON.parse(
                    JSON.stringify(
                        original.runRecord
                    )
                );

            tampered.actualResult =
                "ALLOW";

            const result =
                replay.replay(
                    tampered
                );

            assertEqual(
                result.replayedRun.actualResult,
                "BLOCK",
                "Replay must recompute rather than obey recorded actual result."
            );

            assertTrue(
                !result.comparison.equivalent,
                "Tampered recorded result should create evidence divergence."
            );
        }
    );

    test(
        "Replay preserves explicit baseline control action and generic control assertion",
        function () {
            const input =
                baseInput();

            input.controlRequestedAction = {
                actionType: "AUTO_REFUND",
                amountCents: 40000,
                customerRisk: "LOW",
                transactionAgeDays: 20
            };

            input.controlAssertion = {
                assertionId: "CONTROL-REFUND-AMOUNT",
                ruleReference: "ACTIVE_BOUNDARY_CONSTRAINT",
                assertionVersion: "1",
                parameters: {
                    field: "amountCents",
                    operator: "LTE",
                    comparisonValue: 50000
                }
            };

            const original =
                runner.runGovernedExperiment(
                    input
                );

            const result =
                replay.replay(
                    original.runRecord
                );

            assertTrue(
                result.comparison.comparisons.controlRun,
                "Explicit baseline control run should recompute equivalently."
            );

            assertTrue(
                result.comparison.comparisons.controlAssertionResults,
                "Explicit generic control assertion should recompute equivalently."
            );

            assertTrue(
                result.comparison.equivalent,
                "Replay should remain fully equivalent when explicit baseline control inputs are present."
            );
        }
    );

    test(
        "Recorded control result is not used to force replay assertion result",
        function () {
            const original =
                runner.runGovernedExperiment(
                    baseInput()
                );

            const tampered =
                JSON.parse(
                    JSON.stringify(
                        original.runRecord
                    )
                );

            tampered.controlAssertionResults[1].result =
                "FAIL";

            const result =
                replay.replay(
                    tampered
                );

            assertEqual(
                result.replayedRun.controlAssertionResults[1].result,
                "PASS",
                "Replay must recompute the assertion."
            );

            assertTrue(
                !result.comparison.equivalent,
                "Tampered recorded assertion should diverge."
            );
        }
    );

    const summary =
        document.getElementById(
            "replay-summary"
        );

    const resultList =
        document.getElementById(
            "replay-results"
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
                "data-replay-test-status",
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
                "data-replay-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " replay tests passed.";

    summary.setAttribute(
        "data-replay-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-replay-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-replay-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());