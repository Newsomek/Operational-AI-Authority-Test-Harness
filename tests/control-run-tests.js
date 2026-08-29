(function () {
    "use strict";

    const control =
        window.OAATH.ControlRunEngine;

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

    function baseControlInput() {
        return {
            priorConditions: {
                customerRisk:
                    "LOW",
                refundAmountCents:
                    40000,
                transactionAgeDays:
                    20
            },

            priorAuthority: {
                authorityId:
                    "AUTH-CONTROL",
                authorityVersion:
                    1,
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
                scenarioVersion:
                    "S1",
                policyVersion:
                    "P1"
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

            technicalCapability: {
                supported:
                    true,
                actionType:
                    "AUTO_REFUND",
                technicalLimitCents:
                    500000
            },

            initialTechnicalValidity: {
                status:
                    "PASS"
            },

            controlExpectedResult: {
                expectedExecutionResult:
                    "ALLOW",
                declaredBeforeExecution:
                    true
            }
        };
    }

    test(
        "Baseline control run creates boundary from initial ACTIVE authority",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.boundaryResult.boundaryCreated,
                true,
                "Initial authority should create boundary."
            );
        }
    );

    test(
        "Baseline control run uses initial LOW-risk conditions",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.requestedAction.customerRisk,
                "LOW",
                "Control run must use pre-change risk."
            );
        }
    );

    test(
        "Baseline control run evaluates 400 dollar request",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.requestedAction.amountCents,
                40000,
                "Control run should evaluate 400 dollar refund."
            );
        }
    );

    test(
        "Baseline 500 dollar authority ALLOWs 400 dollar refund",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.executionResult.result,
                "ALLOW",
                "Baseline requested action should be permitted."
            );
        }
    );

    test(
        "Baseline expected ALLOW matches actual ALLOW",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.expectedVsActual.comparison,
                "MATCH",
                "Baseline expected and actual should match."
            );
        }
    );

    test(
        "Baseline boundary assertion passes independently",
        function () {
            const result =
                control.run(
                    baseControlInput()
                );

            assertEqual(
                result.controlAssertion.result,
                "PASS",
                "Initial boundary maximum assertion should pass."
            );
        }
    );

    test(
        "Baseline control requires explicit initial technical validity",
        function () {
            const input =
                baseControlInput();

            delete input.initialTechnicalValidity;

            let threw = false;

            try {
                control.run(input);
            }
            catch (error) {
                threw = true;
            }

            assertTrue(
                threw,
                "Missing initial technical validity must be rejected."
            );
        }
    );

    test(
        "Baseline control requires ACTIVE initial authority",
        function () {
            const input =
                baseControlInput();

            input.priorAuthority.status =
                "INVALID";

            let threw = false;

            try {
                control.run(input);
            }
            catch (error) {
                threw = true;
            }

            assertTrue(
                threw,
                "Invalid initial authority must not create baseline control."
            );
        }
    );

    test(
        "Governed experiment contains baseline control before changed-authority result",
        function () {
            const input =
                window.OAATH.NegativeTestInputFactory();

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.controlRun.executionResult.result,
                "ALLOW",
                "Baseline should ALLOW before material change."
            );

            assertEqual(
                result.runRecord.actualResult,
                "BLOCK",
                "Changed-authority run should remain BLOCK in default negative fixture."
            );
        }
    );

    test(
        "Run evidence retains the baseline control run",
        function () {
            const input =
                window.OAATH.NegativeTestInputFactory();

            const result =
                runner.runGovernedExperiment(
                    input
                );

            assertEqual(
                result.runRecord.controlRun.executionResult.result,
                "ALLOW",
                "Run evidence must retain baseline ALLOW."
            );
        }
    );

    test(
        "Generic baseline control uses explicit pre-change requested action",
        function () {
            const input = {
                priorConditions: {
                    organizationalContext: "PRODUCTION_OPERATIONS"
                },
                priorAuthority: {
                    authorityId: "AUTH-ACCESS-CONTROL",
                    authorityVersion: 1,
                    actionType: "GRANT_PRIVILEGED_ACCESS",
                    purpose: "PRODUCTION_ACCESS",
                    status: "ACTIVE",
                    owner: "Production Operations",
                    scope: {
                        constraints: [
                            {
                                field: "accessLevel",
                                operator: "IN",
                                comparisonValue: ["PRODUCTION_ADMIN"],
                                valueType: "string"
                            },
                            {
                                field: "organizationalContext",
                                operator: "IN",
                                comparisonValue: ["PRODUCTION_OPERATIONS"],
                                valueType: "string"
                            }
                        ]
                    },
                    conditions: [],
                    scenarioVersion: "S2",
                    policyVersion: "P2"
                },
                requestedAction: {
                    actionType: "GRANT_PRIVILEGED_ACCESS",
                    accessLevel: "PRODUCTION_ADMIN",
                    organizationalContext: "BUSINESS_ANALYTICS"
                },
                controlRequestedAction: {
                    actionType: "GRANT_PRIVILEGED_ACCESS",
                    accessLevel: "PRODUCTION_ADMIN",
                    organizationalContext: "PRODUCTION_OPERATIONS"
                },
                technicalCapability: {
                    supported: true,
                    actionType: "GRANT_PRIVILEGED_ACCESS"
                },
                initialTechnicalValidity: { status: "PASS" },
                controlExpectedResult: {
                    expectedExecutionResult: "ALLOW",
                    declaredBeforeExecution: true
                },
                controlAssertion: {
                    assertionId: "CONTROL-ACCESS-CONTEXT",
                    ruleReference: "ACTIVE_BOUNDARY_CONSTRAINT",
                    assertionVersion: "1",
                    parameters: {
                        field: "organizationalContext",
                        operator: "IN",
                        comparisonValue: ["PRODUCTION_OPERATIONS"]
                    }
                }
            };

            const result = control.run(input);

            assertEqual(
                result.requestedAction.organizationalContext,
                "PRODUCTION_OPERATIONS",
                "Baseline must consume the explicit pre-change action."
            );
            assertEqual(
                result.executionResult.result,
                "ALLOW",
                "Pre-change access should be allowed."
            );
            assertEqual(
                result.controlAssertion.result,
                "PASS",
                "Generic access boundary assertion should pass."
            );
        }
    );

    test(
        "Generic control assertion blocks an action outside a typed boundary",
        function () {
            const input = {
                priorConditions: {},
                priorAuthority: {
                    authorityId: "AUTH-WORK-CONTROL",
                    authorityVersion: 1,
                    actionType: "ASSIGN_SHIFT",
                    purpose: "WORKFORCE_SCHEDULING",
                    status: "ACTIVE",
                    owner: "Workforce Operations",
                    scope: {
                        constraints: [
                            {
                                field: "resultingWeeklyHours",
                                operator: "LTE",
                                comparisonValue: 40,
                                valueType: "integer"
                            }
                        ]
                    },
                    conditions: [],
                    scenarioVersion: "S3",
                    policyVersion: "P3"
                },
                requestedAction: {
                    actionType: "ASSIGN_SHIFT",
                    resultingWeeklyHours: 48
                },
                controlRequestedAction: {
                    actionType: "ASSIGN_SHIFT",
                    resultingWeeklyHours: 48
                },
                technicalCapability: {
                    supported: true,
                    actionType: "ASSIGN_SHIFT"
                },
                initialTechnicalValidity: { status: "PASS" },
                controlExpectedResult: {
                    expectedExecutionResult: "BLOCK",
                    declaredBeforeExecution: true
                },
                controlAssertion: {
                    assertionId: "CONTROL-WEEKLY-HOURS",
                    ruleReference: "ACTIVE_BOUNDARY_CONSTRAINT",
                    assertionVersion: "1",
                    parameters: {
                        field: "resultingWeeklyHours",
                        operator: "LTE",
                        comparisonValue: 40
                    }
                }
            };

            const result = control.run(input);

            assertEqual(result.executionResult.result, "BLOCK", "48 hours must exceed the 40-hour boundary.");
            assertEqual(result.controlAssertion.result, "PASS", "Generic boundary assertion should independently predict BLOCK.");
        }
    );

    test(
        "Procurement control demonstrates faithful enforcement of the configured equipment-price metric",
        function () {
            const input = {
                priorConditions: {
                    authorityMetric: "equipmentPriceCents"
                },
                priorAuthority: {
                    authorityId: "AUTH-PROC-CONTROL",
                    authorityVersion: 1,
                    actionType: "AUTHORIZE_PURCHASE",
                    purpose: "EQUIPMENT_PROCUREMENT",
                    status: "ACTIVE",
                    owner: "Procurement",
                    scope: {
                        constraints: [
                            {
                                field: "equipmentPriceCents",
                                operator: "LTE",
                                comparisonValue: 17500000,
                                valueType: "integer"
                            }
                        ]
                    },
                    conditions: [],
                    scenarioVersion: "S4",
                    policyVersion: "P4"
                },
                requestedAction: {
                    actionType: "AUTHORIZE_PURCHASE",
                    vendorId: "VENDOR-C",
                    equipmentPriceCents: 14500000,
                    shippingHandlingCents: 5500000,
                    totalAcquisitionCostCents: 20000000
                },
                controlRequestedAction: {
                    actionType: "AUTHORIZE_PURCHASE",
                    vendorId: "VENDOR-C",
                    equipmentPriceCents: 14500000,
                    shippingHandlingCents: 5500000,
                    totalAcquisitionCostCents: 20000000
                },
                technicalCapability: {
                    supported: true,
                    actionType: "AUTHORIZE_PURCHASE"
                },
                initialTechnicalValidity: { status: "PASS" },
                controlExpectedResult: {
                    expectedExecutionResult: "ALLOW",
                    declaredBeforeExecution: true
                },
                controlAssertion: {
                    assertionId: "CONTROL-EQUIPMENT-PRICE",
                    ruleReference: "ACTIVE_BOUNDARY_CONSTRAINT",
                    assertionVersion: "1",
                    parameters: {
                        field: "equipmentPriceCents",
                        operator: "LTE",
                        comparisonValue: 17500000
                    }
                }
            };

            const result = control.run(input);

            assertEqual(
                result.executionResult.result,
                "ALLOW",
                "The configured equipment-price rule should allow Vendor C."
            );
            assertEqual(
                result.controlAssertion.result,
                "PASS",
                "The control assertion should confirm faithful enforcement of the configured metric."
            );
            assertTrue(
                input.controlRequestedAction.totalAcquisitionCostCents > 17500000,
                "The fixture must retain the higher total acquisition cost as the counterexample."
            );
        }
    );

    const summary =
        document.getElementById(
            "control-run-summary"
        );

    const list =
        document.getElementById(
            "control-run-results"
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
                "data-control-run-test-status",
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
                "data-control-run-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " baseline control-run tests passed.";

    summary.setAttribute(
        "data-control-run-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-control-run-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-control-run-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());