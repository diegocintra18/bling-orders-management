import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { OrdersModule } from '../orders/orders.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [OrdersModule, AccountsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
