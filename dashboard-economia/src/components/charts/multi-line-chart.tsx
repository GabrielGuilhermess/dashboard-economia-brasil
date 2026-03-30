'use client';

import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartSkeleton } from '@/components/ui/skeleton';
import { INDICATOR_CONFIG } from '@/lib/api';
import { formatChartDate, formatCurrency, formatPercent } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboard-store';
import type { Indicator } from '@/types/economia';

export interface MultiSeriePoint {
  date: string;
  selic?: number;
  ipca?: number;
  dolar?: number;
  cdi?: number;
}

/**
 * Props do gráfico multi-linha.
 */
export interface MultiLineChartProps {
  data?: MultiSeriePoint[];
  isLoading?: boolean;
}

const indicators: Indicator[] = ['selic', 'ipca', 'dolar', 'cdi'];

export function MultiLineChart({
  data,
  isLoading = false,
}: MultiLineChartProps) {
  const activeIndicators = useDashboardStore((state) => state.activeIndicators);
  const period = useDashboardStore((state) => state.period);

  if (isLoading || !data) {
    return <ChartSkeleton height={360} />;
  }

  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Indicadores selecionados
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Evolução comparada</h2>
      </div>

      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatChartDate(value, period)}
              stroke="var(--color-text-tertiary)"
              tickLine={false}
              axisLine={false}
              minTickGap={18}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => formatPercent(Number(value), 0)}
              stroke="var(--color-text-tertiary)"
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatCurrency(Number(value), 2)}
              stroke="var(--color-text-tertiary)"
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip content={<MultiLineTooltip />} />
            <Legend />

            {indicators
              .filter((indicator) => activeIndicators.includes(indicator))
              .map((indicator) => {
                const config = INDICATOR_CONFIG[indicator];

                return (
                  <Line
                    key={indicator}
                    type="monotone"
                    dataKey={indicator}
                    name={config.label}
                    yAxisId={config.axis}
                    stroke={config.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                    animationDuration={800}
                  />
                );
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

MultiLineChart.displayName = 'MultiLineChart';

function MultiLineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-text-primary">{label}</p>
      <div className="space-y-2">
        {payload.map((item) => (
          <div key={`${item.name}-${item.color}`} className="flex items-center gap-3 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="min-w-20 text-text-secondary">{item.name}</span>
            <span className="font-semibold text-text-primary">
              {item.name === 'Dolar'
                ? formatCurrency(Number(item.value))
                : formatPercent(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
