# Quality Engineering Plan

## Quality Goals
ARTOON should be trusted because every transformation is verified:
- Parse must be deterministic.
- Serialize must preserve supported structure.
- Validate must explain issues clearly.
- Render must be safe and accessible.
- State operations must be reversible and predictable.
- Editor interactions must not corrupt documents.

## Release Gates
Every release candidate should pass:
- `npm ci`
- root build
- root tests
- package typechecks
- package smoke tests from built `dist`
- conformance corpus
- CLI golden tests
- editor targeted UI tests
- documentation link check where practical

## Recommended Scripts
Add these root scripts:

```json
{
  "verify": "npm run build && npm run test",
  "verify:typer": "npm run typecheck -w artoon-typer && npm test -w artoon-typer && npm run build -w artoon-typer",
  "verify:release": "npm ci && npm run verify && npm run smoke:packages"
}
```

Exact commands should match the final package setup.

## Test Architecture
| Layer | Scope | Owner |
|---|---|---|
| Unit tests | Pure helpers, AST utilities, parser internals | Package |
| Integration tests | parser -> AST -> validator -> renderer | Core |
| Conformance tests | shared spec fixtures | Platform |
| Golden tests | CLI and serializer output | CLI/Serializer |
| UI behavior tests | editor shortcuts, menus, toolbar, dialogs | Typer |
| Manual matrix | visual, keyboard-only, zoom, RTL/LTR | Release |
| Fuzz tests | malformed syntax and hostile input | Parser/Renderer |
| Performance tests | large documents and hot operations | Platform |

## Conformance Corpus Structure
Recommended folder:

```text
tests/conformance/
  valid/
    text/
    lists/
    tables/
    media/
    metadata/
    rtl-ltr/
  invalid/
    syntax/
    attributes/
    nesting/
    unsafe/
  roundtrip/
    serializer/
    state/
    renderer/
```

Each fixture should include:
- `.artoon` source.
- expected AST JSON where stable.
- expected diagnostics for invalid cases.
- notes explaining the edge case.

## Diagnostics Standard
Every diagnostic should eventually include:
- stable code
- severity
- message
- line
- column
- source package
- optional suggestion
- optional documentation link

Example:

```json
{
  "code": "ARTOON_LIST_MIXED_DEPTH",
  "severity": "error",
  "message": "List child depth is invalid here.",
  "line": 12,
  "column": 1,
  "source": "@artoon/parser",
  "suggestion": "Use one additional '-' for a nested list item."
}
```

## Performance Budgets
Initial budgets should be measured before enforcing.

Recommended benchmarks:
- Parse 1 KB, 100 KB, 1 MB documents.
- Serialize 1 KB, 100 KB, 1 MB ASTs.
- Render large article with tables, media, lists, and inline marks.
- Validate invalid corpus with many diagnostics.
- Apply 1,000 state transactions.
- Editor mount and first editable interaction for large documents.

## Security Checklist
- Escape all rendered text and attributes.
- Validate link protocols.
- Avoid unsafe HTML injection in renderer output.
- Keep editor `dangerouslySetInnerHTML` usage audited.
- Add hostile fixtures for script-like text, attributes, links, and media URLs.
- Document renderer trust boundaries.

## Observability
For developer-facing tools:
- CLI should support `--json` diagnostics.
- Parser and validator should expose structured errors.
- Editor should surface import/validation errors clearly.
- Debug logging should be opt-in, never default in hot paths.

## Compatibility Policy
Suggested policy:
- Patch versions fix bugs without changing syntax.
- Minor versions add syntax or APIs backward-compatibly.
- Major versions may change syntax or AST contracts.
- Spec versions must be explicit and documented.
- Migrations must be available before breaking old documents.

