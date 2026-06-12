/**
 * BlockRenderer
 * 
 * Renders the content of a block based on its type using the BlockRegistry.
 */

import React from 'react';
import { BlockRendererProps } from './BlockRendererTypes';
import { getDefaultRegistry } from '../../core/BlockRegistry';

export function BlockRenderer(props: BlockRendererProps) {
  const { block } = props;
  const registry = getDefaultRegistry();
  const definition = registry.get(block.type);

  if (definition && definition.component) {
    const Component = definition.component;
    // Pass BlockRenderer as the renderBlock function to handle recursion
    return <Component {...props} renderBlock={BlockRenderer} />;
  }

  return (
    <div className="block__content">
       (نوع البلوك {block.type} غير مدعوم في هذا الإصدار)
    </div>
  );
}

export default BlockRenderer;
