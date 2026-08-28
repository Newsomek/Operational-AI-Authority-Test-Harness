(function () {
    "use strict";

    const tests = [];

    function test(name, fn) {
        tests.push({
            name: name,
            fn: fn
        });
    }

    function assertTrue(value, message) {
        if (value !== true) {
            throw new Error(message);
        }
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

    function sampleScenario() {
        return {
            scenarioId: "TEST",
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",
            name: "Test",
            description: "Test",
            reauthorizationArchitecture:
                "SAME_LAYER_REAUTHORIZATION",
            priorConditions: {
                customerRisk: "LOW"
            },
            currentConditions: {
                customerRisk: "MEDIUM",
                refundAmountCents: 40000
            },
            recommendation: {},
            technicalCapability: {},
            technicalRevalidation: {
                status: "PASS"
            },
            requestedAction: {
                amountCents: 40000,
                customerRisk: "MEDIUM"
            },
            materialityRules: [],
            priorAuthority: {
                authorityId: "AUTH-1"
            },
            decisionActor: {
                actorId: "ACTOR-1"
            },
            evidenceItems: [],
            requiredEvidenceIds: [],
            allowedDispositions: [],
            decision: {
                disposition: "NARROW",
                newScope: {
                    maximumAmountCents: 25000,
                    allowedRiskLevels: [
                        "LOW",
                        "MEDIUM"
                    ],
                    maximumTransactionAgeDays: 30
                }
            },
            expectedResult: {
                expectedExecutionResult: "BLOCK"
            },
            controlAssertions: []
        };
    }

    test(
        "Application controller is exposed",
        function () {
            assertTrue(
                !!window.OAATH.App,
                "App controller should exist."
            );
        }
    );

    test(
        "Structured architecture controls exist",
        function () {
            assertTrue(
                !!document.getElementById(
                    "architecture-same-layer"
                ),
                "Same-layer architecture control should exist."
            );

            assertTrue(
                !!document.getElementById(
                    "architecture-separated"
                ),
                "Separated architecture control should exist."
            );
        }
    );

    test(
        "Reset control exists",
        function () {
            assertTrue(
                !!document.getElementById(
                    "reset-scenario"
                ),
                "Reset button should exist."
            );
        }
    );

    test(
        "Raw JSON editor remains visible",
        function () {
            assertTrue(
                !!document.getElementById(
                    "scenario-editor"
                ),
                "Raw JSON editor must remain available."
            );
        }
    );

    test(
        "Architecture selection remains a scenario input",
        function () {
            const app =
                window.OAATH.App;

            const scenario =
                sampleScenario();

            const built =
                app.buildRunInput(
                    scenario
                );

            assertEqual(
                built.reauthorizationArchitecture,
                "SAME_LAYER_REAUTHORIZATION",
                "Architecture should pass through as experiment input."
            );

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    built,
                    "executionResult"
                ),
                "Architecture selection must not create execution result."
            );
        }
    );

    test(
        "Separated architecture also does not create execution result",
        function () {
            const app =
                window.OAATH.App;

            const scenario =
                sampleScenario();

            scenario.reauthorizationArchitecture =
                "SEPARATED_REAUTHORIZATION";

            const built =
                app.buildRunInput(
                    scenario
                );

            assertEqual(
                built.reauthorizationArchitecture,
                "SEPARATED_REAUTHORIZATION",
                "Separated architecture should remain an experimental input."
            );

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    built,
                    "executionResult"
                ),
                "Separated architecture must not create permission."
            );
        }
    );

    test(
        "Recommendation and execution outputs remain separate",
        function () {
            assertTrue(
                document.getElementById(
                    "recommendation-output"
                ) !==
                document.getElementById(
                    "execution-output"
                ),
                "Recommendation and execution must remain separate."
            );
        }
    );

    test(
        "Authority and boundary outputs remain separate",
        function () {
            assertTrue(
                document.getElementById(
                    "authority-history-output"
                ) !==
                document.getElementById(
                    "boundary-output"
                ),
                "Authority and boundary must remain separate."
            );
        }
    );

    test(
        "Prediction and control results remain separate",
        function () {
            assertTrue(
                document.getElementById(
                    "prediction-output"
                ) !==
                document.getElementById(
                    "assertion-output"
                ),
                "Prediction and control results must remain separate."
            );
        }
    );

    test(
        "Structured controls modify scenario data rather than output state",
        function () {
            const app =
                window.OAATH.App;

            const scenario =
                sampleScenario();

            const updated =
                app.applyControlsToScenarioObject(
                    scenario
                );

            assertTrue(
                Object.prototype.hasOwnProperty.call(
                    updated,
                    "reauthorizationArchitecture"
                ),
                "Structured controls should modify scenario input."
            );

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    updated,
                    "actualResult"
                ),
                "Structured controls must not manufacture observed result."
            );
        }
    );

    test(
        "Architecture comparison button exists",
        function () {
            assertTrue(
                !!document.getElementById(
                    "compare-architectures"
                ),
                "Architecture comparison control should exist."
            );
        }
    );

    test(
        "Architecture comparison summary does not declare separated architecture superior",
        function () {
            const app =
                window.OAATH.App;

            const summary =
                app.architectureComparisonSummary(
                    {
                        architectureContext: {
                            decisionActor: {
                                actorId: "OPS"
                            }
                        },
                        runRecord: {
                            actualResult: "BLOCK"
                        },
                        governedResult: {
                            executionResult: {
                                boundaryId: "B1"
                            }
                        }
                    },
                    {
                        architectureContext: {
                            decisionActor: {
                                actorId: "GOV"
                            }
                        },
                        runRecord: {
                            actualResult: "BLOCK"
                        },
                        governedResult: {
                            executionResult: {
                                boundaryId: "B2"
                            }
                        }
                    }
                );

            assertTrue(
                !summary.interpretation.toLowerCase().includes(
                    "superior"
                ),
                "Comparison must remain neutral."
            );
        }
    );

    test(
        "Explain outputs are separate visible artifacts",
        function () {
            assertTrue(
                document.getElementById(
                    "authority-explain-output"
                ) !==
                document.getElementById(
                    "boundary-explain-output"
                ),
                "Authority and boundary explanations must remain separate."
            );

            assertTrue(
                document.getElementById(
                    "boundary-explain-output"
                ) !==
                document.getElementById(
                    "execution-explain-output"
                ),
                "Boundary and execution explanations must remain separate."
            );
        }
    );

    test(
        "Architecture comparison output is separate from execution result",
        function () {
            assertTrue(
                document.getElementById(
                    "architecture-comparison-summary"
                ) !==
                document.getElementById(
                    "execution-output"
                ),
                "Comparison interpretation must not replace observed execution."
            );
        }
    );
    const summary =
        document.getElementById(
            "ui-summary"
        );

    const list =
        document.getElementById(
            "ui-results"
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
                "data-ui-test-status",
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
                "data-ui-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " UI interaction tests passed.";

    summary.setAttribute(
        "data-ui-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-ui-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-ui-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());