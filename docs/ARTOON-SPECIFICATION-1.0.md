# ARTOON Specification 1.0

> The ARTOON Article Format — A semantic, direction-aware markup language for structured content archival and AI consumption.

---

```yaml
Spec: ARTOON
Version: 1.0.0
Status: Draft
Date: 2026-04-27
Language: en-us
```

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Principles](#2-design-principles)
3. [Formal Grammar](#3-formal-grammar)
4. [Direction System](#4-direction-system)
5. [Components](#5-components)
6. [Blocks](#6-blocks)
7. [Lists](#7-lists)
8. [Tables](#8-tables)
9. [Compound Components](#9-compound-components)
10. [Inline Content](#10-inline-content)
11. [Comments](#11-comments)
12. [META Block](#12-meta-block)
13. [Constraints](#13-constraints)
14. [Compliance](#14-compliance)
15. [Appendix A: MIME Type](#appendix-a-mime-type)
16. [Appendix B: File Extension](#appendix-b-file-extension)

---

## 1. Introduction

ARTOON is a line-based semantic markup format designed for:

- **Human authoring** — simple syntax, RTL-first design
- **Machine parsing** — unambiguous grammar, no regex complexity
- **AI consumption** — explicit structure, no presentation leakage
- **Long-term archival** — pure text, versioned specification
- **Multi-format rendering** — HTML, PDF, JSON, and others

### 1.1 Comparison with Existing Formats

| Feature | Markdown | HTML | reST | ARTOON |
|---------|----------|------|------|--------|
| RTL native | No | Partial | No | **Yes** |
| Semantic purity | Weak | No | Medium | **Strong** |
| Ambiguity | High | Low | Low | **None** |
| AI-readable | Medium | Low | Medium | **High** |
| Line-based | No | No | No | **Yes** |
| Presentation-free | No | No | Yes | **Yes** |

### 1.2 Document Example

```artoon
<meta>.
>.-:title: ARTOON Format Introduction
>.-:author: Ahmad Muhammad
>.-:date: 2026-04-27
>.-:lang: ar
.<meta>

>.t1:: مقدمة في صيغة ARTOON

>.p:: ARTOON هي صيغة markup دلالية تدعم [s:: العربية] والإنجليزية.

<callout>.
>.p:: This is a reusable component called "callout".
<.p:: It can contain any ARTOON content.
.<callout>

>.ul::
li:: عنصر أول
li:: عنصر ثاني
--li:: عنصر متداخل
li:: عنصر ثالث

>.table::
th:: الاسم; البلد; المهنة
tr:: أحمد; مصر; مبرمج
tr:: سارة; الأردن; مصممة
```

---

## 2. Design Principles

### P1: Line Is Unit
Every line represents exactly one semantic unit. Empty lines separate units. Multi-line content exists only inside code blocks.

### P2: Meaning Before Form
ARTOON describes **what** content is, never **how** it looks. No colors, fonts, dimensions, margins, or positioning information is permitted.

### P3: Direction Is Structural
Text direction (`>` for RTL, `<` for LTR) is a structural declaration, not metadata or styling. Every line must declare its direction.

### P4: Safe Separator
The `::` sequence is the universal content separator. It is chosen because:
- It cannot appear naturally in prose
- It allows free use of `:`, `;`, `[`, `]` inside content
- It makes parsing deterministic without regex ambiguity

### P5: No Presentation Leakage
Presentation is the renderer's responsibility. ARTOON content is pure semantics.

### P6: Extensible By Convention
Custom blocks and fields are first-class citizens through naming conventions, not special syntax.

---

## 3. Formal Grammar

### 3.1 EBNF Grammar

```ebnf
document        ::= { line } EOF

line            ::= empty-line
                  | comment-line
                  | block-start-line
                  | block-end-line
                  | list-item-line
                  | table-row-line
                  | direction-line

empty-line      ::= WS* NEWLINE

comment-line    ::= DIRECTION ".:::" CONTENT NEWLINE

block-start-line::= "<" IDENTIFIER ":" IDENTIFIER ">." NEWLINE
                  | "<" IDENTIFIER ">." NEWLINE

block-end-line  ::= ".<" IDENTIFIER ">" NEWLINE

list-item-line  ::= DASHES list-type "::" CONTENT NEWLINE
                  | list-type "::" CONTENT NEWLINE

table-row-line  ::= "th" "::" CONTENT NEWLINE
                  | "tr" "::" CONTENT NEWLINE

direction-line  ::= DIRECTION "." DASHES? COMPONENT ("::" CONTENT)? NEWLINE

DIRECTION       ::= ">" | "<"
DASHES          ::= "-" { "-" }
COMPONENT       ::= text-component | media-component | separator-component
                  | list-component | table-component | compound-component
                  | "c"

text-component  ::= "p" | "t1" | "t2" | "t3" | "t4" | "t5" | "t6"
                  | "q" | "pre" | "time" | "abbr"

media-component ::= "a" | "img" | "video" | "audio" | "file"

separator-component ::= "br" | "hr" | "wbr"

list-component  ::= "ul" | "ol" | "dl" | "li" | "dt" | "dd"

table-component ::= "table" | "th" | "tr"

compound-component ::= "figure" | "details"

list-type       ::= "ul" | "ol" | "dl" | "li" | "dt" | "dd"

CONTENT         ::= { any-character }
IDENTIFIER      ::= LETTER { LETTER | DIGIT | "_" | "-" }
LETTER          ::= "a" ... "z" | "A" ... "Z"
DIGIT           ::= "0" ... "9"
WS              ::= " " | "\t"
NEWLINE         ::= "\n" | "\r\n"
```

### 3.2 Structural Symbols

| Symbol | Name | Required | Purpose |
|--------|------|----------|---------|
| `>` | RTL Marker | Yes | Declares right-to-left direction |
| `<` | LTR Marker | Yes | Declares left-to-right direction |
| `.` | Component Declarator | Yes | Separates direction from component type |
| `::` | Content Separator | Yes | Separates component declaration from content |
| ` ` | Mandatory Space | Yes | Single space after `::` |
| `;` | Value Separator | No | Separates multiple values |
| `-` | Depth Indicator | No | Nesting level for lists |

---

## 4. Direction System

### 4.1 Rule
Every non-empty, non-block line MUST begin with `>` (RTL) or `<` (LTR).

### 4.2 Semantics

| Marker | Direction | Languages | HTML Output |
|--------|-----------|-----------|-------------|
| `>` | RTL | Arabic, Hebrew, Persian, Urdu | `dir="rtl"` |
| `<` | LTR | English, Latin, CJK | `dir="ltr"` |

### 4.3 Default Direction Strategy
Renderers MAY define a default direction. When rendering, the default direction's `dir` attribute MAY be omitted for brevity.

```artoon
>; Default is RTL — no dir="rtl" needed on RTL elements
>.p:: هذا نص عربي

>; LTR element gets explicit dir="ltr"
<.p:: This is English text
```

---

## 5. Components

### 5.1 Text Components

| Component | HTML | Purpose |
|-----------|------|---------|
| `p` | `<p>` | Paragraph |
| `t1` | `<h1>` | Heading 1 |
| `t2` | `<h2>` | Heading 2 |
| `t3` | `<h3>` | Heading 3 |
| `t4` | `<h4>` | Heading 4 |
| `t5` | `<h5>` | Heading 5 |
| `t6` | `<h6>` | Heading 6 |
| `q` | `<blockquote>` | Block quote |
| `pre` | `<pre>` | Preformatted text |
| `time` | `<time>` | Date/time with optional display text |
| `abbr` | `<abbr>` | Abbreviation with expansion |

**Syntax:**
```artoon
>.p:: paragraph content
>.time:: 2026-04-27; April 27, 2026
>.abbr:: HTML; HyperText Markup Language
```

### 5.2 Media Components

| Component | HTML | Required Attributes | Optional Attributes |
|-----------|------|---------------------|---------------------|
| `a` | `<a>` | `url` | `text`, `title` |
| `img` | `<img>` | `path` | `alt`, `title` |
| `video` | `<video>` | `path` | `title` |
| `audio` | `<audio>` | `path` | `title` |
| `file` | `<a download>` | `path` | `label` |

**Syntax:**
```artoon
>.a:: https://example.com; Click here
>.img:: /path/to/image.jpg; Alt text; Image title
```

### 5.3 Separator Components

Separators have no content and do NOT use `::`.

| Component | HTML | Purpose |
|-----------|------|---------|
| `br` | `<br>` | Line break |
| `hr` | `<hr>` | Thematic break |
| `wbr` | `<wbr>` | Word break opportunity |

**Syntax:**
```artoon
>.br
>.hr
```

### 5.4 Modifier System

Modifiers apply to text-based components. They are written in inline tokens `[...]`.

| Modifier | HTML | Purpose |
|----------|------|---------|
| `s` | `<strong>` | Strong importance |
| `e` | `<em>` | Emphasis |
| `u` | `<u>` | Unarticulated annotation |
| `d` | `<del>` | Deleted text |
| `mark` | `<mark>` | Marked/highlighted text |
| `sub` | `<sub>` | Subscript |
| `sup` | `<sup>` | Superscript |

**Syntax:**
```artoon
>.p:: This is [s:: important] and [e:: emphasized] text.
```

**Combined modifiers:**
```artoon
>.p:: [s+e:: bold and italic text]
```

### 5.5 Components That Accept Modifiers

Text components: `p`, `t1`-`t6`, `q`, `pre`, `a`, `abbr`, `time`

### 5.6 Components That Reject Modifiers

Media components: `img`, `audio`, `video`, `file`
Code component: `c`

---

## 6. Blocks

### 6.1 Syntax

```artoon
<blockname>.        # Block start
...content...       # Block body (any ARTOON lines)
.<blockname>        # Block end
```

### 6.2 Reserved Blocks

#### `code` Block
Content inside a `code` block is NOT parsed as ARTOON. It is stored verbatim.

```artoon
<code:javascript>.
function hello() {
  return "world";
}
.<code>
```

#### `meta` Block
The `meta` block contains hidden fields and is stored in `document.meta`, not in `document.children`.

```artoon
<meta>.
>.-:title: Document Title
>.-:author: Author Name
>.-:date: 2026-04-27
.<meta>
```

### 6.3 Custom Blocks

Any identifier not reserved creates a custom block:

```artoon
<callout>.
>.p:: This is a callout component.
.<callout>
```

---

## 7. Lists

### 7.1 Container Declaration

```artoon
>.ul::     # Unordered list container
>.ol::     # Ordered list container
>.dl::     # Definition list container
```

### 7.2 List Items

```artoon
li:: List item
dt:: Definition term
dd:: Definition description
```

### 7.3 Nested Lists

Depth is indicated by leading dashes:

```artoon
>.ul::
li:: Level 1 item
-li:: Level 2 item
--li:: Level 3 item
li:: Back to level 1
```

### 7.4 Per-Item List Types (Mixed Lists)

Each item MAY declare its own list type:

```artoon
>.ul::
li:: Bullet item
ol:: Numbered item (switches to ol)
li:: Bullet item again (switches back to ul)
```

---

## 8. Tables

### 8.1 Syntax

```artoon
>.table::
th:: Header 1; Header 2; Header 3
tr:: Row 1 Col 1; Row 1 Col 2; Row 1 Col 3
tr:: Row 2 Col 1; Row 2 Col 2; Row 2 Col 3
```

### 8.2 Rules
- `th::` defines header row(s)
- `tr::` defines data rows
- Cells are separated by `; `
- Tables do NOT use direction markers on rows (they inherit from container)

---

## 9. Compound Components

### 9.1 `figure`

```artoon
>.figure::
>.-img:: /path/to/image.jpg; Alt text
>.-caption:: This is the figure caption.
```

### 9.2 `details`

```artoon
>.details:: Summary text
>.p:: Hidden content paragraph 1
>.p:: Hidden content paragraph 2
```

---

## 10. Inline Content

### 10.1 Inline Tokens

Inline formatting uses bracket syntax `[...]` within content.

```ebnf
inline-token    ::= "[" inline-body "]"
inline-body     ::= modifier-list? "::" value
modifier-list   ::= modifier ("+" modifier)*
modifier        ::= "s" | "e" | "u" | "d" | "mark" | "sub" | "sup"
value           ::= { any-character }
```

### 10.2 Inline Components

| Component | Syntax | Example |
|-----------|--------|---------|
| Link | `[a:: url; text]` | `[a:: https://example.com; Visit]` |
| Image | `[img:: path; alt; title]` | `[img:: photo.jpg; Photo; Title]` |
| Code | `[c:: code; lang]` | `[c:: console.log("hi"); js]` |
| Abbreviation | `[abbr:: short; full]` | `[abbr:: HTML; HyperText Markup Language]` |
| Time | `[time:: ISO; display]` | `[time:: 2026-04-27; April 27]` |

### 10.3 Nested Brackets

Brackets may be nested. The parser MUST match the outermost pair.

```artoon
>.p:: Outer [s:: inner [e:: nested] text] continues.
```

---

## 11. Comments

Comments begin with `>.:::` (or `<.:::`) and are ignored by the parser.

```artoon
>.::: This is a comment — not rendered
<.::: This is also a comment in LTR context
```

---

## 12. META Block

### 12.1 Purpose
The `meta` block stores document metadata. It is the ONLY block that uses hidden fields.

### 12.2 Hidden Fields

```ebnf
hidden-field    ::= DIRECTION ".-:" IDENTIFIER ":" VALUE
```

### 12.3 Restrictions
- Hidden fields (`>.-:field:`) are ONLY permitted inside `<meta>` blocks
- `meta` blocks MUST contain only hidden fields
- `meta` blocks MUST NOT contain regular content lines

### 12.4 Standard Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Document title | `>.-:title: My Article` |
| `author` | Author name | `>.-:author: Ahmad` |
| `date` | Publication date | `<.-:date: 2026-04-27` |
| `lang` | Language code | `>.-:lang: ar` |
| `version` | Format version | `>.-:version: 1.0.0` |
| `tags` | Comma-separated tags | `<.-:tags: technology, tutorial` |

---

## 13. Constraints

### 13.1 Forbidden Content

The following MUST NOT appear in ARTOON source:

| Category | Forbidden | Reason |
|----------|-----------|--------|
| Visual | Colors, backgrounds, dimensions, fonts, spacing | Presentation leakage |
| Behavioral | onClick, hover effects, animation, autoplay | Behavior leakage |
| Layout | Grid, flex, columns, positioning, floats | Presentation leakage |
| Compatibility | Fallbacks, polyfills, browser detection | Presentation leakage |
| HTML | Raw HTML tags (`<div>`, `<span>`, etc.) | Ambiguity, non-semantic |
| CSS | Style attributes, class names | Presentation leakage |
| JavaScript | Script tags, event handlers | Behavior leakage |

### 13.2 Parser MUST Reject

A conforming parser MUST reject documents containing:
- Lines starting with a direction marker but missing `::` separator (for content-bearing components)
- Invalid component types (unless custom blocks)
- Malformed block closures (`.<blockname>` must match opening)
- Hidden fields outside `<meta>` blocks

### 13.3 Parser MAY Tolerate

A conforming parser MAY tolerate:
- Missing trailing newline on last line
- Multiple consecutive empty lines (normalize to one)
- UTF-8 BOM at file start

---

## 14. Compliance

### 14.1 Compliance Levels

| Level | Name | Requirements |
|-------|------|--------------|
| C1 | **Minimal** | Parse valid ARTOON, reject obvious errors |
| C2 | **Standard** | C1 + validate constraints + produce clean AST |
| C3 | **Full** | C2 + render HTML + round-trip serialize + validate philosophy |

### 14.2 Conformance Verification

A conforming implementation MUST pass all test cases defined in the ARTOON Conformance Test Suite (to be published separately).

### 14.3 Versioning

- ARTOON specifications follow semantic versioning
- Patch changes (1.0.1) do not affect parsing
- Minor changes (1.1.0) add optional features
- Major changes (2.0.0) modify required behavior

---

## Appendix A: MIME Type

Recommended MIME type for ARTOON documents:

```
text/artoon
```

For archival purposes, ARTOON files SHOULD be served with:

```
Content-Type: text/artoon; charset=utf-8
```

## Appendix B: File Extension

Standard file extension: `.artoon`

Example filenames:
```
article.artoon
report.artoon
documentation.artoon
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **ARTOON** | ARticle Oriented Notation — the format defined by this specification |
| **Component** | A semantic unit with a type and optional content |
| **Block** | A multi-line container with explicit start/end markers |
| **Direction** | Text directionality: RTL (right-to-left) or LTR (left-to-right) |
| **Hidden Field** | A metadata key-value pair inside a `<meta>` block |
| **Modifier** | Inline formatting applied to text content |
| **Parser** | Software that converts ARTOON text into an AST |
| **Renderer** | Software that converts an AST into another format (e.g., HTML) |
| **Serializer** | Software that converts an AST back into ARTOON text |
| **Validator** | Software that checks ARTOON for errors and philosophy breaches |

---

## Appendix D: Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-27 | Initial specification |

---

*Specification maintained by the ARTOON Project.*
*For implementation details, see individual system documentation.*