import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { API_SOURCES } from '@/config/api-sources.config';

import { PibEstadoDto } from '../dto/pib-estado.dto';
import { PibSetorDto } from '../dto/pib-setor.dto';
import { IbgeAgregadoRaw } from '../interfaces/ibge-raw.interface';

const UF_BY_IBGE_CODE: Record<string, string> = {
  '11': 'RO',
  '12': 'AC',
  '13': 'AM',
  '14': 'RR',
  '15': 'PA',
  '16': 'AP',
  '17': 'TO',
  '21': 'MA',
  '22': 'PI',
  '23': 'CE',
  '24': 'RN',
  '25': 'PB',
  '26': 'PE',
  '27': 'AL',
  '28': 'SE',
  '29': 'BA',
  '31': 'MG',
  '32': 'ES',
  '33': 'RJ',
  '35': 'SP',
  '41': 'PR',
  '42': 'SC',
  '43': 'RS',
  '50': 'MS',
  '51': 'MT',
  '52': 'GO',
  '53': 'DF',
};

const LATEST_SECTOR_YEAR = 2021;

@Injectable()
export class IbgeService {
  constructor(private readonly httpService: HttpService) {}

  async fetchPibPorUF(): Promise<PibEstadoDto[]> {
    const url =
      `${API_SOURCES.ibgeAgregados.baseUrl}/` +
      `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/-1/variaveis/37?localidades=N3`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<IbgeAgregadoRaw[]>(url, {
          timeout: API_SOURCES.ibgeAgregados.timeout,
        }),
      );

      const series = response.data.at(0)?.resultados.at(0)?.series ?? [];
      const parsed = series.map((item) => ({
        uf: UF_BY_IBGE_CODE[item.localidade.id] ?? item.localidade.id,
        codIbge: item.localidade.id,
        nome: item.localidade.nome,
        valor: this.extractLastSerieValue(item.serie) / 1000,
      }));
      const total = parsed.reduce((sum, estado) => sum + estado.valor, 0);

      return parsed
        .map((estado) => ({
          ...estado,
          participacao: total > 0 ? (estado.valor / total) * 100 : 0,
        }))
        .sort((left, right) => right.valor - left.valor);
    } catch (error: unknown) {
      throw this.buildSourceError('IBGE Agregados', error);
    }
  }

  async fetchPibPorSetor(): Promise<PibSetorDto[]> {
    const url =
      `${API_SOURCES.ibgeAgregados.baseUrl}/` +
      `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/${LATEST_SECTOR_YEAR}` +
      '/variaveis/513|517|6575|525?localidades=N1[1]';

    try {
      const response = await firstValueFrom(
        this.httpService.get<IbgeAgregadoRaw[]>(url, {
          timeout: API_SOURCES.ibgeAgregados.timeout,
        }),
      );

      const byVariable = new Map(
        response.data.map((item) => [item.id, this.extractFirstSeriesValue(item)]),
      );
      const agro = byVariable.get('513');
      const industria = byVariable.get('517');
      const servicosPrivados = byVariable.get('6575');
      const servicosPublicos = byVariable.get('525');

      if (
        agro === undefined ||
        industria === undefined ||
        servicosPrivados === undefined ||
        servicosPublicos === undefined
      ) {
        throw new ServiceUnavailableException(
          'Erro na fonte: IBGE Agregados (setores indisponiveis)',
        );
      }

      const servicos = servicosPrivados + servicosPublicos;
      const total = agro + industria + servicos;

      return [
        {
          setor: 'Servicos',
          valor: servicos / 1000,
          percentual: (servicos / total) * 100,
        },
        {
          setor: 'Industria',
          valor: industria / 1000,
          percentual: (industria / total) * 100,
        },
        {
          setor: 'Agropecuaria',
          valor: agro / 1000,
          percentual: (agro / total) * 100,
        },
      ];
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw this.buildSourceError('IBGE Agregados', error);
    }
  }

  async fetchPopulacaoPorUF(): Promise<Map<string, number>> {
    const url =
      `${API_SOURCES.ibgeAgregados.baseUrl}/` +
      `${API_SOURCES.ibgeAgregados.tabelas.POPULACAO_UF}/periodos/-1/variaveis/9324?localidades=N3`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<IbgeAgregadoRaw[]>(url, {
          timeout: API_SOURCES.ibgeAgregados.timeout,
        }),
      );

      const map = new Map<string, number>();
      const series = response.data.at(0)?.resultados.at(0)?.series ?? [];

      for (const item of series) {
        map.set(item.localidade.id, this.extractLastSerieValue(item.serie));
      }

      return map;
    } catch (error: unknown) {
      throw this.buildSourceError('IBGE Agregados', error);
    }
  }

  async fetchGeoJSON(): Promise<GeoJSON.FeatureCollection> {
    const url =
      `${API_SOURCES.ibgeMalhas.baseUrl}` +
      '/paises/BR?intrarregiao=UF&formato=application/vnd.geo+json&qualidade=minima';

    try {
      const response = await firstValueFrom(
        this.httpService.get<GeoJSON.FeatureCollection>(url, {
          timeout: API_SOURCES.ibgeMalhas.timeout,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      throw this.buildSourceError('IBGE Malhas', error);
    }
  }

  async fetchPibBrasilSerieAnual(): Promise<{
    current: { year: number; value: number };
    previous: { year: number; value: number };
  }> {
    const url =
      `${API_SOURCES.ibgeAgregados.baseUrl}/` +
      `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/2022|2023/variaveis/37?localidades=N1[1]`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<IbgeAgregadoRaw[]>(url, {
          timeout: API_SOURCES.ibgeAgregados.timeout,
        }),
      );

      const serie =
        response.data.at(0)?.resultados.at(0)?.series.at(0)?.serie;

      if (!serie) {
        throw new ServiceUnavailableException(
          'Erro na fonte: IBGE Agregados (PIB anual indisponivel)',
        );
      }

      const entries = Object.entries(serie)
        .filter(([, value]) => this.isNumericValue(value))
        .sort(([leftYear], [rightYear]) => leftYear.localeCompare(rightYear));

      const current = entries.at(-1);
      const previous = entries.at(-2);

      if (!current || !previous) {
        throw new ServiceUnavailableException(
          'Erro na fonte: IBGE Agregados (PIB anual indisponivel)',
        );
      }

      return {
        current: {
          year: Number(current[0]),
          value: Number.parseInt(current[1], 10),
        },
        previous: {
          year: Number(previous[0]),
          value: Number.parseInt(previous[1], 10),
        },
      };
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw this.buildSourceError('IBGE Agregados', error);
    }
  }

  private extractLastSerieValue(serie: Record<string, string>): number {
    const lastEntry = Object.entries(serie)
      .filter(([, value]) => this.isNumericValue(value))
      .sort(([leftPeriod], [rightPeriod]) => leftPeriod.localeCompare(rightPeriod))
      .at(-1);

    if (!lastEntry) {
      throw new ServiceUnavailableException(
        'Erro na fonte: IBGE Agregados (valor indisponivel)',
      );
    }

    return Number.parseInt(lastEntry[1], 10);
  }

  private extractFirstSeriesValue(item: IbgeAgregadoRaw): number {
    const serie = item.resultados.at(0)?.series.at(0)?.serie;

    if (!serie) {
      throw new ServiceUnavailableException(
        'Erro na fonte: IBGE Agregados (serie indisponivel)',
      );
    }

    return this.extractLastSerieValue(serie);
  }

  private isNumericValue(value: string): boolean {
    return value !== '' && value !== '-' && value !== '...';
  }

  private buildSourceError(
    sourceName: string,
    error: unknown,
  ): ServiceUnavailableException {
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return new ServiceUnavailableException(
          `Fonte indisponivel: ${sourceName}`,
        );
      }

      if (error.response) {
        return new ServiceUnavailableException(
          `Erro na fonte: ${sourceName} (HTTP ${error.response.status})`,
        );
      }
    }

    return new ServiceUnavailableException(`Fonte indisponivel: ${sourceName}`);
  }
}
