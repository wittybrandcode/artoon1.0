/**
 * Compatibility entrypoint for EditorController.
 *
 * Mutable V1 implementation was removed.
 * This file now re-exports the state-backed V2 controller.
 */

export { EditorController, createEditorController } from './EditorControllerV2';
export { default } from './EditorControllerV2';
