# System Analysis Report: `@artoon/ast`

> ARTOON Canonical AST — Unified Type Definitions & Utilities

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/ast` |
| **Version** | `2.0.0` |
| **Role** | Canonical AST schema + type definitions for the entire ARTOON ecosystem |
| **Status** | ✅ Stable / Core Infrastructure |
| **Test Count** | 42 tests |
| **Lines of Code** | ~1,800 (src/) |

**Verdict:** This is the **foundation stone** of the ARTOON platform. It is well-designed, comprehensive, and production-ready with minor maintenance items.

---

## 2. Architecture Overview

```
src/
├── index.ts           # Main entry — re-exports everything
├── types.ts           # ═══ CORE: All TypeScript definitions (~540 lines)
├── compat.ts          # v1 → v2 migration compatibility layer
├── nodes/             # Node creation helpers + traversal utilities
│   └── index.ts
├── builder/           # Fluent Builder API
│   └── ARTOONBuilder.ts
├── transform/         # Parser AST → Canonical AST converter
│   ├── index.ts       # Main transform logic (~510 lines)
│   └── parser-types.ts
├── serialize/         # AST → JSON utilities
│   └── index.ts
├── schema/            # JSON Schema definitions
├── migration/         # V1 → V2 migration tool
└── unified/           # Unified type exports
```

### Design Philosophy

The package follows a **"canonical center"** pattern:
- `types.ts` defines the one true AST schema
- `transform/` converts parser-specific output into canonical form
- `compat.ts` bridges v1 and v2 during migration
- All other packages depend on these types

---

## 3. Type System Analysis (`types.ts`)

### Node Hierarchy

```
BaseNode
├── TextNode        (p, t1-t6, q, pre, time, abbr)
├── SeparatorNode   (br, hr, wbr)
├── ListNode        (ul, ol, dl)
├── TableNode
├── CompoundNode    (figure, details)
├── BlockNode       (meta, code, custom blocks)
├── MediaNode       (img, video, audio, file)
├── LinkNode
├── CodeNode        (inline code)
└── CommentNode
```

### Key Design Decisions

| Decision | Assessment |
|----------|------------|
| `type` as canonical (replaces `nodeType`) | ✅ Correct — aligns with JS ecosystem conventions |
| `ReadonlyArray<T>` for immutability | ✅ Good — enforces immutable AST |
| `direction: 'rtl' \| 'ltr'` on every node | ✅ Essential for ARTOON's RTL-first mission |
| `id?: string` for editor support | ✅ Pragmatic — doesn't clutter non-editor use |
| `nodeType` kept as `@deprecated` | ✅ Smart migration path |

### Inline Content Model

```
InlineContent = PlainText | InlineComponent
```

**Modifiers:** `s` (strong), `e` (emphasis), `u` (underline), `d` (delete), `mark`, `sub`, `sup`

**Components:** `a`, `img`, `audio`, `video`, `file`, `abbr`, `time`, `c`

---

## 4. Module-by-Module Assessment

### 4.1 `compat.ts` — Compatibility Layer ⭐⭐⭐⭐⭐

**Purpose:** Bridge v1 (`nodeType`) and v2 (`type`) formats during migration.

**Strengths:**
- `normalizeNode()` — converts any format to canonical
- `createCompatNode()` — produces dual-property nodes
- `getMigrationStats()` — audit legacy content
- Clearly marked `@deprecated` with removal target (v3.0)

**Assessment:** Professionally handled migration path.

---

### 4.2 `transform/index.ts` — Parser → Canonical Converter ⭐⭐⭐⭐

**Purpose:** Convert `@artoon/parser` output into canonical AST.

**Strengths:**
- Handles all 10 node types
- Transforms meta blocks into structured `DocumentMeta`
- Converts inline content with placeholder replacement
- Supports both old (`ParsedContent`) and new (`InlineContent[]`) formats

**Concerns:**
- **Complexity:** `transformInlineContent()` handles two formats with placeholder replacement — this is technical debt from migration
- **Circular dependency risk:** Comment says it avoids importing `@artoon/parser` directly, but `package.json` lists parser as a runtime dependency
- **Table cell content:** Returns plain text only (`"to avoid circular dependency"`) — rich inline in tables is lost

**Recommendation:** After v1 support is dropped, simplify transform logic significantly.

---

### 4.3 `nodes/index.ts` — Node Utilities ⭐⭐⭐⭐

**Purpose:** Factory functions and traversal utilities.

**API Surface:**
- Creators: `createTextNode`, `createListNode`, `createSeparatorNode`, etc.
- Traversal: `visitNodes`, `findNodesByType`
- Extractors: `extractText`, `countByType`
- Inline helpers: `inlineToText`, `hasModifiers`, `getModifiers`

**Strengths:**
- Clean factory functions using `createCompatNode`
- Recursive traversal handles nested lists and compounds

**Gap:** No `mapNodes()` or `filterNodes()` functional utilities — only imperative `visitNodes`.

---

### 4.4 `builder/ARTOONBuilder.ts` — Fluent API ⭐⭐⭐

**Purpose:** Programmatic document construction.

**Current API:**
```typescript
new ARTOONBuilder('rtl')
  .meta({ title: 'Hello' })
  .paragraph('Text')
  .heading(1, 'Title')
  .list('ul', ['item 1', 'item 2'])
  .separator('hr')
  .build()
```

**Strengths:** Fluent, chainable, direction-aware.

**Gaps:**
- No table builder
- No compound node builder (figure, details)
- No media builder
- No inline component builder (links, images within text)
- `heading()` uses `as any` cast — type safety issue
- `list()` only supports `ul`/`ol`, not `dl` (definition lists)

---

### 4.5 `serialize/index.ts` — Serialization ⭐⭐⭐⭐

**API:** `toJSON`, `fromJSON`, `toCompactJSON`, `clone`, `getStats`

**Bug Found in `getStats`:**
```typescript
if (item.children) {
  countNodes([item.children], stats);  // ❌ Wraps array in array
}
```
`item.children` is already `ListItem[]`. Wrapping it in another array `[item.children]` causes `countNodes` to receive `[[item1, item2]]` — the inner array is treated as a single object node. This undercounts nested list items.

**Fix:**
```typescript
if (item.children) {
  countNodes(item.children, stats);  // ✅ Pass array directly
}
```

---

## 5. Test Coverage Assessment

| Test File | Focus | Assessment |
|-----------|-------|------------|
| `types.test.ts` | Type guards, interfaces | ✅ Good |
| `compat.test.ts` | Migration utilities | ✅ Comprehensive (14.7KB) |
| `nodes.test.ts` | Factory + traversal | ✅ Adequate |
| `serialize.test.ts` | JSON round-trip | ⚠️ Missing `getStats` bug coverage |
| `transform.test.ts` | Parser → AST | ✅ Good |
| `builder.test.ts` | Fluent API | ⚠️ Basic — doesn't cover gaps |

**Overall:** 42 tests provide solid coverage. Missing edge cases around nested list stats and builder gaps.

---

## 6. Dependency Analysis

```json
"dependencies": {
  "@artoon/parser": "file:../artoon-parser"
}
```

**Issue:** Runtime dependency on parser, but `transform/` only imports **types** from parser.

**Recommendation:** Move `@artoon/parser` to `devDependencies` or `peerDependencies` since only type imports are used at compile time. This eliminates circular dependency risk and makes `ast` a true leaf node in the dependency graph.

Target dependency graph:
```
artoon-parser → artoon-ast (types only)
artoon-serializer → artoon-ast
artoon-renderer-html → artoon-ast
artoon-validator → artoon-ast
artoon-state → artoon-ast
```

---

## 7. Issues & Recommendations

### 🔴 Critical

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | `getStats` undercounts nested list items | `serialize/index.ts:91` | Remove array wrapper around `item.children` |
| 2 | `VERSION = '1.0'` contradicts package v2.0.0 | `index.ts:50` | Update to `'2.0.0'` |

### 🟡 Important

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 3 | `@artoon/parser` is runtime dependency | `package.json` | Move to `devDependencies` |
| 4 | Builder API missing table, media, compound | `builder/` | Add builder methods |
| 5 | Builder `heading()` uses `as any` | `ARTOONBuilder.ts:83` | Use proper TextType mapping |
| 6 | Table cells lose inline formatting | `transform/index.ts:282` | Document limitation or fix post-migration |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 7 | Add `mapNodes()` functional utility | Enables immutable AST transformations |
| 8 | Add `filterNodes()` utility | Common query pattern |
| 9 | Add Builder support for inline components | Rich text construction |
| 10 | Export JSON Schema at build time | Consumers can validate without TypeScript |

---

## 8. Integration Points

### Consumers of `@artoon/ast`

| Package | Uses | Integration Quality |
|---------|------|---------------------|
| `artoon-serializer` | Types, `ARTOONDocument` | ✅ Direct |
| `artoon-renderer-html` | Types, node traversal | ✅ Direct |
| `artoon-validator` | Types, schema | ✅ Direct |
| `artoon-editor-state` | Types, re-exports | ✅ Direct |
| `artoon-typer` | Types (via state adapter) | ⚠️ Indirect — uses Block[], not AST |
| `artoon-cli` | Types, `transform` | ✅ Direct |

**Observation:** `artoon-typer` uses its own `Block[]` type system instead of canonical AST nodes. This is the key friction point for `artoon-state` unification.

---

## 9. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Type Safety | 9/10 | Comprehensive, readonly, well-guarded |
| API Design | 7/10 | Good core, builder needs expansion |
| Test Coverage | 7/10 | Solid but missing edge cases |
| Documentation | 8/10 | README is clear, inline comments good |
| Migration Path | 9/10 | Excellent v1→v2 compat handling |
| Performance | 8/10 | Immutable, no unnecessary cloning |
| Maintainability | 7/10 | Transform complexity due to dual-format support |
| **Overall** | **7.9/10** | Strong foundation with minor fixes needed |

---

## 10. Action Items for Roadmap

### Phase 2 (Complete Existing Systems)
- [ ] Fix `getStats` nested list counting bug
- [ ] Fix `VERSION` constant mismatch
- [ ] Move `@artoon/parser` to `devDependencies`
- [ ] Add tests covering `getStats` with nested lists

### Phase 3 (State Unification)
- [ ] Ensure `artoon-state` document model aligns with AST types
- [ ] Verify `artoon-typer` Block[] → AST conversion is lossless

### Phase 4 (Cleanup)
- [ ] Remove `compat.ts` when v1 support ends (v3.0)
- [ ] Simplify `transform/` after v1 format removal

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
