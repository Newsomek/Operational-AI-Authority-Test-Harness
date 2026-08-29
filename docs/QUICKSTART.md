# Quick Start

## Operational AI Authority Test Harness

This guide is for someone encountering the project for the first time.

The V1 harness is a browser-based governance laboratory. It does not require
Docker, Node.js, npm, a database, an API key, an AI model, a cloud account, or
an external service.

## Fastest way to run it

### 1. Get the project

From the public GitHub repository:

1. Select **Code**.
2. Select **Download ZIP**.
3. Extract the ZIP to a folder on your computer.

Git users may instead clone the repository.

### 2. Open the application

Open:

`index.html`

in a modern browser.

Microsoft Edge, Google Chrome, Firefox, or another modern standards-based
browser should be suitable.

### 3. Start with the default scenario

The included V1 default scenario is Customer Refund Authorization.

The requested action is:

`AUTO_REFUND`

The requested amount is:

`$400`

Initial authority permits automated refunds up to:

`$500`

under the configured risk and age conditions.

The initial control run therefore provides a known baseline in which the
requested action is within the initial enforceable authority boundary.

### 4. Run the control run first

Before interpreting a material-change experiment, run or inspect the baseline
control run.

The control run establishes that the action can execute under the initial
authority and initial conditions.

This is important because a later BLOCK should be attributable to the changed
governance state or boundary rather than to a scenario that could never execute
in the first place.

### 5. Run the governed experiment

Work through the application in this conceptual order:

1. scenario configuration;
2. initial authority;
3. initial enforceable boundary;
4. control run;
5. initial execution evaluation;
6. condition change;
7. materiality evaluation;
8. authority invalidation where required;
9. execution block where authority is insufficient;
10. technical revalidation;
11. reauthorization requirement;
12. decision owner;
13. evidence review;
14. disposition;
15. new authority version where applicable;
16. new enforceable boundary where applicable;
17. execution attempt;
18. ALLOW or BLOCK;
19. expected versus actual;
20. MATCH or MISMATCH;
21. control assertion;
22. PASS or FAIL;
23. retained evidence;
24. deterministic replay.

## Reading the results

Do not treat these result types as interchangeable.

### ALLOW / BLOCK

This is the execution decision.

It answers whether the requested action is permitted by the current enforceable
boundary and applicable conditions.

### MATCH / MISMATCH

This compares the expected result with the actual result.

It is a prediction-accuracy result.

### PASS / FAIL

This is the result of a defined control assertion.

It does not mean that the project's overall hypothesis has been proven or
disproven.

## Optional local web server

Opening `index.html` directly is the preferred V1 path.

If your browser or local security configuration prevents the application from
working correctly from a file URL, and Python is installed, run this command
from the repository root:

`python -m http.server 8000`

Then open:

`http://localhost:8000`

This server is only a convenience for local file delivery. It is not part of
the governance architecture.

## Independently verify the implementation

Open:

`tests/test-runner.html`

The verified V1 baseline is:

**182 / 182 tests passing**

See `docs/TESTING.md` for the testing procedure and manual experiments.

## More information

- `README.md` - project overview and conceptual model
- `docs/USER-GUIDE.md` - detailed operation of the harness
- `docs/TESTING.md` - independent verification and experimental exercises
- `docs/ROADMAP.md` - explicitly deferred future work
- `docs/V1-READINESS.md` - V1 verification record

## License

The project is publicly available for permitted noncommercial use under the
repository `LICENSE`.

It is source-available, not open source.

Read the license before redistributing or using the project.
