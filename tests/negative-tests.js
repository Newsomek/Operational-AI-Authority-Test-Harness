(function () {
    "use strict";

    const runner =
        window.OAATH.TestRunner;

    const execution =
        window.OAATH.ExecutionEngine;

    const authority =
        window.OAATH.AuthorityEngine;

    const boundary =
        window.OAATH.BoundaryEngine;

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
            runId:
                "NEGATIVE-RUN",

            scenarioVersion:
                "SCENARIO-NEGATIVE-1",

            policyVersion:
                "POLICY-NEGATIVE-1",

            scenarioSnapshot: {
                scenarioId:
                    "NEGATIVE-REFUND",
                name:
                    "Required attack tests"
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
                    ruleId:
                        "RISK-LOW-MEDIUM",
                    type:
                        "FIELD_TRANSITION",
                    field:
                        "customerRisk",
                    from:
                        "LOW",
                    to:
                        "MEDIUM",
                    result:
                        "MATERIAL"
                }
            ],

            priorAuthority: {
                authorityId:
                    "AUTH-104",
                authorityVersion:
                    104,
                actionType:
                    "AUTO_REFUND",
                purpose:
                    "CUSTOMER_REFUND",
                status:
                    "ACTIVE",
                owner:
                    "Operations",
                scope: {
                    maximumAmountCents:
                        50000,
                    allowedRiskLevels: [
                        "LOW"
                    ],
                    maximumTransactionAgeDays:
                        30
                },
                conditions: [],
                createdByDecisionId:
                    "DECISION-2",
                replacesAuthorityId:
                    "AUTH-103",
                invalidatedByEventId:
                    null,
                scenarioVersion:
                    "SCENARIO-NEGATIVE-1",
                policyVersion:
                    "POLICY-NEGATIVE-1"
            },

            invalidationEventId:
                "EVENT-NEGATIVE-1",

            materialityActorId:
                "ACTOR-MATERIALITY",

            revalidationActorId:
                "ACTOR-TECH",

            initialTechnicalValidity: {
                status:
                    "PASS",
                reason:
                    "Initial technical validation passed.",
                evidenceReferences: [
                    "E-TECH-INITIAL"
                ]
            },

            controlExpectedResult: {
                expectedExecutionResult:
                    "ALLOW",
                declaredBeforeExecution:
                    true
            },

            technicalRevalidation: {
                status:
                    "PASS",
                reason:
                    "Technical validation remains successful.",
                evidenceReferences: [
                    "E-TECH"
                ]
            },

            technicalCapability: {
                supported:
                    true,
                actionType:
                    "AUTO_REFUND",
                technicalLimitCents:
                    500000
            },

            requestedAction: {
                actionType:
                    "AUTO_REFUND",
                amountCents:
                    40000,
                customerRisk:
                    "MEDIUM",
                transactionAgeDays:
                    20
            },

            reauthorizationArchitecture:
                "SEPARATED_REAUTHORIZATION",

            operationalActor: {
                actorId:
                    "ACTOR-OPERATIONS",
                name:
                    "Operations",
                capabilities: [
                    "OPERATE_SYSTEM",
                    "REAUTHORIZE"
                ]
            },

            designatedAuthorityOwner: {
                actorId:
                    "ACTOR-GOVERNANCE",
                name:
                    "Governance Authority Owner",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            decisionActor: {
                actorId:
                    "ACTOR-OPERATIONS",
                name:
                    "Operations",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },

            separationReason:
                "Configured policy requires separated reauthorization.",

            evidenceItems: [
                {
                    evidenceId:
                        "E-POLICY",
                    type:
                        "POLICY",
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
                    "DECISION-NEGATIVE",
                disposition:
                    "NARROW",
            evidenceReviewed: [
                    "E-POLICY",
                    "E-RISK"
                ],
                newScope: {
                    maximumAmountCents:
                        25000,
                    allowedRiskLevels: [
                        "LOW"
                    ],
                    maximumTransactionAgeDays:
                        30
                },
                scenarioVersion:
                    "SCENARIO-NEGATIVE-1",
                policyVersion:
                    "POLICY-NEGATIVE-1"
            },

            expectedResult: {
                expectedExecutionResult:
                    "BLOCK",
                declaredBeforeExecution:
                    true
            },

            controlAssertions: [
                {
                    assertionId:
                        "NEG-NARROW-250",
                    ruleReference:
                        "ACTIVE_BOUNDARY_MAXIMUM",
                    assertionVersion:
                        "1",
                    parameters: {
                        maximumAmountCents:
                            25000
                    }
                }
            ]
        };
    }

    function run(input) {
        return runner.runGovernedExperiment(
            input
        );
    }

    window.OAATH.NegativeTestInputFactory =
        baseInput;

    test(
        "ATTACK: execute while authority is INVALID remains blocked",
        function () {
            const input =
                baseInput();

            const changed =
                runner.evaluateConditionChange(
                    input
                );

            assertEqual(
                changed.currentAuthority.status,
                "INVALID",
                "Material change should invalidate authority."
            );

            assertEqual(
                changed.executionState,
                "BLOCKED",
                "Invalid authority must remain blocked."
            );
        }
    );

    test(
        "ATTACK: materiality actor cannot become separated decision owner merely by being detector",
        function () {
            const result =
                run(
                    baseInput()
                );

            assertEqual(
                result.architectureContext.decisionActor.actorId,
                "ACTOR-GOVERNANCE",
                "Separated architecture must use designated authority owner."
            );

            assertTrue(
                result.architectureContext.decisionActor.actorId !==
                "ACTOR-MATERIALITY",
                "Materiality detector must not inherit reauthorization authority."
            );
        }
    );

    test(
        "ATTACK: original operational owner cannot bypass required escalation",
        function () {
            const result =
                run(
                    baseInput()
                );

            assertEqual(
                result.architectureContext.operationalActor.actorId,
                "ACTOR-OPERATIONS",
                "Operational actor should remain visible."
            );

            assertEqual(
                result.architectureContext.decisionActor.actorId,
                "ACTOR-GOVERNANCE",
                "Separated decision must be evaluated as designated-owner decision."
            );
        }
    );

    test(
        "ATTACK: missing disposition where reauthorization is required remains blocked",
        function () {
            const input =
                baseInput();

            delete input.decision.disposition;

            const result =
                run(input);

            assertEqual(
                result.governedResult.decisionResult.valid,
                false,
                "Missing disposition must invalidate governance decision."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Missing disposition must not permit execution."
            );
        }
    );

    test(
        "ATTACK: unauthorized designated actor cannot modify authority",
        function () {
            const input =
                baseInput();

            input.designatedAuthorityOwner.capabilities = [
                "OPERATE_SYSTEM"
            ];

            const result =
                run(input);

            assertEqual(
                result.governedResult.decisionResult.valid,
                false,
                "Unauthorized actor must be rejected."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Unauthorized authority change must remain blocked."
            );
        }
    );

    test(
        "ATTACK: prior authority is not reused after material change",
        function () {
            const result =
                run(
                    baseInput()
                );

            assertEqual(
                result.runRecord.authorityHistory[0].authorityId,
                "AUTH-104",
                "Original authority should be retained only as history."
            );

            assertEqual(
                result.runRecord.authorityHistory[1].status,
                "INVALID",
                "Prior authority must be represented as invalidated."
            );

            assertTrue(
                result.governedResult.executionResult.boundaryId !==
                "BOUNDARY-AUTH-104",
                "Execution must not use the stale prior boundary."
            );
        }
    );

    test(
        "ATTACK: missing required evidence prevents reauthorization",
        function () {
            const input =
                baseInput();

            input.evidenceItems =
                input.evidenceItems.filter(
                    function (item) {
                        return item.evidenceId !==
                            "E-RISK";
                    }
                );

            const result =
                run(input);

            assertEqual(
                result.governedResult.decisionResult.valid,
                false,
                "Missing required evidence must invalidate decision."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Missing evidence must remain blocked."
            );
        }
    );

    test(
        "ATTACK: required evidence present but not reviewed prevents reauthorization",
        function () {
            const input =
                baseInput();

            input.decision.evidenceReviewed = [
                "E-POLICY"
            ];

            const result =
                run(input);

            assertEqual(
                result.governedResult.decisionResult.valid,
                false,
                "Unreviewed required evidence must invalidate decision."
            );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Unreviewed evidence must remain blocked."
            );
        }
    );

    test(
        "ATTACK: 400 dollar execution after NARROW to 250 is blocked",
        function () {
            const result =
                run(
                    baseInput()
                );

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "400 dollar request must exceed 250 dollar authority."
            );
        }
    );

    test(
        "ATTACK: recommendation outside authority does not create permission",
        function () {
            const input =
                baseInput();

            input.recommendation = {
                actionType:
                    "AUTO_CREDIT",
                amountCents:
                    999999,
                confidence:
                    0.99999
            };

            const result =
                run(input);

            assertEqual(
                result.governedResult.executionResult.result,
                "BLOCK",
                "Recommendation must not override authority."
            );
        }
    );

    test(
        "ATTACK: increasing recommendation confidence does not change authority or execution",
        function () {
            const low =
                baseInput();

            const high =
                baseInput();

            low.recommendation = {
                confidence:
                    0.51
            };

            high.recommendation = {
                confidence:
                    0.99999
            };

            const lowResult =
                run(low);

            const highResult =
                run(high);

            assertEqual(
                lowResult.runRecord.actualResult,
                highResult.runRecord.actualResult,
                "Confidence alone must not change execution."
            );

            assertEqual(
                JSON.stringify(
                    lowResult.runRecord.authorityHistory
                ),
                JSON.stringify(
                    highResult.runRecord.authorityHistory
                ),
                "Confidence alone must not change authority history."
            );
        }
    );

    test(
        "ATTACK: technical revalidation PASS while authority invalid remains blocked",
        function () {
            const input =
                baseInput();

            const changed =
                runner.evaluateConditionChange(
                    input
                );

            assertEqual(
                changed.technicalRevalidation.status,
                "PASS",
                "Technical revalidation should remain independently PASS."
            );

            assertEqual(
                changed.currentAuthority.status,
                "INVALID",
                "Authority should remain INVALID before reauthorization."
            );

            assertEqual(
                changed.executionState,
                "BLOCKED",
                "Technical PASS must not create authority."
            );
        }
    );

    test(
        "DEPENDENCY: NARROW does not itself imply BLOCK when boundary permits action",
        function () {
            const prior = {
                authorityId:
                    "AUTH-200",
                authorityVersion:
                    200,
                actionType:
                    "AUTO_REFUND",
                purpose:
                    "CUSTOMER_REFUND",
                status:
                    "INVALID",
                owner:
                    "Operations",
                scope: {
                    maximumAmountCents:
                        100000,
                    allowedRiskLevels: [
                        "LOW"
                    ],
                    maximumTransactionAgeDays:
                        30
                },
                conditions: [],
                scenarioVersion:
                    "S1",
                policyVersion:
                    "P1"
            };

            const translation =
                authority.translateDecision(
                    prior,
                    {
                        decisionId:
                            "D-201",
                        disposition:
                            "NARROW",
                        newScope: {
                            maximumAmountCents:
                                50000,
                            allowedRiskLevels: [
                                "LOW"
                            ],
                            maximumTransactionAgeDays:
                                30
                        }
                    }
                );

            const boundaryResult =
                boundary.createBoundary(
                    translation.authority
                );

            const result =
                execution.evaluateExecution({
                    requestedAction: {
                        actionType:
                            "AUTO_REFUND",
                        amountCents:
                            40000,
                        customerRisk:
                            "LOW",
                        transactionAgeDays:
                            20
                    },
                    boundary:
                        boundaryResult.boundary,
                    technicalCapability: {
                        supported:
                            true
                    },
                    technicalValidity: {
                        status:
                            "PASS"
                    },
                    conditionValues: {}
                });

            assertEqual(
                result.result,
                "ALLOW",
                "Execution must evaluate narrowed boundary instead of disposition label."
            );
        }
    );

    test(
        "ATTACK: tampered recorded replay result cannot force recomputed execution",
        function () {
            const original =
                run(
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

            const replayed =
                window.OAATH.ReplayEngine.replay(
                    tampered
                );

            assertEqual(
                replayed.replayedRun.actualResult,
                "BLOCK",
                "Replay must recompute observed execution."
            );

            assertEqual(
                replayed.comparison.equivalent,
                false,
                "Tampering must create replay divergence."
            );
        }
    );

    test(
        "ATTACK: unsupported imported schema is rejected",
        function () {
            let rejected = false;

            try {
                window.OAATH.ImportExport.importScenario(
                    JSON.stringify({
                        schemaVersion:
                            "999",
                        scenarioVersion:
                            "S",
                        policyVersion:
                            "P",
                        priorConditions: {},
                        currentConditions: {},
                        materialityRules: [],
                        priorAuthority: {},
                        decision: {},
                        expectedResult: {}
                    })
                );
            }
            catch (error) {
                rejected = true;
            }

            assertEqual(
                rejected,
                true,
                "Unsupported imported schema must be rejected."
            );
        }
    );

    test(
        "SEPARATION: inserting a different approver without downstream outcome difference is not reported as superior",
        function () {
            const same =
                baseInput();

            same.reauthorizationArchitecture =
                "SAME_LAYER_REAUTHORIZATION";

            const separated =
                baseInput();

            separated.reauthorizationArchitecture =
                "SEPARATED_REAUTHORIZATION";

            const sameResult =
                run(same);

            const separatedResult =
                run(separated);

            assertEqual(
                sameResult.runRecord.actualResult,
                separatedResult.runRecord.actualResult,
                "This scenario intentionally permits equal downstream outcomes."
            );

            assertTrue(
                separatedResult.architectureContext.description
                    .toLowerCase()
                    .indexOf("superior") === -1,
                "Separated topology must not be labeled superior."
            );
        }
    );

    const summary =
        document.getElementById(
            "negative-summary"
        );

    const list =
        document.getElementById(
            "negative-results"
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
                "data-negative-test-status",
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
                "data-negative-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " negative / attack tests passed.";

    summary.setAttribute(
        "data-negative-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-negative-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-negative-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());