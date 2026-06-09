/**
 * Icon Component
 * Wrapper for Lucide React icons with consistent sizing
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  color,
  className,
}) => {
  return (
    <IconComponent
      size={ICON_SIZES[size]}
      className={cn('ds-icon', className)}
      style={{ color }}
      aria-hidden="true"
    />
  );
};

Icon.displayName = 'Icon';
