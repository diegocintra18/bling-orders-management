import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckDelayedOrdersJob } from './check-delayed-orders.job';
import { OrdersModule } from '../orders/orders.module';
import { OrderSchema } from '../../common/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    OrdersModule,
  ],
  providers: [CheckDelayedOrdersJob],
  exports: [CheckDelayedOrdersJob],
})
export class TrackingModule {}
