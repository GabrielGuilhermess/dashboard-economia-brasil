'use client';

import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboard-store';
import type { PeriodFilter } from '@/types/economia';

/**
 * Props do seletor de período.
 */
export interface PeriodSelectorProps {
  className?: string;
}

const PERIODS: Array<{ value: PeriodFilter; label: string }> = [
  { value: '1M', label: '1M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1A' },
  { value: '5Y', label: '5A' },
  { value: '10Y', label: '10A' },
];

export function PeriodSelector({ className }: PeriodSelectorProps) {
  const period = useDashboardStore((state) => state.period);
  const setPeriod = useDashboardStore((state) => state.setPeriod);

  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-border bg-bg-secondary p-1',
        className,
      )}
      role="radiogroup"
      aria-label="Selecionar período"
    >
      {PERIODS.map((item) => {
        const isActive = item.value === period;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPeriod(item.value)}
            className={cn(
              'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-accent-primary text-text-inverse'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

PeriodSelector.displayName = 'PeriodSelector';
