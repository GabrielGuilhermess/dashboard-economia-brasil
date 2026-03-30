'use client';

import { useMemo } from 'react';

import {
  useCdiSeries,
  useDesempregoSeries,
  useDolarSeries,
  useIpcaSeries,
  useSelicSeries,
} from '@/hooks/use-economia';
import type { HistoricalRow } from '@/types/economia';

export function useHistoricalTable(): {
  data: HistoricalRow[];
  isLoading: boolean;
  isError: boolean;
  errors: Record<string, Error | null>;
} {
  const selic = useSelicSeries();
  const ipca = useIpcaSeries();
  const dolar = useDolarSeries();
  const cdi = useCdiSeries();
  const desemprego = useDesempregoSeries();

  const data = useMemo(() => {
    const joinedRows = new Map<string, Partial<HistoricalRow>>();

    const assignSeries = (
      rows: Array<{ date: string; value: number }> | undefined,
      field: keyof Omit<HistoricalRow, 'date'>,
    ) => {
      rows?.forEach((row) => {
        const current = joinedRows.get(row.date) ?? { date: row.date };
        joinedRows.set(row.date, {
          ...current,
          date: row.date,
          [field]: row.value,
        });
      });
    };

    assignSeries(selic.data?.data, 'selic');
    assignSeries(ipca.data?.data, 'ipca');
    assignSeries(dolar.data?.data, 'dolar');
    assignSeries(cdi.data?.data, 'cdi');
    assignSeries(desemprego.data?.data, 'desemprego');

    return [...joinedRows.values()]
      .map((row) => ({
        date: row.date ?? '',
        selic: row.selic ?? null,
        ipca: row.ipca ?? null,
        dolar: row.dolar ?? null,
        cdi: row.cdi ?? null,
        desemprego: row.desemprego ?? null,
      }))
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [
    cdi.data?.data,
    desemprego.data?.data,
    dolar.data?.data,
    ipca.data?.data,
    selic.data?.data,
  ]);

  const isLoading =
    selic.isLoading ||
    ipca.isLoading ||
    dolar.isLoading ||
    cdi.isLoading ||
    desemprego.isLoading;

  const failedQueries = [selic, ipca, dolar, cdi, desemprego].filter(
    (query) => query.isError,
  );

  return {
    data,
    isLoading,
    isError: failedQueries.length === 5,
    errors: {
      selic: selic.error ?? null,
      ipca: ipca.error ?? null,
      dolar: dolar.error ?? null,
      cdi: cdi.error ?? null,
      desemprego: desemprego.error ?? null,
    },
  };
}
