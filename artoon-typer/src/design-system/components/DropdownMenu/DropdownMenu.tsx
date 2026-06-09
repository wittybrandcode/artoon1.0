/**
 * DropdownMenu Component
 * Built on Radix UI DropdownMenu primitive
 */

import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItem | 'separator')[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'start',
  side = 'bottom',
}) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="ds-dropdown-menu"
          align={align}
          side={side}
          sideOffset={5}
        >
          {items.map((item, index) => {
            if (item === 'separator') {
              return (
                <DropdownMenuPrimitive.Separator
                  key={`separator-${index}`}
                  className="ds-dropdown-menu__separator"
                />
              );
            }

            return (
              <DropdownMenuPrimitive.Item
                key={item.id}
                className={cn(
                  'ds-dropdown-menu__item',
                  item.danger && 'ds-dropdown-menu__item--danger'
                )}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.icon && (
                  <span className="ds-dropdown-menu__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ds-dropdown-menu__label">{item.label}</span>
                {item.shortcut && (
                  <span className="ds-dropdown-menu__shortcut">
                    {item.shortcut}
                  </span>
                )}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
