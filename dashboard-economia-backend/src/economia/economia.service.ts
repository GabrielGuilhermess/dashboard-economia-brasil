import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { API_SOURCES } from '@/config/api-sources.config';

import { PibEstadoDto } from './dto/pib-estado.dto';
import { PibSetorDto } from './dto/pib-setor.dto';
import { SeriePointDto } from './dto/serie-point.dto';
import { SummaryCardDto } from './dto/summary-card.dto';
import { MapaResponseDto, MapaUfDataDto } from './dto/mapa-response.dto';
import { ApiResponse } from './interfaces/api-response.interface';
import { BcbService } from './services/bcb.service';
import { IbgeService } from './services/ibge.service';

type PeriodFilter = '1M' | '6M' | '1Y' | '5Y' | '10Y';
type Indicator = 'selic' | 'ipca' | 'dolar' | 'cdi' | 'desemprego';

interface CachedPayload<T> {
  data: T;
  updatedAt: string;
}

interface CachedResult<T> {
  data: T;
  cached: boolean;
  stale: boolean;
  updatedAt: string;
}

const INDICATOR_TO_SERIES: Record<Indicator, number> = {
  selic: API_SOURCES.bcbSgs.series.SELIC_META,
  ipca: API_SOURCES.bcbSgs.series.IPCA_MENSAL,
  dolar: API_SOURCES.bcbSgs.series.DOLAR_VENDA,
  cdi: API_SOURCES.bcbSgs.series.CDI,
  desemprego: API_SOURCES.bcbSgs.series.DESEMPREGO,
};

@Injectable()
export class EconomiaService {
  constructor(
    private readonly bcbService: BcbService,
    private readonly ibgeService: IbgeService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getSummary(): Promise<ApiResponse<SummaryCardDto[]>> {
    const result = await this.fetchWithStale(
      'economia:summary',
      async () => {
        const now = new Date();
        const ipcaStart = new Date(now);
        ipcaStart.setMonth(ipcaStart.getMonth() - 24);

        const [
          selicLatest,
          dolarAtual,
          dolarMesAnterior,
          ipcaSeries,
          pibBrasil,
        ] = await Promise.all([
          this.bcbService.fetchLatestValue(API_SOURCES.bcbSgs.series.SELIC_META),
          // O card de dolar usa PTAX; grafico e tabela seguem a serie SGS 1.
          this.bcbService.fetchPtaxDia(),
          this.bcbService.fetchPtaxDia(this.subtractMonths(now, 1)),
          this.bcbService.fetchSeries(API_SOURCES.bcbSgs.series.IPCA_MENSAL, ipcaStart, now),
          this.ibgeService.fetchPibBrasilSerieAnual(),
        ]);

        const previousSelic = await this.bcbService.fetchPreviousValue(
          API_SOURCES.bcbSgs.series.SELIC_META,
          selicLatest.date,
        );

        const ipcaCurrent12m = this.sumLastN(ipcaSeries, 12);
        const ipcaPrevious12m = this.sumPreviousWindow(ipcaSeries, 12);
        const pibCurrent = pibBrasil.current.value;
        const pibPrevious = pibBrasil.previous.value;
        const pibVariation = this.calcPercentChange(pibCurrent, pibPrevious);

        const summaryCards: SummaryCardDto[] = [
          {
            id: 'selic',
            title: 'Selic Meta',
            value: this.formatDecimal(selicLatest.value),
            unit: '% a.a.',
            change: selicLatest.value - previousSelic.value,
            changeLabel: 'vs reuniao anterior',
            invertSentiment: true,
            color: 'sky',
          },
          {
            id: 'dolar',
            title: 'Dolar PTAX',
            value: this.formatDecimal(dolarAtual.cotacao),
            unit: 'R$',
            change: this.calcPercentChange(dolarAtual.cotacao, dolarMesAnterior.cotacao),
            changeLabel: 'vs mesmo dia do mes anterior',
            invertSentiment: true,
            color: 'emerald',
          },
          {
            id: 'ipca',
            title: 'IPCA Acum. 12m',
            value: this.formatDecimal(ipcaCurrent12m),
            unit: '%',
            change: ipcaCurrent12m - ipcaPrevious12m,
            changeLabel: 'vs acumulo de 12m anterior',
            invertSentiment: true,
            color: 'rose',
          },
          {
            id: 'pib',
            title: 'PIB Nacional',
            value: this.formatTri(pibCurrent),
            unit: 'R$ tri',
            change: pibVariation,
            changeLabel: `vs ${pibBrasil.previous.year}`,
            invertSentiment: false,
            color: 'amber',
          },
        ];

        return summaryCards;
      },
    );

    return this.wrap(
      result.data,
      'bcb-sgs+bcb-ptax+ibge-agregados',
      result.cached,
      result.stale,
      undefined,
      result.updatedAt,
    );
  }

  async getSeries(
    indicator: Indicator,
    period: PeriodFilter,
  ): Promise<ApiResponse<SeriePointDto[]>> {
    const result = await this.fetchWithStale(
      `economia:${indicator}:${period}`,
      async () => {
        const startDate = this.getStartDate(period);
        const rawSeries = await this.bcbService.fetchSeries(
          INDICATOR_TO_SERIES[indicator],
          startDate,
          new Date(),
        );

        return this.normalizeSeriesForPeriod(rawSeries, period);
      },
    );

    return this.wrap(
      result.data,
      'bcb-sgs',
      result.cached,
      result.stale,
      period,
      result.updatedAt,
    );
  }

  async getPibEstados(): Promise<ApiResponse<PibEstadoDto[]>> {
    const result = await this.fetchWithStale(
      'economia:pib-estados',
      () => this.ibgeService.fetchPibPorUF(),
    );

    return this.wrap(
      result.data,
      'ibge-agregados',
      result.cached,
      result.stale,
      undefined,
      result.updatedAt,
    );
  }

  async getPibSetores(): Promise<ApiResponse<PibSetorDto[]>> {
    const result = await this.fetchWithStale(
      'economia:pib-setores',
      () => this.ibgeService.fetchPibPorSetor(),
    );

    return this.wrap(
      result.data,
      'ibge-agregados',
      result.cached,
      result.stale,
      undefined,
      result.updatedAt,
    );
  }

  async getMapa(): Promise<ApiResponse<MapaResponseDto>> {
    const result = await this.fetchWithStale(
      'economia:mapa',
      async () => {
        const [geojson, pibEstados, populacaoPorUf] = await Promise.all([
          this.fetchWithStale(
            'economia:mapa:geojson',
            () => this.ibgeService.fetchGeoJSON(),
            API_SOURCES.cache.ttlGeojson,
          ),
          this.ibgeService.fetchPibPorUF(),
          this.ibgeService.fetchPopulacaoPorUF(),
        ]);

        const estados: MapaUfDataDto[] = pibEstados.map((estado) => {
          const populacao = populacaoPorUf.get(estado.codIbge) ?? 0;
          const pibTotal = estado.valor;

          return {
            uf: estado.uf,
            codIbge: estado.codIbge,
            nome: estado.nome,
            pibTotal,
            populacao,
            pibPerCapita:
              populacao > 0 ? (pibTotal * 1_000_000) / populacao : 0,
          };
        });

        return {
          geojson: geojson.data,
          estados,
        };
      },
    );

    return this.wrap(
      result.data,
      'ibge-agregados+ibge-malhas',
      result.cached,
      result.stale,
      undefined,
      result.updatedAt,
    );
  }

  private async fetchWithStale<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttl: number = API_SOURCES.cache.ttlDefault,
  ): Promise<CachedResult<T>> {
    const backupKey = cacheKey.replace('economia:', 'economia:backup:');
    const primaryHit = await this.cacheManager.get<CachedPayload<T>>(cacheKey);

    if (primaryHit) {
      return {
        data: primaryHit.data,
        cached: true,
        stale: false,
        updatedAt: primaryHit.updatedAt,
      };
    }

    try {
      const data = await fetcher();
      const payload: CachedPayload<T> = {
        data,
        updatedAt: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, payload, this.toCacheTtl(ttl));
      await this.cacheManager.set(
        backupKey,
        payload,
        this.toCacheTtl(API_SOURCES.cache.ttlBackup),
      );

      return {
        data: payload.data,
        cached: false,
        stale: false,
        updatedAt: payload.updatedAt,
      };
    } catch (error: unknown) {
      const backupHit =
        await this.cacheManager.get<CachedPayload<T>>(backupKey);

      if (backupHit) {
        return {
          data: backupHit.data,
          cached: true,
          stale: true,
          updatedAt: backupHit.updatedAt,
        };
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new ServiceUnavailableException('Fonte indisponivel.');
    }
  }

  private wrap<T>(
    data: T,
    source: string,
    cached: boolean,
    stale: boolean,
    period: string | undefined,
    updatedAt: string,
  ): ApiResponse<T> {
    return {
      data,
      meta: {
        updatedAt,
        source,
        cached,
        stale,
        period,
      },
    };
  }

  private normalizeSeriesForPeriod(
    series: SeriePointDto[],
    _period: PeriodFilter,
  ): SeriePointDto[] {
    const lastValueByMonth = new Map<string, SeriePointDto>();

    for (const point of series) {
      const monthKey = point.date.slice(0, 7);
      lastValueByMonth.set(monthKey, point);
    }

    return [...lastValueByMonth.entries()]
      .sort(([leftMonth], [rightMonth]) => leftMonth.localeCompare(rightMonth))
      .map(([monthKey, point]) => ({
        date: `${monthKey}-01`,
        value: point.value,
      }));
  }

  private getStartDate(period: PeriodFilter): Date {
    const date = new Date();

    switch (period) {
      case '1M':
        date.setDate(1);
        date.setMonth(date.getMonth() - 1);
        break;
      case '6M':
        date.setDate(1);
        date.setMonth(date.getMonth() - 5);
        break;
      case '1Y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      case '5Y':
        date.setFullYear(date.getFullYear() - 5);
        break;
      case '10Y':
        date.setFullYear(date.getFullYear() - 10);
        break;
    }

    return date;
  }

  private calcPercentChange(current: number, previous: number): number {
    if (previous === 0) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  }

  private sumLastN(series: SeriePointDto[], count: number): number {
    return series
      .slice(-count)
      .reduce((total, point) => total + point.value, 0);
  }

  private sumPreviousWindow(series: SeriePointDto[], count: number): number {
    return series
      .slice(-(count * 2), -count)
      .reduce((total, point) => total + point.value, 0);
  }

  private formatDecimal(value: number, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(value);
  }

  private formatTri(valueInThousandReais: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valueInThousandReais / 1_000_000_000);
  }

  private subtractMonths(date: Date, months: number): Date {
    const clonedDate = new Date(date);
    clonedDate.setMonth(clonedDate.getMonth() - months);
    return clonedDate;
  }

  private toCacheTtl(ttlInSeconds: number): number {
    return ttlInSeconds * 1000;
  }
}
