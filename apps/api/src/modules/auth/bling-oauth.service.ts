import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AccountsService } from '../accounts/accounts.service';

interface BlingTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

@Injectable()
export class BlingOAuthService {
  private readonly logger = new Logger(BlingOAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly accountsService: AccountsService,
  ) {}

  getAuthorizationUrl(state?: string): string {
    const clientId = this.configService.get<string>('BLING_CLIENT_ID');
    const redirectUri = encodeURIComponent(this.configService.get<string>('BLING_REDIRECT_URI') || 'http://localhost:3001/auth/bling/callback');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'pedidos.vendas.ver pedidos.vendas.editar produtos.ver',
      state: state || '',
    });

    return `https://bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, accountId: string): Promise<void> {
    const clientId = this.configService.get<string>('BLING_CLIENT_ID');
    const clientSecret = this.configService.get<string>('BLING_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('BLING_REDIRECT_URI') || 'http://localhost:3001/auth/bling/callback';

    try {
      const response = await axios.post<BlingTokenResponse>(
        'https://bling.com.br/Api/v3/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

      const companyData = await this.getCompanyData(access_token);

      await this.accountsService.update(accountId, {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: tokenExpiresAt,
        blingCompanyId: companyData.id,
        authType: 'oauth',
      });

      this.logger.log(`Account ${accountId} connected to Bling company ${companyData.id}`);
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new BadRequestException('Failed to connect to Bling');
    }
  }

  async refreshAccessToken(accountId: string): Promise<string> {
    const account = await this.accountsService.findById(accountId);

    if (!account || !account.refreshToken) {
      throw new BadRequestException('Account not found or not connected via OAuth');
    }

    try {
      const clientId = this.configService.get<string>('BLING_CLIENT_ID');
      const clientSecret = this.configService.get<string>('BLING_CLIENT_SECRET');

      const response = await axios.post<BlingTokenResponse>(
        'https://bling.com.br/Api/v3/oauth/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: account.refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'enable-jwt': '1',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

      await this.accountsService.update(accountId, {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: tokenExpiresAt,
      });

      this.logger.log(`Token refreshed for account ${accountId}`);
      return access_token;
    } catch (error) {
      this.logger.error('Failed to refresh token', error);
      throw new BadRequestException('Failed to refresh token');
    }
  }

  async getValidAccessToken(accountId: string): Promise<string> {
    const account = await this.accountsService.findById(accountId);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.authType !== 'oauth' || !account.accessToken) {
      return account.apiKey || '';
    }

    if (account.tokenExpiresAt && account.tokenExpiresAt > new Date()) {
      return account.accessToken;
    }

    return this.refreshAccessToken(accountId);
  }

  private async getCompanyData(accessToken: string): Promise<{ id: number; nome: string }> {
    try {
      const response = await axios.get('https://api.bling.com.br/Api/v3/empresas/me/dados-basicos', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'enable-jwt': '1',
        },
      });

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get company data', error);
      return { id: 0, nome: 'Unknown' };
    }
  }
}
