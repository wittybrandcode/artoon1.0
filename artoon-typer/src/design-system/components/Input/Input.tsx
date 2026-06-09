/**
 * Input Component
 * Professional text input with label, hint, and error states
 */

import React, { useId } from 'react';
import { cn } from '../../utils/cn';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = 'md',
      fullWidth = false,
      icon,
      className,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const inputId = props.id || id;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className={cn('ds-input-wrapper', fullWidth && 'ds-input-wrapper--full', className)}>
        {label && (
          <label htmlFor={inputId} className="ds-input-label">
            {label}
            {required && <span className="ds-input-required" aria-label="required">*</span>}
          </label>
        )}

        <div className={cn('ds-input-container', `ds-input-container--${size}`, error && 'ds-input-container--error')}>
          {icon && (
            <span className="ds-input-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="ds-input"
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
        </div>

        {error && (
          <span id={errorId} className="ds-input-error" role="alert">
            {error}
          </span>
        )}

        {hint && !error && (
          <span id={hintId} className="ds-input-hint">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
