import { API_SOURCES } from './api-sources.mjs';
import {
  subtractMonths,
  toBcbDate,
  toIsoDate,
  toPtaxDate,
} from './dates.mjs';
import { fetchJson } from './http-client.mjs';

export async function fetchSeries(codigo, dataInicial, dataFinal) {
  const query = new URLSearchParams({
    formato: 'json',
    dataInicial: toBcbDate(dataInicial),
    dataFinal: toBcbDate(dataFinal),
  });
  const url = `${API_SOURCES.bcbSgs.baseUrl}.${codigo}/dados?${query.toString()}`;
  const response = await fetchJson(url, {
    timeout: Math.max(API_SOURCES.bcbSgs.timeout, 15_000),
    sourceName: 'BCB SGS',
  });

  if (!Array.isArray(response)) {
    throw new Error('Payload inesperado da fonte: BCB SGS (era esperado um array de pontos)');
  }

  return response
    .filter((point) => point.valor !== null)
    .map((point) => ({
      date: normalizePointDate(point),
      value: normalizePointValue(point),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export async function fetchPtaxDia(referenceDate = new Date()) {
  let lastError;

  for (let offset = 0; offset < 5; offset += 1) {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() - offset);

    const queryDate = toPtaxDate(date);
    const url =
      `${API_SOURCES.bcbPtax.baseUrl}` +
      `/CotacaoDolarDia(dataCotacao=@dataCotacao)?` +
      `@dataCotacao='${queryDate}'&$format=json`;

    try {
      const response = await fetchJson(url, {
        timeout: API_SOURCES.bcbPtax.timeout,
        sourceName: 'BCB PTAX',
      });
      const cotacao = response.value?.at(0);

      if (cotacao) {
        return {
          cotacao: cotacao.cotacaoVenda,
          data: cotacao.dataHoraCotacao.slice(0, 10),
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Fonte indisponivel: BCB PTAX');
}

export function findLatestValue(series) {
  const latestPoint = series.at(-1);

  if (!latestPoint) {
    throw new Error('Fonte indisponivel: BCB SGS');
  }

  return {
    value: latestPoint.value,
    date: latestPoint.date,
  };
}

export function findPreviousValue(series, latestDate) {
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
    throw new Error('Fonte indisponivel: BCB SGS');
  }

  const previousPoint = [...series.slice(0, latestPointIndex)]
    .reverse()
    .find((point) => point.value !== latestPoint.value);

  if (!previousPoint) {
    throw new Error('Fonte indisponivel: BCB SGS');
  }

  return {
    value: previousPoint.value,
    date: previousPoint.date,
  };
}

export function getPreviousWindowStart(latestDate) {
  return subtractMonths(new Date(latestDate), 6);
}

function normalizeValue(rawValue) {
  return Number.parseFloat(rawValue);
}

function normalizePointDate(point) {
  if (typeof point?.data !== 'string' || point.data.length !== 10) {
    throw new Error(
      `Payload inesperado da fonte: BCB SGS (campo "data" invalido: ${JSON.stringify(point?.data ?? null)})`,
    );
  }

  return toIsoDate(point.data);
}

function normalizePointValue(point) {
  if (typeof point?.valor !== 'string') {
    throw new Error(
      `Payload inesperado da fonte: BCB SGS (campo "valor" invalido: ${JSON.stringify(point?.valor ?? null)})`,
    );
  }

  const parsedValue = normalizeValue(point.valor);

  if (Number.isNaN(parsedValue)) {
    throw new Error(
      `Payload inesperado da fonte: BCB SGS (valor numerico invalido: ${JSON.stringify(point.valor)})`,
    );
  }

  return parsedValue;
}
