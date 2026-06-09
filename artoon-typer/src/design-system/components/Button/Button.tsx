/**
 * Button Component
 * Professional button with variants, sizes, and states
 */

import React from 'react';
import { cn } from '../../utils/cn';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'start',
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'ds-btn',
          `ds-btn--${variant}`,
          `ds-btn--${size}`,
          fullWidth && 'ds-btn--full',
          loading && 'ds-btn--loading',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="ds-btn__spinner" aria-hidden="true">
            <svg className="ds-spinner" viewBox="0 0 24 24">
              <circle
                className="ds-spinner__circle"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </span>
        )}
        {icon && iconPosition === 'start' && !loading && (
          <span className="ds-btn__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children && <span className="ds-btn__text">{children}</span>}
        {icon && iconPosition === 'end' && !loading && (
          <span className="ds-btn__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
