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
                        "LOW"
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
        "Run Experiment render targets are bound",
        function () {
            [
                "authority-explain-output",
                "boundary-explain-output",
                "execution-explain-output"
            ].forEach(function (id) {
                assertTrue(
                    !!document.getElementById(id),
                    "Missing Run Experiment render target: " + id
                );
            });
        }
    );

    test(
        "Architecture comparison render targets are bound",
        function () {
            [
                "same-layer-comparison-output",
                "separated-comparison-output",
                "architecture-comparison-summary"
            ].forEach(function (id) {
                assertTrue(
                    !!document.getElementById(id),
                    "Missing architecture comparison render target: " + id
                );
            });
        }
    );
    test(
        "Human-readable experiment story targets exist",
        function () {
            [
                "experiment-story",
                "story-before",
                "story-change",
                "story-authority",
                "story-technical",
                "story-owner",
                "story-new-authority",
                "story-consequence",
                "story-meaning"
            ].forEach(function (id) {
                assertTrue(
                    !!document.getElementById(id),
                    "Missing human-readable story target: " + id
                );
            });
        }
    );

    test(
        "Human-readable architecture comparison targets exist",
        function () {
            [
                "comparison-same-readable",
                "comparison-separated-readable",
                "comparison-finding-readable"
            ].forEach(function (id) {
                assertTrue(
                    !!document.getElementById(id),
                    "Missing readable comparison target: " + id
                );
            });
        }
    );

    test(
        "Raw deterministic evidence remains present beneath narrative",
        function () {
            [
                "control-run-output",
                "materiality-output",
                "decision-output",
                "boundary-output",
                "execution-output",
                "architecture-comparison-summary",
                "authority-history-output",
                "event-log-output"
            ].forEach(function (id) {
                assertTrue(
                    !!document.getElementById(id),
                    "Required inspectable evidence target missing: " + id
                );
            });
        }
    );
    test(
        "Primary controls explain what they do and when to use them",
        function () {
            const ids = [
                    "load-default",
                    "import-scenario",
                    "export-scenario",
                    "export-run",
                    "reset-scenario",
                    "apply-controls",
                    "run-experiment",
                    "compare-architectures",
                    "run-replay"
            ];

            ids.forEach(function (id) {
                const button =
                    document.getElementById(id);

                assertTrue(
                    !!button,
                    "Expected primary control: " + id
                );

                assertTrue(
                    typeof button.getAttribute("title") ===
                        "string" &&
                    button.getAttribute("title").trim().length >
                        20,
                    "Primary control requires explanatory hover text: " +
                        id
                );

                assertTrue(
                    typeof button.getAttribute(
                        "aria-describedby"
                    ) === "string" &&
                    button.getAttribute(
                        "aria-describedby"
                    ).trim().length > 0,
                    "Primary control requires an accessible definition reference: " +
                        id
                );
            });

            assertTrue(
                !!document.getElementById(
                    "control-guide"
                ),
                "A visible control-definition guide is required."
            );
        }
    );
    test(
        "Money controls display dollars while scenario values remain cents",
        function () {
            const scenario =
                sampleScenario();

            window.OAATH.App.syncControlsFromScenario(
                scenario
            );

            assertEqual(
                document.getElementById(
                    "requested-amount"
                ).value,
                "400.00",
                "Requested refund amount should display dollars."
            );

            assertEqual(
                document.getElementById(
                    "new-authority-maximum"
                ).value,
                "250.00",
                "New authority maximum should display dollars."
            );

            const updated =
                window.OAATH.App.applyControlsToScenarioObject(
                    scenario
                );

            assertEqual(
                updated.requestedAction.amountCents,
                40000,
                "Requested refund must remain 40000 cents internally."
            );

            assertEqual(
                updated.currentConditions.refundAmountCents,
                40000,
                "Current-condition refund amount must remain 40000 cents internally."
            );

            assertEqual(
                updated.decision.newScope.maximumAmountCents,
                25000,
                "New authority maximum must remain 25000 cents internally."
            );
        }
    );
    test(
        "Human-readable story renders authoritative experiment values",
        function () {
            window.OAATH.App.renderHumanSummary({
                controlRun: {
                    boundaryResult: {
                        boundary: {
                            scope: {
                                maximumAmountCents:
                                    50000
                            }
                        }
                    },
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
                    executionResult: {
                        result:
                            "ALLOW"
                    }
                },

                changedState: {
                    materiality: {
                        result:
                            "MATERIAL"
                    },
                    currentAuthority: {
                        status:
                            "INVALID"
                    }
                },

                architectureContext: {
                    architecture:
                        "SAME_LAYER_REAUTHORIZATION",
                    decisionActor: {
                        actorId:
                            "ACTOR-OPERATIONS",
                        name:
                            "Operations Authority Owner"
                    }
                },

                governedResult: {
                    decisionResult: {
                        valid:
                            true,
                        translation: {
                            disposition:
                                "NARROW"
                        }
                    },
                    boundaryResult: {
                        boundary: {
                            scope: {
                                maximumAmountCents:
                                    25000
                            }
                        }
                    },
                    executionResult: {
                        result:
                            "BLOCK",
                        reason:
                            "Requested amount exceeds the current authorized maximum."
                    }
                },

                runRecord: {
                    executionAttempts: [
                        {
                            requestedAction: {
                                actionType:
                                    "AUTO_REFUND",
                                amountCents:
                                    40000,
                                customerRisk:
                                    "HIGH",
                                transactionAgeDays:
                                    20
                            },
                            technicalValidity: {
                                status:
                                    "PASS"
                            }
                        }
                    ]
                }
            });

            const before =
                document.getElementById(
                    "story-before"
                ).textContent;

            const change =
                document.getElementById(
                    "story-change"
                ).textContent;

            const newAuthority =
                document.getElementById(
                    "story-new-authority"
                ).textContent;

            const consequence =
                document.getElementById(
                    "story-consequence"
                ).textContent;

            assertTrue(
                before.includes("$400") &&
                before.includes("$500") &&
                before.includes("ALLOW"),
                "Baseline story must show $400 request, $500 authority, and ALLOW."
            );

            assertTrue(
                change.includes("LOW") &&
                change.includes("HIGH") &&
                change.includes("MATERIAL"),
                "Change story must show LOW to HIGH and MATERIAL."
            );

            assertTrue(
                newAuthority.includes("$250") &&
                newAuthority.includes("NARROW"),
                "New-authority story must show NARROW and $250."
            );

            assertTrue(
                consequence.includes("$400") &&
                consequence.includes("BLOCK"),
                "Consequence story must show $400 and BLOCK."
            );

            assertTrue(
                !before.includes("not recorded") &&
                !before.includes("[object Object]") &&
                !change.includes("not recorded"),
                "Human-readable story must not expose unresolved mapping placeholders."
            );
        }
    );
    test(
        "Experiment Story reports the executed change instead of stale scenario narrative",
        function () {
            const scenario = {
                priorConditions: {
                    customerRisk: "LOW"
                },
                currentConditions: {
                    customerRisk: "LOW"
                },
                materialityRules: [
                    {
                        field: "customerRisk"
                    }
                ],
                presentation: {
                    situation: "Configured refund scenario.",
                    change: "Customer risk changes from LOW to MEDIUM.",
                    capability: "Technical capability remains available.",
                    authorityQuestion: "Does current authority still permit execution?"
                },
                technicalRevalidation: {
                    status: "PASS"
                }
            };

            window.OAATH.App.renderHumanSummary(
                {
                    controlRun: {
                        boundaryResult: {
                            boundary: {
                                scope: {
                                    maximumAmountCents: 50000
                                }
                            }
                        },
                        requestedAction: {
                            amountCents: 40000,
                            customerRisk: "LOW"
                        },
                        executionResult: {
                            result: "ALLOW"
                        }
                    },
                    changedState: {
                        materiality: {
                            result: "NON_MATERIAL"
                        },
                        currentAuthority: {
                            status: "ACTIVE"
                        }
                    },
                    architectureContext: {
                        architecture: "SAME_LAYER_REAUTHORIZATION",
                        decisionActor: {
                            name: "Operations Authority Owner"
                        }
                    },
                    governedResult: {
                        decisionResult: {
                            valid: true,
                            translation: {
                                disposition: "RENEW"
                            }
                        },
                        boundaryResult: {
                            boundary: {
                                scope: {
                                    maximumAmountCents: 50000
                                }
                            }
                        },
                        executionResult: {
                            result: "ALLOW"
                        }
                    },
                    runRecord: {
                        executionAttempts: [
                            {
                                requestedAction: {
                                    amountCents: 40000,
                                    customerRisk: "LOW"
                                },
                                technicalValidity: {
                                    status: "PASS"
                                }
                            }
                        ]
                    }
                },
                scenario
            );

            const change = document.getElementById("story-change").textContent;

            assertTrue(
                change.includes("Customer risk changed from LOW to LOW.") &&
                change.includes("NON_MATERIAL") &&
                !change.includes("MEDIUM"),
                "Story change must reflect the executed LOW to LOW case, not the scenario default narrative."
            );
        }
    );
    test(
        "Scenario-specific controls replace prior scenario controls without stale remnants",
        function () {
            const container = document.createElement("div");

            window.OAATH.ScenarioCatalog.renderControls(
                container,
                {
                    ui: {
                        controls: [
                            {
                                id: "access-context",
                                label: "Current organizational context",
                                kind: "select",
                                path: "currentConditions.organizationalContext",
                                options: ["PRODUCTION_OPERATIONS", "BUSINESS_ANALYTICS"]
                            }
                        ]
                    },
                    currentConditions: {
                        organizationalContext: "BUSINESS_ANALYTICS"
                    }
                }
            );

            window.OAATH.ScenarioCatalog.renderControls(
                container,
                {
                    ui: {
                        controls: [
                            {
                                id: "work-resulting-hours",
                                label: "Resulting weekly hours if shift executes",
                                kind: "number",
                                path: "currentConditions.resultingWeeklyHours"
                            }
                        ]
                    },
                    currentConditions: {
                        resultingWeeklyHours: 48
                    }
                }
            );

            assertTrue(
                container.querySelector("#scenario-control-access-context") === null &&
                container.querySelector("#scenario-control-work-resulting-hours") !== null &&
                container.querySelectorAll("[data-scenario-control]").length === 1,
                "Rendering a destination scenario must remove controls from the source scenario."
            );
        }
    );
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

            assertEqual(
                summary.separationFinding,
                "AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED",
                "Different approver without downstream execution difference must report the governed separation finding."
            );

            assertEqual(
                summary.interpretation,
                "AUTHORITY SEPARATION NOT OPERATIONALLY DEMONSTRATED",
                "Visible comparison interpretation must report the governed separation finding."
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
    test(
        "Scenario import control exists",
        function () {
            assertTrue(
                !!document.getElementById(
                    "import-scenario"
                ),
                "Scenario import control should exist."
            );
        }
    );

    test(
        "Scenario export control exists",
        function () {
            assertTrue(
                !!document.getElementById(
                    "export-scenario"
                ),
                "Scenario export control should exist."
            );
        }
    );

    test(
        "Run evidence export control exists",
        function () {
            assertTrue(
                !!document.getElementById(
                    "export-run"
                ),
                "Run evidence export control should exist."
            );
        }
    );

    test(
        "Importing compatible scenario updates inputs but does not manufacture run evidence",
        function () {
            const imported =
                window.OAATH.App.importScenarioText(
                    JSON.stringify(
                        sampleScenario()
                    )
                );

            assertEqual(
                imported.scenarioVersion,
                "SCENARIO-1",
                "Imported scenario should be returned."
            );

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    imported,
                    "actualResult"
                ),
                "Imported scenario must not manufacture observed execution."
            );
        }
    );

    test(
        "All editable selections propagate without stale defaults",
        function () {
            document.getElementById(
                "architecture-same-layer"
            ).checked = false;

            document.getElementById(
                "architecture-separated"
            ).checked = true;

            document.getElementById(
                "current-risk"
            ).value = "HIGH";

            document.getElementById(
                "requested-amount"
            ).value = "375.50";

            document.getElementById(
                "decision-disposition"
            ).value = "NARROW";

            document.getElementById(
                "expected-result"
            ).value = "ALLOW";

            document.getElementById(
                "new-authority-maximum"
            ).value = "425.00";

            document.getElementById(
                "technical-validity"
            ).value = "FAIL";

            const scenario = {
                reauthorizationArchitecture:
                    "SAME_LAYER_REAUTHORIZATION",
                operationalActor: {
                    actorId:
                        "ACTOR-OPERATIONS",
                    name:
                        "Operations Authority Owner"
                },
                designatedAuthorityOwner: {
                    actorId:
                        "ACTOR-GOVERNANCE",
                    name:
                        "Governance Authority Owner"
                },
                priorConditions: {
                    customerRisk:
                        "LOW"
                },
                currentConditions: {
                    customerRisk:
                        "MEDIUM",
                    refundAmountCents:
                        40000
                },
                requestedAction: {
                    amountCents:
                        40000,
                    customerRisk:
                        "MEDIUM"
                },
                decision: {
                    disposition:
                        "NARROW",
                    newScope: {
                        maximumAmountCents:
                            25000,
                        allowedRiskLevels: [
                            "LOW"
                        ],
                        maximumTransactionAgeDays:
                            30
                    }
                },
                expectedResult: {
                    expectedExecutionResult:
                        "BLOCK"
                },
                technicalRevalidation: {
                    status:
                        "PASS"
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
                ]
            };

            const updated =
                window.OAATH.App
                    .applyControlsToScenarioObject(
                        scenario
                    );

            assertEqual(
                updated.reauthorizationArchitecture,
                "SEPARATED_REAUTHORIZATION",
                "Architecture selection must propagate."
            );

            assertEqual(
                updated.currentConditions.customerRisk,
                "HIGH",
                "Current risk HIGH must propagate."
            );

            assertEqual(
                updated.requestedAction.customerRisk,
                "HIGH",
                "Requested-action risk HIGH must propagate."
            );

            assertEqual(
                updated.requestedAction.amountCents,
                37550,
                "Requested amount must propagate as cents."
            );

            assertEqual(
                updated.currentConditions.refundAmountCents,
                37550,
                "Current-condition refund amount must propagate as cents."
            );

            assertEqual(
                updated.decision.disposition,
                "NARROW",
                "Governance disposition must propagate."
            );

            assertEqual(
                updated.decision.newScope.maximumAmountCents,
                42500,
                "New authority maximum must propagate as cents."
            );

            assertEqual(
                updated.expectedResult.expectedExecutionResult,
                "ALLOW",
                "Expected execution result must propagate."
            );

            assertEqual(
                updated.technicalRevalidation.status,
                "FAIL",
                "Technical validity must propagate."
            );

            assertTrue(
                updated.materialityRules.some(
                    function (rule) {
                        return (
                            rule.type ===
                                "FIELD_TRANSITION" &&
                            rule.field ===
                                "customerRisk" &&
                            rule.from ===
                                "LOW" &&
                            rule.to ===
                                "HIGH" &&
                            rule.result ===
                                "MATERIAL"
                        );
                    }
                ),
                "LOW to HIGH must create a MATERIAL transition rule."
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
    test(
        "CONDITION structured controls create an enforceable typed predicate",
        function () {
            const scenario = baseScenario();

            document.getElementById("decision-disposition").value =
                "CONDITION";
            document.getElementById(
                "condition-supervisor-confirmation"
            ).disabled = false;
            document.getElementById(
                "condition-supervisor-confirmation"
            ).value = "true";

            const applied =
                window.OAATH.App.applyControlsToScenarioObject(
                    scenario
                );

            assertTrue(
                Array.isArray(applied.decision.conditions),
                "CONDITION must create decision.conditions."
            );

            assertEqual(
                applied.decision.conditions[0].predicate.field,
                "supervisorConfirmation",
                "CONDITION predicate field mismatch."
            );

            assertEqual(
                applied.decision.conditions[0].predicate.operator,
                "EQ",
                "CONDITION predicate operator mismatch."
            );

            assertEqual(
                applied.currentConditions.supervisorConfirmation,
                true,
                "CONDITION execution value must propagate."
            );
        }
    );

    test(
        "TRANSFER structured controls provide explicit new decision owner",
        function () {
            const scenario = baseScenario();

            document.getElementById("decision-disposition").value =
                "TRANSFER";
            document.getElementById(
                "transfer-decision-owner"
            ).disabled = false;
            document.getElementById(
                "transfer-decision-owner"
            ).value = "ACTOR-GOVERNANCE";

            const applied =
                window.OAATH.App.applyControlsToScenarioObject(
                    scenario
                );

            assertEqual(
                applied.decision.newDecisionOwner,
                "ACTOR-GOVERNANCE",
                "TRANSFER new decision owner must propagate."
            );

            assertFalse(
                Object.prototype.hasOwnProperty.call(
                    applied.decision,
                    "newScope"
                ),
                "TRANSFER must not manufacture executable authority scope."
            );
        }
    );

    test(
        "Disposition-specific controls show only inputs relevant to the selected disposition",
        function () {
            const scenario = baseScenario();

            scenario.decision.disposition = "CONDITION";
            window.OAATH.App.syncControlsFromScenario(scenario);

            assertFalse(
                document.getElementById(
                    "condition-supervisor-confirmation-control"
                ).hidden,
                "CONDITION control should be visible."
            );

            assertTrue(
                document.getElementById(
                    "new-authority-maximum-control"
                ).hidden,
                "NARROW maximum should be hidden for CONDITION."
            );

            scenario.decision.disposition = "TRANSFER";
            window.OAATH.App.syncControlsFromScenario(scenario);

            assertFalse(
                document.getElementById(
                    "transfer-decision-owner-control"
                ).hidden,
                "TRANSFER owner control should be visible."
            );
        }
    );

    /* V1.0.2 disposition-specific UI regression marker */

}());
