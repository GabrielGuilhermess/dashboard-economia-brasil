import { renderHook } from '@testing-library/react';

import { useHistoricalTable } from '@/hooks/use-historical-table';

jest.mock('@/hooks/use-economia', () => ({
  useSelicSeries: () => ({
    data: { data: [{ date: '2026-03-01', value: 14.75 }] },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useIpcaSeries: () => ({
    data: { data: [{ date: '2026-03-01', value: 0.5 }] },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDolarSeries: () => ({
    data: { data: [{ date: '2026-02-01', value: 5.2 }] },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCdiSeries: () => ({
    data: { data: [{ date: '2026-03-01', value: 14.65 }] },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDesempregoSeries: () => ({
    data: { data: [{ date: '2026-01-01', value: 10.4 }] },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe('useHistoricalTable', () => {
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
});
