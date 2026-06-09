# System Analysis Report: `@artoon/renderer-html`

> HTML Renderer for ARTOON — Converts AST to semantic HTML with RTL/LTR support.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/renderer-html` |
| **Version** | `2.0.0` (exports `VERSION = '1.0.0'`) |
| **Role** | Render ARTOON AST to HTML strings |
| **Status** | ✅ Functional, but tests partially disabled |
| **Module Type** | ES Module (`"type": "module"`) |
| **Lines of Code** | ~1,200 (src/) |

**Verdict:** A **capable and well-designed renderer** with excellent dual-format compatibility, rich customization options, and professional HTML output. However, **6 out of 9 test files are skipped** (`.skip`), indicating a test coverage gap.

---

## 2. Architecture Overview

```
src/
├── index.ts           # Main entry — render(), renderFull(), createRenderer()
├── types.ts           # RenderOptions, HTML_MAPPING, DEFAULT_OPTIONS
├── utils.ts           # escapeHtml, wrap, selfClose, attr, attrs, indent
└── render/
    ├── index.ts       # Re-exports
    ├── document.ts    # Full document wrapper, <head>, <body>
    ├── nodes.ts       # Node renderers (~750 lines — the core)
    └── inline.ts      # Inline content renderers (~320 lines)
```

### Pipeline

```
ARTOONDocument (AST or Parser Output)
    ↓
[Document Renderer] — renderDocument()
    ↓
[Node Dispatcher] — renderNode() dispatches by nodeType/type
    ↓
[Node Renderers] — text, list, table, compound, block, media, link, code, comment
    ↓
[Inline Renderer] — renderInlineContent() for text content
    ↓
HTML String
```

---

## 3. Public API

### Functions

| Function | Purpose |
|----------|---------|
| `render(doc, options?)` | Render AST to HTML fragment |
| `renderFull(doc, options?)` | Render to full `<!DOCTYPE html>` document |
| `createRenderer(defaults)` | Create instance with preset options |

### Options System (`types.ts`)

```typescript
interface RenderOptions {
  fullDocument?: boolean;        // Wrap in html/head/body
  title?: string;                // Document title
  includeDirection?: boolean;    // Add dir="rtl" | dir="ltr"
  defaultDirection?: 'rtl' | 'ltr';
  indent?: boolean;              // Pretty-print
  indentSize?: number;
  includeComments?: boolean;     // Render <!-- comments -->
  commentDisplay?: 'hidden' | 'editor-only' | 'visible' | 'collapsible';
  commentTag?: 'div' | 'aside' | 'span' | 'section';
  metaHandling?: 'hide' | 'tags' | 'comment';
  customBlocks?: CustomBlockMapping[];
  defaultCustomBlockTag?: string;
  classPrefix?: string;
  addSemanticClasses?: boolean;
}
```

**Defaults:** `defaultDirection: 'rtl'` (correct for Arabic-first design).

---

## 4. HTML Mapping (`HTML_MAPPING`)

Comprehensive mapping from ARTOON components to HTML tags:

| Category | Mapping |
|----------|---------|
| Text | `p→p`, `t1→h1`, `t2→h2`, `t3→h3`, `t4→h4`, `t5→h5`, `t6→h6`, `q→blockquote`, `pre→pre`, `time→time`, `abbr→abbr` |
| Lists | `ul→ul`, `ol→ol`, `dl→dl`, `li→li`, `dt→dt`, `dd→dd` |
| Modifiers | `s→strong`, `e→em`, `u→u`, `d→del`, `mark→mark`, `sub→sub`, `sup→sup` |
| Inline | `a→a`, `img→img`, `audio→audio`, `video→video`, `abbr→abbr`, `time→time`, `c→code` |
| Separators | `br→br`, `hr→hr`, `wbr→wbr` |
| Compound | `figure→figure`, `details→details` |

---

## 5. Node Renderers (`render/nodes.ts`) ⭐⭐⭐⭐

### Dual-Format Compatibility

Every renderer supports **both** AST format and parser output format:

```typescript
// AST format: nodeType, textType, listType, compoundType, mediaType
const nodeType = (node as any).nodeType || (node as any).type;

// Example: text node
const textType = (node as any).textType || (node as any).componentType;
```

This is **excellent forward-compatibility design** — the renderer works with both the canonical AST and raw parser output without requiring `transform()` first.

### Node Types Supported

| Node | Renderer | Notes |
|------|----------|-------|
| `text` | `renderTextNode()` | Handles `time` and `abbr` specially (splits by `;`) |
| `separator` | `renderSeparatorNode()` | Supports old `separators[]` and new `separatorType` |
| `list` | `renderListNode()` | **Phase 18:** Mixed-type list grouping |
| `table` | `renderTableNode()` | Parser format (string[][]) and AST format (TableRow[]) |
| `compound` | `renderCompoundNode()` | Parser format + AST `{role, node}` format |
| `block` | `renderBlockNode()` | Dispatches to code/meta/figure/details/custom |
| `media` | `renderMediaNode()` | img, audio, video, file |
| `link` | `renderLinkNode()` | With modifier wrapping |
| `code` | `renderCodeNode()` | Inline code only |
| `comment` | `renderCommentNode()` | 4 display modes |

### Special Features

**1. Mixed-Type List Grouping (Phase 18)**
```typescript
// Groups consecutive same-type items:
// ol li, ol li, ul li, ul li → <ol>...</ol>\n<ul>...</ul>
```

**2. Custom Block Mapping**
```typescript
customBlocks: [
  { name: 'card', tag: 'article', className: 'card' },
  { name: 'note', tag: 'aside', className: 'note' }
]
```

**3. Smart Direction Attributes**
```typescript
// Only adds dir="ltr" when content differs from default (rtl)
if (direction === options.defaultDirection) return {};
return { dir: direction };
```

---

## 6. Inline Renderer (`render/inline.ts`) ⭐⭐⭐⭐

### Dual-Format Support

```typescript
// Parser format: { text: string, inlines: any[] }
// AST format: InlineContent[] (array of PlainText | InlineComponent)
```

**Parser format handling:** Replaces `{index}` placeholders with rendered inline HTML — smart design for parser integration.

**AST format handling:** Direct rendering with `isPlainText()` / `isInlineComponent()` guards.

### Modifier Wrapping

```typescript
// Applied inside-out: [s+e:: text] → <strong><em>text</em></strong>
for (const mod of [...modifiers].reverse()) {
  html = wrap(tag, html);
}
```

---

## 7. Document Renderer (`render/document.ts`)

### Full Document Output

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Title</title>
  <style>/* Default RTL styles */</style>
</head>
<body dir="rtl">
  <!-- Content -->
</body>
</html>
```

**Includes default CSS for:** RTL text alignment, `pre/code` styling, table borders, blockquote styling, figure margins.

### META Block Integration

Handles `document.meta` from parser output and `DocumentMeta` from AST — merges into `<head>` meta tags when `metaHandling: 'tags'`.

---

## 8. Test Coverage Assessment

| Test File | Status | Tests | Assessment |
|-----------|--------|-------|------------|
| `custom-blocks.test.ts` | ✅ Active | ~15 | Custom block mapping |
| `comment-display.test.ts` | ✅ Active | ~12 | Comment modes |
| `meta-rendering.test.ts` | ✅ Active | ~10 | META block modes |
| `integration.test.ts.skip` | ❌ Skipped | ~20 | End-to-end |
| `text.test.ts.skip` | ❌ Skipped | ~15 | Text components |
| `inline.test.ts.skip` | ❌ Skipped | ~12 | Inline rendering |
| `blocks.test.ts.skip` | ❌ Skipped | ~10 | Block rendering |
| `compound.test.ts.skip` | ❌ Skipped | ~8 | Compound components |
| `structure.test.ts.skip` | ❌ Skipped | ~10 | Document structure |

**Active tests: ~37 | Skipped tests: ~85**

**Critical Gap:** 67% of tests are disabled. This suggests either:
1. Tests were failing and temporarily skipped
2. Tests were written for old format and not updated
3. Incomplete test migration

---

## 9. Issues & Recommendations

### 🔴 Critical

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **67% of tests skipped** (6/9 files `.skip`) | `tests/` | Massive coverage gap, regression risk | Investigate and re-enable |

### 🟡 Important

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 2 | **`VERSION = '1.0.0'`** | `index.ts:56` | Version mismatch with package | Update to `'2.0.0'` |
| 3 | **README is Arabic-only** | `README.md` | Inconsistent with English-first policy | Translate or provide bilingual |
| 4 | **ES Module only** | `package.json:5` | May break CommonJS consumers | Add dual build or document requirement |
| 5 | **Many `as any` casts** | Throughout | Type safety erosion | Strengthen type unions |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 6 | Add CSS framework integration (Tailwind, Bootstrap) | Easier styling |
| 7 | Add ARIA accessibility attributes | Accessibility compliance |
| 8 | Add structured data (JSON-LD) output | SEO improvement |
| 9 | Plugin system for custom renderers | Extensibility |

---

## 10. Integration Points

### Consumers

| Package | Usage |
|---------|-------|
| `artoon-cli` | `render()` in CLI output |
| `artoon-typer` | Preview panel HTML generation |
| External | Static site generators, CMS integrations |

### Dependencies

```
artoon-renderer-html
├── @artoon/ast (runtime dependency)
└── @artoon/parser (devDependency — for tests)
```

---

## 11. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Renderer Design | 8/10 | Dual-format support is excellent |
| HTML Output | 8/10 | Semantic, clean, RTL-aware |
| Customization | 9/10 | Rich options system, custom blocks |
| Test Coverage | 3/10 | Only 37/133 tests active |
| Type Safety | 6/10 | Many `as any` casts for compatibility |
| Documentation | 6/10 | README is Arabic, missing some options |
| Performance | 8/10 | String concatenation, no DOM dependency |
| **Overall** | **6.9/10** | Good renderer, **test crisis** is the blocker |

---

## 12. Action Items for Roadmap

### Phase 2 (Complete Existing Systems) — HIGH PRIORITY
- [ ] **Investigate and re-enable skipped tests** (6 files)
- [ ] Fix `VERSION` constant to `'2.0.0'`
- [ ] Translate README to English (or bilingual)
- [ ] Document the `.skip` reason for each test file

### Phase 3 (State Unification)
- [ ] Ensure renderer works with `artoon-state` document model
- [ ] Verify `render()` accepts `EditorState.toJSON()` output

### Phase 4 (Cleanup)
- [ ] Add accessibility attributes (ARIA)
- [ ] Add CSS framework presets
- [ ] Improve type safety (reduce `as any`)

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
