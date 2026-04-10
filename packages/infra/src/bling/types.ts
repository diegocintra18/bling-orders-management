export interface IBlingClient {
  getOrder(orderId: number): Promise<BlingOrderResponse | null>;
  getOrders(params?: BlingOrdersParams): Promise<BlingOrdersResponse>;
  validateWebhook(data: unknown, token: string): boolean;
}

export interface BlingOrderResponse {
  id: number;
  numero: string;
  situacao: BlingSituacao;
  cliente: {
    nome: string;
    telefone?: string | null;
    email?: string | null;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  valorTotal: number;
  dataEmissao: string;
  dataPrevista?: string | undefined;
  dataSaida?: string | undefined;
  codigosRastreamento?: string[] | undefined;
  notaFiscal?: BlingNotaFiscal | null;
  loja?: BlingLoja | null;
}

export interface BlingSituacao {
  id: number;
  nome?: string;
  valor?: number;
}

export interface BlingNotaFiscal {
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao?: string;
}

export interface BlingLoja {
  id: number;
  descricao?: string;
  unidadeNegocio?: {
    id: number;
    descricao?: string;
  };
}

export interface BlingOrdersParams {
  dataEmissao?: {
    inicio: string;
    fim: string;
  };
  dataAlteracao?: {
    inicio: string;
    fim: string;
  };
  idsSituacoes?: number[];
  pagina?: number;
  limite?: number;
  idLoja?: number;
}

export interface BlingOrdersResponse {
  data: BlingOrderResponse[];
  totalPages: number;
  currentPage: number;
}

export interface BlingWebhookPayload {
  id: number | string;
  tipo: string;
  data?: string;
}
