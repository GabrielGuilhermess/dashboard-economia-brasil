'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  cn,
  downloadFile,
  formatCurrency,
  formatDate,
  formatPercent,
  toCSV,
} from '@/lib/utils';
import type { HistoricalRow } from '@/types/economia';

/**
 * Props da tabela histórica.
 */
export interface HistoricalTableProps {
  data?: HistoricalRow[];
  isLoading?: boolean;
}

export function HistoricalTable({
  data,
  isLoading = false,
}: HistoricalTableProps) {
  if (isLoading || !data) {
    return <TableSkeleton />;
  }

  return <HistoricalTableContent data={data} />;
}

HistoricalTable.displayName = 'HistoricalTable';

interface HistoricalTableContentProps {
  data: HistoricalRow[];
}

function HistoricalTableContent({ data }: HistoricalTableContentProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<HistoricalRow>[] = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ getValue }) => formatDate(String(getValue())),
      sortingFn: (left, right) =>
        left.original.date.localeCompare(right.original.date),
    },
    {
      accessorKey: 'selic',
      header: 'Selic',
      cell: ({ getValue }) => formatNullable(getValue<number | null>(), 'percent'),
    },
    {
      accessorKey: 'ipca',
      header: 'IPCA',
      cell: ({ getValue }) => formatNullable(getValue<number | null>(), 'percent'),
    },
    {
      accessorKey: 'dolar',
      header: 'Dólar',
      cell: ({ getValue }) => formatNullable(getValue<number | null>(), 'currency'),
    },
    {
      accessorKey: 'cdi',
      header: 'CDI',
      cell: ({ getValue }) => formatNullable(getValue<number | null>(), 'percent'),
    },
    {
      accessorKey: 'desemprego',
      header: 'Desemprego',
      cell: ({ getValue }) =>
        formatNullable(getValue<number | null>(), 'percent-1'),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const csvColumns: Array<{ key: keyof HistoricalRow; label: string }> = [
    { key: 'date', label: 'Data' },
    { key: 'selic', label: 'Selic' },
    { key: 'ipca', label: 'IPCA' },
    { key: 'dolar', label: 'Dólar' },
    { key: 'cdi', label: 'CDI' },
    { key: 'desemprego', label: 'Desemprego' },
  ];

  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
            Série histórica
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Indicadores consolidados</h2>
        </div>
        <Button
          variant="secondary"
          onClick={() => downloadFile(toCSV(data, csvColumns), 'historico-economia.csv')}
        >
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        <SortIndicator direction={header.column.getIsSorted()} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  'rounded-2xl bg-bg-card',
                  rowIndex % 2 === 1 ? 'even:bg-bg-secondary' : '',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm text-text-secondary',
                      cell.column.id !== 'date' ? 'font-mono' : '',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="ghost"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortIndicator({
  direction,
}: {
  direction: false | 'asc' | 'desc';
}) {
  if (!direction) {
    return <span className="text-text-tertiary">·</span>;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4 fill-current', direction === 'desc' ? 'rotate-180' : '')}
    >
      <path d="M12 5 19 16H5z" />
    </svg>
  );
}

function formatNullable(
  value: number | null,
  formatter: 'percent' | 'percent-1' | 'currency',
) {
  if (value === null) {
    return <span className="text-text-tertiary">—</span>;
  }

  if (formatter === 'currency') {
    return formatCurrency(value);
  }

  return formatPercent(value, formatter === 'percent-1' ? 1 : 2);
}
