// ARTOON Validator - Main Entry Point

// Export types
export * from './types';

// Export engine
export { 
  validate, 
  isValid, 
  validateStrict, 
  validateState,
  isValidState,
  validateStateStrict,
  formatReport,
  formatReportJSON,
  addRule,
  removeRule,
  clearRules,
  listRules
} from './engine';

// Export rules for custom validation
export {
  syntaxRules,
  structureRules,
  semanticRules,
  constraintRules,
  philosophyRules
} from './rules';

// Export error utilities
export { createError, getErrorTemplate, ERROR_CODES } from './errors';

/**
 * Validator version
 */
export const VERSION = '1.0.0';
