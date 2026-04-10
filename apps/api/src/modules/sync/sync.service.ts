import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from '../../common/schemas';
import { BlingSyncService } from './bling-sync.service';
import { BlingOAuthService } from '../auth/bling-oauth.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectModel('Account') private readonly accountModel: Model<AccountDocument>,
    private readonly blingSyncService: BlingSyncService,
    private readonly blingOAuthService: BlingOAuthService,
  ) {}

  @Cron('*/15 * * * *')
  async syncAllAccounts(): Promise<void> {
    this.logger.log('Starting full sync for all accounts');

    const accounts = await this.accountModel.find({ isActive: true }).exec();

    for (const account of accounts) {
      try {
        await this.syncAccount(account);
      } catch (error) {
        this.logger.error({
          message: 'Failed to sync account',
          accountId: account._id.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log({
      message: 'Full sync completed',
      accountsProcessed: accounts.length,
    });
  }

  async syncAccount(account: AccountDocument): Promise<void> {
    this.logger.log({
      message: 'Syncing account',
      accountId: account._id.toString(),
    });

    let accessToken: string;

    if (account.authType === 'oauth' && account.accessToken) {
      accessToken = await this.blingOAuthService.getValidAccessToken(account._id.toString());
    } else if (account.apiKey) {
      accessToken = account.apiKey;
    } else {
      throw new Error(`Account ${account._id.toString()} has no valid authentication`);
    }

    await this.blingSyncService.syncAccountOrders(
      accessToken,
      account._id.toString(),
      account.storeId,
    );
  }

  async syncAccountById(accountId: string): Promise<void> {
    const account = await this.accountModel.findById(accountId).exec();

    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    await this.syncAccount(account);
  }
}
