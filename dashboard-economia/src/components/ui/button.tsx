'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * Props do botão reutilizável.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent-primary text-text-inverse shadow-md hover:opacity-95',
  secondary:
    'bg-bg-secondary text-text-primary border border-border hover:bg-bg-tertiary',
  ghost:
    'bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
};

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

Button.displayName = 'Button';
