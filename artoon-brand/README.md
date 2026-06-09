# ARTOON Visual Identity v2.0

**Editorial dark · Professional English typography · Syntax Stripe accent**

Inspired by engineered dark-mode patterns such as [BMW M on getdesign.md](https://getdesign.md/bmw-m/design-md) — pure black canvas, uppercase display type, tricolor stripe used sparingly. ARTOON replaces the M stripe with a **Syntax Stripe** (RTL blue · semantic blue · LTR gold).

```
STRUCTURED FOR MACHINES · READABLE FOR HUMANS
```

## Start here

| File | Purpose |
|------|---------|
| **[DESIGN.md](./DESIGN.md)** | Source of truth for AI + developers (like getdesign `DESIGN.md`) |
| [BRAND-GUIDELINES-EN.md](./BRAND-GUIDELINES-EN.md) | Extended English spec |
| [preview/brand-preview.html](./preview/brand-preview.html) | Live preview in browser |

## Usage

```bash
# Reference in your project
cp artoon-brand/DESIGN.md ./DESIGN.md
```

```html
<link rel="icon" href="artoon-brand/logos/favicon.svg" type="image/svg+xml" />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Inter:wght@400;500&family=IBM+Plex+Mono&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="artoon-brand/tokens/tokens.css" />
```

## Structure

```
artoon-brand/
├── DESIGN.md                 ← AI / dev spec (primary)
├── tokens/                   ← colors.json, tokens.css
├── logos/                    ← mark, wordmark, syntax-stripe
├── patterns/                 ← hero backgrounds
├── preview/brand-preview.html
└── social/SOCIAL-SPECS.md
```

## Syntax Stripe (identity accent)

| Band | Hex | Meaning |
|------|-----|---------|
| Light blue | `#6CB4EE` | RTL `>` |
| Deep blue | `#1D4ED8` | Structure `::` |
| Gold | `#EAB308` | LTR `<` |

Use **once per section** — never flood the UI.

## Typography

- **Display:** Inter Tight — uppercase, `letter-spacing: 0.14em`
- **Body:** Inter
- **Mono:** IBM Plex Mono — syntax samples

## License

MIT — ARTOON project.
