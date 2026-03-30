export interface IbgeAgregadoRaw {
  id: string;
  variavel: string;
  unidade: string;
  resultados: IbgeResultado[];
}

export interface IbgeResultado {
  classificacoes: IbgeClassificacao[];
  series: IbgeSerie[];
}

export interface IbgeClassificacao {
  id: string;
  nome: string;
  categoria: Record<string, string>;
}

export interface IbgeSerie {
  localidade: {
    id: string;
    nome: string;
    nivel: {
      id: string;
      nome: string;
    };
  };
  serie: Record<string, string>;
}
