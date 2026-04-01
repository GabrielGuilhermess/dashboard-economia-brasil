import { render, screen } from '@testing-library/react';

import { MultiLineChart } from '@/components/charts/multi-line-chart';

jest.mock('@/store/dashboard-store', () => ({
  useDashboardStore: (selector: (state: object) => unknown) =>
    selector({
      activeIndicators: ['selic', 'ipca'],
      period: '1Y',
    }),
}));

jest.mock('recharts', () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
  Line: ({ name }: { name: string }) => <div data-testid={`line-${name}`}>{name}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({
    yAxisId,
    orientation,
  }: {
    yAxisId: string;
    orientation?: string;
  }) => (
    <div
      data-testid={`y-axis-${yAxisId}`}
      data-orientation={orientation ?? 'left'}
    />
  ),
}));

describe('MultiLineChart', () => {
  const data = [
    {
      date: '2026-01-01',
      selic: 14.25,
      ipca: 0.33,
      dolar: 5.23,
      cdi: 14.15,
    },
  ];

  it('renders the main comparative chart with only non-redundant percentual indicators', () => {
    render(
      <MultiLineChart
        data={data}
        indicators={['selic', 'ipca']}
        eyebrow="Indicadores percentuais"
        title="Evolução comparada"
        description="Comparação temporal entre Selic e IPCA."
      />,
    );

    expect(screen.getByText('Indicadores percentuais')).toBeInTheDocument();
    expect(screen.getByText('Evolução comparada')).toBeInTheDocument();
    expect(
      screen.getByText('Comparação temporal entre Selic e IPCA.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-left')).toBeInTheDocument();
    expect(screen.queryByTestId('y-axis-right')).not.toBeInTheDocument();
    expect(screen.getByTestId('line-Selic')).toBeInTheDocument();
    expect(screen.getByTestId('line-IPCA')).toBeInTheDocument();
    expect(screen.queryByTestId('line-Dólar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-CDI')).not.toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders the dedicated dollar chart with explicit cotation labeling', () => {
    render(
      <MultiLineChart
        data={data}
        indicators={['dolar']}
        eyebrow="Cotação no tempo"
        title="Cotação do dólar (R$/US$)"
        description="Evolução do dólar ao longo do tempo."
      />,
    );

    expect(screen.getByText('Cotação no tempo')).toBeInTheDocument();
    expect(screen.getByText('Cotação do dólar (R$/US$)')).toBeInTheDocument();
    expect(
      screen.getByText('Evolução do dólar ao longo do tempo.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('y-axis-left')).not.toBeInTheDocument();
    expect(screen.getByTestId('y-axis-right')).toBeInTheDocument();
    expect(screen.getByTestId('line-Dólar')).toBeInTheDocument();
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });
});
