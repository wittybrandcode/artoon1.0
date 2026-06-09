# Typer UI Manual Validation Matrix

Use a desktop browser and repeat the core editing checks once with mouse input and once with keyboard-only navigation.

| Area | Scenario | Expected result |
| --- | --- | --- |
| RTL/LTR | Start in RTL, add Arabic text, switch a block to LTR, add Latin text, then switch it back | Caret, alignment, block direction, and status remain consistent per block |
| Block operations | Add paragraph, heading, list, quote, and media blocks; duplicate, move, convert, and delete a middle block | Order and content remain correct; focus follows the intended block; no accidental drag starts |
| Undo/redo | Perform add, edit, move, convert, and delete actions; use toolbar undo/redo and `Ctrl+Z` / `Ctrl+Y` where supported | History reverses and reapplies each action in order without losing content or focus unexpectedly |
| Import/export | Import a mixed RTL/LTR ARTOON document with inline marks, lists, links, and media; export and re-import it | Export is valid and the second import preserves content, order, direction, and supported formatting |
| Keyboard menus | Open the slash menu, move through choices, select an item, dismiss with `Escape`; open block menus and dismiss with `Escape` | Menus are reachable, selection is visible, actions run once, and dismissal returns safely to editing |
| Keyboard shortcuts | With a caret and with selected text, exercise `Ctrl+B`, `Ctrl+I`, `Ctrl+U`, and `Ctrl+K`; dismiss overlays with `Escape` | Formatting shortcuts run once, link dialog opens only for selected text, and `Escape` closes open overlays |
| Accessibility | Navigate toolbar and menus with keyboard only; inspect buttons with a screen reader or accessibility tree | Toolbar has toolbar semantics; icon buttons have names; toggle buttons expose pressed state; disabled controls are announced |
| Accessibility | Zoom to 200% and test narrow viewport layout in RTL and LTR | Controls remain operable, visible focus is not clipped, and content does not overlap essential actions |
