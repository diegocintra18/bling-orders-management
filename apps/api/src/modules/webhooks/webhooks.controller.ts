import { Controller, Post, Headers, Body, Param, UnauthorizedException, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { BlingWebhookPayload } from '@bling-orders/core';

@Controller('webhook/bling')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':accountId')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('accountId') accountId: string,
    @Headers('x-webhook-token') webhookToken: string,
    @Body() payload: BlingWebhookPayload,
  ) {
    if (!webhookToken) {
      throw new UnauthorizedException('Missing webhook token');
    }

    try {
      await this.webhooksService.handleWebhook(accountId, payload, webhookToken);
      return { success: true };
    } catch (error) {
      this.logger.error({
        message: 'Webhook processing failed',
        accountId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
