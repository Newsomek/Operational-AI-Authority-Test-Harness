(function () {
    "use strict";

    const engine =
        window.OAATH.ArchitectureEngine;

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

    function operationalActor() {
        return {
            actorId: "OPS",
            capabilities: [
                "OPERATE_SYSTEM",
                "REAUTHORIZE"
            ]
        };
    }

    function governanceOwner() {
        return {
            actorId: "GOV",
            capabilities: [
                "REAUTHORIZE"
            ]
        };
    }

    test(
        "Same-layer reauthorization keeps decision in operational layer",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SAME_LAYER_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner()
                });

            assertEqual(
                result.decisionActor.actorId,
                "OPS",
                "Same-layer decision actor should be operational actor."
            );

            assertEqual(
                result.authorityMoved,
                false,
                "Same-layer should not claim decision authority moved."
            );
        }
    );

    test(
        "Separated reauthorization moves decision to designated authority owner",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SEPARATED_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner(),
                    separationReason:
                        "Policy requires separation."
                });

            assertEqual(
                result.decisionActor.actorId,
                "GOV",
                "Separated decision should move to designated owner."
            );

            assertEqual(
                result.authorityMoved,
                true,
                "Separated architecture should record movement."
            );
        }
    );

    test(
        "Separated reauthorization requires distinct actors",
        function () {
            assertThrows(
                function () {
                    engine.resolve({
                        reauthorizationArchitecture:
                            "SEPARATED_REAUTHORIZATION",
                        operationalActor:
                            operationalActor(),
                        designatedAuthorityOwner:
                            operationalActor()
                    });
                },
                "Separated architecture must reject identical actors."
            );
        }
    );

    test(
        "Separated architecture requires designated owner",
        function () {
            assertThrows(
                function () {
                    engine.resolve({
                        reauthorizationArchitecture:
                            "SEPARATED_REAUTHORIZATION",
                        operationalActor:
                            operationalActor()
                    });
                },
                "Separated architecture must require authority owner."
            );
        }
    );

    test(
        "Architecture result contains no execution result",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SAME_LAYER_REAUTHORIZATION",
                    operationalActor:
                        operationalActor()
                });

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    result,
                    "executionResult"
                ),
                "Architecture must not create execution result."
            );
        }
    );

    test(
        "Architecture result contains no enforceable boundary",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SEPARATED_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner()
                });

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    result,
                    "boundary"
                ),
                "Architecture must not create boundary."
            );
        }
    );

    test(
        "Architecture result contains no authority record",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SAME_LAYER_REAUTHORIZATION",
                    operationalActor:
                        operationalActor()
                });

            assertTrue(
                !Object.prototype.hasOwnProperty.call(
                    result,
                    "authority"
                ),
                "Architecture must not create authority."
            );
        }
    );

    test(
        "Separated result preserves movement reason",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SEPARATED_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner(),
                    separationReason:
                        "Configured boundary triggered separation."
                });

            assertEqual(
                result.movementReason,
                "Configured boundary triggered separation.",
                "Reason for separation should survive."
            );
        }
    );

    test(
        "Architecture terminology remains neutral",
        function () {
            const same =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SAME_LAYER_REAUTHORIZATION",
                    operationalActor:
                        operationalActor()
                });

            const separated =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SEPARATED_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner()
                });

            assertTrue(
                !same.description.toLowerCase().includes("weak"),
                "Same-layer must not be labeled weak."
            );

            assertTrue(
                !separated.description.toLowerCase().includes("superior"),
                "Separated must not be labeled superior."
            );
        }
    );

    test(
        "Architecture result is frozen",
        function () {
            const result =
                engine.resolve({
                    reauthorizationArchitecture:
                        "SEPARATED_REAUTHORIZATION",
                    operationalActor:
                        operationalActor(),
                    designatedAuthorityOwner:
                        governanceOwner()
                });

            assertTrue(
                Object.isFrozen(result),
                "Architecture result should be frozen."
            );
        }
    );

    const summary =
        document.getElementById(
            "architecture-summary"
        );

    const list =
        document.getElementById(
            "architecture-results"
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
                "data-architecture-test-status",
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
                "data-architecture-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " architecture tests passed.";

    summary.setAttribute(
        "data-architecture-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-architecture-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-architecture-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());