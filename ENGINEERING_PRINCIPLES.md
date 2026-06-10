# ARTOON Engineering Principles

## 1. QUALITY OVER VELOCITY
Architecture and long-term maintainability always take precedence over quick fixes or features.

## 2. SOURCE OF TRUTH
`@artoon/ast` is the hub. No shadowing, no duplication.

## 3. SPECIFICATION FIRST
The specification is the product. Implementation is an artifact of the specification.

## 4. TYPE RIGOR
Zero use of `any`. Exhaustive pattern matching on AST nodes.

## 5. BIDI INTEGRITY
Arabic (RTL) is the primary testing target. If it works in Arabic, it will work in English.

## 6. PLUGIN ARCHITECTURE
Avoid "God Components". Registry-based extensibility for all core layers.
