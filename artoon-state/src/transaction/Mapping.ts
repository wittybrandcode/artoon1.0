/**
 * Mapping - Maps positions through document changes
 */

import type { Mapping, MapResult, Position } from '../types';

/**
 * A single position mapping range
 */
interface MapRange {
  from: number;
  to: number;
  newFrom: number;
  newTo: number;
}

/**
 * Mapping implementation
 */
export class MappingImpl implements Mapping {
  private ranges: MapRange[] = [];
  
  constructor(ranges: MapRange[] = []) {
    this.ranges = ranges;
  }

  /**
   * Add a replacement range
   */
  addRange(from: number, to: number, newFrom: number, newTo: number): void {
    this.ranges.push({ from, to, newFrom, newTo });
  }

  /**
   * Map a position through the changes
   */
  map(pos: Position, bias: -1 | 1 = 1): Position {
    return this.mapResult(pos, bias).pos;
  }

  /**
   * Map a position with deletion info
   */
  mapResult(pos: Position, bias: -1 | 1 = 1): MapResult {
    let deleted = false;
    let result = pos;
    let offset = 0;

    for (const range of this.ranges) {
      if (pos < range.from) {
        // Position is before this range, apply accumulated offset
        break;
      }
      
      if (pos >= range.from && pos <= range.to) {
        // Position is within deleted range
        deleted = true;
        
        if (bias === -1) {
          // Map to start of replacement
          result = range.newFrom + offset;
        } else {
          // Map to end of replacement
          result = range.newTo + offset;
        }
        break;
      }
      
      if (pos > range.to) {
        // Position is after this range, accumulate offset
        const oldSize = range.to - range.from;
        const newSize = range.newTo - range.newFrom;
        offset += newSize - oldSize;
      }
    }

    if (!deleted) {
      result = pos + offset;
    }

    return { pos: result, deleted };
  }

  /**
   * Invert the mapping
   */
  invert(): MappingImpl {
    const inverted = this.ranges.map(r => ({
      from: r.newFrom,
      to: r.newTo,
      newFrom: r.from,
      newTo: r.to
    }));
    return new MappingImpl(inverted);
  }

  /**
   * Compose with another mapping
   */
  compose(other: MappingImpl): MappingImpl {
    // Map other's ranges through this mapping
    const composed: MapRange[] = [...this.ranges];
    
    for (const range of other.ranges) {
      const mappedFrom = this.map(range.from);
      const mappedTo = this.map(range.to);
      composed.push({
        from: mappedFrom,
        to: mappedTo,
        newFrom: range.newFrom,
        newTo: range.newTo
      });
    }
    
    return new MappingImpl(composed);
  }

  /**
   * Create empty mapping
   */
  static empty(): MappingImpl {
    return new MappingImpl([]);
  }

  /**
   * Create mapping from a single replacement
   */
  static fromReplace(from: number, to: number, size: number): MappingImpl {
    const mapping = new MappingImpl();
    mapping.addRange(from, to, from, from + size);
    return mapping;
  }
}
