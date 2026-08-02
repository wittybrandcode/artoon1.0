# ARTOON

> **The Block-Based Rich Text Editor & Structured Document Format**

**ARTOON** is a structured document format designed for content generation, alongside a production-ready React block editor (`@artoon/typer`) that provides a Notion-like authoring experience with native RTL (Right-to-Left) and Arabic support.

## 🌟 Key Features

### The Editor (`@artoon/typer`)
- **Block-Based Authoring**: A modern, block-oriented editing experience.
- **Native RTL Support**: Built from the ground up to support Arabic and Right-to-Left languages.
- **Live Non-Blocking Validation**: Instantly flags structural and semantic issues without interrupting your flow.
- **Transactional State Engine**: Powered by a document state model (`@artoon/state`) ensuring reliable undo/redo and history tracking.
- **Drag & Drop**: Reorder blocks effortlessly.

### The Format
- **Unambiguous Syntax**: Clear semantic structure designed for programmatic parsing and transformation.
- **Single-Table Storage**: Store complete, rich documents in a single database column or file.

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

| Package | Description |
|---------|-------------|
| `@artoon/typer` | **Editor MVP:** The React block editor with live validation. |
| `@artoon/state` | Transactional editor state and history manager. |
| `@artoon/parser` | Parses ARTOON string format into an AST. |
| `@artoon/serializer` | Serializes AST back into ARTOON string format. |
| `@artoon/renderer-html` | Renders ARTOON AST into semantic HTML. |
| `@artoon/validator` | Structural and philosophical document validator. |
| `@artoon/ast` | Core types and Abstract Syntax Tree definitions. |
| `@artoon/cli` | Command-line tools for parsing and validating. |

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
<.-:author: Assistant
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

## 📄 License

MIT License.
