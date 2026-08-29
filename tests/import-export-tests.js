(function () {
    "use strict";

    const io =
        window.OAATH.ImportExport;

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

    function scenario() {
        return {
            schemaVersion: "1.0",
            scenarioId: "TEST-SCENARIO",
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",
            name: "Test scenario",
            priorConditions: {
                customerRisk: "LOW"
            },
            currentConditions: {
                customerRisk: "MEDIUM"
            },
            materialityRules: [],
            operationalActor: {
                actorId: "OPS",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },
            designatedAuthorityOwner: {
                actorId: "GOV",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },
            decisionActor: {
                actorId: "OPS",
                capabilities: [
                    "REAUTHORIZE"
                ]
            },
            priorAuthority: {
                authorityId: "AUTH-1"
            },
            evidenceItems: [],
            requiredEvidenceIds: [],
            allowedDispositions: [
                "NARROW"
            ],
            reauthorizationArchitecture:
                "SAME_LAYER_REAUTHORIZATION",
            decision: {
                decisionId: "D-1",
                disposition: "NARROW"
            },
            expectedResult: {
                expectedExecutionResult:
                    "BLOCK"
            },
            technicalCapability: {
                supported: true
            },
            technicalRevalidation: {
                status: "PASS"
            },
            requestedAction: {
                actionType: "AUTO_REFUND"
            },
            recommendation: {
                recommendationId: "REC-1"
            },
            controlAssertions: []
        };
    }

    function runRecord() {
        return {
            runId: "RUN-1",
            scenarioSnapshot: {
                scenarioId: "TEST"
            },
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",
            authorityHistory: [],
            decisionHistory: [],
            eventLog: [],
            executionAttempts: [],
            expectedResult: {
                expectedExecutionResult:
                    "BLOCK"
            },
            actualResult:
                "BLOCK",
            predictionComparison: {
                expected: "BLOCK",
                actual: "BLOCK",
                comparison: "MATCH"
            },
            controlAssertions: [
                {
                    assertionId: "A-1"
                }
            ],
            controlAssertionResults: [
                {
                    assertionId: "A-1",
                    result: "PASS"
                }
            ],
            replayInputs: []
        };
    }

    test(
        "Scenario export uses plain JSON",
        function () {
            const text =
                io.exportScenario(
                    scenario()
                );

            const parsed =
                JSON.parse(text);

            assertEqual(
                parsed.exportType,
                "OAATH_SCENARIO",
                "Expected scenario export type."
            );
        }
    );

    test(
        "Scenario export includes required governing sections",
        function () {
            const exported =
                io.scenarioExportObject(
                    scenario()
                );

            assertTrue(
                !!exported.conditions,
                "Conditions should be exported."
            );

            assertTrue(
                Array.isArray(
                    exported.materialityRules
                ),
                "Materiality rules should be exported."
            );

            assertTrue(
                !!exported.actors,
                "Actors should be exported."
            );

            assertTrue(
                !!exported.authorityRules,
                "Authority rules should be exported."
            );

            assertTrue(
                !!exported.evidenceRequirements,
                "Evidence requirements should be exported."
            );

            assertTrue(
                !!exported.decisionCriteria,
                "Decision criteria should be exported."
            );

            assertTrue(
                !!exported.expectedResult,
                "Expected result should be exported."
            );

            assertTrue(
                !!exported.policyConfiguration,
                "Policy configuration should be exported."
            );
        }
    );

    test(
        "Scenario export preserves schema and scenario versions",
        function () {
            const exported =
                io.scenarioExportObject(
                    scenario()
                );

            assertEqual(
                exported.schemaVersion,
                "1.0",
                "Schema version should be exported."
            );

            assertEqual(
                exported.scenarioVersion,
                "SCENARIO-1",
                "Scenario version should be exported."
            );
        }
    );

    test(
        "Exported scenario can be imported",
        function () {
            const original =
                scenario();

            const imported =
                io.importScenario(
                    io.exportScenario(
                        original
                    )
                );

            assertEqual(
                imported.scenarioId,
                original.scenarioId,
                "Scenario identity should survive round trip."
            );

            assertEqual(
                imported.decision.disposition,
                original.decision.disposition,
                "Decision should survive round trip."
            );
        }
    );

    test(
        "Raw compatible scenario JSON can be imported",
        function () {
            const imported =
                io.importScenario(
                    JSON.stringify(
                        scenario()
                    )
                );

            assertEqual(
                imported.schemaVersion,
                "1.0",
                "Imported scenario should normalize schema version."
            );
        }
    );

    test(
        "Version 2 scenario schema survives export/import without downgrade",
        function () {
            const v2 =
                scenario();

            v2.schemaVersion =
                "2.0";
            v2.scenarioId =
                "V2-SCENARIO";

            const imported =
                io.importScenario(
                    io.exportScenario(
                        v2
                    )
                );

            assertEqual(
                imported.schemaVersion,
                "2.0",
                "V2 scenario schema should be preserved."
            );

            assertEqual(
                imported.scenarioId,
                "V2-SCENARIO",
                "V2 scenario identity should survive round trip."
            );
        }
    );

    test(
        "Version 2 raw scenario JSON is accepted",
        function () {
            const v2 =
                scenario();

            v2.schemaVersion =
                "2.0";

            const imported =
                io.importScenario(
                    JSON.stringify(v2)
                );

            assertEqual(
                imported.schemaVersion,
                "2.0",
                "Raw V2 scenario schema should remain 2.0."
            );
        }
    );

    test(
        "Malformed JSON import is rejected",
        function () {
            assertThrows(
                function () {
                    io.importScenario(
                        "{broken"
                    );
                },
                "Malformed import must be rejected."
            );
        }
    );

    test(
        "Unsupported scenario schema is rejected",
        function () {
            const bad =
                scenario();

            bad.schemaVersion =
                "99.0";

            assertThrows(
                function () {
                    io.importScenario(
                        JSON.stringify(
                            bad
                        )
                    );
                },
                "Unsupported schema must be rejected."
            );
        }
    );

    test(
        "Run export uses plain JSON",
        function () {
            const text =
                io.exportRun(
                    runRecord()
                );

            const parsed =
                JSON.parse(text);

            assertEqual(
                parsed.exportType,
                "OAATH_RUN_EVIDENCE",
                "Expected run evidence export type."
            );
        }
    );

    test(
        "Run export preserves required evidence sections",
        function () {
            const exported =
                io.runExportObject(
                    runRecord()
                );

            [
                "scenarioSnapshot",
                "scenarioVersion",
                "policyVersion",
                "authorityHistory",
                "decisionHistory",
                "eventLog",
                "executionAttempts",
                "expectedResult",
                "actualResult",
                "expectedVsActual",
                "controlAssertions",
                "controlAssertionResults"
            ].forEach(function (field) {
                assertTrue(
                    Object.prototype.hasOwnProperty.call(
                        exported,
                        field
                    ),
                    "Run export missing: " +
                    field
                );
            });
        }
    );

    test(
        "Expected-versus-actual remains separate from control assertion result",
        function () {
            const exported =
                io.runExportObject(
                    runRecord()
                );

            assertEqual(
                exported.expectedVsActual.comparison,
                "MATCH",
                "Expected-vs-actual should remain MATCH/MISMATCH."
            );

            assertEqual(
                exported.controlAssertionResults[0].result,
                "PASS",
                "Control assertion should remain PASS/FAIL."
            );
        }
    );

    test(
        "Scenario filename is deterministic",
        function () {
            assertEqual(
                io.scenarioFileName(
                    scenario()
                ),
                "oaath-scenario-TEST-SCENARIO-SCENARIO-1.json",
                "Unexpected scenario export filename."
            );
        }
    );

    test(
        "Run filename is deterministic",
        function () {
            assertEqual(
                io.runFileName(
                    runRecord()
                ),
                "oaath-run-RUN-1-SCENARIO-1.json",
                "Unexpected run export filename."
            );
        }
    );

    const summary =
        document.getElementById(
            "import-export-summary"
        );

    const list =
        document.getElementById(
            "import-export-results"
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
                "data-import-export-test-status",
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
                "data-import-export-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " import/export tests passed.";

    summary.setAttribute(
        "data-import-export-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-import-export-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-import-export-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());