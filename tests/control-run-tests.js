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