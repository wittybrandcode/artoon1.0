# System Analysis Report: `@artoon/state` (formerly `@artoon/editor-state`)

> Framework-agnostic editor state management — ProseMirror-inspired immutable state engine.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/state` (renamed from `@artoon/editor-state`) |
| **Version** | `2.0.0` (exports `VERSION = '1.0.0'`) |
| **Role** | Unified state kernel for ALL ARTOON systems |
| **Status** | ✅ Mature architecture, limited test coverage |
| **Lines of Code** | ~3,500 (src/) |
| **Architecture** | ProseMirror-inspired (immutable, transactional) |

**Verdict:** The **most architecturally sophisticated system** in the monorepo. A full ProseMirror-like implementation with transactions, position mapping, history, plugins, and commands. This is the correct foundation for the unified state kernel.

---

## 2. Architecture Overview

```
src/
├── index.ts           # Comprehensive exports (~190 lines)
├── types.ts           # Core type definitions (~516 lines)
├── state/
│   ├── EditorState.ts # Main immutable state (~260 lines)
│   ├── Document.ts    # Document model with positions (~240 lines)
│   ├── Fragment.ts    # Node collection with helpers (~280 lines)
│   ├── ResolvedPos.ts # Position resolution (~240 lines)
│   └── Slice.ts       # Document slice (~60 lines)
├── transaction/
│   ├── Transaction.ts # Transaction builder (~350 lines)
│   ├── Step.ts        # Step types (Replace, AddMark, RemoveMark, SetAttrs)
│   └── Mapping.ts     # Position mapping through changes
├── selection/
│   ├── Selection.ts   # Text/Node/All selection implementations
│   └── helpers.ts     # Selection utilities
├── commands/
│   ├── text.ts        # Text commands (insert, delete, selectAll)
│   ├── format.ts      # Format commands (toggle marks)
│   └── types.ts       # Command utilities
├── history/
│   ├── History.ts     # Undo/redo manager
│   └── commands.ts    # undo, redo, historyKeymap
└── plugins/
    ├── Plugin.ts      # Plugin system
    └── builtin/
        ├── history.ts # History plugin
        └── keymap.ts  # Keymap plugin
```

### Core Design: Immutable State + Transactions

```
EditorState (immutable)
    ↓
  .tr (create transaction)
    ↓
Transaction (accumulates steps)
    ↓
  .insertText("hello")
  .toggleMark("strong")
    ↓
state.apply(tr) → new EditorState
    ↓
HistoryManager stores inverse steps for undo
```

---

## 3. Type System (`types.ts`) ⭐⭐⭐⭐⭐

### Position & Mapping

```typescript
interface ResolvedPos {
  pos: Position;        // Absolute position
  depth: number;        // Tree depth
  path: ContentNode[];  // Parent chain
  index: number[];      // Index at each depth
  nodeAfter: ContentNode | null;
  nodeBefore: ContentNode | null;
  textOffset: number;
  node(depth?: number): ContentNode | null;
  start(depth?: number): Position;
  end(depth?: number): Position;
}
```

**Full ProseMirror-style position resolution.** Enables precise cursor placement and content manipulation.

### Selection System

| Selection Type | Use Case |
|---------------|----------|
| `TextSelection` | Cursor or text range |
| `NodeSelection` | Entire node selected |
| `AllSelection` | Whole document |

### Transaction Interface

```typescript
interface Transaction {
  readonly steps: Step[];
  readonly docs: Document[];      // Document after each step
  readonly mapping: Mapping;      // Combined position mapping
  readonly doc: Document;         // Current document
  readonly selection: Selection;
  readonly meta: Map<string, unknown>;
  readonly time: number;

  // Fluent API
  insertText(text: string, from?, to?): Transaction;
  delete(from: Position, to: Position): Transaction;
  addMark(from, to, mark: Modifier): Transaction;
  removeMark(from, to, mark: Modifier): Transaction;
  toggleMark(mark: Modifier): Transaction;
  setSelection(selection: Selection): Transaction;
  setMeta(key: string, value: unknown): Transaction;
  scrollIntoView(): Transaction;
}
```

### Step System

| Step Type | Purpose |
|-----------|---------|
| `ReplaceStep` | Replace content in range |
| `AddMarkStep` | Add formatting mark |
| `RemoveMarkStep` | Remove formatting mark |
| `SetAttrsStep` | Set node attributes |

Each step supports: `apply()`, `invert()`, `map()`, `merge()`, `toJSON()`.

---

## 4. EditorState (`state/EditorState.ts`) ⭐⭐⭐⭐⭐

### Key Features

**Immutable creation:**
```typescript
const state = EditorStateImpl.create({
  doc: artoonDocument,
  selection: textSelection,
  plugins: [historyPlugin, keymapPlugin]
});
```

**Plugin system:**
```typescript
// Filter transactions
filterTransaction?(tr: Transaction, state: EditorState): boolean;

// Append transactions after user actions
appendTransaction?(transactions, oldState, newState): Transaction | null;

// State management
state: {
  init(config, state): T;
  apply(tr, value, oldState, newState): T;
}
```

**History integration:**
```typescript
get history(): HistoryState {
  return this._history.getState();
}
```

### Plugin Architecture

The plugin system is **identical to ProseMirror's**:
- `filterTransaction` — reject invalid transactions
- `appendTransaction` — auto-correct or extend transactions
- `state.init` / `state.apply` — per-plugin persistent state
- `PluginKey` — typed access to plugin state

---

## 5. Commands

### Text Commands

| Command | Keybinding | Action |
|---------|-----------|--------|
| `insertText` | — | Insert text at cursor |
| `deleteBackward` | Backspace | Delete before cursor |
| `deleteForward` | Delete | Delete after cursor |
| `selectAll` | Ctrl+A | Select entire document |
| `insertParagraph` | Enter | Split paragraph |
| `joinBackward` | Backspace (at start) | Join with previous block |

### Format Commands

| Command | Action |
|---------|--------|
| `toggleStrong` | Toggle bold |
| `toggleEmphasis` | Toggle italic |
| `toggleUnderline` | Toggle underline |
| `toggleStrikethrough` | Toggle strikethrough |
| `toggleHighlight` | Toggle highlight |
| `toggleSubscript` | Toggle subscript |
| `toggleSuperscript` | Toggle superscript |
| `toggleInlineCode` | Toggle inline code |

### Command Pattern

```typescript
type Command = (state: EditorState, dispatch?: Dispatch) => boolean;
```

- Returns `true` if command can execute
- If `dispatch` provided, executes the command
- If `dispatch` omitted, acts as a predicate (can-check)

---

## 6. History System

```typescript
interface HistoryItem {
  steps: Step[];           // Applied steps
  inverseSteps: Step[];    // Steps to undo
  selection: Selection;    // Selection before change
  timestamp: number;
}

interface HistoryState {
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
  canUndo: boolean;
  canRedo: boolean;
  undoDepth: number;
  redoDepth: number;
}
```

**Inverse step generation:** Each step knows how to create its inverse (`step.invert(doc)`), enabling proper undo.

---

## 7. Test Coverage Assessment

| Test File | Tests | Focus |
|-----------|-------|-------|
| `types.test.ts` | ~10 | Type definition validation |
| `state/*.test.ts` | ~8 | EditorState, Document |

**Total: ~18 tests**

**Critical Gap:** Only ~18 tests for a 3,500-line ProseMirror-like engine. This is severely under-tested for the complexity level.

**Missing test coverage:**
- Transaction operations
- Step application/inversion
- Position mapping
- Selection helpers
- Command execution
- Plugin system
- History undo/redo
- Keyboard keymap

---

## 8. Issues & Recommendations

### 🔴 Critical

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **Severely under-tested (~18 tests)** | `tests/` | High regression risk for core kernel | Add comprehensive test suite |

### 🟡 Important

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 2 | **`VERSION = '1.0.0'`** | `index.ts:191` | Version mismatch | Update to `'2.0.0'` |
| 3 | **Package name doesn't reflect role** | `package.json` | `editor-state` implies editor-only | Rename to `artoon-state` |
| 4 | **Peer deps not wired** | `package.json:42-51` | `@artoon/validator` and `@artoon/serializer` listed as optional peers but never used | Remove or wire up |
| 5 | **Default document uses `version: '1.0'`** | `EditorState.ts:60` | Outdated version | Update to `'2.0.0'` |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 6 | Add collaborative editing support (OT/CRDT) | Multi-user editing |
| 7 | Add change tracking / review mode | Track changes like Word |
| 8 | Add schema validation for document structure | Structural guarantees |

---

## 9. Integration Points

### Consumers (Planned)

| Package | Integration |
|---------|-------------|
| `artoon-typer` | Phase 3: Replace mutable Block[] with EditorState |
| `artoon-cli` | State manipulation for format/convert commands |
| `artoon-validator` | Plugin for real-time validation |
| `artoon-serializer` | `EditorState.toARTOON()` method |

### Dependencies

```
artoon-editor-state
├── @artoon/ast (runtime)
├── @artoon/validator (peer, optional)
└── @artoon/serializer (peer, optional)
```

---

## 10. Why This Should Be the State Kernel

| Feature | `artoon-editor-state` | `artoon-typer` (current) |
|---------|----------------------|--------------------------|
| Immutability | ✅ Full | ❌ Mutable Block[] |
| Transactions | ✅ With inverse steps | ❌ Direct mutations |
| Position mapping | ✅ Through changes | ❌ None |
| History | ✅ With inverse steps | ❌ Deep clone snapshots |
| Plugins | ✅ Full system | ❌ None |
| Selection model | ✅ Rich (Text/Node/All) | ❌ Simple string IDs |
| Commands | ✅ 20+ commands | ❌ Ad-hoc methods |
| Memory efficiency | ✅ Shared structure | ❌ Full deep clones |
| Framework agnostic | ✅ Pure TypeScript | ❌ React-bound |

---

## 11. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 10/10 | ProseMirror-grade design |
| Type System | 9/10 | Comprehensive, well-typed |
| Feature Completeness | 9/10 | Steps, transactions, history, plugins |
| Test Coverage | 3/10 | ~18 tests for 3,500 lines |
| Documentation | 5/10 | Inline comments good, README minimal |
| Performance | 8/10 | Immutable with shared structure |
| **Overall** | **7.3/10** | Excellent architecture, **test crisis** |

---

## 12. Action Items for Roadmap

### Phase 1 (Rename)
- [ ] Rename package from `artoon-editor-state` → `artoon-state`
- [ ] Update all references in dependent packages

### Phase 2 (Complete Existing Systems) — HIGH PRIORITY
- [ ] **Add comprehensive test suite** (target: 100+ tests)
- [ ] Fix `VERSION` constant
- [ ] Remove or wire up peer dependencies
- [ ] Update default document version

### Phase 3 (State Unification)
- [ ] Integrate into `artoon-typer` as canonical state manager
- [ ] Add validation plugin
- [ ] Add serialization helpers

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
