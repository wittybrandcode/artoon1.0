# System Analysis Report: `@artoon/typer`

> Block-based rich text editor for ARTOON — React + Vite visual editor.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/typer` |
| **Version** | `2.0.0` (exports `VERSION = '1.0.0'`) |
| **Role** | Visual editor for ARTOON format |
| **Status** | ✅ Feature-rich, but uses mutable state (to be unified with `artoon-state`) |
| **Module Type** | ES Module (`"type": "module"`) |
| **Lines of Code** | ~8,000+ (src/) |
| **UI Framework** | React 18 + Vite |

**Verdict:** A **feature-rich, professional visual editor** with an impressive UI layer (drag-drop, inline toolbar, add menu, themes). However, the **state management layer is custom mutable `Block[]`** and should be replaced with `artoon-state` in Phase 3.

---

## 2. Architecture Overview

```
src/
├── index.ts           # Main exports (~270 lines)
├── types.ts           # Core types (~650 lines)
├── main.tsx           # React entry point
├── App.tsx            # Main App component (~470 lines)
│
├── core/              # State management (Phase 1 ✅)
│   ├── EditorController.ts    # Main controller (~475 lines)
│   ├── BlockRegistry.ts       # Block type registry
│   ├── CommandManager.ts      # Command system
│   ├── KeyboardManager.ts     # Keyboard shortcuts
│   ├── DragDropManager.ts     # Drag & drop
│   └── utils.ts               # Utilities (generateId, deepClone)
│
├── blocks/            # Block system (Phase 2 & 3)
│   ├── definitions.ts         # Block definitions
│   └── views/                 # Block view components
│       ├── BaseBlockView.ts
│       ├── TextBlockView.ts
│       ├── ListBlockView.ts
│       ├── CodeBlockView.ts
│       ├── MediaBlockView.ts
│       ├── DividerBlockView.ts
│       └── TableBlockView.ts
│
├── inline/            # Inline content (Phase 2 ✅)
│   ├── InlineParser.ts        # HTML → InlineContent[]
│   ├── InlineRenderer.ts      # InlineContent[] → HTML
│   └── MarkManager.ts         # Mark (modifier) management
│
├── integration/       # External system integration
│   ├── StateAdapter.ts        # Bridge to AST (Phase 3 prep)
│   ├── ARTOONImporter.ts      # Parse ARTOON → Block[]
│   └── ARTOONExporter.ts      # Block[] → ARTOON text
│
├── ui/                # UI components (Phase 4 ✅)
│   ├── components/
│   │   ├── EditorContainer.tsx
│   │   ├── BlockWrapper.tsx
│   │   ├── BlockRenderer.tsx
│   │   ├── AddMenu.tsx
│   │   ├── InlineToolbar.tsx
│   │   └── ContextMenu.tsx
│   └── hooks/
│       ├── useEditor.ts
│       ├── useKeyboard.ts
│       └── useDragDrop.ts
│
├── design-system/     # Design tokens
└── themes/            # Theme system (light/dark)
```

---

## 3. State Management: EditorController (`core/EditorController.ts`)

### Current Design: Mutable Block[]

```typescript
class EditorController {
  private blocks: Block[] = [];           // Mutable array
  private focusedBlockId: string | null;
  private selection: SelectionState | null;
  private stateAdapter: StateAdapter;     // Bridge to AST

  // Operations use direct splice
  addBlock(block, index) {
    this.blocks.splice(index, 0, block);
    this.saveState();
  }

  deleteBlock(id) {
    const index = this.getBlockIndex(id);
    this.blocks.splice(index, 1);
    this.saveState();
  }

  // History: deep clone snapshots
  saveState() {
    this.stateAdapter.saveSnapshot(deepClone(this.blocks));
  }
}
```

### Block Types

```typescript
type BlockType =
  | 'paragraph' | 'heading1' | 'heading2' | 'heading3'
  | 'heading4' | 'heading5' | 'heading6' | 'quote'
  | 'preformatted' | 'list' | 'bullet-list' | 'numbered-list'
  | 'definition-list' | 'code' | 'table' | 'image' | 'video'
  | 'audio' | 'figure' | 'file' | 'divider' | 'line-break'
  | 'details' | 'time-block' | 'abbr-block' | 'meta'
  | 'link-block' | 'custom' | 'word-break';
```

**26 block types** — comprehensive coverage of ARTOON syntax.

### Comparison with `artoon-state`

| Aspect | `artoon-typer` (current) | `artoon-state` (target) |
|--------|-------------------------|------------------------|
| State model | Mutable `Block[]` | Immutable `EditorState` |
| History | Deep clone snapshots | Inverse step tracking |
| Memory | O(n) per snapshot | O(log n) shared structure |
| Transactions | None | Full transaction system |
| Plugins | None | Full plugin system |
| Position | Block ID + offset | ResolvedPos with depth |
| Selection | String block ID | Rich selection model |
| Undo/Redo | Stack of clones | Proper inverse steps |

---

## 4. Integration Layer (`integration/`)

### StateAdapter.ts

**The bridge between Block[] and AST.** Contains explicit comment:

```typescript
// Full integration with @artoon/state will be added in Phase 3
```

**Key methods:**
- `fromBlocks(blocks: Block[])` — convert to internal representation
- `toBlocks()` — convert back to Block[]
- `blocksToAST()` — convert Block[] to ARTOON AST
- `astToBlocks(ast)` — convert AST to Block[]
- `saveSnapshot(blocks)` — push to history
- `undo()` / `redo()` — history navigation

### ARTOONImporter / ARTOONExporter

**Bidirectional conversion** between ARTOON text and Block[].

```
ARTOON Text → parse() → AST → transform() → Block[]
Block[] → export() → ARTOON Text
```

---

## 5. UI Components

### EditorContainer

Main wrapper with:
- Toolbar
- Block list rendering
- Keyboard event handling
- Theme provider

### BlockWrapper

Individual block wrapper with:
- Drag handle (DnD Kit)
- Focus state
- Block type indicator
- Action buttons

### InlineToolbar

Floating toolbar for:
- Bold, italic, underline, strikethrough
- Highlight, subscript, superscript
- Inline code
- Link insertion

### AddMenu

Slash-command style menu for inserting blocks.

### Drag & Drop

Uses **DnD Kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) for:
- Block reordering
- Visual drag feedback
- Drop position indicators

---

## 6. Inline System

### InlineParser

Converts HTML content (from `contentEditable`) to `InlineContent[]`.

### InlineRenderer

Converts `InlineContent[]` back to HTML for display.

### MarkManager

Manages active marks (modifiers) at cursor position.

---

## 7. Test Coverage Assessment

| Directory | Files | Assessment |
|-----------|-------|------------|
| `tests/blocks/` | ~19 files | Block component tests |
| `tests/core/` | ~9 files | Controller, registry, commands |
| `tests/inline/` | ~4 files | Inline parser/renderer |
| `tests/ui/` | ~9 files | UI component tests |
| `tests/e2e/` | ~6 files | End-to-end tests |
| `tests/integration/` | ~5 files | Integration tests |

**Total: ~52 test files** — good coverage for a UI-heavy package.

**Note:** Uses **Vitest** (not Jest) for testing.

---

## 8. Dependencies Analysis

### Runtime Dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `@radix-ui/*` (7 packages) | Accessible UI primitives |
| `@dnd-kit/*` (4 packages) | Drag & drop |
| `lucide-react` | Icons |
| `clsx` | Class name utilities |

**Notable absence:** No dependency on `@artoon/state` — confirming they are not integrated.

---

## 9. Issues & Recommendations

### 🔴 Critical

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **Uses mutable Block[]** | `core/EditorController.ts` | No transaction safety, memory inefficient | Migrate to `artoon-state` |
| 2 | **History uses deep clones** | `core/EditorController.ts` | O(n) memory per undo step | Use inverse steps |
| 3 | **No plugin system** | — | Can't extend behavior | Adopt `artoon-state` plugins |

### 🟡 Important

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 4 | **`VERSION = '1.0.0'`** | `index.ts:269` | Version mismatch | Update to `'2.0.0'` |
| 5 | **Placeholder in Arabic** | `EditorController.ts:39` | Inconsistent with English-first policy | Translate |
| 6 | **ES Module only** | `package.json:5` | May break CJS consumers | Add dual build |
| 7 | **No dependency on `@artoon/state`** | `package.json` | Confirms non-integration | Add in Phase 3 |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 8 | Add collaborative cursors | Multi-user editing |
| 9 | Add AI autocomplete | Smart suggestions |
| 10 | Add export to PDF/Word | Wider format support |

---

## 10. Integration Points

### Dependencies

```
artoon-typer
├── react, react-dom (runtime)
├── @radix-ui/* (runtime)
├── @dnd-kit/* (runtime)
├── lucide-react (runtime)
└── (no @artoon/state — confirmed not integrated)
```

### Future Integration (Phase 3)

```
artoon-typer
├── @artoon/state (runtime) ← NEW
├── @artoon/ast (runtime) ← via state
├── @artoon/parser (runtime) ← for import
└── @artoon/serializer (runtime) ← for export
```

---

## 11. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| UI Design | 9/10 | Professional, accessible, RTL-aware |
| Feature Richness | 9/10 | 26 block types, drag-drop, inline toolbar |
| State Management | 4/10 | Mutable, no transactions, clone-based history |
| Test Coverage | 7/10 | ~52 test files, Vitest |
| Code Organization | 8/10 | Clear separation of concerns |
| Documentation | 5/10 | Minimal README |
| **Overall** | **7.0/10** | Excellent UI, **needs state unification** |

---

## 12. Action Items for Roadmap

### Phase 2 (Complete Existing Systems)
- [ ] Fix `VERSION` constant
- [ ] Translate Arabic placeholder text
- [ ] Add dual CJS/ESM build

### Phase 3 (State Unification) — HIGH PRIORITY
- [ ] **Replace mutable Block[] with `artoon-state` EditorState**
- [ ] Wire `EditorController` to dispatch transactions
- [ ] Convert UI components to use `state.apply(tr)` pattern
- [ ] Migrate history from clones to inverse steps
- [ ] Add `artoon-state` as runtime dependency

### Phase 4 (Cleanup)
- [ ] Remove `StateAdapter` (no longer needed)
- [ ] Add collaborative editing support

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
