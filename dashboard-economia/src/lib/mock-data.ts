import type {
  ApiResponse,
  MapaResponse,
  MapaUFData,
  PibEstado,
  PibSetor,
  SeriePoint,
  SummaryCard,
} from '@/types/economia';

const MOCK_UPDATED_AT = '2026-03-29T18:00:00.000Z';

export const MOCK_SUMMARY_CARDS: SummaryCard[] = [
  {
    id: 'selic',
    title: 'Selic Meta',
    value: '14,75',
    unit: '% a.a.',
    change: -0.25,
    changeLabel: 'vs reuniao anterior',
    invertSentiment: true,
    color: 'sky',
  },
  {
    id: 'dolar',
    title: 'Dolar PTAX',
    value: '5,24',
    unit: 'R$',
    change: 1.71,
    changeLabel: 'vs mesmo dia do mes anterior',
    invertSentiment: true,
    color: 'emerald',
  },
  {
    id: 'ipca',
    title: 'IPCA Acum. 12m',
    value: '3,75',
    unit: '%',
    change: -1.2,
    changeLabel: 'vs acumulo de 12m anterior',
    invertSentiment: true,
    color: 'rose',
  },
  {
    id: 'pib',
    title: 'PIB Nacional',
    value: '10,94',
    unit: 'R$ tri',
    change: 8.57,
    changeLabel: 'vs ano anterior',
    invertSentiment: false,
    color: 'amber',
  },
];

export const MOCK_SELIC_SERIES: SeriePoint[] = [
  { date: '2025-03-31', value: 14.25 },
  { date: '2025-04-30', value: 14.25 },
  { date: '2025-05-31', value: 14.75 },
  { date: '2025-06-30', value: 15 },
  { date: '2025-07-31', value: 15 },
  { date: '2025-08-31', value: 15 },
  { date: '2025-09-30', value: 15 },
  { date: '2025-10-31', value: 15 },
  { date: '2025-11-30', value: 15 },
  { date: '2025-12-31', value: 15 },
  { date: '2026-01-31', value: 15 },
  { date: '2026-02-28', value: 15 },
  { date: '2026-03-29', value: 14.75 },
];

export const MOCK_IPCA_SERIES: SeriePoint[] = [
  { date: '2025-03-01', value: 0.56 },
  { date: '2025-04-01', value: 0.43 },
  { date: '2025-05-01', value: 0.26 },
  { date: '2025-06-01', value: 0.24 },
  { date: '2025-07-01', value: 0.26 },
  { date: '2025-08-01', value: -0.11 },
  { date: '2025-09-01', value: 0.48 },
  { date: '2025-10-01', value: 0.09 },
  { date: '2025-11-01', value: 0.18 },
  { date: '2025-12-01', value: 0.33 },
  { date: '2026-01-01', value: 0.33 },
  { date: '2026-02-01', value: 0.7 },
];

export const MOCK_DOLAR_SERIES: SeriePoint[] = [
  { date: '2025-03-31', value: 5.7422 },
  { date: '2025-04-30', value: 5.6608 },
  { date: '2025-05-30', value: 5.7087 },
  { date: '2025-06-30', value: 5.4571 },
  { date: '2025-07-31', value: 5.6021 },
  { date: '2025-08-29', value: 5.4264 },
  { date: '2025-09-30', value: 5.3186 },
  { date: '2025-10-31', value: 5.3843 },
  { date: '2025-11-28', value: 5.3338 },
  { date: '2025-12-31', value: 5.5024 },
  { date: '2026-01-30', value: 5.2301 },
  { date: '2026-02-27', value: 5.1495 },
  { date: '2026-03-27', value: 5.2376 },
];

export const MOCK_CDI_SERIES: SeriePoint[] = [
  { date: '2025-03-31', value: 14.15 },
  { date: '2025-04-30', value: 14.15 },
  { date: '2025-05-30', value: 14.65 },
  { date: '2025-06-30', value: 14.9 },
  { date: '2025-07-31', value: 14.9 },
  { date: '2025-08-29', value: 14.9 },
  { date: '2025-09-30', value: 14.9 },
  { date: '2025-10-31', value: 14.9 },
  { date: '2025-11-28', value: 14.9 },
  { date: '2025-12-31', value: 14.9 },
  { date: '2026-01-30', value: 14.9 },
  { date: '2026-02-27', value: 14.9 },
  { date: '2026-03-26', value: 14.65 },
];

export const MOCK_DESEMPREGO_SERIES: SeriePoint[] = [
  { date: '2025-03-01', value: 7.0 },
  { date: '2025-04-01', value: 6.6 },
  { date: '2025-05-01', value: 6.2 },
  { date: '2025-06-01', value: 5.8 },
  { date: '2025-07-01', value: 5.6 },
  { date: '2025-08-01', value: 5.6 },
  { date: '2025-09-01', value: 5.6 },
  { date: '2025-10-01', value: 5.4 },
  { date: '2025-11-01', value: 5.2 },
  { date: '2025-12-01', value: 5.1 },
  { date: '2026-01-01', value: 5.4 },
  { date: '2026-02-01', value: 5.8 },
];

export const MOCK_PIB_ESTADOS: PibEstado[] = [
  { uf: 'SP', codIbge: '35', nome: 'São Paulo', valor: 3444814.033, participacao: 31.478619155646054 },
  { uf: 'RJ', codIbge: '33', nome: 'Rio de Janeiro', valor: 1172871.443, participacao: 10.717668100236176 },
  { uf: 'MG', codIbge: '31', nome: 'Minas Gerais', valor: 971977.551, participacao: 8.88190504992829 },
  { uf: 'PR', codIbge: '41', nome: 'Paraná', valor: 670919.162, participacao: 6.130841485927957 },
  { uf: 'RS', codIbge: '43', nome: 'Rio Grande do Sul', valor: 650107.022, participacao: 5.940660703279599 },
  { uf: 'SC', codIbge: '42', nome: 'Santa Catarina', valor: 513392.973, participacao: 4.691371353993748 },
  { uf: 'BA', codIbge: '29', nome: 'Bahia', valor: 430987.853, participacao: 3.938355555722554 },
  { uf: 'DF', codIbge: '53', nome: 'Distrito Federal', valor: 365669.108, participacao: 3.3414745984683485 },
  { uf: 'GO', codIbge: '52', nome: 'Goiás', valor: 336746.975, participacao: 3.077184915148905 },
  { uf: 'MT', codIbge: '51', nome: 'Mato Grosso', valor: 273008.586, participacao: 2.4947452090559463 },
  { uf: 'PE', codIbge: '26', nome: 'Pernambuco', valor: 270474.919, participacao: 2.4715926272921145 },
  { uf: 'PA', codIbge: '15', nome: 'Pará', valor: 254546.511, participacao: 2.3260392579710176 },
  { uf: 'CE', codIbge: '23', nome: 'Ceará', valor: 232239.257, participacao: 2.1221961632937902 },
  { uf: 'ES', codIbge: '32', nome: 'Espírito Santo', valor: 209829.732, participacao: 1.9174185189343944 },
  { uf: 'MS', codIbge: '50', nome: 'Mato Grosso do Sul', valor: 184402.118, participacao: 1.6850616574391155 },
  { uf: 'AM', codIbge: '13', nome: 'Amazonas', valor: 161794.976, participacao: 1.4784781941814893 },
  { uf: 'MA', codIbge: '21', nome: 'Maranhão', valor: 149227.195, participacao: 1.3636341451440925 },
  { uf: 'RN', codIbge: '24', nome: 'Rio Grande do Norte', valor: 101740.275, participacao: 0.9296999312112639 },
  { uf: 'PB', codIbge: '25', nome: 'Paraíba', valor: 96963.174, participacao: 0.8860469091303894 },
  { uf: 'AL', codIbge: '27', nome: 'Alagoas', valor: 89688.932, participacao: 0.8195750789037256 },
  { uf: 'PI', codIbge: '22', nome: 'Piauí', valor: 80916.856, participacao: 0.7394160813604225 },
  { uf: 'RO', codIbge: '11', nome: 'Rondônia', valor: 76456.179, participacao: 0.6986545333888285 },
  { uf: 'TO', codIbge: '17', nome: 'Tocantins', valor: 64317.699, participacao: 0.5877334254892351 },
  { uf: 'SE', codIbge: '28', nome: 'Sergipe', valor: 60816.662, participacao: 0.5557410423541581 },
  { uf: 'AP', codIbge: '16', nome: 'Amapá', valor: 28020.12, participacao: 0.2560471124786262 },
  { uf: 'AC', codIbge: '12', nome: 'Acre', valor: 26291.321, participacao: 0.24024939312532095 },
  { uf: 'RR', codIbge: '14', nome: 'Roraima', valor: 25124.805, participacao: 0.2295898008944484 },
];

export const MOCK_PIB_SETORES: PibSetor[] = [
  { setor: 'Serviços', valor: 5129115, percentual: 66.49099902657494, anoReferencia: 2021 },
  { setor: 'Indústria', valor: 1993799, percentual: 25.8465032209623, anoReferencia: 2021 },
  { setor: 'Agropecuária', valor: 591085, percentual: 7.662497752462763, anoReferencia: 2021 },
];

export const MOCK_MAPA_ESTADOS: MapaUFData[] = [
  { uf: 'SP', codIbge: '35', nome: 'São Paulo', pibTotal: 3444814.033, populacao: 46081801, pibPerCapita: 74754.32726685313 },
  { uf: 'RJ', codIbge: '33', nome: 'Rio de Janeiro', pibTotal: 1172871.443, populacao: 17223547, pibPerCapita: 68096.97462433261 },
  { uf: 'MG', codIbge: '31', nome: 'Minas Gerais', pibTotal: 971977.551, populacao: 21393441, pibPerCapita: 45433.43686506533 },
  { uf: 'PR', codIbge: '41', nome: 'Paraná', pibTotal: 670919.162, populacao: 11890517, pibPerCapita: 56424.725855065844 },
  { uf: 'RS', codIbge: '43', nome: 'Rio Grande do Sul', pibTotal: 650107.022, populacao: 11233263, pibPerCapita: 57873.39101737402 },
  { uf: 'SC', codIbge: '42', nome: 'Santa Catarina', pibTotal: 513392.973, populacao: 8187029, pibPerCapita: 62708.092642642405 },
  { uf: 'BA', codIbge: '29', nome: 'Bahia', pibTotal: 430987.853, populacao: 14870907, pibPerCapita: 28981.947973987062 },
  { uf: 'DF', codIbge: '53', nome: 'Distrito Federal', pibTotal: 365669.108, populacao: 2996899, pibPerCapita: 122015.82635917993 },
  { uf: 'GO', codIbge: '52', nome: 'Goiás', pibTotal: 336746.975, populacao: 7423629, pibPerCapita: 45361.50378743334 },
  { uf: 'MT', codIbge: '51', nome: 'Mato Grosso', pibTotal: 273008.586, populacao: 3893659, pibPerCapita: 70116.20329361148 },
  { uf: 'PE', codIbge: '26', nome: 'Pernambuco', pibTotal: 270474.919, populacao: 9562007, pibPerCapita: 28286.417171625162 },
  { uf: 'PA', codIbge: '15', nome: 'Pará', pibTotal: 254546.511, populacao: 8711196, pibPerCapita: 29220.615745530235 },
  { uf: 'CE', codIbge: '23', nome: 'Ceará', pibTotal: 232239.257, populacao: 9268836, pibPerCapita: 25055.924713739674 },
  { uf: 'ES', codIbge: '32', nome: 'Espírito Santo', pibTotal: 209829.732, populacao: 4126854, pibPerCapita: 50844.961319203445 },
  { uf: 'MS', codIbge: '50', nome: 'Mato Grosso do Sul', pibTotal: 184402.118, populacao: 2924631, pibPerCapita: 63051.413323595356 },
  { uf: 'AM', codIbge: '13', nome: 'Amazonas', pibTotal: 161794.976, populacao: 4321616, pibPerCapita: 37438.53595506866 },
  { uf: 'MA', codIbge: '21', nome: 'Maranhão', pibTotal: 149227.195, populacao: 7018211, pibPerCapita: 21262.853881138653 },
  { uf: 'RN', codIbge: '24', nome: 'Rio Grande do Norte', pibTotal: 101740.275, populacao: 3455236, pibPerCapita: 29445.246287084297 },
  { uf: 'PB', codIbge: '25', nome: 'Paraíba', pibTotal: 96963.174, populacao: 4164468, pibPerCapita: 23283.447969824716 },
  { uf: 'AL', codIbge: '27', nome: 'Alagoas', pibTotal: 89688.932, populacao: 3220848, pibPerCapita: 27846.372135536978 },
  { uf: 'PI', codIbge: '22', nome: 'Piauí', pibTotal: 80916.856, populacao: 3384547, pibPerCapita: 23907.735954028707 },
  { uf: 'RO', codIbge: '11', nome: 'Rondônia', pibTotal: 76456.179, populacao: 1751950, pibPerCapita: 43640.61702674163 },
  { uf: 'TO', codIbge: '17', nome: 'Tocantins', pibTotal: 64317.699, populacao: 1586859, pibPerCapita: 40531.45175469276 },
  { uf: 'SE', codIbge: '28', nome: 'Sergipe', pibTotal: 60816.662, populacao: 2299425, pibPerCapita: 26448.639116300816 },
  { uf: 'AP', codIbge: '16', nome: 'Amapá', pibTotal: 28020.12, populacao: 806517, pibPerCapita: 34742.1319079449 },
  { uf: 'AC', codIbge: '12', nome: 'Acre', pibTotal: 26291.321, populacao: 884372, pibPerCapita: 29728.803037635746 },
  { uf: 'RR', codIbge: '14', nome: 'Roraima', pibTotal: 25124.805, populacao: 738772, pibPerCapita: 34008.87553940864 },
];

export const MOCK_MAPA_RESPONSE: MapaResponse = {
  geojson: createMockGeoJson(MOCK_MAPA_ESTADOS),
  estados: MOCK_MAPA_ESTADOS,
};

export const MOCK_RESPONSES = {
  summary: buildResponse(MOCK_SUMMARY_CARDS, 'bcb-sgs+bcb-ptax+ibge-agregados'),
  selic: buildResponse(MOCK_SELIC_SERIES, 'bcb-sgs', '1Y'),
  ipca: buildResponse(MOCK_IPCA_SERIES, 'bcb-sgs', '1Y'),
  dolar: buildResponse(MOCK_DOLAR_SERIES, 'bcb-sgs', '1Y'),
  cdi: buildResponse(MOCK_CDI_SERIES, 'bcb-sgs', '1Y'),
  desemprego: buildResponse(MOCK_DESEMPREGO_SERIES, 'bcb-sgs', '1Y'),
  pibEstados: buildResponse(MOCK_PIB_ESTADOS, 'ibge-agregados'),
  pibSetores: buildResponse(MOCK_PIB_SETORES, 'ibge-agregados'),
  mapa: buildResponse(MOCK_MAPA_RESPONSE, 'ibge-agregados+ibge-malhas'),
};

function buildResponse<T>(
  data: T,
  source: string,
  period?: string,
): ApiResponse<T> {
  return {
    data,
    meta: {
      updatedAt: MOCK_UPDATED_AT,
      source,
      cached: false,
      stale: false,
      period,
    },
  };
}

function createMockGeoJson(estados: MapaUFData[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = estados.map((estado, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const minX = -74 + column * 4;
    const minY = -34 + row * 3;

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minX, minY],
          [minX + 2.6, minY],
          [minX + 2.6, minY + 1.8],
          [minX, minY + 1.8],
          [minX, minY],
        ]],
      },
      properties: {
        codarea: estado.codIbge,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
