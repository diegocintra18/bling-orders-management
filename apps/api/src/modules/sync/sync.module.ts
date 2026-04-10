import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { AccountsModule } from '../accounts/accounts.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
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
    AuthModule,
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
