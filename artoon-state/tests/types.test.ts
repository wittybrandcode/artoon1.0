/**
 * Type definition tests for @artoon/editor-state
 * 
 * These tests verify that types are correctly defined and exported.
 * They primarily test compile-time behavior.
 */

import type {
  Position,
  ResolvedPos,
  Selection,
  TextSelection,
  NodeSelection,
  AllSelection,
  Document,
  Fragment,
  Slice,
  Step,
  Transaction,
  EditorState,
  EditorStateConfig,
  Command,
  Dispatch,
  Plugin,
  PluginKey,
  HistoryState,
  Modifier,
  Direction
} from '../src';

import { VERSION } from '../src';

describe('@artoon/editor-state types', () => {
  describe('VERSION', () => {
    it('should export VERSION constant', () => {
      expect(VERSION).toBe('1.0.0');
    });
  });

  describe('Position type', () => {
    it('should be a number', () => {
      const pos: Position = 5;
      expect(typeof pos).toBe('number');
    });
  });

  describe('Direction type', () => {
    it('should accept rtl', () => {
      const dir: Direction = 'rtl';
      expect(dir).toBe('rtl');
    });

    it('should accept ltr', () => {
      const dir: Direction = 'ltr';
      expect(dir).toBe('ltr');
    });
  });

  describe('Modifier type', () => {
    it('should accept valid modifiers', () => {
      const modifiers: Modifier[] = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'];
      expect(modifiers).toHaveLength(7);
    });
  });

  describe('Selection types', () => {
    it('should have correct type discriminators', () => {
      // Type-level test - these would fail at compile time if wrong
      const textType: TextSelection['type'] = 'text';
      const nodeType: NodeSelection['type'] = 'node';
      const allType: AllSelection['type'] = 'all';
      
      expect(textType).toBe('text');
      expect(nodeType).toBe('node');
      expect(allType).toBe('all');
    });
  });

  describe('Command type', () => {
    it('should accept valid command signature', () => {
      // This is a compile-time test
      const mockCommand: Command = (state, dispatch) => {
        if (dispatch) {
          // Would dispatch transaction
        }
        return true;
      };
      
      expect(typeof mockCommand).toBe('function');
    });
  });

  describe('EditorStateConfig', () => {
    it('should accept minimal config', () => {
      const config: EditorStateConfig = {};
      expect(config).toBeDefined();
    });

    it('should accept full config', () => {
      const config: EditorStateConfig = {
        doc: undefined,
        selection: undefined,
        plugins: []
      };
      expect(config.plugins).toEqual([]);
    });
  });
});

describe('Type compatibility with @artoon/ast', () => {
  it('should re-export AST types', () => {
    // These imports would fail at compile time if not exported
    const testDirection: Direction = 'rtl';
    const testModifier: Modifier = 's';
    
    expect(testDirection).toBe('rtl');
    expect(testModifier).toBe('s');
  });
});
