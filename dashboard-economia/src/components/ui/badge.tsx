'use client';

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * Props do badge semântico.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}

const badgeTones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-bg-secondary text-text-secondary border border-border',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
};

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

Badge.displayName = 'Badge';
