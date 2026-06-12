/**
 * Editor State Incremental Integration
 */

import { initIncremental, updateLine, IncrementalState as ParserIncrementalState } from '@artoon/parser';
import { DocumentImpl } from './state/Document';
import type { ARTOONDocument } from '@artoon/ast';

export class IncrementalManager {
  private parserState: ParserIncrementalState;

  constructor(initialSource: string) {
    this.parserState = initIncremental(initialSource);
  }

  update(lineNumber: number, newText: string) {
    const result = updateLine(this.parserState, lineNumber, newText);
    const artoonDoc: ARTOONDocument = {
      version: '2.0',
      content: result.ast.children as any
    };
    return new DocumentImpl(artoonDoc);
  }

  getDoc() {
    const artoonDoc: ARTOONDocument = {
      version: '2.0',
      content: this.parserState.result.ast.children as any
    };
    return new DocumentImpl(artoonDoc);
  }
}
