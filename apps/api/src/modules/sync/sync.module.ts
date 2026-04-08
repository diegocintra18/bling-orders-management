import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { AccountsModule } from '../accounts/accounts.module';
import { OrdersModule } from '../orders/orders.module';
import { BlingSyncService } from './bling-sync.service';
import { OrderSchema, AccountSchema } from '../../common/schemas';
import { createBlingClient } from '@bling-orders/infra';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Account', schema: AccountSchema },
    ]),
    AccountsModule,
    OrdersModule,
  ],
  providers: [
    SyncService,
    BlingSyncService,
    {
      provide: 'BLING_CLIENT_FACTORY',
      useValue: createBlingClient,
    },
  ],
  exports: [SyncService],
})
export class SyncModule {}
