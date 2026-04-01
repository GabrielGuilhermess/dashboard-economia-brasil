import { render, screen } from '@testing-library/react';

import { HistoricalTable } from '@/components/table/historical-table';

describe('HistoricalTable', () => {
  it('shows partial failure feedback and keeps available data rendered', () => {
    render(
      <HistoricalTable
        data={[
          {
            date: '2026-03-01',
            selic: 14.75,
            ipca: null,
            dolar: 5.24,
            cdi: 14.65,
            desemprego: null,
          },
        ]}
        unavailableSeries={['ipca', 'desemprego']}
      />,
    );

    expect(
      screen.getByText(
        'Dados indisponíveis para IPCA, Desemprego. A tabela continua com as séries disponíveis.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Indicadores consolidados')).toBeInTheDocument();
    expect(screen.getByText('01/03/2026')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('5,24'))).toBeInTheDocument();
  });
});
