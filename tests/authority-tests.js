(function () {
    "use strict";

    const authorityEngine =
        window.OAATH.AuthorityEngine;

    const boundaryEngine =
        window.OAATH.BoundaryEngine;

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

    function assertFalse(value, message) {
        if (value !== false) {
            throw new Error(message);
        }
    }

    function assertNull(value, message) {
        if (value !== null) {
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

    function basePriorAuthority() {
        return {
            authorityId: "AUTH-104",
            authorityVersion: 104,
            actionType: "AUTO_REFUND",
            purpose: "CUSTOMER_REFUND",
            status: "INVALID",
            owner: "Operations",
            scope: {
                maximumAmountCents: 50000,
                allowedRiskLevels: ["LOW"],
                maximumTransactionAgeDays: 30
            },
            conditions: [],
            createdByDecisionId: "DECISION-2",
            replacesAuthorityId: "AUTH-103",
            invalidatedByEventId: "EVENT-17",
            scenarioVersion: "SCENARIO-1",
            policyVersion: "POLICY-1",
            originatingDisposition: "RENEW"
        };
    }

    /*
     * The expectations below are manually declared test oracles.
     * They are not produced by AuthorityEngine or BoundaryEngine.
     */

    test(
        "RENEW creates a new ACTIVE authority version",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-3",
                        disposition: "RENEW",
                        scenarioVersion: "SCENARIO-1",
                        policyVersion: "POLICY-1"
                    }
                );

            assertTrue(
                result.authorityCreated,
                "RENEW must create an authority."
            );

            assertEqual(
                result.authority.status,
                "ACTIVE",
                "RENEW expected authority status."
            );

            assertEqual(
                result.authority.authorityVersion,
                105,
                "RENEW expected authority version."
            );

            assertEqual(
                result.authority.replacesAuthorityId,
                "AUTH-104",
                "RENEW must preserve authority lineage."
            );

            assertEqual(
                prior.status,
                "INVALID",
                "Prior authority must remain unchanged."
            );

            assertEqual(
                prior.authorityVersion,
                104,
                "Prior authority version must remain unchanged."
            );
        }
    );

    test(
        "RENEW boundary preserves configured 500 dollar maximum",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-3",
                        disposition: "RENEW"
                    }
                );

            const boundaryResult =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertTrue(
                boundaryResult.boundaryCreated,
                "RENEW authority should produce boundary."
            );

            assertEqual(
                boundaryResult.boundary.scope.maximumAmountCents,
                50000,
                "Expected manually declared 500 dollar boundary."
            );
        }
    );

    test(
        "NARROW creates new authority with manually specified 250 dollar maximum",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-4",
                        disposition: "NARROW",
                        newScope: {
                            maximumAmountCents: 25000,
                            allowedRiskLevels: ["LOW"],
                            maximumTransactionAgeDays: 30
                        }
                    }
                );

            assertTrue(
                result.authorityCreated,
                "NARROW must create authority."
            );

            assertEqual(
                result.authority.scope.maximumAmountCents,
                25000,
                "NARROW expected manually declared maximum."
            );

            assertEqual(
                prior.scope.maximumAmountCents,
                50000,
                "Prior scope must not be mutated."
            );
        }
    );

    test(
        "NARROW creates a boundary rather than an execution result",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-4",
                        disposition: "NARROW",
                        newScope: {
                            maximumAmountCents: 25000,
                            allowedRiskLevels: ["LOW"],
                            maximumTransactionAgeDays: 30
                        }
                    }
                );

            const result =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertTrue(
                result.boundaryCreated,
                "NARROW authority should create boundary."
            );

            assertEqual(
                result.boundary.scope.maximumAmountCents,
                25000,
                "Boundary must carry narrowed scope."
            );

            assertFalse(
                Object.prototype.hasOwnProperty.call(
                    result,
                    "executionResult"
                ),
                "Boundary translation must not create execution result."
            );
        }
    );

    test(
        "CONDITION creates ACTIVE authority with typed required condition",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-5",
                        disposition: "CONDITION",
                        conditions: [
                            {
                                required: true,
                                predicate: {
                                    field: "supervisorConfirmation",
                                    operator: "EQ",
                                    comparisonValue: true,
                                    valueType: "boolean"
                                }
                            }
                        ]
                    }
                );

            assertEqual(
                result.authority.status,
                "ACTIVE",
                "CONDITION expected ACTIVE authority."
            );

            assertEqual(
                result.authority.conditions.length,
                1,
                "Expected one manually specified condition."
            );
        }
    );

    test(
        "CONDITION may explicitly reauthorize changed scope while adding a typed condition",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-CONDITION-SCOPE",
                        disposition: "CONDITION",
                        newScope: {
                            maximumAmountCents: 50000,
                            allowedRiskLevels: [
                                "LOW",
                                "MEDIUM"
                            ],
                            maximumTransactionAgeDays: 30
                        },
                        conditions: [
                            {
                                required: true,
                                predicate: {
                                    field: "supervisorConfirmation",
                                    operator: "EQ",
                                    comparisonValue: true,
                                    valueType: "boolean"
                                }
                            }
                        ]
                    }
                );

            assertTrue(
                result.authority.scope.allowedRiskLevels.includes(
                    "MEDIUM"
                ),
                "CONDITION should carry explicitly reauthorized changed scope."
            );

            assertEqual(
                result.authority.conditions.length,
                1,
                "CONDITION should retain its typed predicate."
            );
        }
    );

    test(
        "Valid CONDITION authority produces enforceable boundary",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-5",
                        disposition: "CONDITION",
                        conditions: [
                            {
                                required: true,
                                predicate: {
                                    field: "supervisorConfirmation",
                                    operator: "EQ",
                                    comparisonValue: true,
                                    valueType: "boolean"
                                }
                            }
                        ]
                    }
                );

            const result =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertTrue(
                result.boundaryCreated,
                "Supported typed condition should be enforceable."
            );

            assertEqual(
                result.boundary.enforceableConditions.length,
                1,
                "Expected one enforceable condition."
            );
        }
    );

    test(
        "Malformed required condition does not create boundary",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-6",
                        disposition: "CONDITION",
                        conditions: [
                            {
                                required: true,
                                predicate: {
                                    field: "supervisorConfirmation",
                                    operator: "MAGIC",
                                    comparisonValue: true,
                                    valueType: "boolean"
                                }
                            }
                        ]
                    }
                );

            const result =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertFalse(
                result.boundaryCreated,
                "Malformed required condition must fail closed."
            );

            assertNull(
                result.boundary,
                "Malformed condition must not produce boundary."
            );
        }
    );

    test(
        "TRANSFER creates no authority",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-7",
                        disposition: "TRANSFER",
                        newDecisionOwner: "Risk Officer"
                    }
                );

            assertFalse(
                result.authorityCreated,
                "TRANSFER must not create executable authority."
            );

            assertNull(
                result.authority,
                "TRANSFER authority must be null."
            );

            assertEqual(
                result.transferredDecisionOwner,
                "Risk Officer",
                "TRANSFER must identify new decision owner."
            );
        }
    );

    test(
        "REFUSE creates no authority",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-8",
                        disposition: "REFUSE"
                    }
                );

            assertFalse(
                result.authorityCreated,
                "REFUSE must not create authority."
            );

            assertNull(
                result.authority,
                "REFUSE must produce no authority record."
            );
        }
    );

    test(
        "SUSPEND creates a new SUSPENDED authority version",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-9",
                        disposition: "SUSPEND"
                    }
                );

            assertTrue(
                result.authorityCreated,
                "SUSPEND must create a new authority version."
            );

            assertEqual(
                result.authority.status,
                "SUSPENDED",
                "Expected SUSPENDED status."
            );

            assertEqual(
                result.authority.authorityVersion,
                105,
                "Expected next authority version."
            );

            assertEqual(
                prior.status,
                "INVALID",
                "Prior authority must remain unchanged."
            );
        }
    );

    test(
        "SUSPENDED authority creates no executable boundary",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-9",
                        disposition: "SUSPEND"
                    }
                );

            const result =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertFalse(
                result.boundaryCreated,
                "Suspended authority must not create boundary."
            );

            assertNull(
                result.boundary,
                "Suspended authority boundary must be null."
            );
        }
    );

    test(
        "Unsupported disposition is rejected",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-10",
                            disposition: "APPROVE"
                        }
                    );
                },
                "Unsupported disposition must be rejected."
            );
        }
    );

    test(
        "NARROW requires explicit new scope",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-11",
                            disposition: "NARROW"
                        }
                    );
                },
                "NARROW without scope must be rejected."
            );
        }
    );

    test(
        "TRANSFER requires explicit new decision owner",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-12",
                            disposition: "TRANSFER"
                        }
                    );
                },
                "TRANSFER without owner must be rejected."
            );
        }
    );

    test(
        "Authority translation result is deeply frozen",
        function () {
            const prior = basePriorAuthority();

            const result =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-13",
                        disposition: "RENEW"
                    }
                );

            assertTrue(
                Object.isFrozen(result),
                "Translation result should be frozen."
            );

            assertTrue(
                Object.isFrozen(result.authority),
                "Authority record should be frozen."
            );

            assertTrue(
                Object.isFrozen(result.authority.scope),
                "Authority scope should be frozen."
            );
        }
    );

    test(
        "Boundary result is deeply frozen",
        function () {
            const prior = basePriorAuthority();

            const translation =
                authorityEngine.translateDecision(
                    prior,
                    {
                        decisionId: "DECISION-14",
                        disposition: "RENEW"
                    }
                );

            const result =
                boundaryEngine.createBoundary(
                    translation.authority
                );

            assertTrue(
                Object.isFrozen(result),
                "Boundary result should be frozen."
            );

            assertTrue(
                Object.isFrozen(result.boundary),
                "Boundary should be frozen."
            );

            assertTrue(
                Object.isFrozen(result.boundary.scope),
                "Boundary scope should be frozen."
            );
        }
    );

    const resultList =
        document.getElementById("authority-results");

    const summary =
        document.getElementById("authority-summary");

    let passed = 0;

    tests.forEach(function (item) {
        const row = document.createElement("li");

        try {
            item.fn();

            row.textContent =
                item.name + ": PASS";

            row.setAttribute(
                "data-authority-test-status",
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
                "data-authority-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " authority/boundary tests passed.";

    summary.setAttribute(
        "data-authority-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-authority-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-authority-status",
        passed === tests.length ? "PASS" : "FAIL"
    );
    test(
        "NARROW rejects scope broadening even when another dimension is stricter",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-NARROW-MIXED",
                            disposition: "NARROW",
                            newScope: {
                                maximumAmountCents: 25000,
                                allowedRiskLevels: [
                                    "LOW",
                                    "MEDIUM"
                                ],
                                maximumTransactionAgeDays: 30
                            }
                        }
                    );
                },
                "NARROW must reject mixed narrow-plus-broaden scope changes."
            );
        }
    );

    test(
        "NARROW rejects scope with no stricter enforceable boundary",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-NARROW-NO-STRICTER",
                            disposition: "NARROW",
                            newScope: {
                                maximumAmountCents: 50000,
                                allowedRiskLevels: ["LOW"],
                                maximumTransactionAgeDays: 30
                            }
                        }
                    );
                },
                "NARROW must reject an unchanged scope."
            );
        }
    );

    test(
        "NARROW rejects broadening of amount",
        function () {
            const prior = basePriorAuthority();

            assertThrows(
                function () {
                    authorityEngine.translateDecision(
                        prior,
                        {
                            decisionId: "DECISION-NARROW-AMOUNT-BROADENING",
                            disposition: "NARROW",
                            newScope: {
                                maximumAmountCents: 60000,
                                allowedRiskLevels: ["LOW"],
                                maximumTransactionAgeDays: 30
                            }
                        }
                    );
                },
                "NARROW must reject amount broadening."
            );
        }
    );

    /* Strict NARROW semantics regression marker */

}());
