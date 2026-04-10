import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  IBlingClient,
  BlingOrderResponse,
  BlingOrdersParams,
  BlingOrdersResponse,
  BlingWebhookPayload,
  BlingSituacao,
} from './types.js';

export class BlingClient implements IBlingClient {
  private readonly baseUrl = 'https://api.bling.com.br/Api/v3';
  private readonly accessToken: string;
  private readonly client: AxiosInstance;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'enable-jwt': '1',
      },
      timeout: 30000,
    });
  }

  async getOrder(orderId: number): Promise<BlingOrderResponse | null> {
    try {
      const response: AxiosResponse = await this.client.get(
        `/pedidos/vendas/${orderId}`
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
      queryParams.append('dataInicial', params.dataEmissao.inicio);
      queryParams.append('dataFinal', params.dataEmissao.fim);
    }
    if (params?.dataAlteracao) {
      queryParams.append('dataAlteracaoInicial', params.dataAlteracao.inicio);
      queryParams.append('dataAlteracaoFinal', params.dataAlteracao.fim);
    }
    if (params?.idsSituacoes && params.idsSituacoes.length > 0) {
      params.idsSituacoes.forEach((id) => {
        queryParams.append('idsSituacoes[]', id.toString());
      });
    }
    if (params?.pagina) {
      queryParams.append('pagina', params.pagina.toString());
    }
    if (params?.limite) {
      queryParams.append('limite', params.limite.toString());
    }
    if (params?.idLoja) {
      queryParams.append('idLoja', params.idLoja.toString());
    }

    const response: AxiosResponse = await this.client.get(
      `/pedidos/vendas?${queryParams.toString()}`
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
    const situacaoRaw = raw.situacao as Record<string, unknown> | undefined;
    const situacao: BlingSituacao = {
      id: situacaoRaw?.id as number || 0,
      nome: situacaoRaw?.nome as string,
      valor: situacaoRaw?.valor as number,
    };

    const clienteRaw = raw.contato as Record<string, unknown> | undefined;

    return {
      id: raw.id as number,
      numero: raw.numero as string,
      situacao,
      cliente: {
        nome: clienteRaw?.nome as string || '',
        telefone: clienteRaw?.telefone as string,
        email: clienteRaw?.email as string,
      },
      itens: (raw.itens as Array<Record<string, unknown>>)?.map((item) => ({
        codigo: item.codigo as string,
        descricao: item.descricao as string,
        quantidade: item.quantidade as number,
        valorUnitario: item.precoUnitario as number || item.valorUnitario as number,
      })) || [],
      valorTotal: raw.total as number || raw.totalProdutos as number,
      dataEmissao: raw.data as string,
      dataPrevista: raw.dataPrevista as string | undefined,
      dataSaida: raw.dataSaida as string | undefined,
      notaFiscal: raw.notaFiscal as BlingOrderResponse['notaFiscal'],
      loja: raw.loja as BlingOrderResponse['loja'],
    };
  }
}

export function createBlingClient(accessToken: string): IBlingClient {
  return new BlingClient(accessToken);
}
