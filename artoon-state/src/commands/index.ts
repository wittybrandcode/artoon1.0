/**
 * Commands module exports
 */

// Types
export { createCommand, chainCommands, canRun } from './types';
export type { NamedCommand, CommandMeta } from './types';

// Text commands
export {
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
} from './text';

// Format commands
export {
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
} from './format';

// Block commands
export {
  setParagraph,
  setHeading1,
  setHeading2,
  setHeading3,
  setHeading4,
  setHeading5,
  setHeading6,
  setBlockquote,
  setPreformatted,
  setBlockType,
  toggleBlockquote,
  setDirectionRTL,
  setDirectionLTR,
  toggleDirection,
  setDirection,
  insertHorizontalRule,
  insertBreak,
  liftBlock,
  sinkBlock,
  joinUp,
  joinDown,
  splitBlock,
  blockKeymap,
  blockCommands
} from './block';

// List commands
export {
  toggleBulletList,
  toggleOrderedList,
  toggleDefinitionList,
  toggleList,
  wrapInList,
  unwrapList,
  convertList,
  splitListItem,
  liftListItem,
  sinkListItem,
  addListItemAfter,
  addListItemBefore,
  deleteListItem,
  listKeymap,
  listCommands
} from './list';

// Table commands
export {
  insertTable,
  addRowAfter,
  addRowBefore,
  addColumnAfter,
  addColumnBefore,
  deleteRow,
  deleteColumn,
  deleteTable,
  toggleHeaderRow,
  goToNextCell,
  goToPreviousCell,
  tableKeymap,
  tableCommands
} from './table';

// Combined keymap
import { textKeymap } from './text';
import { formatKeymap } from './format';
import { blockKeymap } from './block';
import { listKeymap } from './list';
import { tableKeymap } from './table';
import type { Command } from '../types';

export const baseKeymap: Record<string, Command> = {
  ...textKeymap,
  ...formatKeymap,
  ...blockKeymap,
  ...listKeymap,
  ...tableKeymap
};

import * as _textCommands from './text';
import { formatCommands as _formatCommands } from './format';
import { blockCommands as _blockCommands } from './block';
import { listCommands as _listCommands } from './list';
import { tableCommands as _tableCommands } from './table';

// All commands grouped
export const allCommands = {
  text: _textCommands,
  format: _formatCommands,
  block: _blockCommands,
  list: _listCommands,
  table: _tableCommands
};
