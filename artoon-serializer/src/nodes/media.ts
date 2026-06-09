// ARTOON Serializer - Media Nodes

import { MediaNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';

/**
 * Serialize media node (img, video, audio, file)
 * 
 * Output:
 * {dir}.img:: path; alt; title
 * {dir}.video:: path; title
 * {dir}.audio:: path; title
 * {dir}.file:: path; label
 */
export function serializeMedia(node: MediaNode): string {
  const dir = getDirectionMarker(node.direction);
  const parts: string[] = [node.src];
  
  switch (node.mediaType) {
    case 'img':
      if (node.alt) parts.push(node.alt);
      if (node.title) parts.push(node.title);
      break;
    
    case 'video':
    case 'audio':
      if (node.title) parts.push(node.title);
      break;
    
    case 'file':
      if (node.label) parts.push(node.label);
      break;
  }
  
  return `${dir}.${node.mediaType}:: ${parts.join('; ')}`;
}
