(function () {
    "use strict";

    const materiality =
        window.OAATH.MaterialityEngine;

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

    function riskRule(from, to, result) {
        return {
            ruleId:
                "RISK-" + from + "-" + to,
            type:
                "FIELD_TRANSITION",
            field:
                "customerRisk",
            from:
                from,
            to:
                to,
            result:
                result
        };
    }

    test(
        "LOW to MEDIUM is MATERIAL when configured",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "MEDIUM"
                    },
                    rules: [
                        riskRule(
                            "LOW",
                            "MEDIUM",
                            "MATERIAL"
                        )
                    ]
                });

            assertEqual(
                result.result,
                "MATERIAL",
                "Default risk transition should be material."
            );
        }
    );

    test(
        "LOW to HIGH is MATERIAL when configured",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "HIGH"
                    },
                    rules: [
                        riskRule(
                            "LOW",
                            "HIGH",
                            "MATERIAL"
                        )
                    ]
                });

            assertEqual(
                result.result,
                "MATERIAL",
                "Configured transition should be material."
            );
        }
    );

    test(
        "Unmatched change defaults to NON_MATERIAL",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "MEDIUM"
                    },
                    rules: []
                });

            assertEqual(
                result.result,
                "NON_MATERIAL",
                "No matching rule should be non-material."
            );
        }
    );

    test(
        "Configured ambiguous transition produces AMBIGUOUS",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "MEDIUM"
                    },
                    rules: [
                        riskRule(
                            "LOW",
                            "MEDIUM",
                            "AMBIGUOUS"
                        )
                    ]
                });

            assertEqual(
                result.result,
                "AMBIGUOUS",
                "Ambiguous rule should remain ambiguous."
            );
        }
    );

    test(
        "AMBIGUOUS takes precedence over MATERIAL when both rules match",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "MEDIUM"
                    },
                    rules: [
                        riskRule(
                            "LOW",
                            "MEDIUM",
                            "MATERIAL"
                        ),
                        riskRule(
                            "LOW",
                            "MEDIUM",
                            "AMBIGUOUS"
                        )
                    ]
                });

            assertEqual(
                result.result,
                "AMBIGUOUS",
                "Conflicting matched rule should not silently create certainty."
            );
        }
    );

    test(
        "Numeric threshold crossing above configured value can be MATERIAL",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        refundAmountCents: 50000
                    },
                    currentConditions: {
                        refundAmountCents: 55000
                    },
                    rules: [
                        {
                            ruleId: "AMOUNT-500",
                            type:
                                "NUMERIC_THRESHOLD_CROSSING",
                            field:
                                "refundAmountCents",
                            threshold:
                                50000,
                            direction:
                                "ABOVE",
                            result:
                                "MATERIAL"
                        }
                    ]
                });

            assertEqual(
                result.result,
                "MATERIAL",
                "Crossing configured threshold should be material."
            );
        }
    );

    test(
        "Remaining below numeric threshold does not match crossing rule",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        refundAmountCents: 40000
                    },
                    currentConditions: {
                        refundAmountCents: 45000
                    },
                    rules: [
                        {
                            ruleId: "AMOUNT-500",
                            type:
                                "NUMERIC_THRESHOLD_CROSSING",
                            field:
                                "refundAmountCents",
                            threshold:
                                50000,
                            direction:
                                "ABOVE",
                            result:
                                "MATERIAL"
                        }
                    ]
                });

            assertEqual(
                result.result,
                "NON_MATERIAL",
                "No threshold crossing should remain non-material."
            );
        }
    );

    test(
        "Unknown materiality rule type is rejected",
        function () {
            assertThrows(
                function () {
                    materiality.evaluateMateriality({
                        priorConditions: {
                            customerRisk: "LOW"
                        },
                        currentConditions: {
                            customerRisk: "MEDIUM"
                        },
                        rules: [
                            {
                                ruleId: "BAD",
                                type: "MAGIC",
                                result: "MATERIAL"
                            }
                        ]
                    });
                },
                "Unsupported materiality rule must be rejected."
            );
        }
    );

    test(
        "Unknown materiality result is rejected",
        function () {
            assertThrows(
                function () {
                    materiality.evaluateMateriality({
                        priorConditions: {
                            customerRisk: "LOW"
                        },
                        currentConditions: {
                            customerRisk: "MEDIUM"
                        },
                        rules: [
                            riskRule(
                                "LOW",
                                "MEDIUM",
                                "PROBABLY"
                            )
                        ]
                    });
                },
                "Unsupported materiality result must be rejected."
            );
        }
    );

    test(
        "Materiality result is frozen",
        function () {
            const result =
                materiality.evaluateMateriality({
                    priorConditions: {
                        customerRisk: "LOW"
                    },
                    currentConditions: {
                        customerRisk: "MEDIUM"
                    },
                    rules: [
                        riskRule(
                            "LOW",
                            "MEDIUM",
                            "MATERIAL"
                        )
                    ]
                });

            assertTrue(
                Object.isFrozen(result),
                "Materiality result should be frozen."
            );

            assertTrue(
                Object.isFrozen(result.matchedRules),
                "Matched rule list should be frozen."
            );
        }
    );

    const summary =
        document.getElementById(
            "materiality-summary"
        );

    const resultList =
        document.getElementById(
            "materiality-results"
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
                "data-materiality-test-status",
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
                "data-materiality-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " materiality tests passed.";

    summary.setAttribute(
        "data-materiality-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-materiality-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-materiality-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());