# @artoon/ast

ARTOON Canonical AST - v2.0.0 (Unified Types)

## Overview

This package defines the canonical AST schema for ARTOON documents with unified types across all packages.

## Version 2.0 Changes

- `nodeType` renamed to `type` (with compatibility layer supporting both)
- `ListItem.children` is now `ListItem[]` (was `ListNode`)
- `SeparatorNode.separatorType` replaces `separators[]`
- Added optional `id` field to nodes
- Parser outputs `InlineContent[]` directly

## Installation

```bash
npm install @artoon/ast
```

## Usage

```typescript
import { parse } from '@artoon/parser';
import { transform, toJSON, ARTOONDocument } from '@artoon/ast';
import type { ContentNode, TextNode, ListNode, InlineContent } from '@artoon/ast';

// Parse and transform to canonical AST
const parserResult = parse(`
>.t1:: مرحباً بالعالم
>.p:: فقرة مع [s:: نص مهم]
`);

const ast: ARTOONDocument = transform(parserResult);

// Serialize to JSON
const json = toJSON(ast);
console.log(json);
```

## Compatibility Layer

During migration, nodes have both `type` and `nodeType`:

```typescript
import { createCompatNode, normalizeNode } from '@artoon/ast';

// Create node with both properties
const node = createCompatNode('text', { content: [...] });
// node.type === 'text'
// node.nodeType === 'text'

// Normalize existing node
const normalized = normalizeNode(oldNode);
```

> ⚠️ **Deprecation Warning**: إن الإصدار V2.x هو الملاذ الأخير لخاصية `nodeType`. ابتداءً من الإصدار V3.0 المقرر إطلاقه مستقبلاً، سيتم إسقاط الـ Compat Layer نهائياً. تم توفير الأداة `artoon migrate` لتيسير انتقال مستنداتكم.

## Migration Tool (V1 → V2)

To upgrade your existing `1.0` AST JSON files to the clean `2.0` unified format, a CLI tool is provided:

```bash
artoon migrate ./my-docs --dry-run
```text

This will strip legacy properties like `nodeType`, structure `items` automatically, and clean your AST.

## Key Concepts

- **Modifier (مُعدِّل)**: Modifies text display - `s`, `e`, `u`, `d`, `mark`, `sub`, `sup`
- **Attribute (سمة)**: Describes component - `alt`, `title`, `lang`, `label`
- Modifiers work ONLY with: `text`, `a`, `abbr`, `time`
- Media (`img`, `audio`, `video`, `file`) and code (`c`) do NOT accept modifiers

## Structure

```

src/
├── index.ts        # Main entry point
├── types.ts        # All TypeScript type definitions
├── nodes/          # Node creation and traversal utilities
├── schema/         # JSON Schema (artoon-ast.schema.json)
├── transform/      # Parser AST → Canonical AST
└── serialize/      # AST → JSON serialization

```

## API

### Transform

- `transform(parserResult)` - Convert parser output to canonical AST

### Serialization

- `toJSON(doc, pretty?)` - Serialize to JSON string
- `fromJSON(json)` - Parse JSON to AST
- `clone(doc)` - Deep clone document
- `getStats(doc)` - Get document statistics

### Node Utilities

- `createTextNode()`, `createListNode()`, etc.
- `visitNodes()` - Traverse all nodes
- `findNodesByType()` - Find nodes by type
- `extractText()` - Extract plain text

### Type Guards

- `isTextNode()`, `isListNode()`, `isTableNode()`, etc.

## JSON Schema

The canonical schema is available at:

- `src/schema/artoon-ast.schema.json`
- Schema ID: `https://artoon.dev/schemas/ast/v1.0.json`

## Tests

```bash
npm test
```

42 tests covering types, transform, serialization, and node utilities.
