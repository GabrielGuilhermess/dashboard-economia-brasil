export interface BcbSgsRawPoint {
  data: string;
  valor: string | null;
}

export interface BcbPtaxRawResponse {
  '@odata.context': string;
  value: BcbPtaxCotacao[];
}

export interface BcbPtaxCotacao {
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
}
