(function () {
    "use strict";

    const actorEngine =
        window.OAATH.ActorEngine;

    const evidenceEngine =
        window.OAATH.EvidenceEngine;

    const decisionEngine =
        window.OAATH.GovernanceDecisionEngine;

    const eventLogFactory =
        window.OAATH.EventLog;

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

    function priorAuthority() {
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
            policyVersion: "POLICY-1"
        };
    }

    function authorizedActor() {
        return {
            actorId: "ACTOR-RISK",
            name: "Risk Officer",
            capabilities: [
                "REAUTHORIZE"
            ]
        };
    }

    function unauthorizedActor() {
        return {
            actorId: "ACTOR-OPS",
            name: "Operations Engine",
            capabilities: [
                "OPERATE_SYSTEM"
            ]
        };
    }

    function evidenceItems() {
        return [
            {
                evidenceId: "E1",
                type: "POLICY",
                description: "Applicable policy",
                available: true,
                reviewed: true
            },
            {
                evidenceId: "E2",
                type: "RISK_CHANGE",
                description: "Risk changed to MEDIUM",
                available: true,
                reviewed: true
            }
        ];
    }

    function validDecision() {
        return {
            decisionId: "DECISION-3",
            disposition: "NARROW",
            evidenceReviewed: [
                "E1",
                "E2"
            ],
            newScope: {
                maximumAmountCents: 25000,
                allowedRiskLevels: [
                    "LOW"
                ],
                maximumTransactionAgeDays: 30
            }
        };
    }

    function validDecisionInput() {
        return {
            actor:
                authorizedActor(),
            evidenceItems:
                evidenceItems(),
            requiredEvidenceIds: [
                "E1",
                "E2"
            ],
            allowedDispositions: [
                "RENEW",
                "NARROW",
                "CONDITION",
                "TRANSFER",
                "SUSPEND",
                "REFUSE"
            ],
            currentAuthority:
                priorAuthority(),
            decision:
                validDecision()
        };
    }

    test(
        "Actor with REAUTHORIZE capability is authorized",
        function () {
            const result =
                actorEngine.requireCapability(
                    authorizedActor(),
                    actorEngine.CAPABILITIES.REAUTHORIZE
                );

            assertTrue(
                result.authorized,
                "Expected actor to be authorized."
            );
        }
    );

    test(
        "Actor without REAUTHORIZE capability is rejected",
        function () {
            const result =
                actorEngine.requireCapability(
                    unauthorizedActor(),
                    actorEngine.CAPABILITIES.REAUTHORIZE
                );

            assertFalse(
                result.authorized,
                "Unauthorized actor must be rejected."
            );
        }
    );

    test(
        "Required available reviewed evidence passes validation",
        function () {
            const result =
                evidenceEngine.validateRequiredEvidence({
                    evidenceItems:
                        evidenceItems(),
                    requiredEvidenceIds: [
                        "E1",
                        "E2"
                    ],
                    reviewedEvidenceIds: [
                        "E1",
                        "E2"
                    ]
                });

            assertTrue(
                result.valid,
                "Expected evidence validation to pass."
            );
        }
    );

    test(
        "Missing required evidence fails validation",
        function () {
            const result =
                evidenceEngine.validateRequiredEvidence({
                    evidenceItems: [
                        evidenceItems()[0]
                    ],
                    requiredEvidenceIds: [
                        "E1",
                        "E2"
                    ],
                    reviewedEvidenceIds: [
                        "E1"
                    ]
                });

            assertFalse(
                result.valid,
                "Missing evidence must fail."
            );
        }
    );

    test(
        "Unavailable required evidence fails validation",
        function () {
            const items =
                evidenceItems();

            items[1].available = false;

            const result =
                evidenceEngine.validateRequiredEvidence({
                    evidenceItems: items,
                    requiredEvidenceIds: [
                        "E1",
                        "E2"
                    ],
                    reviewedEvidenceIds: [
                        "E1",
                        "E2"
                    ]
                });

            assertFalse(
                result.valid,
                "Unavailable evidence must fail."
            );
        }
    );

    test(
        "Required evidence not reviewed fails validation",
        function () {
            const result =
                evidenceEngine.validateRequiredEvidence({
                    evidenceItems:
                        evidenceItems(),
                    requiredEvidenceIds: [
                        "E1",
                        "E2"
                    ],
                    reviewedEvidenceIds: [
                        "E1"
                    ]
                });

            assertFalse(
                result.valid,
                "Unreviewed evidence must fail."
            );
        }
    );

    test(
        "Authorized actor with required evidence may create valid governance decision",
        function () {
            const result =
                decisionEngine.validateDecision(
                    validDecisionInput()
                );

            assertTrue(
                result.valid,
                "Expected governance decision validation to pass."
            );
        }
    );

    test(
        "Unauthorized actor cannot complete governance decision",
        function () {
            const input =
                validDecisionInput();

            input.actor =
                unauthorizedActor();

            const result =
                decisionEngine.validateDecision(
                    input
                );

            assertFalse(
                result.valid,
                "Unauthorized actor must not complete reauthorization."
            );
        }
    );

    test(
        "Governance decision without required evidence review is invalid",
        function () {
            const input =
                validDecisionInput();

            input.decision.evidenceReviewed = [
                "E1"
            ];

            const result =
                decisionEngine.validateDecision(
                    input
                );

            assertFalse(
                result.valid,
                "Missing evidence review must invalidate decision."
            );
        }
    );

    test(
        "Disallowed disposition is rejected by configured policy",
        function () {
            const input =
                validDecisionInput();

            input.allowedDispositions = [
                "RENEW"
            ];

            const result =
                decisionEngine.validateDecision(
                    input
                );

            assertFalse(
                result.valid,
                "Policy-disallowed disposition must fail."
            );
        }
    );

    test(
        "Valid decision translates through AuthorityEngine",
        function () {
            const result =
                decisionEngine.decide(
                    validDecisionInput()
                );

            assertTrue(
                result.valid,
                "Expected valid decision."
            );

            assertTrue(
                result.translation.authorityCreated,
                "NARROW should create authority."
            );

            assertEqual(
                result.translation.authority.scope.maximumAmountCents,
                25000,
                "Expected manually declared narrowed maximum."
            );
        }
    );

    test(
        "Invalid decision produces no authority translation",
        function () {
            const input =
                validDecisionInput();

            input.actor =
                unauthorizedActor();

            const result =
                decisionEngine.decide(
                    input
                );

            assertFalse(
                result.valid,
                "Decision should be invalid."
            );

            assertEqual(
                result.translation,
                null,
                "Invalid decision must not invoke authority translation."
            );
        }
    );

    test(
        "Event log assigns deterministic sequence numbers",
        function () {
            const log =
                eventLogFactory.create();

            const first =
                log.append({
                    eventType:
                        "SCENARIO_STARTED"
                });

            const second =
                log.append({
                    eventType:
                        "MATERIAL_CHANGE_DETECTED"
                });

            assertEqual(
                first.sequence,
                1,
                "First event sequence should be 1."
            );

            assertEqual(
                second.sequence,
                2,
                "Second event sequence should be 2."
            );
        }
    );

    test(
        "Event log does not trust caller supplied sequence",
        function () {
            const log =
                eventLogFactory.create();

            const stored =
                log.append({
                    sequence: 999,
                    eventType:
                        "SCENARIO_STARTED"
                });

            assertEqual(
                stored.sequence,
                1,
                "Log must assign sequence deterministically."
            );
        }
    );

    test(
        "Stored events are frozen",
        function () {
            const log =
                eventLogFactory.create();

            const stored =
                log.append({
                    eventType:
                        "AUTHORITY_INVALIDATED",
                    priorState: {
                        authority:
                            "ACTIVE"
                    },
                    newState: {
                        authority:
                            "INVALID"
                    }
                });

            assertTrue(
                Object.isFrozen(stored),
                "Stored event must be frozen."
            );

            assertTrue(
                Object.isFrozen(
                    stored.priorState
                ),
                "Nested prior state must be frozen."
            );
        }
    );

    test(
        "Event log listing returns detached frozen evidence",
        function () {
            const log =
                eventLogFactory.create();

            log.append({
                eventType:
                    "SCENARIO_STARTED"
            });

            const listing =
                log.list();

            assertTrue(
                Object.isFrozen(listing),
                "Event listing should be frozen."
            );

            assertEqual(
                listing.length,
                1,
                "Expected one event."
            );
        }
    );

    const summary =
        document.getElementById(
            "governance-summary"
        );

    const resultList =
        document.getElementById(
            "governance-results"
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
                "data-governance-test-status",
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
                "data-governance-test-status",
                "FAIL"
            );
        }

        resultList.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " governance-control tests passed.";

    summary.setAttribute(
        "data-governance-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-governance-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-governance-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());