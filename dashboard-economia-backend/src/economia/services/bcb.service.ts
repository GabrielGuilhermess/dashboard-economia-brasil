import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { API_SOURCES } from '@/config/api-sources.config';

import { SeriePointDto } from '../dto/serie-point.dto';
import {
  BcbPtaxRawResponse,
  BcbSgsRawPoint,
} from '../interfaces/bcb-raw.interface';

@Injectable()
export class BcbService {
  constructor(private readonly httpService: HttpService) {}

  async fetchSeries(
    codigo: number,
    dataInicial: Date,
    dataFinal: Date,
  ): Promise<SeriePointDto[]> {
    const query = new URLSearchParams({
      formato: 'json',
      dataInicial: this.toBcbDate(dataInicial),
      dataFinal: this.toBcbDate(dataFinal),
    });
    const url = `${API_SOURCES.bcbSgs.baseUrl}.${codigo}/dados?${query.toString()}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<BcbSgsRawPoint[]>(url, {
          timeout: API_SOURCES.bcbSgs.timeout,
        }),
      );

      return response.data
        .filter((point) => point.valor !== null)
        .map((point) => ({
          date: this.toIsoDate(point.data),
          value: this.normalizeValue(codigo, point.valor ?? '0'),
        }))
        .sort((left, right) => left.date.localeCompare(right.date));
    } catch (error: unknown) {
      throw this.buildSourceError('BCB SGS', error);
    }
  }

  async fetchPtaxDia(
    referenceDate: Date = new Date(),
  ): Promise<{ cotacao: number; data: string }> {
    let lastError: unknown;

    for (let offset = 0; offset < 5; offset += 1) {
      const date = new Date(referenceDate);
      date.setDate(referenceDate.getDate() - offset);

      const queryDate = this.toPtaxDate(date);
      const url =
        `${API_SOURCES.bcbPtax.baseUrl}` +
        `/CotacaoDolarDia(dataCotacao=@dataCotacao)?` +
        `@dataCotacao='${queryDate}'&$format=json`;

      try {
        const response = await firstValueFrom(
          this.httpService.get<BcbPtaxRawResponse>(url, {
            timeout: API_SOURCES.bcbPtax.timeout,
          }),
        );

        const cotacao = response.data.value.at(0);

        if (cotacao) {
          return {
            cotacao: cotacao.cotacaoVenda,
            data: cotacao.dataHoraCotacao.slice(0, 10),
          };
        }
      } catch (error: unknown) {
        lastError = error;
      }
    }

    if (lastError) {
      throw this.buildSourceError('BCB PTAX', lastError);
    }

    throw new ServiceUnavailableException('Fonte indisponivel: BCB PTAX');
  }

  async fetchLatestValue(
    codigo: number,
  ): Promise<{ value: number; date: string }> {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    const series = await this.fetchSeries(codigo, startDate, new Date());
    const latestPoint = series.at(-1);

    if (!latestPoint) {
      throw new ServiceUnavailableException('Fonte indisponivel: BCB SGS');
    }

    return {
      value: latestPoint.value,
      date: latestPoint.date,
    };
  }

  async fetchPreviousValue(
    codigo: number,
    latestDate: string,
  ): Promise<{ value: number; date: string }> {
    const series = await this.fetchSeries(
      codigo,
      this.subtractMonths(new Date(latestDate), 6),
      new Date(latestDate),
    );
    let latestPointIndex = -1;

    for (let index = series.length - 1; index >= 0; index -= 1) {
      if (series[index].date <= latestDate) {
        latestPointIndex = index;
        break;
      }
    }
    const latestPoint =
      latestPointIndex >= 0 ? series[latestPointIndex] : series.at(-1);

    if (!latestPoint) {
      throw new ServiceUnavailableException('Fonte indisponivel: BCB SGS');
    }

    const previousPoint = [...series.slice(0, latestPointIndex)].reverse().find(
      (point) => point.value !== latestPoint.value,
    );

    if (!previousPoint) {
      throw new ServiceUnavailableException('Fonte indisponivel: BCB SGS');
    }

    return {
      value: previousPoint.value,
      date: previousPoint.date,
    };
  }

  private toBcbDate(date: Date): string {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private toPtaxDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  private toIsoDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  private normalizeValue(codigo: number, rawValue: string): number {
    const parsedValue = Number.parseFloat(rawValue);

    if (codigo === API_SOURCES.bcbSgs.series.DESEMPREGO) {
      // A taxa de desocupacao da serie 24369 ja vem em percentual no SGS.
      return parsedValue;
    }

    return parsedValue;
  }

  private subtractMonths(date: Date, months: number): Date {
    const clonedDate = new Date(date);
    clonedDate.setMonth(clonedDate.getMonth() - months);
    return clonedDate;
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
