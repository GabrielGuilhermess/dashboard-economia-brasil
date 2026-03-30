'use client';

import { cn } from '@/lib/utils';

/**
 * Props compartilhadas para os skeletons.
 */
export interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: string;
}

export function Skeleton({
  className,
  width,
  height,
  rounded = 'rounded-2xl',
}: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', rounded, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

Skeleton.displayName = 'Skeleton';

export function CardSkeleton() {
  return <Skeleton className="h-28 w-full rounded-[1.5rem]" />;
}

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Props do skeleton de gráfico.
 */
export interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 320 }: ChartSkeletonProps) {
  return <Skeleton className="w-full rounded-[1.75rem]" height={height} />;
}

ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Props do skeleton de tabela.
 */
export interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton
            key={`table-skeleton-row-${index}`}
            className="h-12 w-full rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

TableSkeleton.displayName = 'TableSkeleton';

export function MapSkeleton() {
  return <Skeleton className="h-[420px] w-full rounded-[1.75rem]" />;
}

MapSkeleton.displayName = 'MapSkeleton';
