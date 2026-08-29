(function (global) {
    "use strict";

    const root = global.OAATH = global.OAATH || {};

    const scriptUrl = new URL(document.currentScript.src);

    const entries = Object.freeze([
        Object.freeze({
            scenarioId: "REFUND-V2",
            scenarioType: "AUTOMATED_REFUND",
            label: "Automated Refund",
            url: new URL("../data/scenarios/automated-refund.json", scriptUrl).href
        }),
        Object.freeze({
            scenarioId: "ACCESS-V2",
            scenarioType: "PRIVILEGED_SYSTEM_ACCESS",
            label: "Privileged System Access",
            url: new URL("../data/scenarios/privileged-system-access.json", scriptUrl).href
        }),
        Object.freeze({
            scenarioId: "WORKFORCE-V2",
            scenarioType: "WORKFORCE_SHIFT_ASSIGNMENT",
            label: "Workforce Shift Assignment",
            url: new URL("../data/scenarios/workforce-shift-assignment.json", scriptUrl).href
        }),
        Object.freeze({
            scenarioId: "PROCUREMENT-V2",
            scenarioType: "PROCUREMENT_TOTAL_ACQUISITION_COST",
            label: "Procurement / Total Acquisition Cost",
            url: new URL("../data/scenarios/procurement-total-acquisition-cost.json", scriptUrl).href
        }),
        Object.freeze({
            scenarioId: "ACCOUNT-RESTRICTION-V2",
            scenarioType: "CUSTOMER_ACCOUNT_RESTRICTION",
            label: "Customer Account Restriction",
            url: new URL("../data/scenarios/customer-account-restriction.json", scriptUrl).href
        })
    ]);

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getEntry(id) {
        return entries.find(function (entry) {
            return entry.scenarioId === id || entry.scenarioType === id;
        }) || null;
    }

    function getByScenario(scenario) {
        if (!scenario || typeof scenario !== "object") {
            return null;
        }

        return getEntry(scenario.scenarioId) || getEntry(scenario.scenarioType);
    }

    function load(id) {
        const entry = getEntry(id);

        if (!entry) {
            return Promise.reject(new Error("Unknown Version 2 scenario: " + String(id)));
        }

        return fetch(entry.url, { cache: "no-store" })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Unable to load Version 2 scenario: " + entry.label);
                }
                return response.json();
            });
    }

    function getPath(object, path) {
        return String(path).split(".").reduce(function (value, key) {
            if (value === null || typeof value === "undefined") {
                return undefined;
            }
            return value[key];
        }, object);
    }

    function setPath(object, path, value) {
        const keys = String(path).split(".");
        let cursor = object;

        keys.forEach(function (key, index) {
            if (index === keys.length - 1) {
                cursor[key] = value;
                return;
            }

            if (!cursor[key] || typeof cursor[key] !== "object") {
                cursor[key] = {};
            }

            cursor = cursor[key];
        });
    }

    function displayValue(control, value) {
        if (control.unit === "dollars" && typeof value === "number") {
            return (value / 100).toFixed(2);
        }

        if (control.kind === "boolean") {
            return value === true ? "true" : "false";
        }

        return typeof value === "undefined" || value === null ? "" : String(value);
    }

    function parseValue(control, input) {
        if (control.kind === "boolean") {
            return input.value === "true";
        }

        if (control.kind === "number") {
            const number = Number(input.value);
            if (!Number.isFinite(number)) {
                throw new Error(control.label + " must be a number.");
            }
            return control.unit === "dollars" ? Math.round(number * 100) : number;
        }

        return input.value;
    }

    function renderControls(container, scenario) {
        container.replaceChildren();

        const controls = scenario && scenario.ui && Array.isArray(scenario.ui.controls)
            ? scenario.ui.controls
            : [];

        controls.forEach(function (control) {
            const label = document.createElement("label");
            label.setAttribute("data-scenario-control", control.id);

            const title = document.createElement("span");
            title.textContent = control.label;
            label.appendChild(title);

            let input;

            if (control.kind === "select" || control.kind === "boolean") {
                input = document.createElement("select");
                const options = control.kind === "boolean"
                    ? ["true", "false"]
                    : (control.options || []);

                options.forEach(function (optionValue) {
                    const option = document.createElement("option");
                    option.value = String(optionValue);
                    option.textContent = control.kind === "boolean"
                        ? (String(optionValue) === "true" ? "YES" : "NO")
                        : String(optionValue);
                    input.appendChild(option);
                });
            }
            else {
                input = document.createElement("input");
                input.type = control.kind === "number" ? "number" : "text";
                if (control.step) {
                    input.step = control.step;
                }
            }

            input.id = "scenario-control-" + control.id;
            input.setAttribute("data-scenario-path", control.path);
            input.value = displayValue(control, getPath(scenario, control.path));
            label.appendChild(input);

            if (control.help) {
                const help = document.createElement("span");
                help.className = "field-explanation";
                help.textContent = control.help;
                label.appendChild(help);
            }

            container.appendChild(label);
        });
    }

    function applyControls(container, scenario) {
        const controls = scenario && scenario.ui && Array.isArray(scenario.ui.controls)
            ? scenario.ui.controls
            : [];

        controls.forEach(function (control) {
            const input = container.querySelector("#scenario-control-" + CSS.escape(control.id));
            if (!input) {
                throw new Error("Scenario control is missing: " + control.id);
            }

            const value = parseValue(control, input);
            setPath(scenario, control.path, value);

            (control.syncPaths || []).forEach(function (path) {
                setPath(scenario, path, deepClone(value));
            });
        });

        return scenario;
    }

    function applyDispositionTemplate(scenario, disposition) {
        const templates = scenario && scenario.ui && scenario.ui.dispositionTemplates
            ? scenario.ui.dispositionTemplates
            : {};

        const template = templates[disposition] || {};

        delete scenario.decision.newScope;
        delete scenario.decision.conditions;
        delete scenario.decision.newDecisionOwner;
        delete scenario.decision.newOwner;

        Object.keys(template).forEach(function (key) {
            scenario.decision[key] = deepClone(template[key]);
        });

        return scenario;
    }

    function renderExplanation(container, scenario) {
        const p = scenario && scenario.presentation ? scenario.presentation : {};

        const rows = [
            ["Real-world situation", p.situation],
            ["What changed", p.change],
            ["Why the change is material", p.materiality],
            ["Technical capability", p.capability],
            ["System recommendation", p.recommendation],
            ["Authority before the change", p.priorAuthority],
            ["AUTHORITY QUESTION BEING TESTED", p.authorityQuestion],
            ["Real-world consequence execution controls", p.consequence],
            ["Evidence of operational governance", p.evidence]
        ];

        container.replaceChildren();

        rows.forEach(function (row) {
            if (!row[1]) {
                return;
            }

            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = row[0] + ": ";
            paragraph.appendChild(strong);
            paragraph.appendChild(document.createTextNode(row[1]));
            container.appendChild(paragraph);
        });
    }

    function summarizeControls(container, scenario) {
        const controls = scenario && scenario.ui && Array.isArray(scenario.ui.controls)
            ? scenario.ui.controls
            : [];

        return controls.map(function (control) {
            const input = container.querySelector("#scenario-control-" + CSS.escape(control.id));
            return control.label + ": " + (input ? input.options && input.selectedIndex >= 0
                ? input.options[input.selectedIndex].text
                : input.value
                : "not set");
        });
    }

    root.ScenarioCatalog = Object.freeze({
        entries: entries,
        getEntry: getEntry,
        getByScenario: getByScenario,
        load: load,
        renderControls: renderControls,
        applyControls: applyControls,
        applyDispositionTemplate: applyDispositionTemplate,
        renderExplanation: renderExplanation,
        summarizeControls: summarizeControls
    });
}(window));
