# Transaction Engine Roadmap
**Goal:** Transition from State-Theater to Transactional Integrity.

## 1. Phase 1: The Position Resolver (Immediate)
*   **Objective:** Guarantee that every integer position in the document maps to a unique, editable character or node boundary.
*   **Tasks:**
    1.  Refactor `ResolvedPosImpl` to handle the recursive nesting of `InlineComponent` (links, code) correctly.
    2.  Implement `resolveInlineOffset(pos)` to return `{ nodeIndex, charOffset }` for any text node.
*   **Success Criteria:** 100% test coverage for position-to-node mapping in complex nested lists and compounds.

## 2. Phase 2: Functional Steps (Short Term)
*   **Objective:** Eliminate all stubs in `artoon-state/src/transaction/Step.ts`.
*   **Tasks:**
    1.  Implement `AddMarkStep.apply()`: Logic to split/merge `InlineContent` objects to apply modifiers.
    2.  Implement `RemoveMarkStep.apply()`: Logic to subtract modifiers from target ranges.
    3.  Implement Step merging: Combine multiple `ReplaceStep` objects into one during rapid typing.
*   **Success Criteria:** Formatting changes persist through a `toJSON() -> fromJSON()` cycle without Bridge intervention.

## 3. Phase 3: Consistent History (Medium Term)
*   **Objective:** Enable non-linear undo/redo.
*   **Tasks:**
    1.  Implement `Step.map()` for all step types: Allows steps in the history stack to be "shifted" based on concurrent document changes.
    2.  Implement `SelectionMapping`: Selection must follow document changes via the transaction mapping.
*   **Success Criteria:** Performing a structural change (e.g., indent list) followed by a formatting change, then undoing the structural change, leaves the formatting intact.

## 4. Phase 4: CRDT Foundation (Long Term)
*   **Objective:** Multi-user readiness.
*   **Tasks:**
    1.  Remove all DOM-direct dependencies from the transaction flow.
    2.  Standardize the `StepJSON` format for network transmission.
*   **Success Criteria:** Ability to apply a transaction received as JSON from a remote peer to a local document.
