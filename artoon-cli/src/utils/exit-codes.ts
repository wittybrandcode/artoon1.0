export const ExitCodes = {
  SUCCESS: 0,
  SYNTAX_ERROR: 1,
  VALIDATION_ERROR: 2,
  PHILOSOPHY_BREACH: 3,
  FILE_NOT_FOUND: 4,
  IO_ERROR: 5,
  UNKNOWN_ERROR: 99,
} as const;

export type ExitCode = typeof ExitCodes[keyof typeof ExitCodes];
