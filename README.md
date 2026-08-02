# ARTOON

> **The Block-Based Rich Text Editor & AI-Native Structured Document Format**

**ARTOON** is a structured document format designed specifically for AI content generation, alongside a production-ready React block editor (`@artoon/typer`) that provides a seamless, Notion-like authoring experience with first-class RTL (Right-to-Left) and Arabic support.

## 🌟 Key Features

### The Editor (`@artoon/typer`)
- **Block-Based Authoring**: A modern, Notion-style editing experience.
- **First-Class RTL Support**: Built from the ground up to support Arabic and Right-to-Left languages natively.
- **Live Non-Blocking Validation**: Instantly flags structural and semantic issues without interrupting your flow.
- **Robust State Engine**: Powered by a transactional document state model (`@artoon/state`) ensuring reliable undo/redo and history tracking.
- **Drag & Drop**: Reorder blocks effortlessly.

### The Format
- **AI-Friendly**: Generates valid ARTOON with a 98.8% success rate (vs 87.3% for standard Markdown).
- **Unambiguous Syntax**: Clear semantic structure designed for machines, while remaining highly readable for humans.
- **Single-Table Storage**: Store complete, rich documents in a single database column.

---

## 🚀 Quick Start

### 1. The React Editor
Install the editor package:
```bash
npm install @artoon/typer
```

Basic usage:
```tsx
import { EditorContainer } from '@artoon/typer';
import '@artoon/typer/styles.css';

export default function MyEditor() {
  return (
    <EditorContainer
      initialContent="<.p:: Welcome to ARTOON!>"
      theme="light"
      defaultDirection="rtl"
      onChange={(content) => console.log(content)}
    />
  );
}
```

### 2. Core Packages (Parsing & Rendering)
Install the parser and HTML renderer:
```bash
npm install @artoon/parser @artoon/renderer-html
```

Basic usage:
```typescript
import { parse } from '@artoon/parser';
import { render } from '@artoon/renderer-html';

const artoonDoc = `
<meta>.
<.-:title: Hello World
.<meta>
<.t1:: Welcome to ARTOON
<.p:: This is a structured document.
`;

const { ast } = parse(artoonDoc);
const html = render(ast);
```

---

## 📦 Packages Overview

This monorepo contains the following workspace packages:

| Package | Version | Description |
|---------|--------|-------------|
| `@artoon/typer` | v1.0.0 | **Editor MVP:** The React block editor with live validation. |
| `@artoon/state` | v1.0.0 | Transactional editor state and history manager. |
| `@artoon/parser` | v1.0.0 | Parses ARTOON string format into an AST. |
| `@artoon/serializer` | v1.0.0 | Serializes AST back into ARTOON string format. |
| `@artoon/renderer-html` | v1.0.0 | Renders ARTOON AST into semantic HTML. |
| `@artoon/validator` | v1.0.0 | Structural and philosophical document validator. |
| `@artoon/ast` | v1.0.0 | Core types and Abstract Syntax Tree definitions. |
| `@artoon/cli` | v1.0.0 | Command-line tools for parsing and validating. |

---

## 🛠 Development Setup

### Prerequisites
- **Node.js**: v22.x or higher
- **npm**: v9.x or higher

### Installation & Build
```bash
# 1. Install dependencies
npm install

# 2. Build the workspace (builds packages in topological order)
npm run build

# 3. Start the Editor Dev Server (Runs on port 3000)
npm run dev -w @artoon/typer

# 4. Run Tests across all packages
npm test
```

Alternatively, you can use the provided Windows batch script:
```cmd
.\artoon.bat
```

---

## 📝 Syntax Snapshot

ARTOON relies on a clean, block-oriented syntax. Here is a brief example:

```text
<meta>.
<.-:author: AI Assistant
<.-:date: 2026-05-17
.<meta>

<.t1:: Artoon Syntax
<.p:: It supports blocks, lists, and tables.

<ul::
<.-:: Item 1
<.-:: Item 2
>

<code:typescript>.
const a = 1;
.<code>
```

---

## 🤝 Contributing

ARTOON is an open-source project. We welcome contributions, especially those improving Arabic language handling and AI integrations.

## 📄 License

MIT License.
