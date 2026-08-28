(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const ARCHITECTURES = Object.freeze({
        SAME_LAYER_REAUTHORIZATION:
            "SAME_LAYER_REAUTHORIZATION",

        SEPARATED_REAUTHORIZATION:
            "SEPARATED_REAUTHORIZATION"
    });

    function isObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function freeze(value) {
        if (
            value === null ||
            typeof value !== "object"
        ) {
            return value;
        }

        Object.freeze(value);

        Object.keys(value).forEach(function (key) {
            if (
                value[key] &&
                typeof value[key] === "object" &&
                !Object.isFrozen(value[key])
            ) {
                freeze(value[key]);
            }
        });

        return value;
    }

    function requireActor(actor, label) {
        if (!isObject(actor)) {
            throw new Error(
                label + " must be configured."
            );
        }

        if (
            typeof actor.actorId !== "string" ||
            actor.actorId.trim().length === 0
        ) {
            throw new Error(
                label + ".actorId is required."
            );
        }
    }

    function resolve(input) {
        if (!isObject(input)) {
            throw new Error(
                "Architecture input must be an object."
            );
        }

        const architecture =
            input.reauthorizationArchitecture ||
            ARCHITECTURES.SAME_LAYER_REAUTHORIZATION;

        if (
            architecture ===
            ARCHITECTURES.SAME_LAYER_REAUTHORIZATION
        ) {
            const operationalActor =
                input.operationalActor ||
                input.decisionActor;

            requireActor(
                operationalActor,
                "operationalActor"
            );

            return freeze({
                architecture:
                    architecture,

                operationalActor:
                    operationalActor,

                decisionActor:
                    operationalActor,

                designatedAuthorityOwner:
                    input.designatedAuthorityOwner || null,

                authorityMoved:
                    false,

                movementReason:
                    null,

                topology:
                    "OPERATIONAL_LAYER_AUTHORIZED_DECISION",

                description:
                    "The operational layer retains the configured reauthorization decision."
            });
        }

        if (
            architecture ===
            ARCHITECTURES.SEPARATED_REAUTHORIZATION
        ) {
            const operationalActor =
                input.operationalActor ||
                input.decisionActor;

            const designatedOwner =
                input.designatedAuthorityOwner;

            requireActor(
                operationalActor,
                "operationalActor"
            );

            requireActor(
                designatedOwner,
                "designatedAuthorityOwner"
            );

            if (
                operationalActor.actorId ===
                designatedOwner.actorId
            ) {
                throw new Error(
                    "Separated reauthorization requires a designated authority owner distinct from the operational actor."
                );
            }

            return freeze({
                architecture:
                    architecture,

                operationalActor:
                    operationalActor,

                decisionActor:
                    designatedOwner,

                designatedAuthorityOwner:
                    designatedOwner,

                authorityMoved:
                    true,

                movementReason:
                    input.separationReason ||
                    "Configured policy requires separated reauthorization.",

                topology:
                    "DESIGNATED_AUTHORITY_OWNER_DECISION",

                description:
                    "The operational layer invalidates and blocks, while the designated authority owner makes the reauthorization decision."
            });
        }

        throw new Error(
            "Unsupported reauthorization architecture: " +
            String(architecture)
        );
    }

    root.ArchitectureEngine = Object.freeze({
        ARCHITECTURES:
            ARCHITECTURES,

        resolve:
            resolve
    });
}(window));