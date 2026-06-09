# @artoon/parser

ARTOON Format Parser - v2.0.0 (Unified Types)

## Overview

This package implements the core parser for ARTOON format with unified type output.

## Version 2.0 Changes

- Parser outputs `InlineContent[]` directly (no more `ParsedContent` wrapper)
- Uses `type` instead of `nodeType` (with compatibility layer)
- `SeparatorNode` uses `separatorType` instead of `separators[]`
- **NEW:** `meta` is now a reserved block (along with `code`)
- **NEW:** Hidden fields (`>.-:field:`) are restricted to META blocks only
- **NEW:** META blocks stored in `document.meta` (not in children)
- Simplified integration with downstream packages

## Installation

```bash
npm install @artoon/parser
```

## Usage

### Basic Parsing

```typescript
import { parse, parseStrict, validate, isValid } from '@artoon/parser';
import type { InlineContent } from '@artoon/ast';

// Parse ARTOON source
const result = parse(`
>.t1:: مرحباً بالعالم
>.p:: هذه فقرة بالعربية مع [s:: نص مهم] داخلها
`);

console.log(result.ast);    // AST tree with InlineContent[]
console.log(result.errors); // Array of errors

// Strict parsing (throws on errors)
const ast = parseStrict(source);

// Validation only
const errors = validate(source);
const valid = isValid(source);
```

### META Block Parsing (NEW in v2.0)

```typescript
// Parse document with META block
const result = parse(`
<meta>.
>.-:title: My Document
>.-:author: Ahmad Muhammad
>.-:date: 2026-01-18
>.-:tags: technology, programming
.<meta>

>.t1:: Document Title
>.p:: Document content...
`);

// Access META block
console.log(result.ast.meta);
// {
//   type: 'block',
//   blockName: 'meta',
//   isCode: false,
//   fields: [
//     { name: 'title', value: 'My Document', direction: 'rtl' },
//     { name: 'author', value: 'Ahmad Muhammad', direction: 'rtl' },
//     { name: 'date', value: '2026-01-18', direction: 'rtl' },
//     { name: 'tags', value: 'technology, programming', direction: 'rtl' }
//   ]
// }

// Regular content in children
console.log(result.ast.children); // [t1, p, ...]
```

### META Block Validation

The parser enforces these rules for META blocks:

1. **Hidden fields only in META:** The syntax `>.-:field:` can only be used inside `<meta>` blocks
2. **META contains only hidden fields:** META blocks cannot contain regular child elements or text
3. **Reserved block:** `meta` is a reserved block name (like `code`)

```typescript
// ✅ Valid META block
const valid = parse(`
<meta>.
>.-:title: Document Title
>.-:author: Author Name
.<meta>
`);

// ❌ Invalid: hidden field outside META
const invalid1 = parse(`
<card>.
>.-:caption: This will error
.<card>
`);
// Error: "Hidden field syntax '>.-:field:' can only be used inside <meta> block"

// ❌ Invalid: regular content in META
const invalid2 = parse(`
<meta>.
>.p:: This will error
.<meta>
`);
// Error: "Only hidden fields (>.-:field:) are allowed inside <meta> block"
```

## Structure

```
src/
├── index.ts        # Main entry point
├── types.ts        # Core type definitions
├── lexer/          # Tokenization (6 structural symbols)
├── context/        # Direction context tracking (RTL/LTR)
├── depth/          # Nesting depth calculation
├── inline/         # Inline component parsing [...]
├── compound/       # Compound component parsing (>.- syntax)
├── table/          # Table structure parsing
├── block/          # Block-level parsing (<name>.) - includes META validation
├── ast/            # AST node definitions and builder
└── errors/         # Error types and handling
```

## Features

- ✅ Line-based parsing
- ✅ Direction detection (> RTL / < LTR)
- ✅ All component types (text, media, lists, tables, etc.)
- ✅ Inline tokenization with modifiers
- ✅ Compound components (figure, details)
- ✅ Block handling (meta, code, custom)
- ✅ **META block validation and parsing**
- ✅ **Hidden fields restricted to META**
- ✅ Nested lists with depth tracking
- ✅ Error detection and reporting

## Reserved Blocks

Two block names are reserved with special handling:

### 1. `code` Block
- Content is not parsed as ARTOON
- Stored as raw string
- Used for code snippets

### 2. `meta` Block (NEW in v2.0)
- Only accepts hidden fields (`>.-:field: value`)
- Stored in `document.meta` (not in children)
- Used for document metadata
- Hidden in HTML output by default

## Tests

```bash
npm test
```

**133 tests** covering all parser functionality including:
- 28 META block tests (validation + parsing)
- 105 existing tests (all components, inline, tables, etc.)

## Migration from v1.x

### META Block Changes

**Before (v1.x):**
```typescript
// META was a custom block like any other
<meta>.
>.p:: Some content
.<meta>
```

**After (v2.0):**
```typescript
// META is reserved, only accepts hidden fields
<meta>.
>.-:title: Document Title
>.-:author: Author Name
.<meta>

// Access via document.meta instead of children
result.ast.meta.fields // Array of { name, value, direction }
```

### Hidden Fields

**New restriction:** Hidden fields (`>.-:field:`) can only be used in META blocks.

If you were using hidden fields in custom blocks, you need to either:
1. Move them to a META block
2. Use regular child elements (`>.-element::`) instead

## API Reference

### Main Functions

- `parse(source: string): ParseResult` - Parse ARTOON source
- `parseStrict(source: string): DocumentNode` - Parse and throw on errors
- `validate(source: string): ParseError[]` - Validate without building AST
- `isValid(source: string): boolean` - Check if source is valid

### Types

- `DocumentNode` - Root AST node with `children` and optional `meta`
- `BlockNode` - Block node (meta, code, custom)
- `BlockField` - META field `{ name, value, direction }`
- `ParseError` - Error with line, column, message, suggestion
- `ParseResult` - `{ ast: DocumentNode, errors: ParseError[] }`

## License

MIT
