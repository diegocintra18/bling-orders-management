import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../../../common/schemas';
import type { BlingOrderResponse } from '@bling-orders/core';

@Injectable()
export class CreateOrderFromWebhookService {
  private readonly logger = new Logger(CreateOrderFromWebhookService.name);

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
  ) {}

  async execute(
    accountId: string,
    storeId: string,
    data: unknown,
  ): Promise<void> {
    const orderData = data as BlingOrderResponse;

    try {
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
        orderId: orderData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async createNewOrder(
    accountId: string,
    storeId: string,
    data: BlingOrderResponse,
  ): Promise<void> {
    const order = new this.orderModel({
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
    });

    await order.save();

    this.logger.log({
      message: 'Order created from webhook',
      accountId,
      orderId: data.id,
      numero: data.numero,
    });
  }

  private async updateExistingOrder(
    existing: OrderDocument,
    data: BlingOrderResponse,
  ): Promise<void> {
    existing.status = this.mapStatus(data.situacao);
    existing.dataDespacho = data.dataSaida ? new Date(data.dataSaida) : existing.dataDespacho;
    existing.trackingCode = data.codigosRastreamento?.[0] || existing.trackingCode;
    existing.syncStatus = 'synced';

    await existing.save();

    this.logger.log({
      message: 'Order updated from webhook',
      accountId: existing.accountId,
      orderId: data.id,
    });
  }

  private mapStatus(blingStatus: string): string {
    const statusMap: Record<string, string> = {
      'Aguardando Pagamento': 'pendente',
      'Pago': 'pago',
      'Em Separacao': 'separado',
      'Separado': 'separado',
      'Despachado': 'despachado',
      'Entregue': 'entregue',
      'Cancelado': 'entregue',
    };

    return statusMap[blingStatus] || 'pendente';
  }
}
