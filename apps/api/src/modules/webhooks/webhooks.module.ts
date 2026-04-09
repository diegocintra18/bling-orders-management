import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { CreateOrderFromWebhookService } from './services/create-order-from-webhook.service';
import { OrdersModule } from '../orders/orders.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [OrdersModule, AccountsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, CreateOrderFromWebhookService],
})
export class WebhooksModule {}
