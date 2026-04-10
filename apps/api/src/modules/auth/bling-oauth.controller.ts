import { Controller, Get, Query, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { BlingOAuthService } from './bling-oauth.service';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from '../accounts/accounts.service';

@Controller('auth/bling')
export class BlingOAuthController {
  private readonly logger = new Logger(BlingOAuthService.name);

  constructor(
    private readonly blingOAuthService: BlingOAuthService,
    private readonly accountsService: AccountsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async initiateOAuth(@Query('accountId') accountId: string, @Res() res: Response) {
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const account = await this.accountsService.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const state = Buffer.from(JSON.stringify({ accountId, storeId: account.storeId })).toString('base64');
    const authUrl = this.blingOAuthService.getAuthorizationUrl(state);

    return res.json({ url: authUrl });
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(`/lojas?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect('/lojas?error=no_code');
    }

    try {
      const { accountId } = JSON.parse(Buffer.from(state, 'base64').toString());
      await this.blingOAuthService.exchangeCodeForTokens(code, accountId);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/contas?success=connected`);
    } catch (error) {
      this.logger.error('OAuth callback error', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/contas?error=oauth_failed`);
    }
  }

  @Get('webhook-url')
  @UseGuards(AuthGuard('jwt'))
  async getWebhookUrl(@Query('accountId') accountId: string) {
    if (!accountId) {
      return { error: 'accountId is required' };
    }

    const account = await this.accountsService.findById(accountId);
    if (!account) {
      return { error: 'Account not found' };
    }

    const webhookUrl = `http://localhost:3001/webhook/bling/${accountId}?token=${account.webhookToken}`;

    return { url: webhookUrl };
  }
}
