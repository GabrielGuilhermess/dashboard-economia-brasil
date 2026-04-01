import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

let mockActiveIndicators: Array<'selic' | 'ipca'> = ['selic', 'ipca'];

jest.mock('next/dynamic', () => {
  const React = require('react');
  const componentNames = [
    'MultiLineChart',
    'PibBarChart',
    'PibDonutChart',
    'ChoroplethMap',
    'HistoricalTable',
  ];
  let callIndex = 0;

  return () => {
    const componentName = componentNames[callIndex++] ?? 'DynamicComponent';

    return function MockDynamicComponent(props: Record<string, unknown>) {
      return (
        <div
          data-testid={componentName}
          data-props={JSON.stringify(props)}
        />
      );
    };
  };
});

jest.mock('@/components/filters/indicator-toggle', () => ({
  IndicatorToggle: () => <div data-testid="indicator-toggle" />,
}));

jest.mock('@/components/cards/summary-cards', () => ({
  SummaryCards: () => <div data-testid="summary-cards" />,
}));

jest.mock('@/components/layout/dashboard-shell', () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="dashboard-shell">{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/store/dashboard-store', () => ({
  useDashboardStore: (
    selector: (state: { activeIndicators: Array<'selic' | 'ipca'> }) => unknown,
  ) =>
    selector({
      activeIndicators: mockActiveIndicators,
    }),
}));

const useSummaryCards = jest.fn();
const useSelicSeries = jest.fn();
const useIpcaSeries = jest.fn();
const useDolarSeries = jest.fn();
const usePibEstados = jest.fn();
const usePibSetores = jest.fn();
const useMapData = jest.fn();

jest.mock('@/hooks/use-economia', () => ({
  useSummaryCards: () => useSummaryCards(),
  useSelicSeries: () => useSelicSeries(),
  useIpcaSeries: () => useIpcaSeries(),
  useDolarSeries: () => useDolarSeries(),
  usePibEstados: () => usePibEstados(),
  usePibSetores: () => usePibSetores(),
  useMapData: () => useMapData(),
}));

const useHistoricalTable = jest.fn();

jest.mock('@/hooks/use-historical-table', () => ({
  useHistoricalTable: () => useHistoricalTable(),
}));

import DashboardPage from '@/app/dashboard/page';

function createQueryResult<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockActiveIndicators = ['selic', 'ipca'];

    useSummaryCards.mockReturnValue(
      createQueryResult({
        data: [],
        meta: {
          stale: false,
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    );
    useSelicSeries.mockReturnValue(
      createQueryResult({
        data: [{ date: '2026-01-01', value: 14.75 }],
      }),
    );
    useIpcaSeries.mockReturnValue(
      createQueryResult({
        data: [{ date: '2026-01-01', value: 0.33 }],
      }),
    );
    useDolarSeries.mockReturnValue(
      createQueryResult({
        data: [{ date: '2026-01-01', value: 5.23 }],
      }),
    );
    usePibEstados.mockReturnValue(createQueryResult(undefined));
    usePibSetores.mockReturnValue(createQueryResult(undefined));
    useMapData.mockReturnValue(createQueryResult(undefined));
    useHistoricalTable.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      unavailableSeries: [],
    });
  });

  it.each([
    [['selic'], ['selic']],
    [['ipca'], ['ipca']],
    [['selic', 'ipca'], ['selic', 'ipca']],
  ])(
    'passes the current selected indicators %p to the main comparative chart',
    (selectedIndicators, expectedIndicators) => {
      mockActiveIndicators = selectedIndicators as Array<'selic' | 'ipca'>;

      render(<DashboardPage />);

      const [mainChart, dollarChart] = screen.getAllByTestId('MultiLineChart');
      const mainChartProps = JSON.parse(mainChart.getAttribute('data-props') ?? '{}');
      const dollarChartProps = JSON.parse(dollarChart.getAttribute('data-props') ?? '{}');

      expect(mainChartProps.indicators).toEqual(expectedIndicators);
      expect(dollarChartProps.indicators).toEqual(['dolar']);
    },
  );
});
