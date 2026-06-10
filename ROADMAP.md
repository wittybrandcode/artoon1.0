# ARTOON Strategic Roadmap 3.0 (Organization-Wide)
**Status:** SUPERCEDED v2.0
**Approved by:** CTO, Principal Architect, Compiler Board

## 1. CORE MISSION: THE "JSON OF DOCUMENTS"
Transform ARTOON from a project into an industry-standard, specification-driven platform for structured content in the LLM era.

## 2. REVIEWS & IMPROVEMENTS (PHASE 2)

### 2.1 URL Sanitization (Roadmap v2.0)
- **Status:** APPROVED & ENHANCED.
- **Improvement:** Move from simple whitelisting to a dedicated `@artoon/core` security middleware. Add specific checks for Homoglyph attacks in URLs.

### 2.2 BaseNode Unification
- **Status:** APPROVED.
- **Improvement:** Enforce via a **Build-time Contract**. The CI/CD pipeline should verify that `@artoon/ast` is the exclusive source for all Node interfaces across all packages.

### 2.3 Plugin Architecture (Typer)
- **Status:** APPROVED & REPLACED.
- **Replacement:** Implement a **Universal Plugin System**. Registry should handle not just rendering, but also Keyboard Shortcuts, Commands, and State Transformations for each block type.

### 2.4 Tree-sitter & LSP
- **Status:** UPGRADED TO V1.0 PRIORITY.
- **Reason:** Real-time feedback is the only way to achieve developer adoption.

---

## 3. NEW STRATEGIC PILLARS

### 3.1 Specification Supremacy
- Implementation must follow a formal, versioned Language Specification.
- Reference implementation must be validated against a Reference Test Suite of 5000+ cases.

### 3.2 AI Adversarial Hardening
- Use automated red-teaming (LLMs trying to break the grammar) to harden the parser's error recovery mechanisms.

### 3.3 Collaborative Operations
- Transition state synchronization from AST-sync to **Operational Transform (OT) / CRDT** based on atomic operations (`InsertNode`, `DeleteNode`, `MoveNode`).
