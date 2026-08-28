(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function indexEvidence(evidenceItems) {
        const index = Object.create(null);

        if (!Array.isArray(evidenceItems)) {
            return index;
        }

        evidenceItems.forEach(function (item) {
            if (
                isPlainObject(item) &&
                typeof item.evidenceId === "string"
            ) {
                index[item.evidenceId] = item;
            }
        });

        return index;
    }

    function validateRequiredEvidence(input) {
        if (!isPlainObject(input)) {
            return {
                valid: false,
                reason: "Evidence validation input must be an object."
            };
        }

        const requiredIds =
            Array.isArray(input.requiredEvidenceIds)
                ? input.requiredEvidenceIds
                : [];

        const reviewedIds =
            Array.isArray(input.reviewedEvidenceIds)
                ? input.reviewedEvidenceIds
                : [];

        const evidenceIndex =
            indexEvidence(input.evidenceItems);

        for (
            let index = 0;
            index < requiredIds.length;
            index += 1
        ) {
            const evidenceId = requiredIds[index];
            const item = evidenceIndex[evidenceId];

            if (!item) {
                return {
                    valid: false,
                    reason:
                        "Required evidence is missing: " +
                        evidenceId
                };
            }

            if (item.available !== true) {
                return {
                    valid: false,
                    reason:
                        "Required evidence is unavailable: " +
                        evidenceId
                };
            }

            if (!reviewedIds.includes(evidenceId)) {
                return {
                    valid: false,
                    reason:
                        "Required evidence was not reviewed: " +
                        evidenceId
                };
            }

            if (item.reviewed !== true) {
                return {
                    valid: false,
                    reason:
                        "Evidence record does not confirm review: " +
                        evidenceId
                };
            }
        }

        return {
            valid: true,
            reason: null
        };
    }

    root.EvidenceEngine = Object.freeze({
        validateRequiredEvidence:
            validateRequiredEvidence
    });
}(window));