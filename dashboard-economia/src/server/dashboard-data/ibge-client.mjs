import { API_SOURCES, UF_BY_IBGE_CODE } from './api-sources.mjs';
import { fetchJson } from './http-client.mjs';

export async function fetchPibPorUF() {
  const url =
    `${API_SOURCES.ibgeAgregados.baseUrl}/` +
    `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/-1/variaveis/37?localidades=N3`;
  const response = await fetchJson(url, {
    timeout: API_SOURCES.ibgeAgregados.timeout,
    sourceName: 'IBGE Agregados',
  });
  const series = response.at(0)?.resultados.at(0)?.series ?? [];
  const parsed = series.map((item) => ({
    uf: UF_BY_IBGE_CODE[item.localidade.id] ?? item.localidade.id,
    codIbge: item.localidade.id,
    nome: item.localidade.nome,
    valor: extractLastSerieValue(item.serie) / 1000,
  }));
  const total = parsed.reduce((sum, estado) => sum + estado.valor, 0);

  return parsed
    .map((estado) => ({
      ...estado,
      participacao: total > 0 ? (estado.valor / total) * 100 : 0,
    }))
    .sort((left, right) => right.valor - left.valor);
}

export async function fetchPibPorSetor() {
  const url =
    `${API_SOURCES.ibgeAgregados.baseUrl}/` +
    `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/-10` +
    '/variaveis/513|517|6575|525?localidades=N1[1]';
  const response = await fetchJson(url, {
    timeout: API_SOURCES.ibgeAgregados.timeout,
    sourceName: 'IBGE Agregados',
  });
  const byVariable = new Map(
    response.map((item) => [item.id, extractSerie(item)]),
  );
  const referenceYear = extractLatestCommonNumericPeriod([
    byVariable.get('513'),
    byVariable.get('517'),
    byVariable.get('6575'),
    byVariable.get('525'),
  ]);
  const agro = extractSerieValueForPeriod(byVariable.get('513'), referenceYear);
  const industria = extractSerieValueForPeriod(
    byVariable.get('517'),
    referenceYear,
  );
  const servicosPrivados = extractSerieValueForPeriod(
    byVariable.get('6575'),
    referenceYear,
  );
  const servicosPublicos = extractSerieValueForPeriod(
    byVariable.get('525'),
    referenceYear,
  );

  if (
    agro === undefined ||
    industria === undefined ||
    servicosPrivados === undefined ||
    servicosPublicos === undefined
  ) {
    throw new Error(
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
      anoReferencia: referenceYear,
    },
    {
      setor: 'Industria',
      valor: industria / 1000,
      percentual: (industria / total) * 100,
      anoReferencia: referenceYear,
    },
    {
      setor: 'Agropecuaria',
      valor: agro / 1000,
      percentual: (agro / total) * 100,
      anoReferencia: referenceYear,
    },
  ];
}

export async function fetchPopulacaoPorUF() {
  const url =
    `${API_SOURCES.ibgeAgregados.baseUrl}/` +
    `${API_SOURCES.ibgeAgregados.tabelas.POPULACAO_UF}/periodos/-1/variaveis/9324?localidades=N3`;
  const response = await fetchJson(url, {
    timeout: API_SOURCES.ibgeAgregados.timeout,
    sourceName: 'IBGE Agregados',
  });
  const map = new Map();
  const series = response.at(0)?.resultados.at(0)?.series ?? [];

  for (const item of series) {
    map.set(item.localidade.id, extractLastSerieValue(item.serie));
  }

  return map;
}

export async function fetchGeoJSON() {
  const url =
    `${API_SOURCES.ibgeMalhas.baseUrl}` +
    '/paises/BR?intrarregiao=UF&formato=application/vnd.geo+json&qualidade=minima';

  return fetchJson(url, {
    timeout: API_SOURCES.ibgeMalhas.timeout,
    sourceName: 'IBGE Malhas',
  });
}

export async function fetchPibBrasilSerieAnual() {
  const url =
    `${API_SOURCES.ibgeAgregados.baseUrl}/` +
    `${API_SOURCES.ibgeAgregados.tabelas.PIB_UF}/periodos/-10/variaveis/37?localidades=N1[1]`;
  const response = await fetchJson(url, {
    timeout: API_SOURCES.ibgeAgregados.timeout,
    sourceName: 'IBGE Agregados',
  });
  const serie = response.at(0)?.resultados.at(0)?.series.at(0)?.serie;

  if (!serie) {
    throw new Error('Erro na fonte: IBGE Agregados (PIB anual indisponivel)');
  }

  const entries = Object.entries(serie)
    .filter(([, value]) => isNumericValue(value))
    .sort(([leftYear], [rightYear]) => leftYear.localeCompare(rightYear));
  const current = entries.at(-1);
  const previous = entries.at(-2);

  if (!current || !previous) {
    throw new Error('Erro na fonte: IBGE Agregados (PIB anual indisponivel)');
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
}

function extractLastSerieValue(serie) {
  const lastEntry = getNumericSerieEntries(serie).at(-1);

  if (!lastEntry) {
    throw new Error('Erro na fonte: IBGE Agregados (valor indisponivel)');
  }

  return Number.parseInt(lastEntry[1], 10);
}

function extractSerie(item) {
  const serie = item.resultados.at(0)?.series.at(0)?.serie;

  if (!serie) {
    throw new Error('Erro na fonte: IBGE Agregados (serie indisponivel)');
  }

  return serie;
}

function extractSerieValueForPeriod(serie, period) {
  const rawValue = serie?.[String(period)];

  if (!rawValue || !isNumericValue(rawValue)) {
    return undefined;
  }

  return Number.parseInt(rawValue, 10);
}

function extractLatestCommonNumericPeriod(series) {
  const periods = series
    .filter(Boolean)
    .flatMap((serie) => getNumericSerieEntries(serie).map(([period]) => period));
  const uniquePeriods = [...new Set(periods)].sort();

  for (let index = uniquePeriods.length - 1; index >= 0; index -= 1) {
    const period = uniquePeriods[index];
    const isAvailableInAllSeries = series.every((serie) => {
      const rawValue = serie?.[period];
      return rawValue ? isNumericValue(rawValue) : false;
    });

    if (isAvailableInAllSeries) {
      return Number(period);
    }
  }

  throw new Error('Erro na fonte: IBGE Agregados (periodo indisponivel)');
}

function getNumericSerieEntries(serie) {
  return Object.entries(serie)
    .filter(([, value]) => isNumericValue(value))
    .sort(([leftPeriod], [rightPeriod]) => leftPeriod.localeCompare(rightPeriod));
}

function isNumericValue(value) {
  return value !== '' && value !== '-' && value !== '...';
}
