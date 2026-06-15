# DEVELOPMENT GUIDE - ARTOON 2.0 Monorepo

Welcome to the ARTOON development environment. This document explains how to set up, build, and test the project.

## 🛠 Prerequisites

- **Node.js**: v18.x or higher (v20.x recommended)
- **npm**: v9.x or higher

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```
   *This installs all dependencies for all packages in the monorepo using NPM Workspaces.*

2. **Build All Packages**
   ```bash
   npm run build
   ```
   *This builds all packages in the correct order: Core -> Renderer -> State -> Editor -> CLI.*

3. **Run All Tests**
   ```bash
   npm test
   ```
   *Runs Jest and Vitest suites across the entire monorepo.*

4. **Launch the Editor (Windows)**
   Double-click `artoon.bat` and choose option **[1] Start Editor**.
   The editor will be available at: http://localhost:3000

## 📦 Package Structure

- `artoon-core`: Shared security and utility logic.
- `artoon-ast`: Canonical AST definitions and transformations.
- `artoon-parser`: Text-to-AST parsing engine.
- `artoon-serializer`: AST-to-text serialization.
- `artoon-validator`: Semantic and structural validation.
- `artoon-renderer-html`: SSR-ready HTML rendering engine.
- `artoon-state`: Transactional state kernel (editor-agnostic).
- `artoon-typer`: React-based visual editor.
- `artoon-cli`: Universal command-line interface.

## 🧪 Testing

You can run tests for a specific package using:
```bash
npm test -w @artoon/parser
```

## 🛠 Common Tasks

### Adding a new dependency
Always add dependencies from the root to ensure `package-lock.json` is updated correctly:
```bash
npm install <package-name> -w @artoon/typer
```

### Cleaning the project
To remove all `dist` folders and `node_modules`:
```bash
npm run clean
```

## 📝 Troubleshooting

### Module Resolution Issues
If your IDE cannot find `@artoon/*` imports, ensure you have the root `tsconfig.json` open. This file maps the workspace packages to their source code for real-time feedback.

### Packaging Warnings
The packages are configured for dual CJS/ESM support. If you see `MODULE_TYPELESS_PACKAGE_JSON` warnings, ensure the `dist` folders contain the appropriate `package.json` redirects (this is handled automatically by the build script).
