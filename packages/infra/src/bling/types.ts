export interface IBlingClient {
  getOrder(orderId: number): Promise<BlingOrderResponse | null>;
  getOrders(params?: BlingOrdersParams): Promise<BlingOrdersResponse>;
  validateWebhook(data: unknown, token: string): boolean;
}

export interface BlingOrderResponse {
  id: number;
  numero: string;
  situacao: string;
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
}

export interface BlingOrdersParams {
  dataEmissao?: {
    inicio: string;
    fim: string;
  };
  situacao?: number;
  pagina?: number;
  limite?: number;
}

export interface BlingOrdersResponse {
  data: BlingOrderResponse[];
  totalPages: number;
  currentPage: number;
}

export interface BlingWebhookPayload {
  id: number | string;
}
