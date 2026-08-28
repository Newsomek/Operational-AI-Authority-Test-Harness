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
        "Application exposes scenario editor",
        function () {
            assertTrue(
                !!document.getElementById(
                    "scenario-editor"
                ),
                "Scenario editor should exist."
            );
        }
    );

    test(
        "Application exposes experiment control",
        function () {
            assertTrue(
                !!document.getElementById(
                    "run-experiment"
                ),
                "Run experiment button should exist."
            );
        }
    );

    test(
        "Application exposes replay control",
        function () {
            assertTrue(
                !!document.getElementById(
                    "run-replay"
                ),
                "Replay button should exist."
            );
        }
    );

    test(
        "Recommendation output is separate from execution output",
        function () {
            const recommendation =
                document.getElementById(
                    "recommendation-output"
                );

            const execution =
                document.getElementById(
                    "execution-output"
                );

            assertTrue(
                recommendation !== execution,
                "Recommendation and execution must be separate UI elements."
            );
        }
    );

    test(
        "Authority history and boundary output are separate",
        function () {
            assertTrue(
                document.getElementById(
                    "authority-history-output"
                ) !==
                document.getElementById(
                    "boundary-output"
                ),
                "Authority and boundary must remain separate UI artifacts."
            );
        }
    );

    test(
        "Prediction and control assertion outputs are separate",
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
        "UI controller builds governed run input without disposition-derived execution result",
        function () {
            const app =
                window.OAATH.App;

            const sample = {
                scenarioVersion:
                    "SCENARIO-1",
                policyVersion:
                    "POLICY-1",
                scenarioId:
                    "TEST",
                name:
                    "Test",
                description:
                    "Test",
                priorConditions: {},
                currentConditions: {},
                materialityRules: [],
                priorAuthority: {
                    authorityId: "AUTH-1"
                },
                decisionActor: {
                    actorId: "ACTOR-1"
                },
                technicalRevalidation: {},
                technicalCapability: {},
                requestedAction: {},
                evidenceItems: [],
                requiredEvidenceIds: [],
                allowedDispositions: [],
                decision: {
                    disposition: "NARROW"
                },
                expectedResult: {},
                controlAssertions: []
            };

            const built =
                app.buildRunInput(
                    sample
                );

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    built,
                    "executionResult"
                ),
                "UI must not manufacture an execution result."
            );

            assertEqual(
                built.decision.disposition,
                "NARROW",
                "Disposition should remain only a governance-decision input."
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
        " UI smoke tests passed.";

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