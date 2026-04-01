export type PeriodFilter = '1M' | '6M' | '1Y' | '5Y' | '10Y';
export type Indicator = 'selic' | 'ipca' | 'dolar' | 'cdi';
export type Theme = 'light' | 'dark';

export interface SeriePoint {
  date: string;
  value: number;
}

export interface SummaryCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: number;
  changeLabel: string;
  invertSentiment: boolean;
  color: 'emerald' | 'rose' | 'amber' | 'sky';
}

export interface PibEstado {
  uf: string;
  codIbge: string;
  nome: string;
  valor: number;
  participacao: number;
}

export interface PibSetor {
  setor: string;
  valor: number;
  percentual: number;
  anoReferencia: number;
}

export interface MapaResponse {
  geojson: GeoJSON.FeatureCollection;
  estados: MapaUFData[];
}

export interface MapaUFData {
  uf: string;
  codIbge: string;
  nome: string;
  pibTotal: number;
  populacao: number;
  pibPerCapita: number;
}

export interface HistoricalRow {
  date: string;
  selic: number | null;
  ipca: number | null;
  dolar: number | null;
  cdi: number | null;
  desemprego: number | null;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    updatedAt: string;
    source: string;
    cached: boolean;
    stale: boolean;
    period?: string;
  };
}
