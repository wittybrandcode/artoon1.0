/**
 * Command tests
 */

import { DocumentImpl } from '../../src/state/Document';
import { EditorStateImpl } from '../../src/state/EditorState';
import { TextSelectionImpl } from '../../src/selection/Selection';
import type { Transaction } from '../../src/types';
import {
  insertText,
  deleteBackward,
  deleteForward,
  deleteWordBackward,
  deleteWordForward,
  selectAll,
  insertLineBreak,
  insertParagraph,
  joinBackward,
  joinForward,
  textKeymap
} from '../../src/commands/text';
import {
  toggleStrong,
  toggleEmphasis,
  toggleUnderline,
  toggleStrikethrough,
  toggleHighlight,
  toggleSubscript,
  toggleSuperscript,
  toggleInlineCode,
  toggleMark,
  addMark,
  removeMark,
  clearMarks,
  isMarkActive,
  formatKeymap,
  formatCommands
} from '../../src/commands/format';
import {
  createCommand,
  chainCommands,
  canRun
} from '../../src/commands/types';

function createState(content: string[], selFrom?: number, selTo?: number): EditorStateImpl {
  const doc = DocumentImpl.create({
    version: '1.0',
    content: content.map((text, i) => ({
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: i + 1,
      content: [{ type: 'plain', value: text }]
    }))
  });
  const selection = TextSelectionImpl.create(doc, selFrom ?? 1, selTo ?? (selFrom ?? 1));
  return EditorStateImpl.create({ doc, selection });
}

describe('Text Commands', () => {
  describe('insertText', () => {
    it('should return true when dispatch provided', () => {
      const state = createState(['']);
      let tr: Transaction | undefined;
      const result = insertText('مرحباً')(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });

    it('should return true without dispatch', () => {
      const state = createState(['']);
      const result = insertText('مرحباً')(state, undefined);
      expect(result).toBe(true);
    });
  });

  describe('deleteBackward', () => {
    it('should delete selection when not empty', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = deleteBackward(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });

    it('should delete one character backward', () => {
      const state = createState(['مرحباً'], 3, 3);
      let tr: Transaction | undefined;
      const result = deleteBackward(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });

    it('should return false at document start', () => {
      const state = createState([''], 0, 0);
      const result = deleteBackward(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('deleteForward', () => {
    it('should delete selection when not empty', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = deleteForward(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });

    it('should delete one character forward', () => {
      const state = createState(['مرحباً'], 1, 1);
      let tr: Transaction | undefined;
      const result = deleteForward(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });

    it('should return false at document end', () => {
      const doc = DocumentImpl.create({
        version: '1.0',
        content: [{
          type: 'text', nodeType: 'text', textType: 'p',
          direction: 'rtl', line: 1, content: [{ type: 'plain', value: 'a' }]
        }]
      });
      const state = EditorStateImpl.create({
        doc,
        selection: TextSelectionImpl.at(doc.size - 1, doc)
      });
      const result = deleteForward(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('deleteWordBackward', () => {
    it('should delete word backward', () => {
      const state = createState(['مرحباً بالعالم'], 8, 8);
      let tr: Transaction | undefined;
      const result = deleteWordBackward(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });

    it('should fall back to deleteBackward when at start', () => {
      const state = createState([''], 0, 0);
      const result = deleteWordBackward(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('deleteWordForward', () => {
    it('should delete word forward', () => {
      const state = createState(['مرحباً بالعالم'], 1, 1);
      let tr: Transaction | undefined;
      const result = deleteWordForward(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('selectAll', () => {
    it('should select all content', () => {
      const state = createState(['مرحباً']);
      let tr: Transaction | undefined;
      const result = selectAll(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });
  });

  describe('insertLineBreak', () => {
    it('should insert newline', () => {
      const state = createState(['']);
      let tr: Transaction | undefined;
      const result = insertLineBreak(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });
  });

  describe('insertParagraph', () => {
    it('should insert paragraph break', () => {
      const state = createState(['']);
      let tr: Transaction | undefined;
      const result = insertParagraph(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });
  });

  describe('joinBackward', () => {
    it('should return false when not at block start', () => {
      const state = createState(['مرحباً'], 3, 3);
      const result = joinBackward(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('joinForward', () => {
    it('should return false when not at block end', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = joinForward(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('textKeymap', () => {
    it('should contain expected keys', () => {
      expect(textKeymap['Backspace']).toBe(deleteBackward);
      expect(textKeymap['Delete']).toBe(deleteForward);
      expect(textKeymap['Ctrl-a']).toBe(selectAll);
      expect(textKeymap['Enter']).toBe(insertParagraph);
      expect(textKeymap['Shift-Enter']).toBe(insertLineBreak);
    });
  });
});

describe('Format Commands', () => {
  describe('toggleStrong', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = toggleStrong(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch when selection not empty', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleStrong(state, (t) => { tr = t; });
      expect(result).toBe(true);
      expect(tr).toBeDefined();
    });
  });

  describe('toggleEmphasis', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleEmphasis(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleUnderline', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleUnderline(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleStrikethrough', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleStrikethrough(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleHighlight', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleHighlight(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleSubscript', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleSubscript(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleSuperscript', () => {
    it('should work with non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleSuperscript(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleInlineCode', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = toggleInlineCode(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch when selection not empty', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleInlineCode(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('toggleMark', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = toggleMark('s')(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch for non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = toggleMark('e')(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('addMark', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = addMark('s')(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch for non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = addMark('u')(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('removeMark', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = removeMark('s')(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch for non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = removeMark('d')(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('clearMarks', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      const result = clearMarks(state, undefined);
      expect(result).toBe(false);
    });

    it('should dispatch for non-empty selection', () => {
      const state = createState(['مرحباً'], 1, 3);
      let tr: Transaction | undefined;
      const result = clearMarks(state, (t) => { tr = t; });
      expect(result).toBe(true);
    });
  });

  describe('isMarkActive', () => {
    it('should return false for empty selection', () => {
      const state = createState(['مرحباً'], 1, 1);
      expect(isMarkActive(state, 's')).toBe(false);
    });
  });

  describe('formatKeymap', () => {
    it('should contain expected keys', () => {
      expect(formatKeymap['Ctrl-b']).toBe(toggleStrong);
      expect(formatKeymap['Ctrl-i']).toBe(toggleEmphasis);
      expect(formatKeymap['Ctrl-u']).toBe(toggleUnderline);
    });
  });

  describe('formatCommands', () => {
    it('should export all format commands', () => {
      expect(formatCommands.toggleStrong).toBe(toggleStrong);
      expect(formatCommands.toggleMark).toBe(toggleMark);
      expect(formatCommands.clearMarks).toBe(clearMarks);
    });
  });
});

describe('Command Utilities', () => {
  describe('createCommand', () => {
    it('should create named command', () => {
      const cmd = createCommand('test', (state, dispatch) => {
        if (dispatch) dispatch(state.tr);
        return true;
      });
      expect(cmd.name).toBe('test');
      expect(typeof cmd.run).toBe('function');
    });

    it('should include metadata', () => {
      const cmd = createCommand('test', () => true, {
        description: 'A test command',
        shortcut: 'Ctrl-t'
      });
      expect(cmd.description).toBe('A test command');
      expect(cmd.shortcut).toBe('Ctrl-t');
    });
  });

  describe('chainCommands', () => {
    it('should run first successful command', () => {
      const cmd1 = jest.fn(() => false);
      const cmd2 = jest.fn(() => true);
      const chained = chainCommands(cmd1, cmd2);
      const state = createState(['']);
      const result = chained(state, undefined);
      expect(result).toBe(true);
      expect(cmd1).toHaveBeenCalled();
      expect(cmd2).toHaveBeenCalled();
    });

    it('should return false if all fail', () => {
      const cmd1 = jest.fn(() => false);
      const cmd2 = jest.fn(() => false);
      const chained = chainCommands(cmd1, cmd2);
      const state = createState(['']);
      const result = chained(state, undefined);
      expect(result).toBe(false);
    });
  });

  describe('canRun', () => {
    it('should return true when command can run', () => {
      const cmd = (state: any, dispatch?: any) => true;
      const check = canRun(cmd);
      const state = createState(['']);
      expect(check(state)).toBe(true);
    });

    it('should return false when command cannot run', () => {
      const cmd = (state: any, dispatch?: any) => false;
      const check = canRun(cmd);
      const state = createState(['']);
      expect(check(state)).toBe(false);
    });
  });
});
