# ARTOON AI Constitution

## 1. VISION
ARTOON is designed to be the native tongue of Large Language Models (LLMs) for document authoring.

## 2. LLM-CENTRIC PRINCIPLES

### 2.1 Low-Ambiguity Tokenization
The grammar uses explicit line-prefixes (`>.p::`) rather than implicit whitespace. This reduces "syntax hallucinations" by providing clear, early indicators of content type to the transformer's attention mechanism.

### 2.2 Semantic Preservation
AI agents often struggle with nested context. ARTOON's dash-based nesting (`-li::`) provides a clear, locally-visible indicator of depth on every line, making it easier for AI to maintain hierarchical state.

### 2.3 DB-Friendly Output
AI pipelines that store generated content benefit from ARTOON's single-table storage strategy. Metadata is embedded in `<meta>.` blocks, eliminating the need for external state management in the generation loop.

### 2.4 Prompt-Driven Extensibility
Custom blocks are designed to be easily "taught" to LLMs via system prompts, as they follow a predictable `<name>.` pattern.
