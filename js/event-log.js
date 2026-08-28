(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
        if (value === null || typeof value !== "object") {
            return value;
        }

        Object.freeze(value);

        Object.keys(value).forEach(function (key) {
            if (
                value[key] !== null &&
                typeof value[key] === "object" &&
                !Object.isFrozen(value[key])
            ) {
                deepFreeze(value[key]);
            }
        });

        return value;
    }

    function create() {
        const events = [];

        function append(event) {
            if (
                event === null ||
                typeof event !== "object" ||
                Array.isArray(event)
            ) {
                throw new Error(
                    "Event must be an object."
                );
            }

            const stored =
                deepClone(event);

            stored.sequence =
                events.length + 1;

            events.push(
                deepFreeze(stored)
            );

            return events[events.length - 1];
        }

        function list() {
            return deepFreeze(
                deepClone(events)
            );
        }

        return Object.freeze({
            append: append,
            list: list
        });
    }

    root.EventLog = Object.freeze({
        create: create
    });
}(window));