import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../../../common/schemas';
import { AccountsService } from '../../accounts/accounts.service';
import { BlingOAuthService } from '../../auth/bling-oauth.service';
import { createBlingClient } from '@bling-orders/infra';

interface BlingSituacao {
  id: number;
  nome?: string;
  valor?: number;
}

interface BlingOrderData {
  id: number;
  numero: string;
  situacao: BlingSituacao | string;
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
  dataPrevista?: string;
  dataSaida?: string;
  codigosRastreamento?: string[];
  notaFiscal?: {
    numero: string;
    serie: string;
    chaveAcesso?: string | null;
    dataEmissao?: string | null;
  } | null;
  loja?: {
    id: number;
    descricao?: string;
    unidadeNegocio?: {
      id: number;
      descricao?: string;
    };
  } | null;
}

@Injectable()
export class CreateOrderFromWebhookService {
  private readonly logger = new Logger(CreateOrderFromWebhookService.name);

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    private readonly accountsService: AccountsService,
    private readonly blingOAuthService: BlingOAuthService,
  ) {}

  async execute(
    accountId: string,
    storeId: string,
    data: unknown,
  ): Promise<void> {
    const webhookData = data as BlingOrderData;

    try {
      const verifiedData = await this.verifyOrderFromBlingAPI(webhookData.id, accountId);

      if (!verifiedData) {
        this.logger.warn(`Order ${webhookData.id} could not be verified from Bling API`);
      }

      const orderData = verifiedData || webhookData;

      const existingOrder = await this.orderModel.findOne({
        externalOrderId: orderData.id,
        accountId,
      }).exec();

      if (existingOrder) {
        await this.updateExistingOrder(existingOrder, orderData);
        return;
      }

      await this.createNewOrder(accountId, storeId, orderData);
    } catch (error) {
      this.logger.error({
        message: 'Error processing webhook order',
        accountId,
        orderId: webhookData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async verifyOrderFromBlingAPI(
    orderId: number,
    accountId: string,
  ): Promise<BlingOrderData | null> {
    try {
      const accessToken = await this.blingOAuthService.getValidAccessToken(accountId);
      const blingClient = createBlingClient(accessToken);
      const verifiedOrder = await blingClient.getOrder(orderId);
      
      if (verifiedOrder) {
        return verifiedOrder as unknown as BlingOrderData;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to verify order ${orderId} from Bling API`, error);
      return null;
    }
  }

  private async createNewOrder(
    accountId: string,
    storeId: string,
    data: BlingOrderData,
  ): Promise<void> {
    const statusInfo = this.mapStatus(data.situacao);

    const order = new this.orderModel({
      externalOrderId: data.id,
      accountId,
      storeId,
      numero: data.numero,
      status: statusInfo.status,
      isPicked: false,
      isDelayed: false,
      cliente: {
        nome: data.cliente.nome,
        telefone: data.cliente.telefone || null,
        email: data.cliente.email || null,
      },
      itens: data.itens.map((item) => ({
        codigo: item.codigo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
      })),
      valorTotal: data.valorTotal,
      dataEmissao: new Date(data.dataEmissao),
      dataPrevista: data.dataPrevista ? new Date(data.dataPrevista) : null,
      dataDespacho: data.dataSaida ? new Date(data.dataSaida) : null,
      trackingCode: data.codigosRastreamento?.[0] || null,
      syncStatus: 'synced',
      dataFaturamento: statusInfo.dataFaturamento,
      dataEmbalamento: statusInfo.dataEmbalamento,
      dataUltimaAtualizacaoStatus: new Date(),
      notaFiscal: data.notaFiscal || null,
      blingSituacaoOriginal: this.extractSituacao(data.situacao),
    });

    await order.save();

    this.logger.log({
      message: 'Order created from webhook',
      accountId,
      orderId: data.id,
      numero: data.numero,
      status: statusInfo.status,
    });
  }

  private async updateExistingOrder(
    existing: OrderDocument,
    data: BlingOrderData,
  ): Promise<void> {
    const oldStatus = existing.status;
    const statusInfo = this.mapStatus(data.situacao);

    existing.status = statusInfo.status;
    existing.dataDespacho = data.dataSaida ? new Date(data.dataSaida) : existing.dataDespacho;
    existing.trackingCode = data.codigosRastreamento?.[0] || existing.trackingCode;
    existing.syncStatus = 'synced';

    if (oldStatus !== statusInfo.status) {
      existing.dataUltimaAtualizacaoStatus = new Date();

      if (statusInfo.dataFaturamento && !existing.dataFaturamento) {
        existing.dataFaturamento = statusInfo.dataFaturamento;
      }
      if (statusInfo.dataEmbalamento && !existing.dataEmbalamento) {
        existing.dataEmbalamento = statusInfo.dataEmbalamento;
      }
    }

    if (data.notaFiscal) {
      existing.notaFiscal = data.notaFiscal;
    }
    existing.blingSituacaoOriginal = this.extractSituacao(data.situacao);

    await existing.save();

    this.logger.log({
      message: 'Order updated from webhook',
      accountId: existing.accountId,
      orderId: data.id,
      oldStatus,
      newStatus: statusInfo.status,
    });
  }

  private extractSituacao(situacao: BlingSituacao | string): { id: number; nome: string } {
    if (typeof situacao === 'string') {
      return { id: 0, nome: situacao };
    }
    return {
      id: situacao?.id || 0,
      nome: situacao?.nome || '',
    };
  }

  private mapStatus(situacao: BlingSituacao | string): {
    status: string;
    dataFaturamento: Date | null;
    dataEmbalamento: Date | null;
  } {
    const situacaoNome = typeof situacao === 'string' ? situacao : situacao?.nome || '';
    const now = new Date();

    if (situacaoNome === 'Faturado' || situacaoNome === 'Nota Fiscal Gerada') {
      return {
        status: 'faturado',
        dataFaturamento: now,
        dataEmbalamento: null,
      };
    }

    if (situacaoNome === 'Embalado' || situacaoNome === 'Verificado') {
      return {
        status: 'embalado',
        dataFaturamento: null,
        dataEmbalamento: now,
      };
    }

    const statusMap: Record<string, string> = {
      'Aguardando Pagamento': 'pendente',
      'Pago': 'pago',
      'Em Separacao': 'separado',
      'Separado': 'separado',
      'Despachado': 'despachado',
      'Entregue': 'entregue',
      'Cancelado': 'entregue',
    };

    return {
      status: statusMap[situacaoNome] || 'pendente',
      dataFaturamento: null,
      dataEmbalamento: null,
    };
  }
}
