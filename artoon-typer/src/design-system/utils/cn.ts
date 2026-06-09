/**
 * Utility for merging class names
 * Uses clsx for conditional classes
 */

import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
