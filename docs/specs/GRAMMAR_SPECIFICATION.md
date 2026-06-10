# ARTOON Grammar Specification (v1.0.0)

## 1. LEXICAL STRUCTURE
ARTOON is a line-oriented language. Every line is either a **Component**, a **Block Marker**, or **Raw Content**.

### 1.1 Line Prefixes
- `>.`: RTL Component start.
- `<.`: LTR Component start.
- `<`: Block Open (if followed by name and `.`).
- `.<`: Block Close.

## 2. SYNTAX COMPONENTS

### 2.1 Line Components
Format: `{prefix}{type}:: {content}`
Example: `>.p:: This is a paragraph.`

### 2.2 Separators
Format: `{prefix}{type}` (No double colon)
Example: `>.hr`

### 2.3 Blocks
Format:
```
<{name}>.
...raw or artoon content...
.<{name}>
```

## 3. INLINE GRAMMAR
Inline tokens are enclosed in square brackets: `[modifier:: content]`.

### 3.1 Modifiers
- `s`: Strong
- `e`: Emphasis
- `u`: Underline
- `d`: Delete
- `mark`: Highlight

### 3.2 Complex Inlines
- Links: `[a:: {url}; {text}]`
- Media: `[img:: {src}; {alt}; {title}]`

## 4. NESTING (DASH-BASED)
Nesting is indicated by leading dashes before the component type.
- `li::` Level 0
- `-li::` Level 1
- `--li::` Level 2
