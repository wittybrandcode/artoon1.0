# Language-Driven Architecture
**Philosophy:** The Language is the Product; the Editor is the Interface.

## 1. Vision
Transform ARTOON from a "React App with a parser" into a "Document Language Ecosystem." In this model, every platform (Web, Desktop, VS Code, CLI) uses the exact same core engine for state management, validation, and transformation.

## 2. The Target Stack
1.  **Language Specification (SPEC.md):** Defines the "Ground Truth."
2.  **Canonical AST (@artoon/ast):** Strictly typed, immutable document structure.
3.  **Transactional Engine (@artoon/state):** Framework-agnostic logic for editing documents.
4.  **Adapters:**
    *   `ReactAdapter`: Syncs state to React components.
    *   `LSPAdapter`: Translates state into Language Server Protocol events.
    *   `NodeAdapter`: For CLI and Server-side processing.

## 3. Expected Benefits
*   **100% Logic Reuse:** The logic for "how a list item is promoted" is written once in `@artoon/state` and shared between the web editor and the VS Code extension.
*   **Platform Agnostic:** The core engine has zero dependencies on React or the DOM, allowing it to run in service workers or edge functions.
*   **Deterministic State:** Given a starting document and a sequence of JSON transactions, the final state is guaranteed to be identical across all platforms.

## 4. Migration Effort
*   **Step 1:** Complete the `@artoon/state` transactional engine (Phase 1 of roadmap).
*   **Step 2:** Relocate `listTreeOps.ts` and `MarkManager.ts` from UI to State engine.
*   **Step 3:** Implement the `EditorAdapter` to replace the current `EditorController`.
*   **Total Duration:** 3-4 months of focused engineering.

## 5. Success Criteria
*   The CLI can apply a "Format Bold" transaction to an ARTOON file without loading any UI code.
*   The VS Code extension provides identical "Split Block" behavior as the web playground.
