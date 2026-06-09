# 01 — PURPOSE

```yaml
FILE: 01-PURPOSE.md
SYSTEM: @artoon/cli
AI_PRIORITY: HIGH
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: This file explains WHY CLI exists. Key concept: "Developer Interaction Layer" -->

---

## 🎯 CORE PURPOSE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DEVELOPER INTERACTION LAYER                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   @artoon/cli is the INTERFACE between developers and ARTOON systems.  │
│                                                                         │
│   It ORCHESTRATES the core systems:                                     │
│   - @artoon/parser                                                      │
│   - @artoon/ast                                                         │
│   - @artoon/validator                                                   │
│   - @artoon/renderer-html                                               │
│                                                                         │
│   It does NOT implement any parsing, validation, or rendering logic.   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PURPOSE STATEMENT

| Aspect | Description |
|--------|-------------|
| WHAT | Command-line interface for ARTOON processing |
| WHY | Enable developers to use ARTOON from terminal |
| HOW | Orchestrate core systems, format output, manage exit codes |
| NOT | Parser, validator, renderer — just the interface |

---

## 🔑 KEY PHILOSOPHY

### 1. Orchestration Only

```
CLI = Glue code between:
  - File system (read/write)
  - Core systems (parse/validate/render)
  - Terminal (stdout/stderr/exit codes)

CLI ≠ Business logic
```

### 2. Predictable Contracts

```bash
# Exit codes are contracts
0 = Success
1 = Syntax error
2 = Validation error
3 = Philosophy breach
4 = File not found
5 = I/O error

# Output channels are contracts
stdout = Data output (JSON, HTML)
stderr = Error messages
```

### 3. Composable Commands

```bash
# Each command does ONE thing
artoon parse file.artoon      # Parse only
artoon validate file.artoon   # Validate only
artoon render file.artoon     # Render only

# Compose with shell
artoon parse file.artoon | jq '.content'
artoon render file.artoon > output.html
```

---

## 🎯 DESIGN GOALS

| Goal | Priority | Description |
|------|----------|-------------|
| Predictable exit codes | CRITICAL | Scripts can rely on exit codes |
| Clean stdout/stderr | CRITICAL | Data to stdout, errors to stderr |
| Minimal dependencies | HIGH | Only essential packages |
| Fast startup | HIGH | No heavy initialization |
| Helpful errors | MEDIUM | Clear error messages |

---

## 📊 WHAT CLI DOES

```yaml
DOES:
  - Read ARTOON files from disk
  - Call @artoon/parser to parse
  - Call @artoon/ast to transform
  - Call @artoon/validator to validate
  - Call @artoon/renderer-html to render
  - Format output (JSON, HTML)
  - Write output to file or stdout
  - Report errors to stderr
  - Return appropriate exit codes

DOES_NOT:
  - Implement parsing logic
  - Implement validation rules
  - Implement rendering logic
  - Make semantic decisions
```

---

## 🔗 RELATIONSHIP TO OTHER SYSTEMS

```
@artoon/parser        →  CLI calls parse()
@artoon/ast           →  CLI calls transform()
@artoon/validator     →  CLI calls validate()
@artoon/renderer-html →  CLI calls render()

CLI = Orchestrator that connects them all
```

---

## 💡 WHY "DEVELOPER INTERACTION LAYER"?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Developers need a way to:                                             │
│                                                                         │
│   1. Parse ARTOON files → artoon parse                                 │
│   2. Validate ARTOON files → artoon validate                           │
│   3. Render ARTOON files → artoon render                               │
│   4. Integrate with build tools → exit codes + stdout                  │
│   5. Debug issues → error messages                                      │
│                                                                         │
│   CLI provides all of this without exposing internal complexity.       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 SUMMARY

```
@artoon/cli = Developer Interaction Layer

- Orchestrates core systems
- Manages file I/O
- Formats output
- Returns exit codes
- Reports errors

لا parsing logic
لا validation rules
لا rendering logic

فقط: Orchestration + Interface
```
