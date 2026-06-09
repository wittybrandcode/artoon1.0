# Product and Ecosystem Plan

## Product Surfaces
ARTOON has several user-facing surfaces:
- Text format and specification.
- Parser, AST, serializer, validator, renderer packages.
- State kernel.
- CLI.
- React editor (`artoon-typer`).
- VS Code extension.
- Examples and docs.

Each surface should become excellent on its own while still reinforcing the same platform contract.

## Editor Roadmap
Priorities:
- Finish browser-based visual acceptance.
- Continue reducing `BlockRenderer` complexity.
- Improve link, table, media, and list editing flows.
- Add robust import error UI.
- Add document outline panel if useful.
- Add autosave and dirty state semantics.
- Add keyboard help overlay.
- Add command palette for block operations.

Quality bar:
- Keyboard-only authoring is possible.
- RTL/LTR switching is reliable.
- Undo/redo never corrupts content.
- Empty and invalid states are polished.
- Mobile layout remains usable for light editing.

## CLI Roadmap
Priorities:
- `artoon check` for CI.
- `artoon doctor` for environment and package health.
- Better JSON diagnostics.
- Golden tests for parse, validate, render, convert, format, migrate.
- Batch workflows.

Quality bar:
- Commands have predictable exit codes.
- Errors include file, line, column, and suggestion.
- CLI output can be consumed by CI and editors.

## VS Code Roadmap
Priorities:
- Marketplace-ready packaging.
- Snippets and quick fixes.
- Better settings and formatter controls.
- Demo screenshots.
- Extension smoke test workflow.

Quality bar:
- Extension installs cleanly.
- Diagnostics match CLI/validator diagnostics.
- Formatting is stable and expected.
- Hover and outline help users learn the format.

## Documentation Roadmap
Create a documentation path for different users:

| User | Needs |
|---|---|
| Content writer | syntax basics, examples, editor usage |
| AI developer | prompting, validation loop, parser API |
| Web developer | render to HTML, sanitize, style |
| Tool builder | AST, state, diagnostics, conformance |
| Maintainer | release process, spec governance |

Must-have docs:
- What is ARTOON?
- 5-minute quickstart.
- Syntax guide.
- Package API guide.
- CLI guide.
- Editor guide.
- VS Code guide.
- AI generation guide.
- Troubleshooting.
- Migration guide.
- Security notes.

## Examples Roadmap
Add examples that can be tested:
- Minimal parse/render Node script.
- Browser render demo.
- CLI CI check demo.
- AI generation and validation loop.
- Blog article.
- Documentation page.
- Arabic RTL article.
- Mixed RTL/LTR article.
- CMS single-table storage example.
- Editor embedding example.

## Branding and Launch
Launch assets:
- Logo and visual identity usage.
- Short tagline.
- One-page landing copy.
- Demo screenshots.
- Short comparison with Markdown and HTML.
- “Why ARTOON for AI?” article.
- Release announcement.

Suggested tagline:
Structured articles for humans, AI, and reliable publishing.

## Community and Governance
Create:
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- issue templates
- RFC template
- compatibility policy
- release policy

Governance should be lightweight at first:
- Maintainer approves spec changes.
- All syntax changes require conformance fixtures.
- All public API changes require changelog entry.
- Breaking changes require migration notes.

## Integration Opportunities
Potential future integrations:
- Markdown import/export bridge.
- MDX or HTML import subset.
- Static-site generator plugin.
- CMS adapter.
- OpenAI/LLM validation helper.
- Web component renderer.
- Playground website.

Prioritize integrations only after the 1.0 release gates are reliable.

