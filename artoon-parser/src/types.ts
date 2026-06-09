// ARTOON Parser - Core Type Definitions

/**
 * Direction of content
 * RTL = Arabic/Hebrew (>)
 * LTR = English/Latin (<)
 */
export type Direction = 'rtl' | 'ltr';

/**
 * Text-based components that accept modifiers
 */
export type TextComponent = 'p' | 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 'q' | 'pre';

/**
 * Semantic components
 */
export type SemanticComponent = 'time' | 'abbr';

/**
 * Link/Media components - DO NOT accept modifiers
 */
export type MediaComponent = 'a' | 'img' | 'video' | 'audio' | 'file';

/**
 * Separator components - no content (no ::)
 */
export type SeparatorComponent = 'br' | 'hr' | 'wbr';

/**
 * List components
 */
export type ListComponent = 'ul' | 'ol' | 'dl' | 'li' | 'dt' | 'dd';

/**
 * Table components
 */
export type TableComponent = 'table' | 'th' | 'tr';

/**
 * Compound components
 */
export type CompoundComponent = 'figure' | 'details';

/**
 * Compound child components
 */
export type CompoundChildComponent = 'summary' | 'caption' | 'figcaption';

/**
 * Code component
 */
export type CodeComponent = 'c';

/**
 * All component types
 */
export type ComponentType =
  | TextComponent
  | SemanticComponent
  | MediaComponent
  | SeparatorComponent
  | ListComponent
  | TableComponent
  | CompoundComponent
  | CompoundChildComponent
  | CodeComponent;

/**
 * Text modifiers - ONLY for text-based components
 * s=strong, e=emphasis, u=underline, d=delete, mark, sub, sup
 */
export type Modifier = 's' | 'e' | 'u' | 'd' | 'mark' | 'sub' | 'sup';

/**
 * Components that accept modifiers
 */
export const MODIFIER_ACCEPTING_COMPONENTS: readonly string[] = [
  'p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre',
  'a', 'abbr', 'time'
] as const;

/**
 * Components that DO NOT accept modifiers
 */
export const NO_MODIFIER_COMPONENTS: readonly string[] = [
  'img', 'audio', 'video', 'file', 'c'
] as const;

/**
 * Separator components (no :: needed)
 */
export const SEPARATOR_COMPONENTS: readonly string[] = ['br', 'hr', 'wbr'] as const;

/**
 * All valid modifiers
 */
export const VALID_MODIFIERS: readonly Modifier[] = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'] as const;

/**
 * All valid component types
 */
export const VALID_COMPONENTS: readonly string[] = [
  // Text
  'p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre',
  // Semantic
  'time', 'abbr',
  // Media
  'a', 'img', 'video', 'audio', 'file',
  // Separators
  'br', 'hr', 'wbr',
  // Lists
  'ul', 'ol', 'dl', 'li', 'dt', 'dd',
  // Tables
  'table', 'th', 'tr',
  // Compound
  'figure', 'details',
  // Compound children
  'summary', 'caption', 'figcaption',
  // Code
  'c'
] as const;
