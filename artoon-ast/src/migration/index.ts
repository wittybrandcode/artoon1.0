import { ARTOONDocument, ContentNode, ListNode, ListItem, SeparatorNode } from '../types';
import { visitNodes } from '../nodes';

/**
 * Migrates a V1.x ARTOON AST Document to the clean V2.0 format.
 * This prepares for V3.0 where compat types will be fully removed.
 * 
 * Target transformations:
 * 1. Convert `nodeType` to `type`.
 * 2. Delete all instances of `nodeType` and `elementCount`.
 * 3. Convert List `children` -> pure `ListItem[]` in `items`.
 * 4. Convert Separator `separators[]` -> `separatorType`.
 */
export function migrateToV2(oldDoc: any): ARTOONDocument {
    // Deep clone the object
    const doc = JSON.parse(JSON.stringify(oldDoc));

    // Set the new target version
    doc.version = '2.0';

    // Deep traversal and mutation
    const migrateNode = (node: any) => {
        // 1 & 2. Migrate nodeType -> type
        if (node.nodeType) {
            if (!node.type) {
                node.type = node.nodeType;
            }
            delete node.nodeType;
        }

        if (node.elementCount !== undefined) {
            delete node.elementCount;
        }

        // 3. Migrate List nodes
        if (node.type === 'list') {
            const listNode = node as any;

            // If the list has legacy `children` array containing ListNodes with items
            if (listNode.children && Array.isArray(listNode.children)) {
                if (listNode.children.length > 0 && listNode.children[0].items) {
                    listNode.items = listNode.children[0].items;
                } else {
                    listNode.items = listNode.children;
                }
                delete listNode.children;
            }

            // Cleanup nested children in items if any
            if (listNode.items && Array.isArray(listNode.items)) {
                listNode.items.forEach((item: any) => {
                    if (item.children) delete item.children;
                    if (item.elementCount !== undefined) delete item.elementCount;
                });
            }
        }

        // 4. Migrate Separator nodes
        if (node.type === 'separator') {
            const sepNode = node as any;
            if (sepNode.separators && Array.isArray(sepNode.separators) && sepNode.separators.length > 0) {
                sepNode.separatorType = sepNode.separators[0];
                delete sepNode.separators;
            } else if (!sepNode.separatorType) {
                sepNode.separatorType = 'hr'; // Defualt fallback
            }
        }
    };

    if (doc.content) {
        visitNodes(doc.content, migrateNode);
    }

    return doc as ARTOONDocument;
}
