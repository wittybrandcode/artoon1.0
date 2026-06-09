/**
 * Command types
 */

import type { EditorState, Transaction, Dispatch, Command } from '../types';

/**
 * Re-export command types
 */
export type { Command, Dispatch };

/**
 * Command with metadata
 */
export interface CommandMeta {
  /** Command name */
  name: string;
  /** Command description */
  description?: string;
  /** Default keyboard shortcut */
  shortcut?: string;
  /** Icon name */
  icon?: string;
}

/**
 * Named command with metadata
 */
export interface NamedCommand extends CommandMeta {
  /** The command function */
  run: Command;
}

/**
 * Create a named command
 */
export function createCommand(
  name: string,
  run: Command,
  meta?: Partial<CommandMeta>
): NamedCommand {
  return {
    name,
    run,
    ...meta
  };
}

/**
 * Chain multiple commands - runs first that returns true
 */
export function chainCommands(...commands: Command[]): Command {
  return (state, dispatch) => {
    for (const cmd of commands) {
      if (cmd(state, dispatch)) {
        return true;
      }
    }
    return false;
  };
}

/**
 * Create command that only checks if it can run (no dispatch)
 */
export function canRun(command: Command): (state: EditorState) => boolean {
  return (state) => command(state);
}
