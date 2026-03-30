'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartSkeleton } from '@/components/ui/skeleton';
import { formatCompact } from '@/lib/utils';
import type { PibEstado } from '@/types/economia';

/**
 * Props do gráfico de barras do PIB por UF.
 */
export interface PibBarChartProps {
  data?: PibEstado[];
  isLoading?: boolean;
}

const palette = [
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#4f8cf8',
  '#5f99fa',
  '#73a7fb',
  '#86b4fd',
  '#9abffe',
  '#bad3fe',
  '#dbeafe',
];

export function PibBarChart({ data, isLoading = false }: PibBarChartProps) {
  if (isLoading || !data) {
    return <ChartSkeleton height={320} />;
  }

  const chartData = [...data]
    .sort((left, right) => right.valor - left.valor)
    .slice(0, 10)
    .reverse();

  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Top 10 estados
        </p>
        <h2 className="mt-2 text-2xl font-semibold">PIB por unidade federativa</h2>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 18 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--color-text-tertiary)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompact(Number(value) * 1_000_000)}
            />
            <YAxis
              type="category"
              dataKey="uf"
              stroke="var(--color-text-tertiary)"
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip content={<PibBarTooltip />} />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
              {chartData.map((item, index) => (
                <Cell key={`${item.uf}-${index}`} fill={palette[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

PibBarChart.displayName = 'PibBarChart';

function PibBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PibEstado }>;
}) {
  const item = payload?.[0]?.payload;

  if (!active || !item) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3 shadow-xl">
      <p className="font-semibold text-text-primary">{item.nome}</p>
      <p className="mt-2 text-sm text-text-secondary">
        PIB: <span className="font-semibold text-text-primary">{formatCompact(item.valor * 1_000_000)}</span>
      </p>
      <p className="text-sm text-text-secondary">
        Participação: <span className="font-semibold text-text-primary">{item.participacao.toFixed(2)}%</span>
      </p>
    </div>
  );
}
