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

type HistoricalIndicator = keyof Omit<HistoricalRow, 'date'>;

export function useHistoricalTable(): {
  data: HistoricalRow[];
  isLoading: boolean;
  isError: boolean;
  isPartialError: boolean;
  unavailableSeries: HistoricalIndicator[];
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

  const queriesByIndicator: Record<
    HistoricalIndicator,
    typeof selic
  > = {
    selic,
    ipca,
    dolar,
    cdi,
    desemprego,
  };
  const unavailableSeries = (
    Object.entries(queriesByIndicator) as Array<
      [HistoricalIndicator, typeof selic]
    >
  )
    .filter(([, query]) => query.isError)
    .map(([indicator]) => indicator);

  return {
    data,
    isLoading,
    isError: unavailableSeries.length === 5,
    isPartialError:
      unavailableSeries.length > 0 && unavailableSeries.length < 5,
    unavailableSeries,
    errors: {
      selic: selic.error ?? null,
      ipca: ipca.error ?? null,
      dolar: dolar.error ?? null,
      cdi: cdi.error ?? null,
      desemprego: desemprego.error ?? null,
    },
  };
}
