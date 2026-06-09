/**
 * BlockRegistry
 * 
 * Central registry for block type definitions.
 * Manages block creation, lookup, and slash menu items.
 */

import type { 
  BlockType, 
  Block, 
  BlockDefinition, 
  BlockCategory,
  AddMenuTab,
} from '../types';

/**
 * Block Registry - manages all block type definitions
 */
export class BlockRegistry {
  private definitions: Map<BlockType, BlockDefinition> = new Map();
  
  /**
   * Register a block definition
   */
  register(definition: BlockDefinition): void {
    if (this.definitions.has(definition.type)) {
      console.warn(`BlockRegistry: Overwriting existing definition for "${definition.type}"`);
    }
    this.definitions.set(definition.type, definition);
  }
  
  /**
   * Register multiple block definitions
   */
  registerAll(definitions: BlockDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }
  
  /**
   * Get a block definition by type
   */
  get(type: BlockType): BlockDefinition | undefined {
    return this.definitions.get(type);
  }
  
  /**
   * Check if a block type is registered
   */
  has(type: BlockType): boolean {
    return this.definitions.has(type);
  }
  
  /**
   * Get all registered block types
   */
  getTypes(): BlockType[] {
    return Array.from(this.definitions.keys());
  }
  
  /**
   * Get all registered definitions
   */
  getAll(): BlockDefinition[] {
    return Array.from(this.definitions.values());
  }
  
  /**
   * Create a new block of the specified type
   */
  create(type: BlockType): Block {
    const definition = this.definitions.get(type);
    if (!definition) {
      throw new Error(`BlockRegistry: Unknown block type "${type}"`);
    }
    return definition.create();
  }
  
  /**
   * Get blocks by category
   */
  getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter(def => def.category === category);
  }
  
  /**
   * Get add menu tabs with their blocks
   */
  getAddMenuTabs(): AddMenuTab[] {
    const categories: BlockCategory[] = ['text', 'list', 'media', 'advanced'];
    const labels: Record<BlockCategory, { label: string; labelAr: string }> = {
      text: { label: 'Text', labelAr: 'نصية' },
      list: { label: 'Lists', labelAr: 'قوائم' },
      media: { label: 'Media', labelAr: 'وسائط' },
      advanced: { label: 'Advanced', labelAr: 'متقدم' },
    };
    
    return categories.map(category => ({
      id: category,
      label: labels[category].label,
      labelAr: labels[category].labelAr,
      blocks: this.getByCategory(category).map(def => def.type),
    })).filter(tab => tab.blocks.length > 0);
  }
  
  /**
   * Get slash menu items (for / command)
   */
  getSlashMenuItems(): Array<{
    type: BlockType;
    name: string;
    nameAr: string;
    icon: string;
    shortcut?: string;
  }> {
    return this.getAll().map(def => ({
      type: def.type,
      name: def.name,
      nameAr: def.nameAr,
      icon: def.icon,
      shortcut: def.shortcut,
    }));
  }
  
  /**
   * Find block type by shortcut (e.g., "# " for heading1)
   */
  findByShortcut(shortcut: string): BlockDefinition | undefined {
    return this.getAll().find(def => def.shortcut === shortcut);
  }
  
  /**
   * Get types that a block can be converted to
   */
  getConvertibleTypes(fromType: BlockType): BlockType[] {
    const definition = this.definitions.get(fromType);
    return definition?.canConvertTo ?? [];
  }
  
  /**
   * Clear all registered definitions
   */
  clear(): void {
    this.definitions.clear();
  }
}

// Import default block definitions
import { defaultBlockDefinitions } from '../blocks/definitions';

// Singleton instance
let defaultRegistry: BlockRegistry | null = null;

/**
 * Get the default block registry instance
 * Auto-registers all default block definitions on first access
 */
export function getDefaultRegistry(): BlockRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new BlockRegistry();
    // Register all default block definitions automatically
    defaultRegistry.registerAll(defaultBlockDefinitions);
  }
  return defaultRegistry;
}

/**
 * Create a new block registry instance
 */
export function createBlockRegistry(): BlockRegistry {
  return new BlockRegistry();
}
