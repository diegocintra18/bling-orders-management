import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { OrderDocument } from '../../common/schemas';

@Injectable()
export class CheckDelayedOrdersJob {
  private readonly logger = new Logger(CheckDelayedOrdersJob.name);
  private readonly thresholdHours: number;

  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    private readonly configService: ConfigService,
  ) {
    this.thresholdHours = this.configService.get<number>('DELAY_THRESHOLD_HOURS', 24);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async execute(): Promise<void> {
    this.logger.log('Starting delayed orders check');

    const thresholdDate = new Date(Date.now() - this.thresholdHours * 60 * 60 * 1000);

    const pendingOrders = await this.orderModel.find({
      isPicked: false,
      isDelayed: false,
      createdAt: { $lt: thresholdDate },
    }).exec();

    if (pendingOrders.length === 0) {
      this.logger.log('No pending orders to mark as delayed');
      return;
    }

    const orderIds = pendingOrders.map((order) => order._id);

    await this.orderModel.updateMany(
      { _id: { $in: orderIds } },
      { isDelayed: true },
    ).exec();

    this.logger.log({
      message: 'Marked orders as delayed',
      count: orderIds.length,
      thresholdHours: this.thresholdHours,
    });

    for (const order of pendingOrders) {
      this.logger.log({
        event: 'delay_detected',
        accountId: order.accountId,
        orderId: order._id.toString(),
        numero: order.numero,
        hoursPending: Math.floor(
          (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60),
        ),
      });
    }
  }
}
