/**
 * listTreeOps.ts
 *
 * Pure tree-manipulation helpers for ARTOON list items.
 * Every function takes `items` as input and returns new `items` — no React, no DOM.
 */

import type { ListBlock } from '../../types';

type Items = ListBlock['items'];
type ListType = 'ul' | 'ol' | 'dl';

// ── ID Generation ────────────────────────────────────────────────

/** Generate a simple unique list-item ID */
export const makeId = (): string => 'li-' + Math.random().toString(36).slice(2, 9);

// ── Content Helpers ──────────────────────────────────────────────

/** Check if item content is safe to overwrite (empty or PlainText only — no InlineComponents) */
export const isPlainTextOnly = (content: readonly any[]): boolean => {
    return content.length === 0 || content.every((c: any) => c.type === 'plain');
};

/** Update content — safe for empty items AND items with only PlainText.
 *  Items with InlineComponent (bold, italic, links) are protected. */
export const updateItemContentSafe = (items: Items, id: string, text: string): Items => {
    return items.map(item => {
        if (item.id === id) {
            if (isPlainTextOnly(item.content)) {
                return { ...item, content: text ? [{ type: 'plain' as const, value: text }] : [] };
            }
            return item; // Protect rich content
        }
        if (item.children && item.children.length > 0) {
            return { ...item, children: updateItemContentSafe(item.children, id, text) };
        }
        return item;
    });
};

// ── Insert Operations ────────────────────────────────────────────

/** Insert a new item after the item with given id (same level).
 *  The new item inherits listType from the sibling it is inserted after. */
export const insertAfterItem = (items: Items, afterId: string, newItem: any): { items: Items; inserted: boolean } => {
    const result: any[] = [];
    let inserted = false;
    for (const item of items) {
        result.push(item);
        if (item.id === afterId) {
            result.push({ ...newItem, listType: item.listType, itemType: item.itemType || 'li' });
            inserted = true;
        } else if (!inserted && item.children && item.children.length > 0) {
            const sub = insertAfterItem(item.children, afterId, newItem);
            if (sub.inserted) {
                result[result.length - 1] = { ...item, children: sub.items };
                inserted = true;
            }
        }
    }
    return { items: result, inserted };
};

/** Insert a new item as a child of the item with the given id.
 *  Child inherits parent's listType by default. */
export const insertAsChildItem = (items: Items, parentId: string, newItem: any): { items: Items; inserted: boolean } => {
    let inserted = false;
    const result = items.map(item => {
        if (item.id === parentId) {
            inserted = true;
            const childListType = item.childListType || item.listType || 'ul';
            const inheritedType = childListType === 'dl' ? 'dt' : 'li';
            return {
                ...item,
                childListType,
                children: [
                    { ...newItem, itemType: inheritedType, listType: childListType },
                    ...(item.children || [])
                ]
            };
        }
        if (!inserted && item.children && item.children.length > 0) {
            const sub = insertAsChildItem(item.children, parentId, newItem);
            if (sub.inserted) {
                inserted = true;
                return { ...item, children: sub.items };
            }
        }
        return item;
    });
    return { items: result, inserted };
};

// ── Remove / Promote ─────────────────────────────────────────────

/** Remove item by id and promote its children (elevate instead of delete).
 *  Children inherit the removed parent's listType. */
export const removeItem = (items: Items, id: string): Items => {
    return items.flatMap(item => {
        if (item.id === id) {
            return (item.children || []).map(child => ({
                ...child,
                listType: item.listType || child.listType
            }));
        }
        if (item.children && item.children.length > 0) {
            return [{ ...item, children: removeItem(item.children, id) }];
        }
        return [item];
    });
};

// ── Indent / Outdent ─────────────────────────────────────────────

/** Indent item: move it to be the last child of its previous sibling.
 *  Indented item inherits the parent's childListType. */
export const indentItem = (items: Items, id: string): { items: Items; changed: boolean } => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id && i > 0) {
            const prevSibling = items[i - 1];
            const movedItem = items[i];
            const inheritedListType = prevSibling.childListType || prevSibling.listType || movedItem.listType;
            const adjustedItem = { ...movedItem, listType: inheritedListType };
            const newChildren = [...(prevSibling.children || []), adjustedItem];
            const newItems = [...items];
            newItems[i - 1] = { ...prevSibling, children: newChildren, childListType: inheritedListType };
            newItems.splice(i, 1);
            return { items: newItems, changed: true };
        }
        if (items[i].children && items[i].children!.length > 0) {
            const sub = indentItem(items[i].children!, id);
            if (sub.changed) {
                const newItems = [...items];
                newItems[i] = { ...items[i], children: sub.items };
                return { items: newItems, changed: true };
            }
        }
    }
    return { items, changed: false };
};

/** Outdent item: move it from parent's children to after the parent.
 *  Outdented item inherits listType from the new context. */
export const outdentItem = (items: Items, id: string, parent: Items | null = null): { items: Items; changed: boolean } => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].children && items[i].children!.length > 0) {
            const childIdx = items[i].children!.findIndex(c => c.id === id);
            if (childIdx !== -1) {
                const movedItem = items[i].children![childIdx];
                const newChildren = items[i].children!.filter((_, idx) => idx !== childIdx);
                const newItems = [...items];
                newItems[i] = { ...items[i], children: newChildren.length > 0 ? newChildren : undefined };

                const inheritedType = parent ? (parent[i]?.childListType || parent[i]?.listType) : items[i].listType;
                const adjustedItem = { ...movedItem, listType: inheritedType || movedItem.listType };

                newItems.splice(i + 1, 0, adjustedItem);
                return { items: newItems, changed: true };
            }
            const sub = outdentItem(items[i].children!, id, items);
            if (sub.changed) {
                const newItems = [...items];
                newItems[i] = { ...items[i], children: sub.items };
                return { items: newItems, changed: true };
            }
        }
    }
    return { items, changed: false };
};

// ── Type Changing ────────────────────────────────────────────────

/** Change the childListType of the parent containing the item with the given id */
export const changeParentListType = (items: Items, id: string, newType: ListType): { items: Items; changed: boolean } => {
    if (items.some(item => item.id === id)) {
        return { items, changed: false };
    }
    for (let i = 0; i < items.length; i++) {
        if (items[i].children && items[i].children!.length > 0) {
            if (items[i].children!.some(c => c.id === id)) {
                const newItems = [...items];
                newItems[i] = { ...items[i], childListType: newType };
                return { items: newItems, changed: true };
            }
            const sub = changeParentListType(items[i].children!, id, newType);
            if (sub.changed) {
                const newItems = [...items];
                newItems[i] = { ...items[i], children: sub.items };
                return { items: newItems, changed: true };
            }
        }
    }
    return { items, changed: false };
};

/** Set listType on a specific item and recursively update its children */
export const setItemChildListType = (items: Items, id: string, newType: ListType): { items: Items; changed: boolean } => {
    const updateChildrenRecursively = (children: Items | undefined, type: ListType): Items | undefined => {
        if (!children || children.length === 0) return undefined;
        return children.map(child => ({
            ...child,
            listType: type,
            childListType: type,
            children: updateChildrenRecursively(child.children, type)
        }));
    };

    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            const newItems = [...items];
            newItems[i] = {
                ...items[i],
                listType: newType,
                childListType: newType,
                children: updateChildrenRecursively(items[i].children, newType)
            };
            return { items: newItems, changed: true };
        }
        if (items[i].children && items[i].children!.length > 0) {
            const sub = setItemChildListType(items[i].children!, id, newType);
            if (sub.changed) {
                const newItems = [...items];
                newItems[i] = { ...items[i], children: sub.items };
                return { items: newItems, changed: true };
            }
        }
    }
    return { items, changed: false };
};

// ── Search / Traversal ───────────────────────────────────────────

/** Find the previous sibling of a given item id in the tree.
 *  Returns { prevSibling, found } */
export const findPrevSibling = (items: Items, id: string): { prevSibling: any; found: boolean } => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return { prevSibling: i > 0 ? items[i - 1] : null, found: true };
        }
        if (items[i].children && items[i].children!.length > 0) {
            const sub = findPrevSibling(items[i].children!, id);
            if (sub.found) return sub;
        }
    }
    return { prevSibling: null, found: false };
};
