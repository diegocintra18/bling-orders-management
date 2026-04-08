import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from './accounts.repository';
import { Account, AccountSchema } from '../../common/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService, AccountsRepository],
})
export class AccountsModule {}
