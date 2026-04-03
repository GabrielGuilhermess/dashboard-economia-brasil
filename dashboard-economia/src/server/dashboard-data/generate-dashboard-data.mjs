import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { PERIODS, SERIES_INDICATORS } from './api-sources.mjs';
import {
  fetchPtaxDia,
  fetchSeries,
  findLatestValue,
  findPreviousValue,
} from './bcb-client.mjs';
import {
  calcPercentChange,
  filterSeriesByStartDate,
  formatDecimal,
  formatTri,
  getStartDate,
  normalizeSeriesForPeriod,
  subtractMonths,
  sumLastN,
  sumPreviousWindow,
  toPeriodSlug,
} from './dates.mjs';
import {
  fetchGeoJSON,
  fetchPibBrasilSerieAnual,
  fetchPibPorSetor,
  fetchPibPorUF,
  fetchPopulacaoPorUF,
} from './ibge-client.mjs';

export async function generateDashboardData(outputDir) {
  const updatedAt = new Date().toISOString();
  const now = new Date();
  const seriesStartDate = getStartDate('10Y');
  const { parentDir, seriesDir, stagingDir } = await prepareStagingDirectory(
    outputDir,
  );
  try {
    const rawSeriesByIndicator = await fetchRawSeries(seriesStartDate, now);

    const [
      pibEstados,
      pibSetores,
      geojson,
      populacaoPorUf,
      pibBrasil,
      dolarAtual,
      dolarMesAnterior,
    ] = await Promise.all([
      fetchPibPorUF(),
      fetchPibPorSetor(),
      fetchGeoJSON(),
      fetchPopulacaoPorUF(),
      fetchPibBrasilSerieAnual(),
      fetchPtaxDia(),
      fetchPtaxDia(subtractMonths(now, 1)),
    ]);

    const files = [
      await writeJson(
        path.join(stagingDir, 'summary.json'),
        buildSummaryPayload({
          updatedAt,
          now,
          rawSeriesByIndicator,
          dolarAtual,
          dolarMesAnterior,
          pibBrasil,
        }),
      ),
      await writeJson(
        path.join(stagingDir, 'pib-estados.json'),
        wrapResponse(pibEstados, 'ibge-agregados', updatedAt),
      ),
      await writeJson(
        path.join(stagingDir, 'pib-setores.json'),
        wrapResponse(pibSetores, 'ibge-agregados', updatedAt),
      ),
      await writeJson(
        path.join(stagingDir, 'mapa.json'),
        wrapResponse(
          buildMapaPayload({ geojson, pibEstados, populacaoPorUf }),
          'ibge-agregados+ibge-malhas',
          updatedAt,
        ),
      ),
    ];

    for (const [indicator, rawSeries] of Object.entries(rawSeriesByIndicator)) {
      for (const period of PERIODS) {
        const normalizedSeries = normalizeSeriesForPeriod(
          filterSeriesByStartDate(rawSeries, getStartDate(period)),
        );

        files.push(
          await writeJson(
            path.join(seriesDir, `${indicator}-${toPeriodSlug(period)}.json`),
            wrapResponse(normalizedSeries, 'bcb-sgs', updatedAt, period),
          ),
        );
      }
    }

    await replaceOutputDirectory(parentDir, stagingDir, outputDir);

    return files.map((filePath) => filePath.replace(stagingDir, outputDir));
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}

async function fetchRawSeries(startDate, endDate) {
  const entries = [];

  for (const [indicator, codigo] of Object.entries(SERIES_INDICATORS)) {
    entries.push([
      indicator,
      await fetchSeries(codigo, startDate, endDate),
    ]);
  }

  return Object.fromEntries(entries);
}

function buildSummaryPayload({
  updatedAt,
  now,
  rawSeriesByIndicator,
  dolarAtual,
  dolarMesAnterior,
  pibBrasil,
}) {
  const selicLatest = findLatestValue(rawSeriesByIndicator.selic);
  const previousSelic = findPreviousValue(
    rawSeriesByIndicator.selic,
    selicLatest.date,
  );
  const ipcaStart = new Date(now);
  ipcaStart.setMonth(ipcaStart.getMonth() - 24);
  const ipcaSeries = filterSeriesByStartDate(
    rawSeriesByIndicator.ipca,
    ipcaStart,
  );
  const ipcaCurrent12m = sumLastN(ipcaSeries, 12);
  const ipcaPrevious12m = sumPreviousWindow(ipcaSeries, 12);
  const pibCurrent = pibBrasil.current.value;
  const pibPrevious = pibBrasil.previous.value;

  return wrapResponse(
    [
      {
        id: 'selic',
        title: 'Selic Meta',
        value: formatDecimal(selicLatest.value),
        unit: '% a.a.',
        change: selicLatest.value - previousSelic.value,
        changeLabel: 'vs reuniao anterior',
        invertSentiment: true,
        color: 'sky',
      },
      {
        id: 'dolar',
        title: 'Dolar PTAX',
        value: formatDecimal(dolarAtual.cotacao),
        unit: 'R$',
        change: calcPercentChange(dolarAtual.cotacao, dolarMesAnterior.cotacao),
        changeLabel: 'vs mesmo dia do mes anterior',
        invertSentiment: true,
        color: 'emerald',
      },
      {
        id: 'ipca',
        title: 'IPCA Acum. 12m',
        value: formatDecimal(ipcaCurrent12m),
        unit: '%',
        change: ipcaCurrent12m - ipcaPrevious12m,
        changeLabel: 'vs acumulo de 12m anterior',
        invertSentiment: true,
        color: 'rose',
      },
      {
        id: 'pib',
        title: 'PIB Nacional',
        value: formatTri(pibCurrent),
        unit: 'R$ tri',
        change: calcPercentChange(pibCurrent, pibPrevious),
        changeLabel: `vs ${pibBrasil.previous.year}`,
        invertSentiment: false,
        color: 'amber',
      },
    ],
    'bcb-sgs+bcb-ptax+ibge-agregados',
    updatedAt,
  );
}

function buildMapaPayload({ geojson, pibEstados, populacaoPorUf }) {
  const estados = pibEstados.map((estado) => {
    const populacao = populacaoPorUf.get(estado.codIbge) ?? 0;
    const pibTotal = estado.valor;

    return {
      uf: estado.uf,
      codIbge: estado.codIbge,
      nome: estado.nome,
      pibTotal,
      populacao,
      pibPerCapita: populacao > 0 ? (pibTotal * 1_000_000) / populacao : 0,
    };
  });

  return {
    geojson,
    estados,
  };
}

function wrapResponse(data, source, updatedAt, period) {
  return {
    data,
    meta: {
      updatedAt,
      source,
      cached: false,
      stale: false,
      period,
    },
  };
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

async function prepareStagingDirectory(outputDir) {
  const parentDir = path.dirname(outputDir);
  const stagingDir = await mkdtemp(path.join(parentDir, '.data-build-'));
  const seriesDir = path.join(stagingDir, 'series');

  await mkdir(seriesDir, { recursive: true });

  return {
    parentDir,
    stagingDir,
    seriesDir,
  };
}

async function replaceOutputDirectory(parentDir, stagingDir, outputDir) {
  const previousDir = path.join(
    parentDir,
    `.data-previous-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  );

  try {
    await rename(outputDir, previousDir);
  } catch (error) {
    if (!isMissingPathError(error)) {
      throw error;
    }
  }

  try {
    await rename(stagingDir, outputDir);
  } catch (error) {
    try {
      await rename(previousDir, outputDir);
    } catch {
      // Best effort rollback.
    }

    throw error;
  }

  await rm(previousDir, { recursive: true, force: true }).catch(() => undefined);
}

function isMissingPathError(error) {
  return (
    error instanceof Error &&
    'code' in error &&
    (error.code === 'ENOENT' || error.code === 'ENOTDIR')
  );
}
