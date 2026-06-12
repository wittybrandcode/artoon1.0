# Creating Custom Block Plugins for ARTOON-TYPER

ARTOON-TYPER v2.1 uses a modular registry-based architecture. This guide explains how to create and register a new block type.

## 1. Define the Block Type
Add your new block type to `BlockType` union in `src/types.ts`.

## 2. Create the Content Component
Create a new React component in `src/ui/components/block-renderers/`.

```tsx
import React from 'react';
import { BlockRendererProps } from '../BlockRendererTypes';

export function MyCustomBlock({ block, isEditable, onUpdate }: BlockRendererProps) {
  return (
    <div className="my-custom-block">
      {/* Your rendering logic */}
    </div>
  );
}
```

## 3. Register the Definition
In `src/blocks/definitions.ts`, create a definition and add it to `defaultBlockDefinitions`.

```typescript
export const myBlockDefinition: BlockDefinition = {
  type: 'my-block',
  name: 'My Block',
  nameAr: 'بلوك مخصص',
  icon: '⭐',
  category: 'advanced',
  create: () => ({
    id: generateId('my'),
    type: 'my-block',
    // ... other properties
  }),
  component: MyCustomBlock
};
```

## 4. Performance Optimization
Use `React.memo` and `useMemo` for components that handle large arrays of data (like lists or tables) to ensure smooth performance during typing.
