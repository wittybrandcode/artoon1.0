# DESIGN.md — ARTOON Brand System

> **Motorsport editorial meets structured semantics.**  
> Pure black canvas, uppercase display typography, Syntax Stripe accents used sparingly.

Inspired by engineered dark-mode patterns such as [BMW M (getdesign.md)](https://getdesign.md/bmw-m/design-md). ARTOON is **not affiliated** with BMW M.

---

## Usage

```bash
# Reference this file in your repo
cp artoon-brand/DESIGN.md ./DESIGN.md

# Or link from AI context
# "Follow artoon-brand/DESIGN.md for all UI and marketing surfaces."
```

Ask your AI assistant: **Use `artoon-brand/DESIGN.md` for UI work.**

---

## Brand essence

| Principle | Rule |
|-----------|------|
| **Canvas** | Near-pure black `#000000` — default for marketing, docs hero, product chrome |
| **Type** | English-first, uppercase display headlines, wide tracking |
| **Accent** | Syntax Stripe (3 colors) — **never** flood the layout; one stripe per viewport section max |
| **Photography** | Full-bleed, high contrast, desaturated optional; text always on scrim |
| **Motion** | Subtle, mechanical easing; no playful bounce |

**Tagline:** `STRUCTURED FOR MACHINES · READABLE FOR HUMANS`

---

## Color system

### Canvas (primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `black` | `#000000` | Page background |
| `carbon` | `#0A0A0A` | Elevated panels |
| `graphite` | `#141414` | Cards, inputs |
| `steel` | `#262626` | Borders, dividers |
| `silver` | `#737373` | Muted text |
| `white` | `#FFFFFF` | Primary text on dark |

### Syntax Stripe (identity accent — use sparingly)

Three bands mirror ARTOON syntax semantics (like an M tricolor for code):

| Band | Hex | Maps to |
|------|-----|---------|
| `stripe-rtl` | `#6CB4EE` | RTL marker `>` |
| `stripe-semantic` | `#1D4ED8` | Structure / `::` |
| `stripe-ltr` | `#EAB308` | LTR marker `<` |

**CSS:**

```css
.artoon-syntax-stripe {
  display: flex;
  gap: 3px;
  transform: skewX(-12deg);
}
.artoon-syntax-stripe span:nth-child(1) { background: #6CB4EE; }
.artoon-syntax-stripe span:nth-child(2) { background: #1D4ED8; }
.artoon-syntax-stripe span:nth-child(3) { background: #EAB308; }
```

### Functional (UI only)

| Token | Hex |
|-------|-----|
| `success` | `#22C55E` |
| `warning` | `#F59E0B` |
| `danger` | `#EF4444` |
| `link` | `#6CB4EE` |

### Light mode (secondary)

Use light surfaces only for **documentation body** or **print**. Marketing defaults to **dark**.

| Token | Hex |
|-------|-----|
| `paper` | `#FAFAFA` |
| `ink` | `#0A0A0A` |

---

## Typography

Load from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

| Role | Family | Style |
|------|--------|-------|
| **Display** | Inter Tight | `font-weight: 700`; `text-transform: uppercase`; `letter-spacing: 0.14em` |
| **Body** | Inter | `font-weight: 400–500`; `letter-spacing: 0` |
| **Mono** | IBM Plex Mono | Syntax samples, CLI, code |

### Scale

| Name | Size | Line height | Use |
|------|------|-------------|-----|
| `display-xl` | 4.5rem | 1.0 | Hero |
| `display-lg` | 3rem | 1.05 | Section titles |
| `display-md` | 1.75rem | 1.15 | Subheads |
| `body` | 1rem | 1.6 | Paragraphs |
| `caption` | 0.75rem | 1.4 | Labels, overlines |
| `mono` | 0.875rem | 1.5 | `>.p::` examples |

### Display rules

- Headlines: **always uppercase** in marketing (`ARTOON`, `STRUCTURED CONTENT`)
- Overline pattern: `caption` + `letter-spacing: 0.2em` + `color: silver`
- Never use script, serif, or rounded display fonts on brand surfaces

---

## Logo

**Primary mark:** `<>` — angle brackets only.  
- `<` uses LTR stripe color (gold `#EAB308`)  
- `>` uses RTL stripe color (blue `#6CB4EE`)  

| Asset | File | When |
|-------|------|------|
| Mark + stripe | `logos/logo-mark.svg` | Favicon, app icon |
| Horizontal | `logos/logo-horizontal.svg` | Nav, docs header |
| Wordmark | `logos/logo-wordmark.svg` | Hero lockups |
| Mono white | `logos/logo-mono-light.svg` | On photography |
| Stripe only | `logos/syntax-stripe.svg` | Section dividers |

**Clear space:** height of the Syntax Stripe block on all sides.

**Minimum width:** horizontal lockup 140px; mark 32px.

---

## Layout patterns

### Hero (editorial)

```
┌──────────────────────────────────────────────────────────┐
│ ████████████████████ FULL-BLEED IMAGE / GRADIENT ███████ │
│ ░░░░░░░░░░░░░░░░░░░░ dark scrim 60% ░░░░░░░░░░░░░░░░░░░░ │
│                                                          │
│  OVERLINE · AI-NATIVE FORMAT                             │
│  ARTOON                                                  │
│  STRUCTURED FOR MACHINES · READABLE FOR HUMANS           │
│  ═══ syntax stripe (3 bars, skewed) ═══                  │
│                                                          │
│  [ PRIMARY CTA ]    [ GHOST CTA ]                        │
└──────────────────────────────────────────────────────────┘
```

### Section divider

Place `syntax-stripe.svg` or 48×4px stripe between sections — not between every paragraph.

### Card

- Background: `graphite`
- Border: `1px solid steel`
- Radius: `0` or `2px` max (sharp, engineered)
- No heavy shadows; optional `0 0 0 1px` ring

### Buttons

| Variant | Style |
|---------|-------|
| Primary | `background: white; color: black; uppercase; letter-spacing: 0.1em` |
| Ghost | `border: 1px solid steel; color: white; transparent bg` |
| Accent | White text + Syntax Stripe underline on hover only |

---

## Voice (English)

- Precise, confident, technical — not hype
- Short sentences; active voice
- Prefer: *structure*, *semantic*, *pipeline*, *canonical*
- Avoid: *revolutionary*, *magic*, *disrupt*

---

## Don'ts

- No gradients on body text
- No Syntax Stripe on every button
- No rounded “friendly” UI (radius > 4px on marketing)
- No purple/indigo floods (legacy palette deprecated)
- No Arabic in primary marketing lockups (Arabic OK in product UI / docs body)

---

## File map

```
artoon-brand/
├── DESIGN.md              ← this file (AI + dev source of truth)
├── tokens/tokens.css      ← CSS variables
├── logos/                 ← SVG lockups
├── preview/brand-preview.html
└── BRAND-GUIDELINES-EN.md ← extended spec
```

---

**Version:** 2.0.0 · **Style:** Editorial Dark / Syntax Stripe  
**License:** MIT
