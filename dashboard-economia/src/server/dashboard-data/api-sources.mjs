const DEFAULT_API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS) || 30_000;

export const API_SOURCES = {
  bcbSgs: {
    baseUrl:
      process.env.BCB_SGS_BASE_URL ??
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs',
    series: {
      SELIC_META: 432,
      IPCA_MENSAL: 433,
      DOLAR_VENDA: 1,
      CDI: 4389,
      DESEMPREGO: 24369,
    },
    timeout: DEFAULT_API_TIMEOUT_MS,
  },
  bcbPtax: {
    baseUrl:
      process.env.BCB_PTAX_BASE_URL ??
      'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata',
    timeout: DEFAULT_API_TIMEOUT_MS,
  },
  ibgeAgregados: {
    baseUrl:
      process.env.IBGE_AGREGADOS_BASE_URL ??
      'https://servicodados.ibge.gov.br/api/v3/agregados',
    tabelas: {
      PIB_UF: 5938,
      POPULACAO_UF: 6579,
    },
    timeout: DEFAULT_API_TIMEOUT_MS,
  },
  ibgeMalhas: {
    baseUrl:
      process.env.IBGE_MALHAS_BASE_URL ??
      'https://servicodados.ibge.gov.br/api/v3/malhas',
    timeout: Math.max(DEFAULT_API_TIMEOUT_MS, 30_000),
  },
};

export const PERIODS = ['1M', '6M', '1Y', '5Y', '10Y'];

export const SERIES_INDICATORS = {
  selic: API_SOURCES.bcbSgs.series.SELIC_META,
  ipca: API_SOURCES.bcbSgs.series.IPCA_MENSAL,
  dolar: API_SOURCES.bcbSgs.series.DOLAR_VENDA,
  cdi: API_SOURCES.bcbSgs.series.CDI,
  desemprego: API_SOURCES.bcbSgs.series.DESEMPREGO,
};

export const UF_BY_IBGE_CODE = {
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
