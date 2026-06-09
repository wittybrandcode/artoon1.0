# World-Class Acceptance Criteria

## Platform Criteria
- [ ] Root verification command passes from a fresh clone.
- [ ] Every package has a clear README and quickstart.
- [ ] Every public package has smoke tests against built output.
- [ ] Versions and release notes are consistent.
- [ ] Changelog exists and is maintained.
- [ ] Security and contribution docs exist.

## Format and Spec Criteria
- [ ] ARTOON 1.0 spec is frozen and clearly versioned.
- [ ] Syntax examples are valid and tested.
- [ ] Conformance corpus exists.
- [ ] Valid fixtures parse, validate, serialize, render, and round-trip.
- [ ] Invalid fixtures produce stable diagnostics.
- [ ] Compatibility and migration policy is documented.

## Parser and Serializer Criteria
- [ ] Parser behavior is deterministic.
- [ ] Parser diagnostics include stable codes and locations.
- [ ] Serializer golden outputs are tested.
- [ ] Round-trip behavior is documented and tested.
- [ ] Large-document parsing has performance budgets.

## Validator Criteria
- [ ] Rules are documented.
- [ ] Custom rule API has examples.
- [ ] JSON output schema is stable.
- [ ] CLI and VS Code diagnostics share semantics.

## Renderer Criteria
- [ ] Output is escaped and safe by default.
- [ ] Accessibility semantics are documented.
- [ ] State rendering compatibility is tested.
- [ ] Theming or styling guidance is documented.

## State Kernel Criteria
- [ ] Transactions, selection, mapping, and history have broad tests.
- [ ] Public APIs are documented.
- [ ] Performance benchmark exists for transaction-heavy workloads.
- [ ] Debug logs are opt-in.

## CLI Criteria
- [ ] Commands have predictable exit codes.
- [ ] `parse`, `validate`, `render`, `convert`, `format`, and `migrate` have golden tests.
- [ ] CI-friendly command exists.
- [ ] Machine-readable diagnostics are documented.

## Editor Criteria
- [ ] Manual visual acceptance matrix passes.
- [ ] Keyboard shortcuts are behavior-tested.
- [ ] Toolbar and menu accessibility is covered.
- [ ] RTL/LTR authoring is tested.
- [ ] Undo/redo behavior is tested.
- [ ] Large-document performance is measured.
- [ ] Remaining complex renderer extraction is planned or complete.

## VS Code Criteria
- [ ] Extension installs cleanly.
- [ ] Diagnostics match parser/validator expectations.
- [ ] Formatting is stable.
- [ ] Snippets, hover, folding, and outline are documented.
- [ ] Marketplace readiness checklist is complete.

## Documentation Criteria
- [ ] A beginner can complete the quickstart in under 5 minutes.
- [ ] Examples are runnable.
- [ ] AI-generation workflow is documented.
- [ ] Troubleshooting page exists.
- [ ] Docs explain when to use ARTOON and when not to use it.

## Launch Criteria
- [ ] Release candidate tagged.
- [ ] Public examples ready.
- [ ] Screenshots and demo assets ready.
- [ ] Package publishing dry run complete.
- [ ] Known limitations documented.

