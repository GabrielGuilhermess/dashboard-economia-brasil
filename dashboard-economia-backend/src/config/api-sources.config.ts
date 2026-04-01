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
    timeout: Number(process.env.API_TIMEOUT_MS) || 10_000,
  },
  bcbPtax: {
    baseUrl:
      process.env.BCB_PTAX_BASE_URL ??
      'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata',
    timeout: Number(process.env.API_TIMEOUT_MS) || 10_000,
  },
  ibgeAgregados: {
    baseUrl:
      process.env.IBGE_AGREGADOS_BASE_URL ??
      'https://servicodados.ibge.gov.br/api/v3/agregados',
    tabelas: {
      PIB_UF: 5938,
      POPULACAO_UF: 6579,
    },
    timeout: Number(process.env.API_TIMEOUT_MS) || 10_000,
  },
  ibgeMalhas: {
    baseUrl:
      process.env.IBGE_MALHAS_BASE_URL ??
      'https://servicodados.ibge.gov.br/api/v3/malhas',
    timeout: 15_000,
  },
  cache: {
    ttlDefault: Number(process.env.CACHE_TTL_DEFAULT) || 3600,
    ttlGeojson: Number(process.env.CACHE_TTL_GEOJSON) || 86400,
    ttlBackup: 86400,
  },
} as const;
