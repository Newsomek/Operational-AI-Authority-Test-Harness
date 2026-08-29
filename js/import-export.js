(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const SCHEMA_VERSION = "1.0";
    const SUPPORTED_SCENARIO_SCHEMA_VERSIONS = Object.freeze([
        "1.0",
        "2.0"
    ]);

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
        if (
            value === null ||
            typeof value !== "object"
        ) {
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

    function isObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function requireScenario(scenario) {
        if (!isObject(scenario)) {
            throw new Error(
                "Scenario must be an object."
            );
        }

        const required = [
            "scenarioVersion",
            "policyVersion",
            "priorConditions",
            "currentConditions",
            "materialityRules",
            "priorAuthority",
            "decision",
            "expectedResult"
        ];

        required.forEach(function (field) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    scenario,
                    field
                )
            ) {
                throw new Error(
                    "Scenario is missing required field: " +
                    field
                );
            }
        });

        if (
            scenario.schemaVersion &&
            !SUPPORTED_SCENARIO_SCHEMA_VERSIONS.includes(
                scenario.schemaVersion
            )
        ) {
            throw new Error(
                "Unsupported scenario schema version: " +
                scenario.schemaVersion
            );
        }

        return true;
    }

    function scenarioExportObject(scenario) {
        requireScenario(scenario);

        const exportObject = {
            exportType:
                "OAATH_SCENARIO",
            schemaVersion:
                SCHEMA_VERSION,
            scenarioVersion:
                scenario.scenarioVersion,
            policyVersion:
                scenario.policyVersion,

            conditions: {
                prior:
                    deepClone(
                        scenario.priorConditions
                    ),
                current:
                    deepClone(
                        scenario.currentConditions
                    )
            },

            materialityRules:
                deepClone(
                    scenario.materialityRules
                ),

            actors: {
                operationalActor:
                    deepClone(
                        scenario.operationalActor ||
                        scenario.decisionActor ||
                        null
                    ),
                designatedAuthorityOwner:
                    deepClone(
                        scenario.designatedAuthorityOwner ||
                        null
                    ),
                decisionActor:
                    deepClone(
                        scenario.decisionActor ||
                        null
                    )
            },

            authorityRules: {
                priorAuthority:
                    deepClone(
                        scenario.priorAuthority
                    ),
                allowedDispositions:
                    deepClone(
                        scenario.allowedDispositions || []
                    ),
                reauthorizationArchitecture:
                    scenario.reauthorizationArchitecture ||
                    "SAME_LAYER_REAUTHORIZATION",
                separationReason:
                    scenario.separationReason || null
            },

            evidenceRequirements: {
                requiredEvidenceIds:
                    deepClone(
                        scenario.requiredEvidenceIds || []
                    ),
                evidenceItems:
                    deepClone(
                        scenario.evidenceItems || []
                    )
            },

            decisionCriteria: {
                decision:
                    deepClone(
                        scenario.decision
                    ),
                technicalCapability:
                    deepClone(
                        scenario.technicalCapability || null
                    ),
                technicalRevalidation:
                    deepClone(
                        scenario.technicalRevalidation || null
                    ),
                requestedAction:
                    deepClone(
                        scenario.requestedAction || null
                    ),
                recommendation:
                    deepClone(
                        scenario.recommendation || null
                    )
            },

            expectedResult:
                deepClone(
                    scenario.expectedResult
                ),

            policyConfiguration: {
                policyVersion:
                    scenario.policyVersion,
                controlAssertions:
                    deepClone(
                        scenario.controlAssertions || []
                    )
            },

            scenario:
                deepClone(
                    Object.assign(
                        {},
                        scenario,
                        {
                            schemaVersion:
                                scenario.schemaVersion ||
                                SCHEMA_VERSION
                        }
                    )
                )
        };

        return deepFreeze(
            exportObject
        );
    }

    function exportScenario(scenario) {
        return JSON.stringify(
            scenarioExportObject(
                scenario
            ),
            null,
            2
        );
    }

    function importScenario(text) {
        if (
            typeof text !== "string" ||
            text.trim().length === 0
        ) {
            throw new Error(
                "Imported scenario text is empty."
            );
        }

        let parsed;

        try {
            parsed = JSON.parse(text);
        }
        catch (error) {
            throw new Error(
                "Imported scenario is not valid JSON: " +
                error.message
            );
        }

        let scenario;

        if (
            parsed.exportType ===
            "OAATH_SCENARIO"
        ) {
            if (
                parsed.schemaVersion !==
                SCHEMA_VERSION
            ) {
                throw new Error(
                    "Unsupported scenario export schema version: " +
                    String(parsed.schemaVersion)
                );
            }

            scenario =
                parsed.scenario;
        }
        else {
            scenario =
                parsed;
        }

        requireScenario(
            scenario
        );

        const normalized =
            deepClone(
                scenario
            );

        normalized.schemaVersion =
            normalized.schemaVersion ||
            SCHEMA_VERSION;

        return deepFreeze(
            normalized
        );
    }

    function requireRunRecord(runRecord) {
        if (!isObject(runRecord)) {
            throw new Error(
                "Run record must be an object."
            );
        }

        const required = [
            "scenarioSnapshot",
            "scenarioVersion",
            "policyVersion",
            "authorityHistory",
            "decisionHistory",
            "eventLog",
            "executionAttempts",
            "expectedResult",
            "actualResult",
            "predictionComparison",
            "controlAssertions",
            "controlAssertionResults"
        ];

        required.forEach(function (field) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    runRecord,
                    field
                )
            ) {
                throw new Error(
                    "Run record is missing required evidence field: " +
                    field
                );
            }
        });

        return true;
    }

    function runExportObject(runRecord) {
        requireRunRecord(
            runRecord
        );

        return deepFreeze({
            exportType:
                "OAATH_RUN_EVIDENCE",
            schemaVersion:
                SCHEMA_VERSION,

            scenarioSnapshot:
                deepClone(
                    runRecord.scenarioSnapshot
                ),
            scenarioVersion:
                runRecord.scenarioVersion,
            policyVersion:
                runRecord.policyVersion,

            controlRun:
                deepClone(
                    runRecord.controlRun || null
                ),

            authorityHistory:
                deepClone(
                    runRecord.authorityHistory
                ),
            decisionHistory:
                deepClone(
                    runRecord.decisionHistory
                ),
            eventLog:
                deepClone(
                    runRecord.eventLog
                ),
            executionAttempts:
                deepClone(
                    runRecord.executionAttempts
                ),

            expectedResult:
                deepClone(
                    runRecord.expectedResult
                ),
            actualResult:
                runRecord.actualResult,

            expectedVsActual:
                deepClone(
                    runRecord.predictionComparison
                ),

            controlAssertions:
                deepClone(
                    runRecord.controlAssertions
                ),
            controlAssertionResults:
                deepClone(
                    runRecord.controlAssertionResults
                ),

            replayInputs:
                deepClone(
                    runRecord.replayInputs || []
                ),

            runRecord:
                deepClone(
                    runRecord
                )
        });
    }

    function exportRun(runRecord) {
        return JSON.stringify(
            runExportObject(
                runRecord
            ),
            null,
            2
        );
    }

    function fileNamePart(value) {
        return String(value || "unknown")
            .replace(
                /[^A-Za-z0-9_-]/g,
                "_"
            );
    }

    function scenarioFileName(scenario) {
        return (
            "oaath-scenario-" +
            fileNamePart(
                scenario.scenarioId ||
                scenario.name ||
                "scenario"
            ) +
            "-" +
            fileNamePart(
                scenario.scenarioVersion
            ) +
            ".json"
        );
    }

    function runFileName(runRecord) {
        return (
            "oaath-run-" +
            fileNamePart(
                runRecord.runId ||
                "run"
            ) +
            "-" +
            fileNamePart(
                runRecord.scenarioVersion
            ) +
            ".json"
        );
    }

    root.ImportExport = Object.freeze({
        SCHEMA_VERSION:
            SCHEMA_VERSION,
        SUPPORTED_SCENARIO_SCHEMA_VERSIONS:
            SUPPORTED_SCENARIO_SCHEMA_VERSIONS,
        requireScenario:
            requireScenario,
        scenarioExportObject:
            scenarioExportObject,
        exportScenario:
            exportScenario,
        importScenario:
            importScenario,
        requireRunRecord:
            requireRunRecord,
        runExportObject:
            runExportObject,
        exportRun:
            exportRun,
        scenarioFileName:
            scenarioFileName,
        runFileName:
            runFileName
    });
}(window));