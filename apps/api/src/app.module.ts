import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { StoresModule } from './modules/stores/stores.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { SyncModule } from './modules/sync/sync.module';
import { DatabaseProviderModule } from './common/database/database.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    DatabaseProviderModule,
    SeedModule,
    AuthModule,
    AccountsModule,
    StoresModule,
    OrdersModule,
    WebhooksModule,
    TrackingModule,
    SyncModule,
  ],
})
export class AppModule {}
