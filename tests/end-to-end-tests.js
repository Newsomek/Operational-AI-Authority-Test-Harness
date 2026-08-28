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

            technicalRevalidation: {
                status: "PASS",
                reason:
                    "Technical behavior remains valid."
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

            decision: {
                decisionId: "DECISION-3",
                disposition:
                    disposition || "RENEW",
                scenarioVersion:
                    "SCENARIO-1",
                policyVersion:
                    "POLICY-1"
            }
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
        "RENEW restores a 500 dollar authority and permits 400 dollar refund",
        function () {
            const result =
                runner.runCoreExperiment(
                    defaultInput("RENEW")
                );

            assertEqual(
                result.reauthorization.translation.authority.status,
                "ACTIVE",
                "Renewed authority should be ACTIVE."
            );

            assertEqual(
                result.reauthorization.boundaryResult.boundary.scope.maximumAmountCents,
                50000,
                "Expected renewed 500 dollar boundary."
            );

            assertEqual(
                result.reauthorization.executionResult.result,
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
                runner.runCoreExperiment(
                    input
                );

            assertEqual(
                result.reauthorization.translation.authority.scope.maximumAmountCents,
                25000,
                "Expected manually specified narrowed scope."
            );

            assertEqual(
                result.reauthorization.executionResult.result,
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
                runner.runCoreExperiment(
                    input
                );

            assertEqual(
                result.reauthorization.executionResult.result,
                "ALLOW",
                "Same action should be allowed when new boundary explicitly covers it."
            );
        }
    );

    test(
        "SUSPEND creates no executable boundary and remains blocked",
        function () {
            const result =
                runner.runCoreExperiment(
                    defaultInput("SUSPEND")
                );

            assertEqual(
                result.reauthorization.translation.authority.status,
                "SUSPENDED",
                "Expected suspended authority."
            );

            assertEqual(
                result.reauthorization.boundaryResult.boundaryCreated,
                false,
                "Suspended authority must create no executable boundary."
            );

            assertEqual(
                result.reauthorization.executionResult.result,
                "BLOCK",
                "Suspension must leave execution blocked."
            );
        }
    );

    test(
        "REFUSE creates no new authority and execution remains blocked",
        function () {
            const result =
                runner.runCoreExperiment(
                    defaultInput("REFUSE")
                );

            assertEqual(
                result.reauthorization.translation.authorityCreated,
                false,
                "REFUSE must create no authority."
            );

            assertEqual(
                result.reauthorization.executionResult.result,
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
                runner.runCoreExperiment(
                    input
                );

            assertEqual(
                result.reauthorization.translation.authorityCreated,
                false,
                "TRANSFER must not create executable authority."
            );

            assertEqual(
                result.reauthorization.translation.transferredDecisionOwner,
                "Risk Officer",
                "Expected transferred decision owner."
            );

            assertEqual(
                result.reauthorization.executionResult.result,
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