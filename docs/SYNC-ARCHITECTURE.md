# ARTOON Synchronization Architecture
**Goal:** Eliminate O(N) bottlenecks and CPU spikes.

## 1. Current State: Full Document Replacement
The current synchronization between the visual editor (`@artoon/typer`) and the state engine is "Atomic Replacement."
*   **Flow:** `User Action` → `UI Component Update` → `StateBridge Serializes All Blocks` → `State Engine Replaced with New AST`.
*   **Complexity:** $O(N)$ where $N$ is document length.
*   **Impact:** Performance degrades linearly as documents grow. Memory churn is high due to full AST cloning.

## 2. Target State: Diff-and-Patch Transactions
Transition to a unidirectional flow where UI components emit atomic events that are translated into specific transactional steps.

### Data Flow Diagram:
```
[User Interaction]
      |
      v
[Editor Adapter] (Calculates Delta)
      |
      v
[Transaction] (List of atomic Steps: Replace, AddMark, etc.)
      |
      v
[State Engine] (Applies Steps to AST fragment)
      |
      v
[Change Event] (Emits changed sub-tree only)
      |
      v
[UI Renderers] (Re-renders affected block only)
```

## 3. Migration Strategy
1.  **Block-level Identity:** Ensure every visual block has a stable, persistent ID that maps directly to an AST node.
2.  **Stateless Components:** Refactor block renderers (e.g., `TextBlockContent`) to receive content as a prop and only emit "change requests" rather than calling `onUpdate`.
3.  **Local Diffing:** Implement a minimal diffing layer in `StateBridge` that identifies *which* block ID changed and only sends that block's content to the transaction.

## 4. Complexity Analysis
| Operation | Current (Replacement) | Target (Diff-and-Patch) |
| :--- | :--- | :--- |
| **Typing (1 char)** | $O(N)$ serialization | $O(1)$ block update |
| **Split Block** | $O(N)$ serialization | $O(1)$ transaction |
| **Apply Mark** | $O(N)$ serialization | $O(1)$ transaction |

## 5. Risk Assessment
*   **Desync Risk:** If a "Patch" fails to apply, the UI and AST can fall out of sync.
*   **Mitigation:** Retain a "Force Sync" fallback that can re-serialize the full document if transactional integrity is lost.
