import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderFromWebhookService } from './services/create-order-from-webhook.service';
import type { BlingWebhookPayload } from '@bling-orders/core';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly ordersService: OrdersService,
    private readonly createOrderService: CreateOrderFromWebhookService,
  ) {}

  async handleWebhook(
    accountId: string,
    payload: BlingWebhookPayload,
    webhookToken: string,
  ): Promise<void> {
    const account = await this.accountsService.findById(accountId);

    if (!account) {
      this.logger.warn(`Webhook received for unknown account: ${accountId}`);
      throw new UnauthorizedException('Account not found');
    }

    if (account.webhookToken !== webhookToken) {
      this.logger.warn(`Invalid webhook token for account: ${accountId}`);
      throw new UnauthorizedException('Invalid webhook token');
    }

    this.logger.log({
      message: 'Webhook received',
      accountId,
      orderId: payload.id,
      tipo: payload.tipo,
    });

    if (payload.tipo === 'pedido') {
      await this.createOrderService.execute(accountId, account.storeId, payload.data);
    }

    if (payload.tipo === 'rastreamento') {
      await this.handleTrackingUpdate(accountId, payload.data);
    }
  }

  private async handleTrackingUpdate(
    accountId: string,
    data: unknown,
  ): Promise<void> {
    const trackingData = data as {
      pedidoId: number;
      codigosRastreamento?: string[];
    };

    const order = await this.ordersService.findByAccountId(accountId);

    const foundOrder = order.find(
      (o) => o.externalOrderId === trackingData.pedidoId,
    );

    if (foundOrder && trackingData.codigosRastreamento?.length) {
      await this.ordersService.updateStatus(foundOrder.id, {
        status: 'despachado',
      });
    }
  }
}
