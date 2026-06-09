# @artoon/cli Inventory Documentation

```yaml
SYSTEM: @artoon/cli
VERSION: 2.0.0
TYPE: User-facing documentation
PURPOSE: How to use CLI
LAST_UPDATED: 2026-01-22
STATUS: Corrected based on actual codebase
```

---

## 📋 ABOUT THIS INVENTORY

This directory contains **user-facing documentation** for @artoon/cli. It explains how to use the CLI tool, what commands are available, and what to expect.

### Documentation vs Analysis

```yaml
THIS_DIRECTORY (inventory_artoon_cli/):
  Purpose: User documentation
  Audience: Developers using CLI
  Focus: How to use
  Style: Practical, examples
  
SIBLING_DIRECTORY (CLI-DOCS/):
  Purpose: Architectural analysis
  Audience: Architects, maintainers
  Focus: How it works internally
  Style: Technical, analytical
  Protocol: ASAP v1.0
```

---

## 📁 DOCUMENT STRUCTURE

| # | File | Purpose | Audience |
|---|------|---------|----------|
| [00-INDEX.md](./00-INDEX.md) | Overview + Quick Reference | All | START HERE |
| [01-PURPOSE.md](./01-PURPOSE.md) | Why CLI exists | Developers | |
| [02-RESPONSIBILITIES.md](./02-RESPONSIBILITIES.md) | What CLI does | Developers | |
| [03-NON-RESPONSIBILITIES.md](./03-NON-RESPONSIBILITIES.md) | What CLI doesn't do | Developers | |
| [04-COMMANDS.md](./04-COMMANDS.md) | All commands + options | Users | CRITICAL |
| [05-EXIT-CODES.md](./05-EXIT-CODES.md) | Exit code reference | Script writers | CRITICAL |
| [06-OUTPUT-CONTRACTS.md](./06-OUTPUT-CONTRACTS.md) | stdout/stderr contracts | Script writers | |
| [07-API-REFERENCE.md](./07-API-REFERENCE.md) | Internal API | Maintainers | |
| [08-EXAMPLES.md](./08-EXAMPLES.md) | Usage examples | Users | |
| [AI-CONTEXT.md](./AI-CONTEXT.md) | Quick AI reference | AI assistants | CRITICAL |

---

## 🆕 RECENT UPDATES (2026-01-22)

### Corrections Based on ASAP Analysis

```yaml
WHAT_CHANGED:
  - Version updated to 2.0.0
  - Added 3 critical issues
  - Added architecture score (7.5/10)
  - Added exit code 99 (UNKNOWN_ERROR)
  - Added dependency versions
  - Added limitations documentation
  
WHY:
  Complete architectural analysis (ASAP v1.0) revealed
  gaps between documentation and actual implementation
  
REFERENCE:
  See ../CLI-DOCS/ for complete analysis
  See UPDATE-NOTES.md for details
  See CORRECTION-SUMMARY.md for summary
```

---

## ⚠️ IMPORTANT WARNINGS

### Critical Issues (From Analysis)

```yaml
ISSUE_1: No Error Protection
  Impact: CLI may crash on exceptions
  Risk: HIGH
  Workaround: Use error handling in scripts
  Fix: Planned for v2.1

ISSUE_2: No File Size Limits
  Impact: OOM on large files (> 100MB)
  Risk: HIGH
  Workaround: Check file size before processing
  Fix: Planned for v2.1

ISSUE_3: No Signal Handling
  Impact: No cleanup on Ctrl+C
  Risk: MEDIUM
  Workaround: Avoid interrupting during writes
  Fix: Planned for v2.1
```

### Limitations

```yaml
NO_WATCH_MODE:
  Use: nodemon or similar tools
  
NO_CONFIG_FILES:
  Use: Command-line options
  Planned: v2.2
  
NO_GLOB_SUPPORT:
  Use: Shell loops
  
SYNCHRONOUS_IO:
  Impact: Blocking operations
  Planned fix: v3.0 (async refactor)
```

---

## 🎯 QUICK START

### Installation

```bash
npm install -g @artoon/cli
```

### Basic Usage

```bash
# Parse ARTOON file
artoon parse document.artoon

# Render to HTML
artoon render document.artoon -o output.html

# Validate file
artoon validate document.artoon --strict
```

### Common Patterns

```bash
# CI/CD validation
artoon validate docs/*.artoon --strict --json

# Build pipeline
artoon render src/content.artoon -f -o dist/index.html

# Script with error handling
for file in *.artoon; do
  if ! artoon validate "$file"; then
    echo "Failed: $file"
    exit 1
  fi
done
```

---

## 📊 SYSTEM OVERVIEW

### What is @artoon/cli?

```
@artoon/cli is a command-line interface that orchestrates
ARTOON core systems (parser, AST, validator, renderer).

Role: Developer Interaction Layer
Pattern: Facade + Command Pattern
Complexity: Low (350 lines of code)
Maturity: Production-ready (with limitations)
Score: 7.5/10
```

### Commands

```
artoon parse <file>     - Parse to JSON AST
artoon render <file>    - Render to HTML
artoon validate <file>  - Validate file
artoon lint <file>      - Alias for validate
```

### Exit Codes

```
0  = Success
1  = Syntax error
2  = Validation error
3  = Philosophy breach (strict mode)
4  = File not found
5  = I/O error
99 = Unknown error
```

---

## 🔗 RELATED DOCUMENTATION

### For Users
```
START HERE:
  - 00-INDEX.md (overview)
  - 04-COMMANDS.md (command reference)
  - 08-EXAMPLES.md (usage examples)
  - AI-CONTEXT.md (quick reference)
```

### For Script Writers
```
READ:
  - 05-EXIT-CODES.md (exit code contracts)
  - 06-OUTPUT-CONTRACTS.md (stdout/stderr)
  - AI-CONTEXT.md (common mistakes)
```

### For Developers/Maintainers
```
READ:
  - 02-RESPONSIBILITIES.md (what CLI does)
  - 03-NON-RESPONSIBILITIES.md (boundaries)
  - 07-API-REFERENCE.md (internal API)
  - ../CLI-DOCS/ (complete analysis)
```

---

## 📖 READING RECOMMENDATIONS

### For First-Time Users (15 minutes)
```
1. 00-INDEX.md (overview)
2. 04-COMMANDS.md (commands)
3. 08-EXAMPLES.md (examples)
```

### For Script Writers (30 minutes)
```
1. 00-INDEX.md
2. 04-COMMANDS.md
3. 05-EXIT-CODES.md
4. 06-OUTPUT-CONTRACTS.md
5. AI-CONTEXT.md (common mistakes)
```

### For Complete Understanding (2 hours)
```
1. Read all inventory files
2. Read ../CLI-DOCS/EXECUTIVE-SUMMARY-AR.md
3. Browse ../CLI-DOCS/ for details
```

---

## 🎯 SUPPORT

### Getting Help

```bash
# Built-in help
artoon --help
artoon parse --help
artoon render --help
artoon validate --help

# Version
artoon --version
```

### Documentation

```
User Docs: This directory (inventory_artoon_cli/)
Technical Analysis: ../CLI-DOCS/
Examples: 08-EXAMPLES.md
Quick Reference: AI-CONTEXT.md
```

### Reporting Issues

```yaml
BEFORE_REPORTING:
  1. Check file size (< 10MB recommended)
  2. Check for syntax errors
  3. Try with --json for structured output
  4. Check exit code
  
INCLUDE_IN_REPORT:
  - CLI version (artoon --version)
  - Command used
  - File size
  - Error message
  - Exit code
  - Operating system
```

---

## 📊 STATISTICS

```yaml
Commands: 4
Exit Codes: 7
Dependencies: 6
Source Lines: ~350
Architecture Score: 7.5/10
Test Coverage: Integration + Unit
Documentation: 108 pages (CLI-DOCS/)
```

---

## 🎯 ROADMAP

### v2.1 (Immediate - 2 weeks)
```
- Add error protection (try-catch)
- Add file size limits
- Add signal handlers
- Fix type safety issues
```

### v2.2-v2.3 (2-3 months)
```
- Configuration system (.artoonrc)
- Glob pattern support
- Better architecture
- More tests
```

### v3.0 (6-12 months)
```
- Async/await refactor
- Streaming support
- Plugin system
- Watch mode
```

---

**LAST_UPDATED:** 2026-01-22  
**MAINTAINER:** ARTOON Core Team  
**ANALYSIS_REFERENCE:** ../CLI-DOCS/  
**CORRECTIONS:** See UPDATE-NOTES.md and CORRECTION-SUMMARY.md
