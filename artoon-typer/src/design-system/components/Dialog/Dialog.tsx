/**
 * Dialog Component
 * Built on Radix UI Dialog primitive
 */

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import './Dialog.css';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ds-dialog-overlay" />
        <DialogPrimitive.Content className={cn('ds-dialog-content', `ds-dialog-content--${size}`)}>
          {(title || showClose) && (
            <div className="ds-dialog-header">
              {title && (
                <DialogPrimitive.Title className="ds-dialog-title">
                  {title}
                </DialogPrimitive.Title>
              )}
              {showClose && (
                <DialogPrimitive.Close className="ds-dialog-close" aria-label="Close">
                  <X size={20} />
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {description && (
            <DialogPrimitive.Description className="ds-dialog-description">
              {description}
            </DialogPrimitive.Description>
          )}

          <div className="ds-dialog-body">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

Dialog.displayName = 'Dialog';

// Export sub-components for custom layouts
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
