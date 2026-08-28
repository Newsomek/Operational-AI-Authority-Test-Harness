(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const AUTHORITY_STATUS = Object.freeze({
        ACTIVE: "ACTIVE",
        INVALID: "INVALID",
        SUSPENDED: "SUSPENDED"
    });

    const WORKFLOW_STATE = Object.freeze({
        STABLE: "STABLE",
        MATERIALITY_REVIEW_REQUIRED: "MATERIALITY_REVIEW_REQUIRED",
        REAUTHORIZATION_REQUIRED: "REAUTHORIZATION_REQUIRED",
        DECISION_PENDING: "DECISION_PENDING",
        DECISION_COMPLETE: "DECISION_COMPLETE"
    });

    const EXECUTION_STATE = Object.freeze({
        NOT_ATTEMPTED: "NOT_ATTEMPTED",
        ALLOWED: "ALLOWED",
        BLOCKED: "BLOCKED",
        EXECUTED: "EXECUTED"
    });

    const AUTHORITY_TRANSITIONS = Object.freeze({
        ACTIVE: Object.freeze([
            AUTHORITY_STATUS.INVALID
        ]),
        INVALID: Object.freeze([]),
        SUSPENDED: Object.freeze([])
    });

    const WORKFLOW_TRANSITIONS = Object.freeze({
        STABLE: Object.freeze([
            WORKFLOW_STATE.MATERIALITY_REVIEW_REQUIRED
        ]),
        MATERIALITY_REVIEW_REQUIRED: Object.freeze([
            WORKFLOW_STATE.STABLE,
            WORKFLOW_STATE.REAUTHORIZATION_REQUIRED,
            WORKFLOW_STATE.DECISION_PENDING
        ]),
        REAUTHORIZATION_REQUIRED: Object.freeze([
            WORKFLOW_STATE.DECISION_PENDING
        ]),
        DECISION_PENDING: Object.freeze([
            WORKFLOW_STATE.DECISION_COMPLETE
        ]),
        DECISION_COMPLETE: Object.freeze([])
    });

    const EXECUTION_TRANSITIONS = Object.freeze({
        NOT_ATTEMPTED: Object.freeze([
            EXECUTION_STATE.ALLOWED,
            EXECUTION_STATE.BLOCKED
        ]),
        ALLOWED: Object.freeze([
            EXECUTION_STATE.EXECUTED
        ]),
        BLOCKED: Object.freeze([]),
        EXECUTED: Object.freeze([])
    });

    function valuesOf(enumObject) {
        return Object.keys(enumObject).map(function (key) {
            return enumObject[key];
        });
    }

    function assertKnownState(value, allowedValues, label) {
        if (!allowedValues.includes(value)) {
            throw new Error(
                "Unknown " + label + ": " + String(value)
            );
        }
    }

    function canTransition(transitionMap, fromState, toState) {
        return transitionMap[fromState].includes(toState);
    }

    function transitionAuthorityStatus(fromState, toState) {
        const allowedValues = valuesOf(AUTHORITY_STATUS);

        assertKnownState(
            fromState,
            allowedValues,
            "authority status"
        );

        assertKnownState(
            toState,
            allowedValues,
            "authority status"
        );

        if (!canTransition(
            AUTHORITY_TRANSITIONS,
            fromState,
            toState
        )) {
            throw new Error(
                "Illegal authority-status transition: " +
                fromState + " -> " + toState
            );
        }

        return toState;
    }

    function transitionWorkflowState(fromState, toState) {
        const allowedValues = valuesOf(WORKFLOW_STATE);

        assertKnownState(
            fromState,
            allowedValues,
            "workflow state"
        );

        assertKnownState(
            toState,
            allowedValues,
            "workflow state"
        );

        if (!canTransition(
            WORKFLOW_TRANSITIONS,
            fromState,
            toState
        )) {
            throw new Error(
                "Illegal workflow-state transition: " +
                fromState + " -> " + toState
            );
        }

        return toState;
    }

    function transitionExecutionState(fromState, toState) {
        const allowedValues = valuesOf(EXECUTION_STATE);

        assertKnownState(
            fromState,
            allowedValues,
            "execution state"
        );

        assertKnownState(
            toState,
            allowedValues,
            "execution state"
        );

        if (!canTransition(
            EXECUTION_TRANSITIONS,
            fromState,
            toState
        )) {
            throw new Error(
                "Illegal execution-state transition: " +
                fromState + " -> " + toState
            );
        }

        return toState;
    }

    function resetExecutionForNewDecisionPoint() {
        return EXECUTION_STATE.NOT_ATTEMPTED;
    }

    root.StateMachine = Object.freeze({
        AUTHORITY_STATUS: AUTHORITY_STATUS,
        WORKFLOW_STATE: WORKFLOW_STATE,
        EXECUTION_STATE: EXECUTION_STATE,
        transitionAuthorityStatus: transitionAuthorityStatus,
        transitionWorkflowState: transitionWorkflowState,
        transitionExecutionState: transitionExecutionState,
        resetExecutionForNewDecisionPoint:
            resetExecutionForNewDecisionPoint
    });
}(window));