# ARTOON Language Support for VS Code

VS Code extension for ARTOON files (`.artoon`, `.toon`) with practical editing features.

## Features

- Syntax highlighting for ARTOON components, blocks, inline tokens, tables, and comments
- Smart snippets for components, modifiers, blocks, code blocks, and meta fields
- Real-time diagnostics using the ARTOON parser and validator
- Hover documentation for components and modifiers
- Folding ranges for named blocks (`<meta>. ... .<meta>`, `<code:ts>. ... .<code>`)
- Document symbols for outline and breadcrumbs
- Format Document support through the ARTOON serializer
- Command Palette actions:
  - `ARTOON: Validate Document`
  - `ARTOON: Show Document Stats`
  - `ARTOON: New Sample Document`

## Settings

| Setting | Default | Description |
|---|---|---|
| `artoon.validation.enabled` | `true` | Enable real-time diagnostics |
| `artoon.validation.strict` | `false` | Treat warnings as errors |

## Local Development

```bash
cd AROON_2.0/vscode-artoon
npm install
npm run build
```

## Build VSIX

```bash
npm run package
```

## Install VSIX

```bash
code --install-extension vscode-artoon-1.0.0.vsix --force
```

Reload VS Code, then open any `.artoon` or `.toon` file.

## Folder Install

For development, you can also copy this folder to your VS Code extensions directory:

- Windows: `%USERPROFILE%\\.vscode\\extensions\\vscode-artoon`
- macOS/Linux: `~/.vscode/extensions/vscode-artoon`

## Quick Smoke Test

1. Run `ARTOON: New Sample Document` from the Command Palette.
2. Confirm syntax highlighting appears.
3. Run `ARTOON: Validate Document`.
4. Run `ARTOON: Show Document Stats`.
5. Try folding the sample `<meta>` and `<code>` blocks.

## License

MIT
