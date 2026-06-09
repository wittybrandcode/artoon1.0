# @artoon/editor-state

> منطق التحرير المنفصل عن واجهة المستخدم
> Editing Logic Decoupled from UI

---

## 🎯 Overview

`@artoon/editor-state` provides a framework-agnostic state management system for ARTOON editors. It handles document state, selection, history (undo/redo), and editing commands without any UI dependencies.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     @artoon/editor-state                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   EditorState                                                           │
│   ├─ Document (AST wrapper)                                            │
│   ├─ Selection (cursor & range)                                        │
│   ├─ History (undo/redo)                                               │
│   └─ Plugins (extensibility)                                           │
│                                                                         │
│   Transaction                                                           │
│   ├─ Steps (atomic changes)                                            │
│   └─ apply() → new EditorState                                         │
│                                                                         │
│   Commands                                                              │
│   ├─ Text (insert, delete)                                             │
│   ├─ Format (bold, italic)                                             │
│   ├─ Block (heading, quote)                                            │
│   └─ List (bullet, ordered)                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

```bash
npm install @artoon/editor-state
```

---

## 🚀 Quick Start

```typescript
import { EditorState, commands } from '@artoon/editor-state';
import { parse, transform } from '@artoon/ast';

// 1. Create initial state
const doc = transform(parse('>.p:: مرحباً بالعالم'));
const state = EditorState.create({ doc });

// 2. Apply changes via transaction
const tr = state.tr.insertText(' الجميل');
const newState = state.apply(tr);

// 3. Use commands
commands.toggleStrong(newState, dispatch);

// 4. Undo
commands.undo(newState, dispatch);
```

---

## 🔗 Integration

### With React

```typescript
function Editor() {
  const [state, setState] = useState(() => 
    EditorState.create({ doc: initialDoc })
  );
  
  const dispatch = (tr) => setState(state.apply(tr));
  
  return <EditorView state={state} dispatch={dispatch} />;
}
```

### With Vue

```typescript
const { state, dispatch } = useEditorState(initialDoc);
```

### With VS Code Extension

```typescript
const state = EditorState.fromJSON(savedState);
```

---

## 📊 Key Concepts

### Immutability

State never mutates. Every change creates a new state:

```typescript
const newState = state.apply(transaction);
console.log(state === newState); // false
```

### Transactions

All changes go through transactions:

```typescript
const tr = state.tr
  .insertText('Hello')
  .addMark(0, 5, strongMark)
  .setSelection(Selection.at(5));

const newState = state.apply(tr);
```

### Commands

Commands are functions that check and execute actions:

```typescript
// Check if command can run
if (toggleStrong(state)) {
  // Enable bold button
}

// Execute command
toggleStrong(state, dispatch);
```

---

## 📁 Documentation

See `PLAN/` folder for detailed documentation:

- `00-OVERVIEW.md` - System overview
- `01-ARCHITECTURE.md` - Architecture details
- `02-STATE-MODEL.md` - EditorState design
- `03-TRANSACTION-MODEL.md` - Transaction system
- `04-SELECTION-MODEL.md` - Selection handling
- `05-COMMANDS.md` - Available commands
- `06-HISTORY.md` - Undo/Redo system
- `07-PLUGINS.md` - Plugin architecture
- `08-INTEGRATION.md` - Integration guides
- `09-IMPLEMENTATION-PHASES.md` - Development plan
- `10-TRACKING.md` - Progress tracking

---

## 📊 Status

**Current Phase:** Planning Complete

**Progress:** 0% (Ready to implement)

---

## 📜 License

MIT

---

**Part of ARTOON 2.0 System**
