'use client';

import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboard-store';
import type { Indicator } from '@/types/economia';

/**
 * Props do toggle de indicadores.
 */
export interface IndicatorToggleProps {
  className?: string;
}

const INDICATORS: Array<{
  value: Indicator;
  label: string;
  colorClass: string;
}> = [
  { value: 'selic', label: 'Selic', colorClass: 'bg-chart-selic' },
  { value: 'ipca', label: 'IPCA', colorClass: 'bg-chart-ipca' },
];

export function IndicatorToggle({ className }: IndicatorToggleProps) {
  const activeIndicators = useDashboardStore((state) => state.activeIndicators);
  const toggleIndicator = useDashboardStore((state) => state.toggleIndicator);

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {INDICATORS.map((indicator) => {
        const isActive = activeIndicators.includes(indicator.value);

        return (
          <button
            key={indicator.value}
            type="button"
            onClick={() => toggleIndicator(indicator.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
              isActive
                ? 'border-transparent bg-bg-elevated text-text-primary shadow-sm'
                : 'border-border bg-transparent text-text-secondary opacity-75 hover:opacity-100',
            )}
            aria-pressed={isActive}
          >
            <span className={cn('h-2.5 w-2.5 rounded-full', indicator.colorClass)} />
            <span>{indicator.label}</span>
          </button>
        );
      })}
    </div>
  );
}

IndicatorToggle.displayName = 'IndicatorToggle';
