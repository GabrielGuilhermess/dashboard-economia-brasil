'use client';

import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SummaryCard } from '@/types/economia';

/**
 * Props dos cards de resumo.
 */
export interface SummaryCardsProps {
  cards?: SummaryCard[];
  isLoading?: boolean;
  isStale?: boolean;
  updatedAt?: string;
}

const colorMap: Record<SummaryCard['color'], { icon: string; iconBg: string }> = {
  sky: {
    icon: 'text-sky-600 dark:text-sky-300',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  rose: {
    icon: 'text-rose-600 dark:text-rose-300',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
};

export function SummaryCards({
  cards,
  isLoading = false,
  isStale = false,
  updatedAt,
}: SummaryCardsProps) {
  if (isLoading || !cards) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={`summary-card-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  const staleHours = updatedAt
    ? Math.max(
        1,
        Math.round((Date.now() - new Date(updatedAt).getTime()) / 3_600_000),
      )
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const isGood = card.invertSentiment ? card.change < 0 : card.change >= 0;
        const accent = colorMap[card.color];

        return (
          <article
            key={card.id}
            className="card fade-in relative rounded-[1.5rem] p-5"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {isStale && staleHours ? (
              <Badge className="absolute right-4 top-4" tone="warning">
                dados de {staleHours}h atrás
              </Badge>
            ) : null}

            <div className={cn('mb-4 inline-flex rounded-2xl p-3', accent.iconBg)}>
              <div className={accent.icon}>
                <SparkIcon />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              {card.title}
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-4xl font-semibold text-text-primary">
                {card.value}
              </span>
              <span className="pb-1 text-sm font-semibold text-text-secondary">
                {card.unit}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowBadge isPositive={card.change >= 0} tone={isGood ? 'good' : 'bad'} />
              <span className={cn(isGood ? 'text-success' : 'text-danger', 'font-semibold')}>
                {formatSigned(card.change)}
              </span>
              <span className="text-text-secondary">{card.changeLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

SummaryCards.displayName = 'SummaryCards';

function formatSigned(value: number): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  return `${value > 0 ? '+' : ''}${formatter.format(value)}`;
}

function ArrowBadge({
  isPositive,
  tone,
}: {
  isPositive: boolean;
  tone: 'good' | 'bad';
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full',
        tone === 'good'
          ? 'bg-emerald-100 text-success dark:bg-emerald-500/15'
          : 'bg-rose-100 text-danger dark:bg-rose-500/15',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          'h-4 w-4 fill-current transition-transform',
          isPositive ? 'rotate-0' : 'rotate-180',
        )}
      >
        <path d="M12 5 19 16H5z" />
      </svg>
    </span>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M4 17.5 9.5 12 13 15.5 20 8.5" />
      <path d="M15 8.5h5v5" />
    </svg>
  );
}
