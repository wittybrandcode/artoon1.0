import './Toolbar.css';
import { ToolbarRoot } from './ToolbarRoot';
import { ToolbarGroup } from './ToolbarGroup';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarSeparator } from './ToolbarSeparator';

export const Toolbar = {
    Root: ToolbarRoot,
    Group: ToolbarGroup,
    Button: ToolbarButton,
    Separator: ToolbarSeparator,
};

export type { ToolbarRootProps } from './ToolbarRoot';
export type { ToolbarGroupProps } from './ToolbarGroup';
export type { ToolbarButtonProps } from './ToolbarButton';
export type { ToolbarSeparatorProps } from './ToolbarSeparator';
