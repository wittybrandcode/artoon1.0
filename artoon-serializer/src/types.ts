// ARTOON Serializer Types

/**
 * Serialization options
 */
export interface SerializeOptions {
  /** Line ending character (default: '\n') */
  lineEnding?: '\n' | '\r\n';
  
  /** Add blank lines between elements (default: true) */
  blankLinesBetween?: boolean;
  
  /** Preserve comments in output (default: true) */
  preserveComments?: boolean;
}

/**
 * Default serialization options
 */
export const DEFAULT_OPTIONS: Required<SerializeOptions> = {
  lineEnding: '\n',
  blankLinesBetween: true,
  preserveComments: true
};

/**
 * Get direction marker from direction
 */
export function getDirectionMarker(direction: 'rtl' | 'ltr'): '>' | '<' {
  return direction === 'rtl' ? '>' : '<';
}
