import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../../common/schemas';
import { createBlingClient } from '@bling-orders/infra';
import type { IBlingClient, BlingOrderResponse, BlingSituacao } from '@bling-orders/infra';
import type { OrderItem } from '@bling-orders/core';

@Injectable()
export class BlingSyncService {
  private readonly logger = new Logger(BlingSyncService.name);

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
  ) {}

  async syncAccountOrders(
    accessToken: string,
    accountId: string,
    storeId: string,
  ): Promise<void> {
    const blingClient: IBlingClient = createBlingClient(accessToken);

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await blingClient.getOrders({
        pagina: page,
        limite: 100,
      });

      for (const orderData of response.data) {
        await this.upsertOrder(accountId, storeId, orderData);
      }

      hasMore = page < response.totalPages;
      page++;

      this.logger.log({
        message: 'Synced page',
        accountId,
        page,
        ordersOnPage: response.data.length,
      });
    }
  }

  private async upsertOrder(
    accountId: string,
    storeId: string,
    data: BlingOrderResponse,
  ): Promise<void> {
    const statusInfo = this.mapStatus(data.situacao);

    const existingOrder = await this.orderModel.findOne({
      externalOrderId: data.id,
      accountId,
    }).exec();

    if (existingOrder) {
      const oldStatus = existingOrder.status;
      existingOrder.status = statusInfo.status;
      existingOrder.dataDespacho = data.dataSaida
        ? new Date(data.dataSaida)
        : existingOrder.dataDespacho;
      existingOrder.trackingCode = data.codigosRastreamento?.[0] || existingOrder.trackingCode;
      existingOrder.syncStatus = 'synced';

      if (oldStatus !== statusInfo.status) {
        existingOrder.dataUltimaAtualizacaoStatus = new Date();
        if (statusInfo.dataFaturamento && !existingOrder.dataFaturamento) {
          existingOrder.dataFaturamento = statusInfo.dataFaturamento;
        }
        if (statusInfo.dataEmbalamento && !existingOrder.dataEmbalamento) {
          existingOrder.dataEmbalamento = statusInfo.dataEmbalamento;
        }
      }

      await existingOrder.save();
    } else {
      const newOrder = new this.orderModel({
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
        itens: data.itens.map((item: OrderItem) => ({
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
        blingSituacaoOriginal: {
          id: data.situacao?.id || 0,
          nome: data.situacao?.nome || '',
        },
      });

      await newOrder.save();

      this.logger.log({
        message: 'order_processed',
        accountId,
        orderId: data.id,
        numero: data.numero,
      });
    }
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
    };

    return {
      status: statusMap[situacaoNome] || 'pendente',
      dataFaturamento: null,
      dataEmbalamento: null,
    };
  }
}
