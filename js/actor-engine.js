(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const CAPABILITIES = Object.freeze({
        OPERATE_SYSTEM: "OPERATE_SYSTEM",
        DETECT_CHANGE: "DETECT_CHANGE",
        DETERMINE_MATERIALITY: "DETERMINE_MATERIALITY",
        OWN_CONSEQUENCE: "OWN_CONSEQUENCE",
        REVALIDATE: "REVALIDATE",
        REAUTHORIZE: "REAUTHORIZE",
        EXECUTE: "EXECUTE"
    });

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function validateActor(actor) {
        if (!isPlainObject(actor)) {
            return {
                valid: false,
                reason: "Actor must be an object."
            };
        }

        if (
            typeof actor.actorId !== "string" ||
            actor.actorId.trim().length === 0
        ) {
            return {
                valid: false,
                reason: "actorId is required."
            };
        }

        if (!Array.isArray(actor.capabilities)) {
            return {
                valid: false,
                reason: "Actor capabilities must be an array."
            };
        }

        return {
            valid: true,
            reason: null
        };
    }

    function hasCapability(actor, capability) {
        const validation = validateActor(actor);

        if (!validation.valid) {
            return false;
        }

        return actor.capabilities.includes(capability);
    }

    function requireCapability(actor, capability) {
        const validation = validateActor(actor);

        if (!validation.valid) {
            return {
                authorized: false,
                reason: validation.reason
            };
        }

        if (!hasCapability(actor, capability)) {
            return {
                authorized: false,
                reason:
                    "Actor " +
                    actor.actorId +
                    " lacks required capability " +
                    capability +
                    "."
            };
        }

        return {
            authorized: true,
            reason: null
        };
    }

    root.ActorEngine = Object.freeze({
        CAPABILITIES: CAPABILITIES,
        validateActor: validateActor,
        hasCapability: hasCapability,
        requireCapability: requireCapability
    });
}(window));