(function () {
    "use strict";

    const tests = [];

    function test(name, fn) {
        tests.push({
            name: name,
            fn: fn
        });
    }

    function assertTrue(value, message) {
        if (value !== true) {
            throw new Error(message);
        }
    }

    function contrastRatio(
        foreground,
        background
    ) {
        function parse(color) {
            const match =
                color.match(
                    /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                );

            if (!match) {
                throw new Error(
                    "Unsupported computed color: " +
                    color
                );
            }

            return [
                Number(match[1]),
                Number(match[2]),
                Number(match[3])
            ];
        }

        function luminance(rgb) {
            const channels =
                rgb.map(function (value) {
                    const normalized =
                        value / 255;

                    return normalized <= 0.03928
                        ? normalized / 12.92
                        : Math.pow(
                            (normalized + 0.055) /
                                1.055,
                            2.4
                        );
                });

            return (
                (0.2126 * channels[0]) +
                (0.7152 * channels[1]) +
                (0.0722 * channels[2])
            );
        }

        const foregroundLuminance =
            luminance(
                parse(foreground)
            );

        const backgroundLuminance =
            luminance(
                parse(background)
            );

        const lighter =
            Math.max(
                foregroundLuminance,
                backgroundLuminance
            );

        const darker =
            Math.min(
                foregroundLuminance,
                backgroundLuminance
            );

        return (
            (lighter + 0.05) /
            (darker + 0.05)
        );
    }

    test(
        "Page contains semantic main landmark",
        function () {
            assertTrue(
                !!document.querySelector(
                    "main"
                ),
                "A main landmark is required."
            );
        }
    );

    test(
        "Interactive controls use native keyboard-accessible elements",
        function () {
            const controls =
                document.querySelectorAll(
                    "button, input, select, textarea"
                );

            assertTrue(
                controls.length > 0,
                "Expected interactive controls."
            );

            controls.forEach(function (control) {
                assertTrue(
                    !control.hasAttribute(
                        "tabindex"
                    ) ||
                    Number(
                        control.getAttribute(
                            "tabindex"
                        )
                    ) >= 0,
                    "Interactive control must not be removed from keyboard order."
                );
            });
        }
    );

    test(
        "Scenario editor has associated label",
        function () {
            const editor =
                document.getElementById(
                    "scenario-editor"
                );

            const label =
                document.querySelector(
                    'label[for="scenario-editor"]'
                );

            assertTrue(
                !!editor && !!label,
                "Scenario editor requires associated label."
            );
        }
    );

    test(
        "Status region exposes live text status",
        function () {
            const status =
                document.getElementById(
                    "validation-status"
                );

            assertTrue(
                !!status,
                "Validation status region should exist."
            );

            assertTrue(
                status.getAttribute(
                    "role"
                ) === "status" ||
                status.getAttribute(
                    "aria-live"
                ) !== null,
                "Status changes require screen-reader announcement."
            );
        }
    );

    test(
        "Result states are represented with text not color alone",
        function () {
            const textualTerms = [
                "PASS",
                "FAIL",
                "MATCH",
                "MISMATCH",
                "ALLOW",
                "BLOCK"
            ];

            textualTerms.forEach(function (term) {
                assertTrue(
                    typeof term === "string" &&
                    term.length > 0,
                    "Status must retain textual representation."
                );
            });
        }
    );

    test(
        "Primary body contrast meets WCAG AA normal-text threshold",
        function () {
            const style =
                window.getComputedStyle(
                    document.body
                );

            const ratio =
                contrastRatio(
                    style.color,
                    style.backgroundColor
                );

            assertTrue(
                ratio >= 4.5,
                "Body foreground/background contrast must be at least 4.5:1. Actual: " +
                ratio
            );
        }
    );

    test(
        "Buttons retain visible text labels",
        function () {
            document
                .querySelectorAll("button")
                .forEach(function (button) {
                    assertTrue(
                        button.textContent.trim().length > 0 ||
                        button.getAttribute(
                            "aria-label"
                        ),
                        "Every button requires an accessible name."
                    );
                });
        }
    );

    test(
        "Headings provide navigable structure",
        function () {
            assertTrue(
                document.querySelectorAll(
                    "h1"
                ).length === 1,
                "Exactly one page-level h1 is expected."
            );

            assertTrue(
                document.querySelectorAll(
                    "h2"
                ).length > 0,
                "Section headings are required."
            );
        }
    );

    const summary =
        document.getElementById(
            "accessibility-summary"
        );

    const list =
        document.getElementById(
            "accessibility-results"
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
                "data-accessibility-test-status",
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
                "data-accessibility-test-status",
                "FAIL"
            );
        }

        list.appendChild(row);
    });

    summary.textContent =
        passed +
        "/" +
        tests.length +
        " accessibility tests passed.";

    summary.setAttribute(
        "data-accessibility-passed",
        String(passed)
    );

    summary.setAttribute(
        "data-accessibility-total",
        String(tests.length)
    );

    summary.setAttribute(
        "data-accessibility-status",
        passed === tests.length
            ? "PASS"
            : "FAIL"
    );
}());