// ARTOON Compound Component Handler
// Handles figure and details components

import { Direction } from '../types';
import { Token, ASTNode, CompoundNode, ParseError } from '../ast/types';

/**
 * Compound component types
 */
export type CompoundType = 'figure' | 'details';

/**
 * Valid children for compound components
 */
export const COMPOUND_CHILDREN: Record<CompoundType, string[]> = {
  figure: ['img', 'video', 'audio', 'caption', 'figcaption'],
  details: ['summary', 'p', 't1', 't2', 't3', 't4', 't5', 't6', 'ul', 'ol', 'dl', 'table', 'c', 'code']
};

/**
 * Compound parsing state
 */
export interface CompoundState {
  type: CompoundType;
  direction: Direction;
  startLine: number;
  children: ASTNode[];
}

/**
 * Create new compound state
 */
export function createCompoundState(
  type: CompoundType,
  direction: Direction,
  line: number
): CompoundState {
  return {
    type,
    direction,
    startLine: line,
    children: []
  };
}

/**
 * Check if component type is compound
 */
export function isCompoundComponent(type: string | null): boolean {
  return type === 'figure' || type === 'details';
}

/**
 * Check if token is child element (>.- or <.-)
 */
export function isChildElement(token: Token): boolean {
  return token.isChildElement;
}

/**
 * Validate child component for compound
 */
export function validateCompoundChild(
  parentType: CompoundType,
  childType: string,
  lineNumber: number
): { valid: boolean; error?: ParseError } {
  const validChildren = COMPOUND_CHILDREN[parentType];
  
  if (!validChildren.includes(childType)) {
    return {
      valid: false,
      error: {
        type: 'semantic',
        line: lineNumber,
        column: 0,
        message: `${childType} is not valid inside ${parentType}`,
        suggestion: `Valid children for ${parentType}: ${validChildren.join(', ')}`
      }
    };
  }
  
  return { valid: true };
}

/**
 * Add child to compound state
 */
export function addCompoundChild(state: CompoundState, child: ASTNode): void {
  state.children.push(child);
}

/**
 * Build compound node from state
 */
export function buildCompoundNode(state: CompoundState): CompoundNode {
  return {
    type: 'compound',
    line: state.startLine,
    direction: state.direction,
    componentType: state.type,
    children: state.children
  };
}

/**
 * Check if compound should close
 * Closes when non-child element appears
 */
export function shouldCloseCompound(token: Token): boolean {
  // Non-child component declaration closes compound
  if (token.hasComponent && !token.isChildElement) {
    return true;
  }
  
  // Block start/end closes compound
  if (token.isBlockStart || token.isBlockEnd) {
    return true;
  }
  
  return false;
}

/**
 * Parse child element type from token
 * >.-type:: content -> type
 */
export function parseChildType(token: Token): string | null {
  if (!token.isChildElement) return null;
  return token.componentType;
}

/**
 * Get required children for compound
 */
export function getRequiredChildren(type: CompoundType): string[] {
  switch (type) {
    case 'figure':
      return []; // At least one media element recommended but not required
    case 'details':
      return ['summary']; // summary is required for details
    default:
      return [];
  }
}

/**
 * Validate compound completeness
 */
export function validateCompoundComplete(
  state: CompoundState
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (state.type === 'figure' && state.children.length === 0) {
    warnings.push('figure has no children');
  }
  
  if (state.type === 'details') {
    const hasSummary = state.children.some(
      c => 'componentType' in c && (c as any).componentType === 'summary'
    );
    if (!hasSummary) {
      warnings.push('details missing summary element');
    }
  }
  
  return { valid: true, warnings };
}
