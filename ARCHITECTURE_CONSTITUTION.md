# ARTOON Architecture Constitution (v2.0)
**Version:** 2.0.0
**Approved by:** Engineering Board

## 1. IMMUTABLE ENGINEERING PRINCIPLES

### 1.1 Specification Primacy
No code shall be written for the core parser, AST, or renderer without a prior, reviewed specification in `docs/specs/`. The specification is the product.

### 1.2 The "Canonical AST" Mandate
`@artoon/ast` is the sole hub of the system.
- **Rule of Direct Dependency:** All packages interacting with content must depend directly on `@artoon/ast`.
- **Zero Shadowing:** Duplicating or mimicking AST interfaces in other packages is a critical architectural failure.

### 1.3 AI-Native by Design
- Grammar must be optimized for tokenization efficiency in LLMs.
- Syntax must avoid ambiguous states (e.g., Markdown's blank-line-based paragraphs vs ARTOON's explicit `>.p::`).

### 1.4 RTL-First Architecture
- Every content node MUST explicitly carry a `direction` property.
- Layout algorithms must treat `rtl` as the primary case.

### 1.5 Plugin-Centric Extensibility
- The visual editor (`artoon-typer`) must not contain hardcoded logic for specific blocks.
- Every block type is a plugin consisting of a:
  - **Schema** (AST structure)
  - **Renderer** (View)
  - **Controller** (Commands/State logic)
  - **Lexer/Parser rules**

### 1.6 "Zero-Any" Type Safety
- TypeScript `any` is prohibited.
- Type assertions (`as T`) are technically debt and require justification.
- CI/CD must enforce strict mode and no-explicit-any.

### 1.7 Security Point-of-Egress
- Security sanitization must happen at the latest possible stage (Rendering) but be defined in `@artoon/core` to ensure consistency.

### 1.8 Lossless Transformation
- AST-to-Source (Serialization) and Source-to-AST (Parsing) must be semantic-preserving. Round-tripping must be lossless for all defined components.
