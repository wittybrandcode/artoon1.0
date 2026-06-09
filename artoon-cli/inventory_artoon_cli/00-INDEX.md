# @artoon/cli — Inventory v2.0

```yaml
SYSTEM_ID: artoon-cli
VERSION: 2.0.0
TYPE: interface-system
ROLE: developer-interaction-layer
ARCHITECTURE: Facade + Command Pattern
SOURCE_LINES: ~350
TESTS: Integration + Unit tests
STATUS: production-ready-with-limitations
AI_PRIORITY: HIGH
LAST_UPDATED: 2026-01-22
ANALYSIS_SOURCE: Actual codebase (CLI-DOCS/)
```

---

## 🔍 AI QUICK REFERENCE

```
PURPOSE: Developer interaction layer — الواجهة
INPUT:   ARTOON files (.artoon, .toon)
OUTPUT:  stdout, stderr, exit codes
ENTRY:   artoon <command> <file> [options]
INVARIANT: Orchestration only, no parsing/validation logic

CRITICAL_FINDINGS:
  ⚠️ No try-catch in parse/render commands
  ⚠️ No file size limits (OOM risk)
  ⚠️ No signal handlers (no cleanup)
  ✅ Clean architecture (7.5/10)
  ✅ Stable contracts
```

---

## 📁 FILE STRUCTURE

```
artoon-cli/
├── src/
│   ├── index.ts              # Main entry point (commander setup)
│   ├── version.ts            # Version constant
│   ├── commands/
│   │   ├── parse.ts          # parse command
│   │   ├── render.ts         # render command
│   │   └── validate.ts       # validate command
│   └── utils/
│       ├── exit-codes.ts     # Exit code constants
│       ├── file.ts           # File I/O utilities
│       └── output.ts         # Console output formatting
├── tests/
│   └── ...
└── inventory_artoon_cli/     # This documentation
```

---

## 📊 INVENTORY FILES

| # | FILE | CONTENT | AI-PRIORITY |
|---|------|---------|-------------|
| 00 | INDEX.md | Overview + Quick Reference | HIGH |
| 01 | PURPOSE.md | Philosophy (Orchestration Layer) | HIGH |
| 02 | RESPONSIBILITIES.md | What CLI does | CRITICAL |
| 03 | NON-RESPONSIBILITIES.md | Boundaries | CRITICAL |
| 04 | COMMANDS.md | All commands + options | CRITICAL |
| 05 | EXIT-CODES.md | Exit code contracts | CRITICAL |
| 06 | OUTPUT-CONTRACTS.md | stdout/stderr contracts | HIGH |
| 07 | API-REFERENCE.md | All exports | HIGH |
| 08 | EXAMPLES.md | Usage examples | HIGH |
| -- | AI-CONTEXT.md | Quick AI reference | CRITICAL |

---

## 🔗 SYSTEM POSITION

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARTOON CLI ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         ┌─────────────────┐                             │
│                         │   @artoon/cli   │ ◄── YOU ARE HERE            │
│                         │   (Orchestrator)│                             │
│                         └────────┬────────┘                             │
│                                  │                                      │
│         ┌────────────────────────┼────────────────────────┐             │
│         │                        │                        │             │
│         ▼                        ▼                        ▼             │
│   ┌───────────┐          ┌─────────────┐          ┌─────────────┐       │
│   │ @artoon/  │          │ @artoon/    │          │ @artoon/    │       │
│   │ parser    │          │ validator   │          │ renderer-   │       │
│   └───────────┘          └─────────────┘          │ html        │       │
│         │                        │                └─────────────┘       │
│         ▼                        │                        │             │
│   ┌───────────┐                  │                        │             │
│   │ @artoon/  │◄─────────────────┴────────────────────────┘             │
│   │ ast       │                                                         │
│   └───────────┘                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 STATISTICS

```yaml
COMMANDS: 4
  - parse
  - render
  - validate
  - lint (alias)

EXIT_CODES: 7
  - SUCCESS (0)
  - SYNTAX_ERROR (1)
  - VALIDATION_ERROR (2)
  - PHILOSOPHY_BREACH (3)
  - FILE_NOT_FOUND (4)
  - IO_ERROR (5)
  - UNKNOWN_ERROR (99)

DEPENDENCIES: 6
  - @artoon/parser (^1.0.0)
  - @artoon/ast (^1.0.0)
  - @artoon/validator (^1.0.0)
  - @artoon/renderer-html (^1.0.0)
  - commander (^11.1.0)
  - chalk (^4.1.2)

SOURCE_LINES: ~350
TEST_FILES: 2 (integration.test.ts, utils.test.ts)

ARCHITECTURE_SCORE: 7.5/10
CRITICAL_ISSUES: 3
  - No try-catch protection
  - No file size limits
  - No signal handling
```

---

## ⚡ QUICK START

```bash
# Parse ARTOON file to JSON AST
artoon parse document.artoon

# Parse with canonical AST transformation
artoon parse document.artoon --transformed

# Render to HTML
artoon render document.artoon

# Render full HTML document
artoon render document.artoon --full -o output.html

# Validate file
artoon validate document.artoon

# Validate with strict mode
artoon validate document.artoon --strict

# Validate with JSON output
artoon validate document.artoon --json
```

---

**LAST_UPDATED:** 2026-01-22  
**MAINTAINER:** ARTOON Core Team  
**ANALYSIS_REFERENCE:** See CLI-DOCS/ for complete ASAP v1.0 analysis
