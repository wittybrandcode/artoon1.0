/**
 * caretUtils.ts
 *
 * DOM-only utilities for caret (cursor) position calculation and restoration.
 * No React dependencies — pure DOM API.
 */

/**
 * Get the caret offset relative to the container element.
 * Returns the number of characters before the caret.
 */
export function getCaretOffset(el: HTMLElement): number {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;

    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    }
    return range.startOffset;
}

/**
 * Check if the caret is at the very beginning of the element.
 */
export function isCaretAtStart(el: HTMLElement): boolean {
    const text = el.textContent || '';
    if (text === '') return true;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    const offset = getCaretOffset(el);
    if (offset === 0 && Array.from(el.childNodes).indexOf(range.startContainer as ChildNode) <= 0) {
        return true;
    }
    return false;
}

/**
 * Check if the caret is at the very end of the element.
 */
export function isCaretAtEnd(el: HTMLElement): boolean {
    const text = el.textContent || '';
    if (text === '') return true;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    return range.startOffset >= (range.startContainer.textContent?.length || 0);
}

/**
 * Split text at the current caret position.
 * Returns { textBefore, textAfter, isSplitting }.
 */
export function splitTextAtCaret(el: HTMLElement): { textBefore: string; textAfter: string; isSplitting: boolean } {
    const fullText = el.textContent || '';
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0) {
        const offset = getCaretOffset(el);
        if (offset > 0 && offset < fullText.length) {
            return {
                textBefore: fullText.slice(0, offset),
                textAfter: fullText.slice(offset),
                isSplitting: true
            };
        }
        return {
            textBefore: offset === 0 ? '' : fullText,
            textAfter: offset === 0 ? fullText : '',
            isSplitting: false
        };
    }

    return { textBefore: fullText, textAfter: '', isSplitting: false };
}

/**
 * Focus an element by data-item-id and place the caret at a specific character offset.
 */
export function focusItemAtOffset(itemId: string, offset: number): void {
    setTimeout(() => {
        const el = document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement;
        if (!el) return;

        el.focus();
        const range = document.createRange();

        const setCaret = (node: Node, targetOffset: number): boolean => {
            let currentOffset = 0;
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                if (child.nodeType === Node.TEXT_NODE) {
                    const length = child.textContent?.length || 0;
                    if (currentOffset + length >= targetOffset) {
                        range.setStart(child, targetOffset - currentOffset);
                        range.collapse(true);
                        return true;
                    }
                    currentOffset += length;
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (setCaret(child, targetOffset - currentOffset)) return true;
                    currentOffset += child.textContent?.length || 0;
                }
            }
            // Fallback to end
            range.selectNodeContents(node);
            range.collapse(false);
            return false;
        };

        setCaret(el, offset);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }, 0);
}

/**
 * Focus an element by data-item-id and place the caret at the beginning.
 */
export function focusItemAtStart(itemId: string): void {
    setTimeout(() => {
        const el = document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement;
        if (!el) return;

        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }, 0);
}
