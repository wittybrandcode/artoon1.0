# System Analysis Report: `@artoon/cli`

> ARTOON Command Line Interface — Terminal gateway to the ARTOON ecosystem.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/cli` |
| **Version** | `2.0.0` |
| **Role** | CLI tool for parsing, rendering, validating, and migrating ARTOON documents |
| **Status** | ⚠️ Functional but incomplete |
| **Test Count** | ~20 tests (2 files) |
| **Lines of Code** | ~450 (src/) |

**Verdict:** A **solid foundation** with professional CLI patterns, but missing critical commands (`convert`, `format`) needed for a complete file-format ecosystem.

---

## 2. Architecture Overview

```
src/
├── index.ts              # Entry point — Commander.js setup
├── version.ts            # Version export (⚠️ EMPTY)
├── commands/
│   ├── parse.ts          # Parse .artoon → AST JSON
│   ├── render.ts         # Render .artoon → HTML
│   ├── validate.ts       # Validate .artoon file
│   └── migrate.ts        # Migrate V1 AST JSON → V2
└── utils/
    ├── file.ts           # File I/O helpers
    ├── output.ts         # Colored terminal output
    └── exit-codes.ts     # Standardized exit codes
```

### Technology Stack

| Dependency | Purpose |
|------------|---------|
| `commander` | CLI argument parsing and command routing |
| `chalk` | Terminal color/styling |
| `@artoon/parser` | Parse ARTOON source |
| `@artoon/ast` | Transform + serialize AST |
| `@artoon/validator` | Validate document structure |
| `@artoon/renderer-html` | Generate HTML output |

---

## 3. Command Analysis

### 3.1 `parse` — Parse to AST ⭐⭐⭐⭐

**Usage:** `artoon parse <file> [-o output] [-c] [-t]`

**Strengths:**
- Outputs raw parser AST or canonical AST (`--transformed`)
- Compact mode (`--compact`) for machine consumption
- File output or stdout
- Parse errors reported with line numbers

**Code Quality:**
```typescript
// Clean separation of concerns
readFile → parse → transform(optional) → format JSON → output
```

**Gap:** No batch parsing for directories.

---

### 3.2 `render` — Render to HTML ⭐⭐⭐⭐

**Usage:** `artoon render <file> [-o output] [-f] [--no-direction]`

**Strengths:**
- Fragment or full document HTML (`--full`)
- Direction attributes can be disabled (`--no-direction`)
- Clean pipeline: parse → transform → render

**Gap:** No batch rendering.

---

### 3.3 `validate` / `lint` — Validation ⭐⭐⭐⭐⭐

**Usage:** `artoon validate <file> [-s] [-q] [--json]`

**Strengths:**
- **Best command in the CLI.** Professional output formatting.
- Aggregates parse errors, validation errors, warnings, and philosophy breaches
- JSON output mode for CI/CD integration
- Strict mode (warnings as errors)
- Quiet mode (errors only)
- Proper exit codes:
  - `0` = success
  - `1` = syntax error
  - `2` = validation error
  - `3` = philosophy breach (in strict mode)

**Output Quality:**
```
error line 5: [PARSE] Missing space after separator
warn  line 10: [PHI001] Presentation leak detected
──────────────────────────────────────────────────
1 error, 1 warning
```

**Design Note:** `lint` is an alias for `validate` — pragmatic and user-friendly.

---

### 3.4 `migrate` — V1 → V2 Migration ⭐⭐⭐

**Usage:** `artoon migrate <path> [--dry-run]`

**Strengths:**
- Dry-run mode for safe preview
- Directory or single file processing
- Counts processed vs migrated files

**Critical Gap:** Only migrates `.json` AST files, not `.artoon` source files!

```typescript
// migrate.ts line 16
if (!filePath.endsWith('.json')) return;  // ❌ Skips .artoon files
```

This means users cannot migrate their source documents — only pre-parsed AST dumps. A user with `article.artoon` (source) has no migration path via CLI.

**Recommended behavior:**
```typescript
if (filePath.endsWith('.artoon') || filePath.endsWith('.toon')) {
  // Parse source → transform → serialize new AST → write
}
```

---

### 3.5 Missing Commands (Critical for Ecosystem)

| Command | Priority | Purpose |
|---------|----------|---------|
| `convert` | 🔴 Essential | Markdown ↔ ARTOON, HTML ↔ ARTOON |
| `format` | 🔴 Essential | Pretty-print / auto-format `.artoon` files |
| `stats` | 🟡 Useful | Word count, node count, reading time |
| `extract` | 🟡 Useful | Extract text, meta, or specific node types |

---

## 4. Utility Modules Assessment

### 4.1 `utils/file.ts` ⭐⭐⭐⭐

**API:** `readFile`, `writeFile`, `isArtoonFile`, `getOutputPath`

**Strengths:**
- `readFile`/`writeFile` return `FileResult` union type instead of throwing — excellent pattern
- `writeFile` auto-creates directories
- `getOutputPath` computes derived filenames

**Code:**
```typescript
export interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}
```

**Gap:** No streaming/large file support.

---

### 4.2 `utils/output.ts` ⭐⭐⭐⭐⭐

**API:** Colored printing, issue formatting, summary formatting

**Strengths:**
- Clean `colors` abstraction over chalk
- `ValidationIssue` interface is well-designed
- `formatIssue()` produces professional CLI output
- `formatSummary()` handles pluralization

---

### 4.3 `utils/exit-codes.ts` ⭐⭐⭐⭐⭐

**Strengths:**
- Standardized exit codes (Unix conventions)
- Semantic codes for different failure modes
- Type-safe via `ExitCode` type

```typescript
export const ExitCodes = {
  SUCCESS: 0,
  SYNTAX_ERROR: 1,
  VALIDATION_ERROR: 2,
  PHILOSOPHY_BREACH: 3,
  FILE_NOT_FOUND: 4,
  IO_ERROR: 5,
  UNKNOWN_ERROR: 99,
} as const;
```

---

## 5. Test Coverage Assessment

| Test File | Focus | Assessment |
|-----------|-------|------------|
| `integration.test.ts` | End-to-end CLI commands | ⚠️ Conditional — skips if CLI not built |
| `utils.test.ts` | File I/O, output formatting | ✅ Good coverage of utilities |

**Integration Test Pattern:**
```typescript
const cliBuilt = fs.existsSync(cliPath);
// ...
test('parse valid file', () => {
  if (!cliBuilt) return;  // ❌ Skips silently in CI if build forgotten
  // ...
});
```

**Issue:** Tests silently skip if `dist/` is missing. This hides build failures in CI. Better pattern:
```typescript
beforeAll(() => {
  if (!fs.existsSync(cliPath)) {
    throw new Error('CLI must be built before running integration tests');
  }
});
```

---

## 6. Issues & Recommendations

### 🔴 Critical

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **`version.ts` is EMPTY (0 bytes)** | `src/version.ts` | `--version` flag fails | Add `export const version = '2.0.0';` |
| 2 | **`migrate` skips `.artoon` source files** | `commands/migrate.ts:16` | Users cannot migrate source docs | Add `.artoon`/`.toon` handling |
| 3 | **Missing `convert` command** | — | No migration path from Markdown/HTML | Implement bidirectional conversion |
| 4 | **Missing `format` command** | — | No auto-formatting for human editors | Implement pretty-printer |

### 🟡 Important

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 5 | Integration tests silently skip | `integration.test.ts` | Fail fast if CLI not built |
| 6 | No batch/directory operations | all commands | Add glob support (`*.artoon`) |
| 7 | `process.exit()` in commands | all commands | Refactor to return exit codes for testability |
| 8 | No configuration file support | — | Add `.artoonrc` or `artoon.config.js` |
| 9 | No watch mode | — | Add `--watch` for development workflows |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 10 | Add `artoon stats` command | Word count, reading time, node breakdown |
| 11 | Add `artoon extract --text` | Plain text extraction for search indexing |
| 12 | Add `artoon init` | Scaffold new ARTOON project with template |
| 13 | Add shell completions | Bash/zsh tab completion |

---

## 7. Integration Points

### Dependency Graph

```
artoon-cli
├── @artoon/parser    (parse source)
├── @artoon/ast       (transform + serialize)
├── @artoon/validator (validate structure)
├── @artoon/renderer-html (generate HTML)
├── commander         (CLI framework)
└── chalk             (terminal colors)
```

**Observation:** CLI does not yet depend on `@artoon/state`. Once `artoon-state` becomes the unified kernel, CLI commands should be able to output `EditorState` JSON for programmatic consumption.

---

## 8. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| CLI Design | 8/10 | Professional patterns, good UX |
| Command Coverage | 4/10 | Missing convert, format, stats |
| Error Handling | 8/10 | Good exit codes, file result pattern |
| Test Coverage | 5/10 | Utilities tested, integration conditional |
| Documentation | 7/10 | README clear, missing command docs |
| Extensibility | 6/10 | Easy to add commands, but no plugin system |
| **Overall** | **6.3/10** | Good foundation, needs 2-3 more core commands |

---

## 9. Action Items for Roadmap

### Phase 2 (Complete Existing Systems)
- [ ] Fix `version.ts` — add version export
- [ ] Fix `migrate` — handle `.artoon` source files, not just `.json`
- [ ] Implement `convert` command (md↔artoon, html↔artoon)
- [ ] Implement `format` command (pretty-print `.artoon`)
- [ ] Harden integration tests (fail if CLI not built)
- [ ] Add batch/glob support to all commands

### Phase 3 (State Unification)
- [ ] Add `--state` flag to `parse` to output `EditorState` JSON
- [ ] Update `validate` to use `artoon-state` document model

### Phase 4 (Cleanup)
- [ ] Add `artoon init` project scaffolding
- [ ] Add shell completion generation
- [ ] Refactor commands to return exit codes instead of calling `process.exit()`

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
