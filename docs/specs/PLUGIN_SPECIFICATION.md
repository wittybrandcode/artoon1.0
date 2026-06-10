# ARTOON Plugin & Registry Specification
**Version:** 1.0.0
**Status:** DRAFT

## 1. OVERVIEW
To avoid monolithic "God Components", ARTOON uses a registry-based plugin architecture for rendering, editing, and parsing.

## 2. RENDERER REGISTRY
The HTML Renderer and the Typer Editor must use a shared or mirrored registry pattern.

### 2.1 Plugin Interface
```typescript
interface BlockPlugin {
  type: string; // e.g., 'paragraph', 'heading1'

  // The React component for the editor
  EditorView: React.ComponentType<BlockProps>;

  // The static HTML renderer logic
  renderHTML: (node: ContentNode, options: RenderOptions) => string;

  // Commands associated with this block
  commands?: Record<string, Command>;

  // Keyboard shortcuts
  keymaps?: Keymap;
}
```

### 2.2 Registry usage
```typescript
const registry = new RendererRegistry();
registry.register(ParagraphPlugin);
registry.register(HeadingPlugin);

// Usage in BlockRenderer.tsx
const Plugin = registry.get(block.type);
return <Plugin.EditorView {...props} />;
```

## 3. PARSER EXTENSIBILITY
The AST Builder should allow registration of custom block processors.

```typescript
interface BlockProcessor {
  name: string;
  process: (token: Token, state: BuilderState) => void;
}
```
