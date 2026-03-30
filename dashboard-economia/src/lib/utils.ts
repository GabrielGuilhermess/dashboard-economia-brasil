import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { PeriodFilter } from '@/types/economia';

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}%`;
}

export function formatCompact(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000_000_000) {
    return `R$ ${formatCompactNumber(value / 1_000_000_000_000)} tri`;
  }

  if (absoluteValue >= 1_000_000_000) {
    return `R$ ${formatCompactNumber(value / 1_000_000_000)} bi`;
  }

  if (absoluteValue >= 1_000_000) {
    return `R$ ${formatCompactNumber(value / 1_000_000)} mi`;
  }

  return formatCurrency(value);
}

export function formatDate(
  value: string,
  format: 'short' | 'long' = 'short',
): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: format === 'long' ? 'long' : '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatChartDate(value: string, period: PeriodFilter): string {
  const date = new Date(`${value}T00:00:00`);

  if (period === '1M') {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }

  if (period === '6M' || period === '1Y') {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: period === '1Y' ? '2-digit' : undefined,
    }).format(date);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function getStartDate(period: PeriodFilter): Date {
  const date = new Date();

  switch (period) {
    case '1M':
      date.setMonth(date.getMonth() - 1);
      break;
    case '6M':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1Y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case '5Y':
      date.setFullYear(date.getFullYear() - 5);
      break;
    case '10Y':
      date.setFullYear(date.getFullYear() - 10);
      break;
  }

  return date;
}

export function bcbDateToISO(value: string): string {
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function calcChange(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}

export function toCSV<T extends object>(
  data: T[],
  columns: Array<{ key: keyof T; label: string }>,
): string {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const rows = data.map((item) =>
    columns
      .map((column) => escapeCsvValue(item[column.key] ?? ''))
      .join(','),
  );

  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function escapeCsvValue(value: unknown): string {
  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}
