import type { ApiResponse, Indicator } from '@/types/economia';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ENDPOINTS = {
  summary: '/api/economia/summary',
  selic: '/api/economia/selic',
  ipca: '/api/economia/ipca',
  dolar: '/api/economia/dolar',
  cdi: '/api/economia/cdi',
  desemprego: '/api/economia/desemprego',
  pibEstados: '/api/economia/pib-estados',
  pibSetores: '/api/economia/pib-setores',
  mapa: '/api/economia/mapa',
} as const;

export const BCB_SERIES = {
  SELIC_META: 432,
  IPCA_MENSAL: 433,
  DOLAR_VENDA: 1,
  CDI: 4389,
  DESEMPREGO: 24363,
} as const;

export const INDICATOR_CONFIG: Record<
  Indicator,
  {
    label: string;
    color: string;
    unit: string;
    axis: 'left' | 'right';
  }
> = {
  selic: {
    label: 'Selic',
    color: 'var(--chart-selic)',
    unit: '%',
    axis: 'left',
  },
  ipca: {
    label: 'IPCA',
    color: 'var(--chart-ipca)',
    unit: '%',
    axis: 'left',
  },
  dolar: {
    label: 'Dolar',
    color: 'var(--chart-dolar)',
    unit: 'R$',
    axis: 'right',
  },
  cdi: {
    label: 'CDI',
    color: 'var(--chart-cdi)',
    unit: '%',
    axis: 'left',
  },
};

const DEFAULT_API_URL = 'http://localhost:3001';

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;

      try {
        const errorBody = (await response.json()) as { error?: string; message?: string };
        message = errorBody.error ?? errorBody.message ?? message;
      } catch {
        const fallbackText = await response.text().catch(() => '');
        if (fallbackText) {
          message = fallbackText;
        }
      }

      throw new ApiError(response.status, message);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  private getUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    const normalizedBaseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;

    return `${normalizedBaseUrl}${endpoint}`;
  }
}

export const api = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
);
