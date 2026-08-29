(function () {
    "use strict";

    const validation = window.OAATH.ValidationEngine;
    const state = window.OAATH.StateMachine;

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
                " Expected: " + expected +
                " Actual: " + actual
            );
        }
    }

    function assertTrue(value, message) {
        if (value !== true) {
            throw new Error(message);
        }
    }

    function assertFalse(value, message) {
        if (value !== false) {
            throw new Error(message);
        }
    }

    function assertThrows(fn, message) {
        let threw = false;

        try {
            fn();
        }
        catch (error) {
            threw = true;
        }

        if (!threw) {
            throw new Error(message);
        }
    }

    test(
        "Authority ACTIVE may become INVALID",
        function () {
            assertEqual(
                state.transitionAuthorityStatus(
                    state.AUTHORITY_STATUS.ACTIVE,
                    state.AUTHORITY_STATUS.INVALID
                ),
                state.AUTHORITY_STATUS.INVALID,
                "Material invalidation should be legal."
            );
        }
    );

    test(
        "Invalid authority cannot be reactivated in place",
        function () {
            assertThrows(
                function () {
                    state.transitionAuthorityStatus(
                        state.AUTHORITY_STATUS.INVALID,
                        state.AUTHORITY_STATUS.ACTIVE
                    );
                },
                "INVALID -> ACTIVE must be rejected."
            );
        }
    );

    test(
        "Suspended authority cannot be reactivated in place",
        function () {
            assertThrows(
                function () {
                    state.transitionAuthorityStatus(
                        state.AUTHORITY_STATUS.SUSPENDED,
                        state.AUTHORITY_STATUS.ACTIVE
                    );
                },
                "SUSPENDED -> ACTIVE must be rejected."
            );
        }
    );

    test(
        "Stable workflow may enter materiality review",
        function () {
            assertEqual(
                state.transitionWorkflowState(
                    state.WORKFLOW_STATE.STABLE,
                    state.WORKFLOW_STATE.MATERIALITY_REVIEW_REQUIRED
                ),
                state.WORKFLOW_STATE.MATERIALITY_REVIEW_REQUIRED,
                "Condition change should enter materiality review."
            );
        }
    );

    test(
        "Material review may require reauthorization",
        function () {
            assertEqual(
                state.transitionWorkflowState(
                    state.WORKFLOW_STATE.MATERIALITY_REVIEW_REQUIRED,
                    state.WORKFLOW_STATE.REAUTHORIZATION_REQUIRED
                ),
                state.WORKFLOW_STATE.REAUTHORIZATION_REQUIRED,
                "Material change should permit reauthorization state."
            );
        }
    );

    test(
        "Reauthorization may enter decision pending",
        function () {
            assertEqual(
                state.transitionWorkflowState(
                    state.WORKFLOW_STATE.REAUTHORIZATION_REQUIRED,
                    state.WORKFLOW_STATE.DECISION_PENDING
                ),
                state.WORKFLOW_STATE.DECISION_PENDING,
                "Decision routing should be legal."
            );
        }
    );

    test(
        "Decision pending may complete",
        function () {
            assertEqual(
                state.transitionWorkflowState(
                    state.WORKFLOW_STATE.DECISION_PENDING,
                    state.WORKFLOW_STATE.DECISION_COMPLETE
                ),
                state.WORKFLOW_STATE.DECISION_COMPLETE,
                "Decision completion should be legal."
            );
        }
    );

    test(
        "Stable workflow cannot jump directly to decision complete",
        function () {
            assertThrows(
                function () {
                    state.transitionWorkflowState(
                        state.WORKFLOW_STATE.STABLE,
                        state.WORKFLOW_STATE.DECISION_COMPLETE
                    );
                },
                "Illegal workflow shortcut must be rejected."
            );
        }
    );

    test(
        "Execution may be allowed only from not attempted",
        function () {
            assertEqual(
                state.transitionExecutionState(
                    state.EXECUTION_STATE.NOT_ATTEMPTED,
                    state.EXECUTION_STATE.ALLOWED
                ),
                state.EXECUTION_STATE.ALLOWED,
                "Initial execution evaluation should be legal."
            );
        }
    );

    test(
        "Allowed execution may become executed",
        function () {
            assertEqual(
                state.transitionExecutionState(
                    state.EXECUTION_STATE.ALLOWED,
                    state.EXECUTION_STATE.EXECUTED
                ),
                state.EXECUTION_STATE.EXECUTED,
                "Allowed action should be recordable as executed."
            );
        }
    );

    test(
        "Blocked execution cannot become executed directly",
        function () {
            assertThrows(
                function () {
                    state.transitionExecutionState(
                        state.EXECUTION_STATE.BLOCKED,
                        state.EXECUTION_STATE.EXECUTED
                    );
                },
                "BLOCKED -> EXECUTED must be rejected."
            );
        }
    );

    test(
        "Execution reset is explicit and does not reuse prior permission",
        function () {
            assertEqual(
                state.resetExecutionForNewDecisionPoint(),
                state.EXECUTION_STATE.NOT_ATTEMPTED,
                "New decision point must require reevaluation."
            );
        }
    );

    test(
        "Typed integer predicate validates",
        function () {
            const check = validation.validateTypedPredicate({
                field: "refundAmountCents",
                operator: "LTE",
                comparisonValue: 50000,
                valueType: "integer"
            });

            assertTrue(
                check.valid,
                "Supported typed predicate should validate."
            );
        }
    );

    test(
        "Malformed predicate fails closed",
        function () {
            const check = validation.validateTypedPredicate({
                field: "refundAmountCents",
                operator: "LTE",
                comparisonValue: "50000",
                valueType: "integer"
            });

            assertFalse(
                check.valid,
                "Wrong comparison type must fail validation."
            );
        }
    );

    test(
        "Unknown predicate operator is rejected",
        function () {
            const check = validation.validateTypedPredicate({
                field: "refundAmountCents",
                operator: "MAGIC",
                comparisonValue: 50000,
                valueType: "integer"
            });

            assertFalse(
                check.valid,
                "Unsupported operator must fail validation."
            );
        }
    );

    test(
        "Money validation rejects non-integer cents",
        function () {
            const check = validation.validateInteger(
                400.25,
                "refundAmountCents",
                {
                    minimum: 0
                }
            );

            assertFalse(
                check.valid,
                "Money represented in cents must be integer-valued."
            );
        }
    );

    test(
        "Typed IN predicate accepts an array of matching string values",
        function () {
            const check = validation.validateTypedPredicate({
                field: "accessLevel",
                operator: "IN",
                comparisonValue: ["READ_ONLY", "PRODUCTION_ADMIN"],
                valueType: "string"
            });

            assertTrue(
                check.valid,
                "Typed IN predicates should accept arrays whose elements match valueType."
            );
        }
    );

    test(
        "Authority scope normalization adapts the V1 refund scope",
        function () {
            const check = validation.normalizeAuthorityScope({
                maximumAmountCents: 50000,
                allowedRiskLevels: ["LOW"],
                maximumTransactionAgeDays: 30
            });

            assertTrue(
                check.valid,
                "Legacy V1 scope should normalize successfully."
            );

            assertEqual(
                check.constraints.length,
                3,
                "Legacy V1 scope should produce three canonical constraints."
            );
        }
    );

    const results = [];
    let passed = 0;

    tests.forEach(function (item) {
        try {
            item.fn();

            results.push({
                name: item.name,
                passed: true,
                detail: "PASS"
            });

            passed += 1;
        }
        catch (error) {
            results.push({
                name: item.name,
                passed: false,
                detail: error.message
            });
        }
    });

    const summary = document.getElementById("summary");
    const resultList = document.getElementById("results");

    summary.textContent =
        passed + "/" + tests.length + " tests passed.";

    summary.setAttribute(
        "data-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-status",
        passed === tests.length ? "PASS" : "FAIL"
    );

    results.forEach(function (item) {
        const row = document.createElement("li");

        row.textContent =
            item.name + ": " + item.detail;

        row.setAttribute(
            "data-test-status",
            item.passed ? "PASS" : "FAIL"
        );

        resultList.appendChild(row);
    });
}());