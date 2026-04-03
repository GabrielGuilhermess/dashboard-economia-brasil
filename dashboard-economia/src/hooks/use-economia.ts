'use client';

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  ENDPOINTS,
  api,
  getSeriesEndpoint,
  type ApiError,
} from '@/lib/api';
import { MOCK_RESPONSES } from '@/lib/mock-data';
import { useDashboardStore } from '@/store/dashboard-store';
import type {
  ApiResponse,
  MapaResponse,
  PibEstado,
  PibSetor,
  SeriePoint,
  SummaryCard,
} from '@/types/economia';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function useEconomiaQuery<T>(
  options: UseQueryOptions<ApiResponse<T>, ApiError>,
  mockResponse: ApiResponse<T>,
): UseQueryResult<ApiResponse<T>, ApiError> {
  const queryOptions = USE_MOCKS
    ? {
        queryKey: options.queryKey,
        queryFn: async () => mockResponse,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
      }
    : options;

  return useQuery<ApiResponse<T>, ApiError>(queryOptions);
}

export function useSummaryCards() {
  return useEconomiaQuery<SummaryCard[]>(
    {
      queryKey: ['summary'],
      queryFn: () => api.get(ENDPOINTS.summary),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    MOCK_RESPONSES.summary,
  );
}

export function useSelicSeries() {
  const period = useDashboardStore((state) => state.period);

  return useEconomiaQuery<SeriePoint[]>(
    {
      queryKey: ['selic', period],
      queryFn: () => api.get(getSeriesEndpoint('selic', period)),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    {
      ...MOCK_RESPONSES.selic,
      meta: {
        ...MOCK_RESPONSES.selic.meta,
        period,
      },
    },
  );
}

export function useIpcaSeries() {
  const period = useDashboardStore((state) => state.period);

  return useEconomiaQuery<SeriePoint[]>(
    {
      queryKey: ['ipca', period],
      queryFn: () => api.get(getSeriesEndpoint('ipca', period)),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    {
      ...MOCK_RESPONSES.ipca,
      meta: {
        ...MOCK_RESPONSES.ipca.meta,
        period,
      },
    },
  );
}

export function useDolarSeries() {
  const period = useDashboardStore((state) => state.period);

  return useEconomiaQuery<SeriePoint[]>(
    {
      queryKey: ['dolar', period],
      queryFn: () => api.get(getSeriesEndpoint('dolar', period)),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    {
      ...MOCK_RESPONSES.dolar,
      meta: {
        ...MOCK_RESPONSES.dolar.meta,
        period,
      },
    },
  );
}

export function useCdiSeries() {
  const period = useDashboardStore((state) => state.period);

  return useEconomiaQuery<SeriePoint[]>(
    {
      queryKey: ['cdi', period],
      queryFn: () => api.get(getSeriesEndpoint('cdi', period)),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    {
      ...MOCK_RESPONSES.cdi,
      meta: {
        ...MOCK_RESPONSES.cdi.meta,
        period,
      },
    },
  );
}

export function useDesempregoSeries() {
  const period = useDashboardStore((state) => state.period);

  return useEconomiaQuery<SeriePoint[]>(
    {
      queryKey: ['desemprego', period],
      queryFn: () => api.get(getSeriesEndpoint('desemprego', period)),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    },
    {
      ...MOCK_RESPONSES.desemprego,
      meta: {
        ...MOCK_RESPONSES.desemprego.meta,
        period,
      },
    },
  );
}

export function usePibEstados() {
  return useEconomiaQuery<PibEstado[]>(
    {
      queryKey: ['pib-estados'],
      queryFn: () => api.get(ENDPOINTS.pibEstados),
      staleTime: 60 * 60 * 1000,
      gcTime: 120 * 60 * 1000,
    },
    MOCK_RESPONSES.pibEstados,
  );
}

export function usePibSetores() {
  return useEconomiaQuery<PibSetor[]>(
    {
      queryKey: ['pib-setores'],
      queryFn: () => api.get(ENDPOINTS.pibSetores),
      staleTime: 60 * 60 * 1000,
      gcTime: 120 * 60 * 1000,
    },
    MOCK_RESPONSES.pibSetores,
  );
}

export function useMapData() {
  return useEconomiaQuery<MapaResponse>(
    {
      queryKey: ['mapa'],
      queryFn: () => api.get(ENDPOINTS.mapa),
      staleTime: 120 * 60 * 1000,
      gcTime: 240 * 60 * 1000,
    },
    MOCK_RESPONSES.mapa,
  );
}
