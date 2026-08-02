# ARTOON 2.0 Platform Roadmap

> Comprehensive repair and unification roadmap for the ARTOON article format ecosystem.
> Based on analysis of all 9 systems.

---

## Executive Summary

This roadmap addresses **critical issues found across all 9 systems** during comprehensive analysis. The plan is expanded from 4 phases to **6 phases** with granular fix tasks.

### Version Strategy: ARTOON 1.0

**Decision:** All packages will be unified to version **`1.0.0`** for the first official release.

- Current `package.json` files claim `2.0.0` but this was premature — the platform has never had an official release.
- The first stable, unified release will be **ARTOON 1.0**.
- All `VERSION` constants, `package.json` versions, and documentation will reflect `1.0.0`.
- Future releases follow semver: `1.0.1` (patches), `1.1.0` (features), `2.0.0` (breaking changes).

### Critical Issues Matrix

| Issue | Systems Affected | Phase |
|-------|-----------------|-------|
| `VERSION` constant mismatch (all claim 2.0.0) | 8 systems | Phase 0 |
| Tests skipped/broken | 4 systems | Phase 0 |
| README Arabic-only | 4 systems | Phase 0 |
| Empty `version.ts` (CLI) | 1 system | Phase 0 |
| `migrate` only handles `.json` | CLI | Phase 1 |
| Missing `convert`/`format` commands | CLI | Phase 1 |
| Mutable state (Block[]) | typer | Phase 3 |
| No `artoon-state` dependency | typer | Phase 3 |
| Real-time validation not implemented | vscode | Phase 4 |

---

## Progress Overview

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| Phase 0: Platform Hygiene | Cross-cutting fixes | **Complete** | 100% |
| Phase 1: State Kernel Renaming | Rename + fix core | **Complete** | 100% |
| Phase 2: CLI Completion | Add missing commands | **Complete** | 100% |
| Phase 3: Test Crisis Recovery | Re-enable/fix tests | **Complete** | 100% |
| Phase 4: Unify State Management | Wire `artoon-state` everywhere | **Complete** | 95% |
| Phase 5: Ecosystem Enhancement | VS Code + polish | **Complete** | 90% |
| Phase 6: Cleanup & Finalization | Final hardening & Atomization | **In Progress** | 80% |

**Overall Progress:** 92% (Architectural Debt Reduction in progress)

---

## Phase 0: Platform Hygiene (Cross-Cutting Fixes)

> Fix issues that affect multiple systems simultaneously. Do this FIRST before any structural changes.

### 0.1 Unify All Versions to 1.0.0

**All packages currently claim `2.0.0` in `package.json` but the platform has never had an official release. The first release will be ARTOON 1.0.**

Update `package.json` version fields:
- [x] `artoon-ast/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-cli/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-parser/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-renderer-html/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-serializer/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-validator/package.json`: `"version": "2.0.0"` → `"1.0.0"`
- [x] `artoon-editor-state/package.json`: `"version": "2.0.0"` → `"1.0.0"` (before rename)
- [x] `artoon-typer/package.json`: `"version": "2.0.0"` → `"1.0.0"`

Update `VERSION` constants in source code:
- [x] `artoon-ast/src/index.ts`: `VERSION = '1.0'` → `'1.0.0'`
- [x] `artoon-parser/src/index.ts`: `VERSION = '1.0.0'` → keep as `'1.0.0'`
- [x] `artoon-renderer-html/src/index.ts`: `VERSION = '1.0.0'` → keep as `'1.0.0'`
- [x] `artoon-serializer/src/index.ts`: Add `VERSION = '1.0.0'`
- [x] `artoon-validator/src/index.ts`: `VERSION = '1.0.0'` → keep as `'1.0.0'`
- [x] `artoon-editor-state/src/index.ts`: `VERSION = '1.0.0'` → keep as `'1.0.0'` (before rename)
- [x] `artoon-typer/src/index.ts`: `VERSION = '1.0.0'` → keep as `'1.0.0'`
- [x] `artoon-cli/src/version.ts`: Already `'1.0.0'` (file exists at `src/version.ts`, not `src/utils/version.ts`)

**Note:** After Phase 1 rename, `artoon-editor-state` becomes `artoon-state` with `VERSION = '1.0.0'`.

### 0.2 Fix artoon-ast getStats Bug

- [x] Fix `countNodes([item.children], stats)` → `countNodes(item.children, stats)` in `src/serialize/index.ts:91`

### 0.3 artoon-cli Empty version.ts

- [x] `src/version.ts` already exists with `'1.0.0'` (path corrected from `src/utils/version.ts`)
- [x] `--version` flag works (uses existing `src/version.ts`)

### 0.4 artoon-cli migrate command fix

- [x] Fix `migrate` command to handle `.artoon` files (not just `.json`)
- [x] Add proper file extension check
- [x] Added `@artoon/serializer` dependency to CLI

### 0.5 Translate Critical READMEs to English

- [x] `artoon-renderer-html/README.md` — Added English header (bilingual)
- [x] `artoon-serializer/README.md` — Added English header (bilingual)
- [x] `artoon-validator/README.md` — Added English header (bilingual, file existed)
- [x] `artoon-editor-state/README.md` — Already bilingual (no action needed)

### 0.6 Fix artoon-typer Arabic Placeholder

- [x] Change `placeholder: 'اكتب شيئاً...'` → `'Type something...'` in `EditorController.ts`

**Deliverable:** ✅ All VERSION constants correct. CLI `--version` works. `getStats` bug fixed. Critical READMEs readable. artoon-ast tests: 85/85 pass.

---

## Phase 1: State Kernel Renaming + Core Fixes

### 1.1 Rename artoon-editor-state → artoon-state

- [x] Rename directory `artoon-editor-state/` → `artoon-state/`
- [x] Update `package.json` name field to `@artoon/state`
- [x] Update all internal import paths (no runtime imports needed rename)
- [x] `tsconfig.json` verified — no internal path aliases used
- [x] Update root `package.json` workspaces array and test script
- [x] Update `artoon.bat` build sequence
- [x] Update `PLATFORM-ROADMAP.md` references
- [x] Update analysis reports (editor-state → state)
- [x] Verify build passes after rename
- [x] Run tests to ensure no regressions

### 1.2 Fix artoon-state Default Document Version

- [x] Update `version: '1.0'` → `version: '2.0'` in `EditorState.ts` default document (AST format version)

### 1.3 Fix artoon-state Peer Dependencies

- [x] Removed unused `peerDependencies` (`@artoon/validator`, `@artoon/serializer`)

### 1.4 artoon-ast Dependency Cleanup

- [x] Move `@artoon/parser` from `dependencies` to `devDependencies` (no runtime imports)
- [x] Verify build still works

**Deliverable:** `@artoon/state` package builds and tests pass. Directory renamed.

---

## Phase 2: CLI Completion

### 2.1 Convert Command

Implement bidirectional format conversion.

- [x] `artoon convert html <file>` — ARTOON → HTML (uses existing renderer)
- [x] `artoon convert md <file>` — ARTOON → Markdown (custom markdown renderer)
- [x] `artoon convert artoon <file>` — Markdown → ARTOON (basic markdown parser)
- [x] Auto-generates output filename based on input
- [x] Add integration tests for conversion

### 2.2 Format Command

Implement pretty-printer.

- [x] `artoon format <file.artoon>` — output formatted ARTOON to stdout
- [x] `artoon format --write <file.artoon>` — overwrite in place
- [x] Uses parser → serializer pipeline for consistent formatting
- [x] Preserves comments, normalizes blank lines
- [x] Add integration tests

### 2.3 Fix artoon-cli migrate

- [x] Support `.artoon` to `.artoon` migration (parse → transform → serialize)
- [x] Keep `.json` support for AST migration
- [x] Fix `parsed.errors` undefined bug
- [x] Add 6 tests for migrate command (directory, dry-run, skip v2, upgrade v1, skip non-artoon)

**Deliverable:** CLI has 6 commands: `parse`, `render`, `validate`, `migrate`, `convert`, `format`.

---

## Phase 3: Test Crisis Recovery

> Re-enable skipped tests and add missing test coverage. This is the highest-risk phase.

### 3.1 artoon-renderer-html — Re-enable Tests (CRITICAL)

6 out of 9 test files were `.skip`. All re-enabled and fixed.

- [x] Fixed `blocks.test.ts` — custom block class expectations updated
- [x] Renamed all `.skip` files back to `.test.ts`
- [x] All 9 test files pass (121/121 tests)

### 3.2 artoon-serializer — Re-enable Roundtrip Tests

- [x] Fixed `roundtrip.test.ts` — readonly array type signature
- [x] Fixed `list.test.ts` — updated expectations to Phase 18 flat syntax
- [x] Fixed `separator.test.ts` — added required `separatorType` field
- [x] All 15 test suites pass (113/113 tests)

### 3.3 artoon-state — Add Comprehensive Tests (CRITICAL)

Grew from ~48 tests to **183 tests** across 8 suites.

- [x] `Transaction` operations (`Transaction.test.ts`: 20 tests)
- [x] `Selection` mapping (`Selection.test.ts`: 23 tests)
- [x] `History` undo/redo/grouping (`History.test.ts`: 18 tests)
- [x] `Fragment` helpers (`Fragment.test.ts`: 21 tests)
- [x] Commands — text, format, utilities (`Commands.test.ts`: 47 tests)
- [x] Document operations (`Document.test.ts`: 19 tests)
- [x] Type exports (`types.test.ts`: 12 tests)

**Result:** 183/183 tests pass

### 3.4 artoon-validator — Add Rule-Specific Tests

- [x] Added tests for `checkDirectionMarkers`
- [x] Added tests for `checkEmptyCompounds`
- [x] Added tests for `checkRequiredAttributes`
- [x] Added tests for `checkEmptyComponents`
- [x] Added tests for `checkSemanticViolation`
- [x] All 5 rule categories now covered

**Result:** 38/38 tests pass (was 33/33)

### 3.5 artoon-typer — Test Stabilization (Out of Scope)

- [x] Fix list type mismatch failures (`list` vs `bullet-list` / `numbered-list`)
- [x] Fix React mock missing `createContext` export
- [x] 1070/1070 tests pass — 0 failures in artoon-typer

**Deliverable:** All core test suites pass. No `.skip` files remain in core packages.

---

## Phase 4: Unify State Management

> Wire `artoon-state` as the canonical state engine across the platform.

### 4.1 artoon-typer — Migrate to artoon-state (MAJOR)

- [x] Add `@artoon/state` as a runtime dependency in `artoon-typer/package.json`
- [x] Create `Block[]` ↔ `EditorState` adapter layer (`StateBridge.ts`)
- [x] Refactor `EditorController` to delegate to `EditorState` (`EditorControllerV2.ts`)
  - [x] `addBlock` → `transaction.replaceWith()`
  - [x] `updateBlock` → `transaction.replaceWith()` (replace node at index)
  - [x] `removeBlock` → `transaction.replaceWith()` (replace with empty)
  - [x] `moveBlock` → remove + insert transaction sequence
- [x] Migrate history from deep-clone snapshots to inverse steps
- [x] Update selection model to use `artoon-state` selection primitives
- [x] Ensure all existing UI behavior is preserved (build + tests pass)

### 4.2 artoon-cli — State Integration

- [x] Update `parse` command to optionally output `EditorState` JSON
- [x] Update `validate` command to use `artoon-state` document model
- [x] Ensure CLI commands work with the unified state kernel

### 4.3 artoon-renderer-html — State Compatibility

- [x] Verify `render()` accepts `artoon-state` `Document.toAST()` output
- [x] Add `renderState(state)` convenience wrapper

### 4.4 artoon-serializer — State Compatibility

- [x] Add `serializeState(state)` helper for `EditorState.toJSON()`
- [x] Verify round-trip: parse → state → serialize → parse

### 4.5 Cross-System Alignment

- [x] Verify `artoon-ast` types align with `artoon-state` document model
- [x] Ensure `artoon-serializer` round-trips correctly through `artoon-state`
- [x] Ensure `artoon-renderer-html` accepts `artoon-state` document output
- [x] Ensure `artoon-validator` works with `artoon-state` document model

**Deliverable:** `artoon-state` is the single source of truth for document state across editor and CLI.

---

## Phase 5: Ecosystem Enhancement

### 5.1 vscode-artoon — Real Features

- [x] **Remove false claim** about real-time validation from README (or implement it)
- [x] Fix README installation path (old `AROON_1.0/packages/` -> current structure)
- [x] Add error diagnostics using `@artoon/parser` (red squiggles)
- [x] Add hover information for components
- [x] Add code folding for blocks
- [x] Add document outline / breadcrumb support
- [x] Add format document command
- [ ] Consider publishing to VS Code Marketplace

### 5.2 artoon-renderer-html — Enhancements

- [x] Add ARIA accessibility attributes
- [x] Add structured data (JSON-LD) output option
- [x] Improve type safety (reduce `as any` casts)
- [x] Add dual CJS/ESM build

### 5.3 artoon-validator — Enhancements

- [x] Translate error messages to English (or bilingual)
- [x] Add custom rule API (`addRule()`)
- [x] Add JSON output format for CI/CD

### 5.4 artoon-state — Enhancements

- [x] Add `ARTOONParseError` class for `parseStrict()`
- [x] Add streaming parser API (`parseStream()`)
- [x] Add performance benchmarks

**Deliverable:** VS Code extension has diagnostics. Renderer has accessibility. Validator has custom rules.

---

## Phase 6: Cleanup & Finalization

> Remove duplication and verify platform integrity.

- [x] Remove `StateAdapter` from `artoon-typer` (superseded by `artoon-state`)
- [x] Remove `EditorController` mutable state logic (superseded by `artoon-state`)
- [x] Remove duplicate history snapshot code
- [x] Review `artoon-typer/src/core/utils.ts` `deepClone` usage (kept because still required by `EditorControllerV2`)
- [x] Update `artoon-typer` exports to expose `artoon-state` types where needed
- [x] Run full monorepo build - all 8 packages compile
- [x] Run full test suite - all tests pass
- [x] Verify `artoon.bat` menu options work end-to-end
- [x] Update `START-HERE.md` with new architecture overview
- [x] Final documentation pass on `docs/`
- [x] Verify all analysis reports are still accurate post-changes

**Deliverable:** Clean, unified platform with no redundant state logic. All tests green.

---

## System Architecture (Target)

```
┌─────────────────────────────────────────────────────────────┐
│                    ARTOON 2.0 Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   artoon-typer    vscode-artoon    artoon-cli    server    │
│   (React Editor)  (Extension)      (Terminal)    (API)     │
│        │               │                │            │      │
│        └───────────────┴────────────────┴────────────┘      │
│                      @artoon/state                           │
│              (Unified State Kernel)                          │
│                         │                                   │
│              ┌──────────┼──────────┐                        │
│              ▼          ▼          ▼                        │
│         @artoon/ast  @artoon/  @artoon/                     │
│                      parser    serializer                    │
│         @artoon/      @artoon/                               │
│         validator     renderer-html                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## System Health Scorecard (Current)

| System | Score | Critical Issue |
|--------|-------|---------------|
| artoon-ast | 8.5/10 | Stable core and test coverage complete |
| artoon-cli | 8.3/10 | Full command surface complete |
| artoon-parser | 8.8/10 | Strict error class + streaming parser + benchmarks |
| artoon-renderer-html | 8.9/10 | Accessibility + dual build + state support |
| artoon-serializer | 8.9/10 | State round-trip coverage complete |
| artoon-validator | 8.7/10 | Bilingual errors + custom rules + CI JSON output |
| artoon-state | 8.8/10 | Canonical kernel with broad test coverage |
| artoon-typer | 8.8/10 | Legacy state path removed, full suite green |
| vscode-artoon | 8.6/10 | Diagnostics, hover, folding, symbols, formatting live |

**Average:** 8.7/10

**Target after roadmap:** 8.5+/10 for all systems.

---

## Tracking Notes

Use this section to log decisions, blockers, and completion dates as work progresses.

| Date | Phase | Note |
|------|-------|------|
| 2026-04-27 | Phase 3 | Test Crisis Recovery complete. 183 state tests, 121 renderer tests, 113 serializer tests, 38 validator tests. All core packages green. |
| 2026-05-10 | Phase 4 | artoon-typer EditorControllerV2 + StateBridge created. `@artoon/state` integrated as dependency. `tsc` + `vite build` pass. History migrated to inverse steps. Selection model + runtime testing pending. |
| 2026-05-17 | Phase 4 | Completed 4.1 remaining tasks: selection model now synced through `@artoon/state` primitives and regression-tested (`1077/1077` typer tests pass). Completed 4.2 CLI integration: `parse --state` outputs `EditorState` JSON and `validate` runs through state document model (`34/34` CLI tests pass). |
| 2026-05-17 | Phase 4 | Completed 4.3 + 4.4: renderer now has `renderState(state)` and verified `render(Document.toAST())` compatibility (`124/124` renderer tests pass). Serializer now has `serializeState(state)` and state-based round-trip tests (`114/114` serializer tests pass). |
| 2026-05-17 | Phase 4 | Completed 4.5 cross-system alignment: added `@artoon/state` compatibility tests in `artoon-state` and `artoon-validator` (`184/184` state tests, `41/41` validator tests). Added `validateState`/`isValidState`/`validateStateStrict` helper APIs for state-driven validation. |

| 2026-05-25 | Phase 5-6 | Completed vscode real features, renderer accessibility/JSON-LD/dual build, validator custom rules + JSON CI output, parser strict error + streaming + benchmark, typer legacy cleanup. Full monorepo build and tests pass. |
| 2026-06-07 | Phase 6 | Atomized "God Component" (BlockRenderer.tsx). Hardened security with sanitizeUrl. Identified artoon-state Mark stubs. |
---

*Last updated: 2026-05-25*
*Roadmap version: 2.0 (post-analysis)*

