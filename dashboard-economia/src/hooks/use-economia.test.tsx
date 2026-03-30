import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useSummaryCards } from '@/hooks/use-economia';
import type { ApiResponse, SummaryCard } from '@/types/economia';

const summaryResponse: ApiResponse<SummaryCard[]> = {
  data: [
    {
      id: 'selic',
      title: 'Selic Meta',
      value: '14,75',
      unit: '% a.a.',
      change: -0.25,
      changeLabel: 'vs reuniao anterior',
      invertSentiment: true,
      color: 'sky',
    },
  ],
  meta: {
    updatedAt: '2026-03-29T18:00:00.000Z',
    source: 'bcb-sgs',
    cached: false,
    stale: false,
  },
};

describe('useSummaryCards', () => {
  it('fetches summary cards from the API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => summaryResponse,
    });

    Object.defineProperty(global, 'fetch', {
      writable: true,
      value: fetchMock,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSummaryCards(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0]?.title).toBe('Selic Meta');
    expect(result.current.data?.meta.source).toBe('bcb-sgs');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3001/api/economia/summary',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });
});
