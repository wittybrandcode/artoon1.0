# Future Development Roadmap

## Phase 1 - Release Hardening
Target: 0-2 weeks

Goal: turn the complete local platform into a reliable release candidate.

Tasks:
- [ ] Add root CI workflow for build, tests, typecheck, and package smoke checks.
- [ ] Add a root `verify` script that runs the exact release gate locally.
- [ ] Remove or gate remaining noisy logs in test and package output.
- [ ] Confirm every package version and README reflects the intended `1.0.0` release.
- [ ] Create `CHANGELOG.md` and release notes template.
- [ ] Add package smoke tests for generated `dist` outputs.
- [ ] Verify clean install from a fresh clone.

Deliverables:
- Release candidate checklist.
- Automated monorepo verification command.
- Package-level smoke evidence.

Exit criteria:
- Fresh clone can install, build, test, and run examples.
- All packages pass release gates.
- Known warnings are documented or resolved.

## Phase 2 - Specification and Conformance
Target: 2-4 weeks

Goal: make the ARTOON format contract precise, stable, and enforced.

Tasks:
- [ ] Freeze `ARTOON-SPECIFICATION-1.0.md` as the canonical 1.0 spec.
- [ ] Add a `tests/conformance/` corpus with valid, invalid, and edge-case documents.
- [ ] Share corpus across parser, serializer, validator, renderer, CLI, state, and typer.
- [ ] Define exact round-trip expectations: text -> AST -> state -> AST -> text.
- [ ] Define error-code taxonomy and stable diagnostic shape.
- [ ] Add compatibility tests for legacy documents if supported.
- [ ] Document extension points and unsupported syntax clearly.

Deliverables:
- Versioned 1.0 conformance corpus.
- Stable diagnostics guide.
- Spec compliance report.

Exit criteria:
- All core packages consume the same conformance corpus.
- Every valid fixture round-trips as expected.
- Every invalid fixture fails with documented diagnostics.

## Phase 3 - Developer Experience
Target: 4-6 weeks

Goal: make ARTOON easy to adopt by external developers.

Tasks:
- [ ] Rewrite root README around current architecture and quick wins.
- [ ] Add package-specific quickstarts for parser, serializer, renderer, validator, CLI, state, and typer.
- [ ] Add runnable examples for Node, browser, CLI, VS Code, and editor embedding.
- [ ] Add API reference pages generated or checked against exports.
- [ ] Add troubleshooting docs for common parsing, validation, and rendering errors.
- [ ] Add migration guide from Markdown-like workflows.
- [ ] Add “AI generation guide” with prompting patterns and validation loop.

Deliverables:
- Documentation refresh.
- Runnable example suite.
- First-time user onboarding path.

Exit criteria:
- A new developer can parse, validate, render, and edit a document in under 5 minutes.
- Examples are tested or smoke-checked in CI.

## Phase 4 - Editor Excellence
Target: 6-10 weeks

Goal: make `artoon-typer` feel like a serious production editor.

Tasks:
- [ ] Complete manual visual acceptance from `MANUAL-VALIDATION-MATRIX.md`.
- [ ] Continue extracting complex renderers from `BlockRenderer`.
- [ ] Reduce remaining inline styles and old CSS overlap.
- [ ] Add more rendered tests for slash menu, context menu, link dialog, and block focus flow.
- [ ] Add accessibility regression checks for keyboard-only authoring.
- [ ] Add performance profiling for large documents.
- [ ] Add editor error boundary and recoverable import errors.
- [ ] Add polished empty, loading, invalid, and readonly states.

Deliverables:
- Editor acceptance report.
- Reduced `BlockRenderer` complexity.
- Performance baseline for large documents.

Exit criteria:
- Editor passes manual matrix.
- No known critical accessibility blocker.
- Large document behavior has defined budget and evidence.

## Phase 5 - CLI and Automation Power
Target: 8-12 weeks

Goal: make `artoon-cli` the trusted automation surface.

Tasks:
- [ ] Add `artoon doctor` for environment and package checks.
- [ ] Add `artoon check` as a CI-friendly command combining parse and validate.
- [ ] Add JSON diagnostics with stable machine-readable schema.
- [ ] Add batch conversion and directory watch mode if demand is confirmed.
- [ ] Add fixture-based CLI golden tests.
- [ ] Improve error output with file, line, column, and suggestion.

Deliverables:
- CI-friendly CLI.
- Golden test suite.
- Diagnostics schema.

Exit criteria:
- CLI can be used confidently in build pipelines.
- Errors are both human-readable and machine-readable.

## Phase 6 - VS Code and Authoring Ecosystem
Target: 10-14 weeks

Goal: make ARTOON pleasant to write outside the React editor too.

Tasks:
- [ ] Package and document VS Code extension installation.
- [ ] Add screenshots and demo GIFs.
- [ ] Add snippets for common ARTOON structures.
- [ ] Add quick fixes for common validation errors.
- [ ] Add formatter options and settings documentation.
- [ ] Prepare marketplace publishing checklist.

Deliverables:
- Extension release candidate.
- Authoring documentation.
- Marketplace assets.

Exit criteria:
- Extension can be installed by a non-project user.
- Diagnostics, formatting, folding, hover, and outline are demonstrably useful.

## Phase 7 - Performance, Security, and Reliability
Target: 12-18 weeks

Goal: make the platform resilient under real usage.

Tasks:
- [ ] Add performance benchmark budgets for parser, serializer, renderer, validator, and state.
- [ ] Add fuzz tests for parser and serializer.
- [ ] Add malicious-input tests for renderer escaping and link/media handling.
- [ ] Add memory and large-document stress fixtures.
- [ ] Add dependency audit and license review.
- [ ] Add security policy and vulnerability reporting process.

Deliverables:
- Benchmark dashboard or report.
- Fuzz and stress fixtures.
- Security policy.

Exit criteria:
- Performance regressions are caught before release.
- Renderer escaping and validator behavior are tested against hostile input.

## Phase 8 - Ecosystem and Governance
Target: 3-6 months

Goal: make ARTOON sustainable beyond one codebase.

Tasks:
- [ ] Define RFC process for spec changes.
- [ ] Define plugin/extension model for custom blocks.
- [ ] Create public website or documentation portal.
- [ ] Publish package release policy and compatibility matrix.
- [ ] Create contribution guide and issue templates.
- [ ] Build small showcase: blog article, documentation page, AI-generated article, CMS storage demo.

Deliverables:
- Governance docs.
- Public-facing docs site.
- Showcase examples.

Exit criteria:
- External contributors can understand how to propose changes.
- Users can see real-world ARTOON use cases quickly.

