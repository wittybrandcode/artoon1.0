# ARTOON Brand Guidelines v2.0

**Editorial Dark · English-first · Syntax Stripe**

> Full system spec: **[DESIGN.md](./DESIGN.md)**  
> Aesthetic reference: [BMW M Design Analysis (getdesign.md)](https://getdesign.md/bmw-m/design-md)

---

## 1. Positioning

ARTOON is an **AI-native structured article format**. The visual identity communicates:

- Engineering precision (black canvas, sharp geometry)
- Editorial confidence (uppercase display, full-bleed heroes)
- Semantic clarity (Syntax Stripe = `>` · `::` · `<`)

**Tagline (always English on brand surfaces):**  
`STRUCTURED FOR MACHINES · READABLE FOR HUMANS`

---

## 2. Color

### Default: dark editorial

Marketing, product chrome, and hero sections use **pure black** `#000000`.

| Token | Hex | Role |
|-------|-----|------|
| Black | `#000000` | Canvas |
| Graphite | `#141414` | Cards |
| Steel | `#262626` | Borders |
| Silver | `#737373` | Muted text |
| White | `#FFFFFF` | Headlines, primary CTA fill |

### Syntax Stripe (sparingly)

Three skewed bars — ARTOON’s equivalent of an M tricolor:

| Band | Hex |
|------|-----|
| RTL | `#6CB4EE` |
| Semantic | `#1D4ED8` |
| LTR | `#EAB308` |

SVG: `logos/syntax-stripe.svg` · CSS: `.artoon-syntax-stripe` in `tokens/tokens.css`

### Light mode

Documentation body only — not primary marketing.

---

## 3. Typography

| Role | Font | Rules |
|------|------|-------|
| Display | **Inter Tight** 700 | UPPERCASE, tracking 0.12–0.14em |
| Body | **Inter** 400–500 | Sentence case, 1rem / 1.6 |
| Mono | **IBM Plex Mono** | Syntax examples only |

**Do not use:** Outfit, rounded fonts, serif display on brand lockups.

---

## 4. Logo

| Asset | File |
|-------|------|
| Mark + stripe | `logo-mark.svg` |
| Wordmark | `logo-wordmark.svg` |
| Horizontal | `logo-horizontal.svg` |
| Hero | `logo-primary.svg` |
| Stripe only | `syntax-stripe.svg` |

Wordmark is always **ARTOON** in Inter Tight caps with generous letter-spacing.

---

## 5. Layout (BMW M–inspired patterns)

1. **Full-bleed hero** — black + optional image + 60% scrim  
2. **Overline** — caption size, silver, tracked caps  
3. **Display headline** — ARTOON or section title  
4. **Syntax Stripe** — one instance below headline  
5. **Primary CTA** — white fill, black text, uppercase  

Border radius: **0–2px** max. No soft shadows on marketing.

---

## 6. Voice

English, precise, technical. See DESIGN.md § Voice.

---

## 7. Implementation

```bash
# For AI-assisted UI (pattern from getdesign.md)
# Point your assistant to: artoon-brand/DESIGN.md
```

---

*v2.0.0 — MIT License*
