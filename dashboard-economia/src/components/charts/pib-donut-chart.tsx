'use client';

import { useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from 'recharts';

import { ChartSkeleton } from '@/components/ui/skeleton';
import { cn, formatCompact } from '@/lib/utils';
import type { PibSetor } from '@/types/economia';

/**
 * Props do donut de PIB por setor.
 */
export interface PibDonutChartProps {
  data?: PibSetor[];
  isLoading?: boolean;
}

const donutColors = ['#F97316', '#3B82F6', '#22C55E'];

export function PibDonutChart({
  data,
  isLoading = false,
}: PibDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading || !data) {
    return <ChartSkeleton height={320} />;
  }

  const activeSector = data[activeIndex] ?? data[0];
  const referenceYear = data[0]?.anoReferencia;

  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Composição setorial
        </p>
        <h2 className="mt-2 text-2xl font-semibold">PIB por setor</h2>
        {referenceYear ? (
          <p className="mt-2 text-sm text-text-secondary">ref. {referenceYear}</p>
        ) : null}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              innerRadius={70}
              outerRadius={100}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell key={`${entry.setor}-${index}`} fill={donutColors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((entry, index) => (
          <button
            key={entry.setor}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              activeIndex === index
                ? 'border-transparent bg-bg-secondary text-text-primary'
                : 'border-border text-text-secondary',
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: donutColors[index] }}
            />
            <span>{entry.setor}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-bg-secondary p-4">
        <p className="text-sm font-semibold text-text-primary">{activeSector.setor}</p>
        <p className="mt-1 font-display text-3xl font-semibold">
          {activeSector.percentual.toFixed(1)}%
        </p>
        <p className="text-sm text-text-secondary">
          {formatCompact(activeSector.valor * 1_000_000)}
        </p>
      </div>
    </div>
  );
}

PibDonutChart.displayName = 'PibDonutChart';

interface ActiveSectorShapeProps {
  cx?: number;
  cy?: number;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  fill?: string;
}

function renderActiveShape(props: ActiveSectorShapeProps) {
  const {
    cx = 0,
    cy = 0,
    endAngle = 0,
    fill = '#F97316',
    innerRadius = 70,
    outerRadius = 100,
    startAngle = 0,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={toRadius(innerRadius)}
      outerRadius={toRadius(outerRadius) + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

function toRadius(value: number | string | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value ?? 0);
}
