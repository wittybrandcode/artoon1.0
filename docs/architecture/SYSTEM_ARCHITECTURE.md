# ARTOON System Architecture

## 1. OVERVIEW
ARTOON is designed as a modular compiler and editor ecosystem for a structured document format.

## 2. THE CANONICAL AST HUB
At the center of the architecture is `@artoon/ast`. This package defines the **Canonical AST**, which all other packages use as their data exchange format.

## 3. DATA FLOW
1. **Parser Layer (`@artoon/parser`)**:
   - Source Text -> Lexer -> Tokens
   - Tokens -> AST Builder -> Canonical AST
2. **Editor Layer (`@artoon/state` & `@artoon/typer`)**:
   - Canonical AST -> Editor State (Immutable)
   - Transactions -> New State -> Canonical AST (Export)
3. **Renderer Layer (`@artoon/renderer-html`)**:
   - Canonical AST -> HTML
4. **Validation Layer (`@artoon/validator`)**:
   - Canonical AST -> Validation Results

## 4. DESIGN PATTERNS
- **Immutable State:** The editor uses an immutable state kernel to ensure predictable undo/redo and collaboration.
- **Plugin Registry:** Rendering and editing are being migrated to a registry-based system to avoid monolithic components.
- **Direction-Aware Nodes:** Every node in the AST carries its own directionality (`rtl` or `ltr`).

## 5. REPOSITORY STRUCTURE
- `artoon-ast/`: Core types and normalization.
- `artoon-parser/`: Grammar implementation.
- `artoon-serializer/`: Reversing AST to text.
- `artoon-state/`: Headless editor logic.
- `artoon-typer/`: React visual editor.
- `vscode-artoon/`: IDE integration.
