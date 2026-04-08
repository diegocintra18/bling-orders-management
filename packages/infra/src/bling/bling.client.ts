import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  IBlingClient,
  BlingOrderResponse,
  BlingOrdersParams,
  BlingOrdersResponse,
  BlingWebhookPayload,
} from './types.js';

export class BlingClient implements IBlingClient {
  private readonly baseUrl = 'https://api.bling.com.br/Api/v3';
  private readonly apiKey: string;
  private readonly client: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async getOrder(orderId: number): Promise<BlingOrderResponse | null> {
    try {
      const response: AxiosResponse = await this.client.get(
        `/pedidos/${orderId}`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getOrders(params?: BlingOrdersParams): Promise<BlingOrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.dataEmissao) {
      queryParams.append('dataEmissao[inicio]', params.dataEmissao.inicio);
      queryParams.append('dataEmissao[fim]', params.dataEmissao.fim);
    }
    if (params?.situacao) {
      queryParams.append('situacao', params.situacao.toString());
    }
    if (params?.pagina) {
      queryParams.append('pagina', params.pagina.toString());
    }
    if (params?.limite) {
      queryParams.append('limite', params.limite.toString());
    }

    const response: AxiosResponse = await this.client.get(
      `/pedidos?${queryParams.toString()}`
    );

    const data = response.data.data || [];
    return {
      data: data.map(this.mapOrder),
      totalPages: response.data.meta?.totalPages || 1,
      currentPage: params?.pagina || 1,
    };
  }

  validateWebhook(data: unknown, token: string): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    const payload = data as BlingWebhookPayload;
    return String(payload.id) === token;
  }

  private mapOrder(raw: Record<string, unknown>): BlingOrderResponse {
    return {
      id: raw.id as number,
      numero: raw.numero as string,
      situacao: raw.situacao as string,
      cliente: {
        nome: (raw.cliente as Record<string, unknown>)?.nome as string || '',
        telefone: (raw.cliente as Record<string, unknown>)?.telefone as string,
        email: (raw.cliente as Record<string, unknown>)?.email as string,
      },
      itens: (raw.itens as Array<Record<string, unknown>>)?.map((item) => ({
        codigo: item.codigo as string,
        descricao: item.descricao as string,
        quantidade: item.quantidade as number,
        valorUnitario: item.valorUnitario as number,
      })) || [],
      valorTotal: raw.valorTotal as number,
      dataEmissao: raw.dataEmissao as string,
      dataPrevista: raw.dataPrevista as string | undefined,
      dataSaida: raw.dataSaida as string | undefined,
      codigosRastreamento: raw.codigosRastreamento as string[] | undefined,
    };
  }
}

export function createBlingClient(apiKey: string): IBlingClient {
  return new BlingClient(apiKey);
}
