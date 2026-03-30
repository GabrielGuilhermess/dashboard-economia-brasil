'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { IndicatorToggle } from '@/components/filters/indicator-toggle';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SummaryCards } from '@/components/cards/summary-cards';
import { Button } from '@/components/ui/button';
import { ChartSkeleton, MapSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import {
  useCdiSeries,
  useDolarSeries,
  useIpcaSeries,
  useMapData,
  usePibEstados,
  usePibSetores,
  useSelicSeries,
  useSummaryCards,
} from '@/hooks/use-economia';
import { useHistoricalTable } from '@/hooks/use-historical-table';
import type { ApiError } from '@/lib/api';
import type { SeriePoint } from '@/types/economia';

const MultiLineChart = dynamic(
  () =>
    import('@/components/charts/multi-line-chart').then(
      (module) => module.MultiLineChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={360} />,
  },
);

const PibBarChart = dynamic(
  () =>
    import('@/components/charts/pib-bar-chart').then(
      (module) => module.PibBarChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

const PibDonutChart = dynamic(
  () =>
    import('@/components/charts/pib-donut-chart').then(
      (module) => module.PibDonutChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

const ChoroplethMap = dynamic(
  () =>
    import('@/components/map/choropleth-map').then(
      (module) => module.ChoroplethMap,
    ),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

const HistoricalTable = dynamic(
  () =>
    import('@/components/table/historical-table').then(
      (module) => module.HistoricalTable,
    ),
  {
    ssr: false,
    loading: () => <TableSkeleton />,
  },
);

export default function DashboardPage() {
  const summary = useSummaryCards();
  const selic = useSelicSeries();
  const ipca = useIpcaSeries();
  const dolar = useDolarSeries();
  const cdi = useCdiSeries();
  const pibEstados = usePibEstados();
  const pibSetores = usePibSetores();
  const mapa = useMapData();
  const historical = useHistoricalTable();

  const mergedSeries = useMemo(
    () =>
      mergeSeries(
        selic.data?.data,
        ipca.data?.data,
        dolar.data?.data,
        cdi.data?.data,
      ),
    [cdi.data?.data, dolar.data?.data, ipca.data?.data, selic.data?.data],
  );

  const lineChartLoading =
    selic.isLoading || ipca.isLoading || dolar.isLoading || cdi.isLoading;
  const lineChartHasData = mergedSeries.length > 0;
  const hasLineChartError =
    !lineChartHasData &&
    [selic, ipca, dolar, cdi].every((query) => query.isError);

  return (
    <DashboardShell>
      <SummaryCards
        cards={summary.data?.data}
        isLoading={summary.isLoading}
        isStale={summary.data?.meta.stale}
        updatedAt={summary.data?.meta.updatedAt}
      />

      <section className="space-y-4">
        <IndicatorToggle />
        {hasLineChartError ? (
          <SectionError
            title="Não foi possível carregar o gráfico de indicadores."
            onRetry={() => {
              void selic.refetch();
              void ipca.refetch();
              void dolar.refetch();
              void cdi.refetch();
            }}
          />
        ) : (
          <MultiLineChart data={mergedSeries} isLoading={lineChartLoading} />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pibEstados.isError && !pibEstados.data ? (
          <SectionError
            title="Não foi possível carregar o ranking de PIB por estado."
            onRetry={() => void pibEstados.refetch()}
          />
        ) : (
          <PibBarChart
            data={pibEstados.data?.data}
            isLoading={pibEstados.isLoading}
          />
        )}

        {pibSetores.isError && !pibSetores.data ? (
          <SectionError
            title="Não foi possível carregar a composição setorial do PIB."
            onRetry={() => void pibSetores.refetch()}
          />
        ) : (
          <PibDonutChart
            data={pibSetores.data?.data}
            isLoading={pibSetores.isLoading}
          />
        )}
      </div>

      {mapa.isError && !mapa.data ? (
        <SectionError
          title="Não foi possível carregar o mapa econômico."
          onRetry={() => void mapa.refetch()}
        />
      ) : (
        <ChoroplethMap
          data={mapa.data?.data.estados}
          geojson={mapa.data?.data.geojson}
          isLoading={mapa.isLoading}
        />
      )}

      {historical.isError && historical.data.length === 0 ? (
        <SectionError
          title="Não foi possível carregar a tabela histórica."
          onRetry={() => window.location.reload()}
        />
      ) : (
        <HistoricalTable
          data={historical.data}
          isLoading={historical.isLoading}
        />
      )}
    </DashboardShell>
  );
}

function mergeSeries(
  selic: SeriePoint[] | undefined,
  ipca: SeriePoint[] | undefined,
  dolar: SeriePoint[] | undefined,
  cdi: SeriePoint[] | undefined,
) {
  const merged = new Map<
    string,
    {
      date: string;
      selic?: number;
      ipca?: number;
      dolar?: number;
      cdi?: number;
    }
  >();

  const assignSeries = (
    rows: SeriePoint[] | undefined,
    key: 'selic' | 'ipca' | 'dolar' | 'cdi',
  ) => {
    rows?.forEach((row) => {
      const current = merged.get(row.date) ?? { date: row.date };
      merged.set(row.date, {
        ...current,
        [key]: row.value,
      });
    });
  };

  assignSeries(selic, 'selic');
  assignSeries(ipca, 'ipca');
  assignSeries(dolar, 'dolar');
  assignSeries(cdi, 'cdi');

  return [...merged.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function SectionError({
  title,
  onRetry,
}: {
  title: string;
  onRetry: () => void;
}) {
  return (
    <div className="card rounded-[1.75rem] p-6">
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-secondary">
        Os dados estão indisponíveis no momento. Tente novamente em instantes.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
