import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../../common/schemas';
import { createBlingClient } from '@bling-orders/infra';
import type { IBlingClient, BlingOrderResponse } from '@bling-orders/infra';
import type { OrderItem } from '@bling-orders/core';

@Injectable()
export class BlingSyncService {
  private readonly logger = new Logger(BlingSyncService.name);

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
  ) {}

  async syncAccountOrders(
    apiKey: string,
    accountId: string,
    storeId: string,
  ): Promise<void> {
    const blingClient: IBlingClient = createBlingClient(apiKey);

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
    const existingOrder = await this.orderModel.findOne({
      externalOrderId: data.id,
      accountId,
    }).exec();

    if (existingOrder) {
      existingOrder.status = this.mapStatus(data.situacao);
      existingOrder.dataDespacho = data.dataSaida
        ? new Date(data.dataSaida)
        : existingOrder.dataDespacho;
      existingOrder.trackingCode = data.codigosRastreamento?.[0] || existingOrder.trackingCode;
      existingOrder.syncStatus = 'synced';

      await existingOrder.save();
    } else {
      const newOrder = new this.orderModel({
        externalOrderId: data.id,
        accountId,
        storeId,
        numero: data.numero,
        status: this.mapStatus(data.situacao),
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

  private mapStatus(blingStatus: string): string {
    const statusMap: Record<string, string> = {
      'Aguardando Pagamento': 'pendente',
      'Pago': 'pago',
      'Em Separacao': 'separado',
      'Separado': 'separado',
      'Despachado': 'despachado',
      'Entregue': 'entregue',
    };

    return statusMap[blingStatus] || 'pendente';
  }
}
