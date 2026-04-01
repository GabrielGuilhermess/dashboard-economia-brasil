import { renderHook } from '@testing-library/react';

import { useHistoricalTable } from '@/hooks/use-historical-table';

interface MockSeriesQuery {
  data?: { data: Array<{ date: string; value: number }> };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const mockQueries: Record<string, MockSeriesQuery> = {
  selic: {
    data: { data: [{ date: '2026-03-01', value: 14.75 }] },
    isLoading: false,
    isError: false,
    error: null,
  },
  ipca: {
    data: { data: [{ date: '2026-03-01', value: 0.5 }] },
    isLoading: false,
    isError: false,
    error: null,
  },
  dolar: {
    data: { data: [{ date: '2026-02-01', value: 5.2 }] },
    isLoading: false,
    isError: false,
    error: null,
  },
  cdi: {
    data: { data: [{ date: '2026-03-01', value: 14.65 }] },
    isLoading: false,
    isError: false,
    error: null,
  },
  desemprego: {
    data: { data: [{ date: '2026-01-01', value: 10.4 }] },
    isLoading: false,
    isError: false,
    error: null,
  },
};

jest.mock('@/hooks/use-economia', () => ({
  useSelicSeries: () => mockQueries.selic,
  useIpcaSeries: () => mockQueries.ipca,
  useDolarSeries: () => mockQueries.dolar,
  useCdiSeries: () => mockQueries.cdi,
  useDesempregoSeries: () => mockQueries.desemprego,
}));

describe('useHistoricalTable', () => {
  beforeEach(() => {
    mockQueries.selic = {
      data: { data: [{ date: '2026-03-01', value: 14.75 }] },
      isLoading: false,
      isError: false,
      error: null,
    };
    mockQueries.ipca = {
      data: { data: [{ date: '2026-03-01', value: 0.5 }] },
      isLoading: false,
      isError: false,
      error: null,
    };
    mockQueries.dolar = {
      data: { data: [{ date: '2026-02-01', value: 5.2 }] },
      isLoading: false,
      isError: false,
      error: null,
    };
    mockQueries.cdi = {
      data: { data: [{ date: '2026-03-01', value: 14.65 }] },
      isLoading: false,
      isError: false,
      error: null,
    };
    mockQueries.desemprego = {
      data: { data: [{ date: '2026-01-01', value: 10.4 }] },
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it('joins five series by date and keeps missing values as null', () => {
    const { result } = renderHook(() => useHistoricalTable());

    expect(result.current.data).toEqual([
      {
        date: '2026-03-01',
        selic: 14.75,
        ipca: 0.5,
        dolar: null,
        cdi: 14.65,
        desemprego: null,
      },
      {
        date: '2026-02-01',
        selic: null,
        ipca: null,
        dolar: 5.2,
        cdi: null,
        desemprego: null,
      },
      {
        date: '2026-01-01',
        selic: null,
        ipca: null,
        dolar: null,
        cdi: null,
        desemprego: 10.4,
      },
    ]);
  });

  it('keeps available rows and reports partial failures explicitly', () => {
    mockQueries.ipca = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('IPCA indisponível'),
    };

    const { result } = renderHook(() => useHistoricalTable());

    expect(result.current.isError).toBe(false);
    expect(result.current.isPartialError).toBe(true);
    expect(result.current.unavailableSeries).toEqual(['ipca']);
    expect(result.current.data).toEqual([
      {
        date: '2026-03-01',
        selic: 14.75,
        ipca: null,
        dolar: null,
        cdi: 14.65,
        desemprego: null,
      },
      {
        date: '2026-02-01',
        selic: null,
        ipca: null,
        dolar: 5.2,
        cdi: null,
        desemprego: null,
      },
      {
        date: '2026-01-01',
        selic: null,
        ipca: null,
        dolar: null,
        cdi: null,
        desemprego: 10.4,
      },
    ]);
  });
});
