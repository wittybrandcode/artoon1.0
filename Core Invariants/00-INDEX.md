# ARTOON Core Invariants — Master Index v2.0

```yaml
DOCUMENT: Core Invariants Index
VERSION: 2.0.0
LAST_UPDATED: 2026-01-12
AI_PRIORITY: MAXIMUM
PURPOSE: Language specification for ARTOON format
```

<!-- 
AI_INSTRUCTION: This is the MASTER INDEX for ARTOON language specification.
Core Invariants define WHAT ARTOON IS — the syntax, semantics, and constraints.
For SYSTEM architecture (parser, ast, etc.), see SYSTEM-INVENTORY.md
-->

---

## 🎯 DOCUMENT PURPOSE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CORE INVARIANTS = LANGUAGE SPEC                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Core Invariants define:                                               │
│   ├─ ARTOON syntax (how to write)                                      │
│   ├─ ARTOON semantics (what it means)                                  │
│   ├─ ARTOON constraints (what's forbidden)                             │
│   └─ ARTOON components (33 fixed + ∞ custom)                           │
│                                                                         │
│   Core Invariants do NOT define:                                        │
│   ├─ How to parse (see @artoon/parser)                                 │
│   ├─ How to validate (see @artoon/validator)                           │
│   ├─ How to render (see @artoon/renderer-html)                         │
│   └─ How to serialize (see @artoon/serializer)                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 FILE STRUCTURE

```
Core Invariants/
├── 00-INDEX.md                    # This file (Master Index)
├── 00-PHILOSOPHY.md               # Core philosophy (6 principles)
├── 01-SYNTAX-STRUCTURE.md         # Syntax rules
├── 02-COMPONENTS.md               # Component definitions (33)
├── 03-LISTS.md                    # List system (ul, ol, dl)
├── 04-INLINE-SEMANTICS.md         # Inline modifiers (7) + components (8)
├── 05-TABLES.md                   # Table system
├── 06-COMPOUND-COMPONENTS.md      # Figure, details
├── 07-BLOCKS.md                   # Block system
├── 08-RESERVED-BLOCKS.md          # Only 'code' is reserved
├── 09-CONSTRAINTS-AND-ANTI-PATTERNS.md  # What NOT to do
├── 10-INLINE-INTEGRATION.md       # Inline content rules
├── 11-INLINE-COMPONENT-ATTRIBUTES.md    # Attribute syntax
├── 12-CUSTOMIZABLE-ELEMENTS.md    # Custom blocks and fields
├── AI-CONTEXT.md                  # Quick AI reference
├── FINAL-REVIEW-REPORT.md         # Review status
└── inventory/                     # Editor inventory (UI elements)
    ├── 00-INDEX.md
    ├── 01-SECTIONS.md
    ├── 02-COMPONENTS.md
    ├── 03-INLINE-MARKS.md
    ├── 04-MENUS.md
    ├── 05-TOOLBAR-ICONS.md
    ├── 06-BLOCK-HANDLE.md
    ├── 07-KEYBOARD-SHORTCUTS.md
    └── 08-CSS-VARIABLES.md
```

---

## 📋 SPECIFICATION FILES

| # | File | Content | AI-Priority |
|---|------|---------|-------------|
| 00 | PHILOSOPHY.md | 6 core principles | CRITICAL |
| 01 | SYNTAX-STRUCTURE.md | Syntax rules | CRITICAL |
| 02 | COMPONENTS.md | 33 fixed components | CRITICAL |
| 03 | LISTS.md | ul, ol, dl system | HIGH |
| 04 | INLINE-SEMANTICS.md | 7 modifiers + 8 inline types | CRITICAL |
| 05 | TABLES.md | Table syntax | HIGH |
| 06 | COMPOUND-COMPONENTS.md | figure, details | HIGH |
| 07 | BLOCKS.md | Block system | CRITICAL |
| 08 | RESERVED-BLOCKS.md | Only 'code' reserved | CRITICAL |
| 09 | CONSTRAINTS.md | Anti-patterns | HIGH |
| 10 | INLINE-INTEGRATION.md | Inline rules | MEDIUM |
| 11 | INLINE-ATTRIBUTES.md | Attribute syntax | MEDIUM |
| 12 | CUSTOMIZABLE.md | Custom blocks/fields | HIGH |
| -- | AI-CONTEXT.md | Quick AI reference | CRITICAL |

---

## 🔑 THE 6 CORE PRINCIPLES

```yaml
P1_LINE_IS_UNIT:
  rule: "Every line = one semantic unit"
  exception: "Code blocks span multiple lines"

P2_MEANING_BEFORE_FORM:
  rule: "No visual/behavioral information"
  forbidden: "colors, dimensions, fonts, interaction"

P3_CONTEXT_OVER_CLOSURE:
  rule: "Context opens implicitly, closes on new context"
  exception: "Blocks have explicit closure"

P4_LINK_AS_ELEMENT:
  rule: "Non-text content = typed link"
  examples: "img, video, audio, file"

P5_DIRECTION_AWARE:
  rule: "Direction is structural, not metadata"
  markers: "> = RTL, < = LTR"
  no_default: "Every line must declare direction"

P6_STORAGE_PURITY:
  rule: "Don't store what can be derived"
  no_redundancy: "Only source truth"
```

---

## 📊 COMPONENT SUMMARY

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARTOON COMPONENT INVENTORY                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FIXED COMPONENTS (33):                                                 │
│  ├─ Text:        11  (p, t1-t6, q, pre, time, abbr)                    │
│  ├─ Media:        5  (a, img, video, audio, file)                      │
│  ├─ Separators:   3  (br, hr, wbr)                                     │
│  ├─ Lists:        6  (ul, ol, dl, li, dt, dd)                          │
│  ├─ Tables:       3  (table, th, tr)                                   │
│  ├─ Compound:     2  (figure, details)                                 │
│  ├─ Code:         2  (c inline, code block)                            │
│  └─ Comment:      1  (:::)                                             │
│                                                                         │
│  INLINE MODIFIERS (7):                                                  │
│  ├─ s (strong), e (emphasis), u (underline)                            │
│  ├─ d (delete), mark, sub, sup                                         │
│                                                                         │
│  INLINE COMPONENTS (8):                                                 │
│  ├─ a, img, c, abbr, time, audio, video, file                          │
│                                                                         │
│  RESERVED BLOCKS (1):                                                   │
│  └─ code (content not parsed as ARTOON)                                │
│                                                                         │
│  CUSTOM (∞):                                                            │
│  ├─ Blocks: meta, profile, header, article, ...                        │
│  └─ Fields: title, author, date, id, ...                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 SYNTAX QUICK REFERENCE

### Basic Syntax

```
>.type:: content          # RTL component
<.type:: content          # LTR component
>.-type:: content         # Child component
>.-:field: value          # Hidden field
>.:::  comment            # Comment
```

### Block Syntax

```
<blockname>.              # Open block
...content...
.<blockname>              # Close block
```

### Code Block (RESERVED)

```
<code:language>.
...code content (not parsed)...
.<code>
```

### Inline Syntax

```
**bold**                  # Strong
*italic*                  # Emphasis
`code`                    # Inline code
[text](url)               # Link
![alt](url)               # Image
```

---

## 🚫 WHAT'S FORBIDDEN

```yaml
VISUAL:
  - colors, backgrounds
  - dimensions (width, height)
  - fonts (family, size, weight)
  - spacing (margin, padding)

BEHAVIORAL:
  - interaction (onclick, hover)
  - animation
  - autoplay, loop

LAYOUT:
  - grid, flex
  - columns
  - positioning

COMPATIBILITY:
  - fallbacks
  - polyfills
```

---

## 🔗 RELATIONSHIP TO SYSTEMS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CORE INVARIANTS vs SYSTEMS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Core Invariants (this folder):                                        │
│   └─ WHAT ARTOON IS (language specification)                           │
│                                                                         │
│   Systems (see SYSTEM-INVENTORY.md):                                    │
│   ├─ @artoon/parser — HOW to parse                                     │
│   ├─ @artoon/ast — HOW to represent                                    │
│   ├─ @artoon/validator — HOW to validate                               │
│   ├─ @artoon/renderer-html — HOW to render                             │
│   ├─ @artoon/serializer — HOW to serialize                             │
│   └─ @artoon/cli — HOW to use from terminal                            │
│                                                                         │
│   Core Invariants are STABLE (frozen v1)                                │
│   Systems can EVOLVE (implementation details)                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 STATISTICS

```yaml
SPECIFICATION_FILES: 13
EDITOR_INVENTORY_FILES: 9
FIXED_COMPONENTS: 33
INLINE_MODIFIERS: 7
INLINE_COMPONENTS: 8
RESERVED_BLOCKS: 1
CUSTOM_BLOCKS: ∞
CUSTOM_FIELDS: ∞
```

---

## 💡 FOR AI AGENTS

```
READ ORDER:
1. AI-CONTEXT.md (quick reference)
2. 00-PHILOSOPHY.md (core principles)
3. 08-RESERVED-BLOCKS.md (critical: only 'code' is reserved)
4. Other files as needed

KEY FACTS:
- Direction is STRUCTURAL (> RTL, < LTR)
- No default direction
- Only 'code' block is reserved
- 'meta' is NOT reserved (it's a convention)
- 33 fixed components + infinite custom
```

---

**LAST_UPDATED:** 2026-01-12
**VERSION:** Core Invariants v2.0
**STATUS:** Production Ready
