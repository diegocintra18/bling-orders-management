import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';
import type { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findById(id);
  }

  @Post()
  async create(@Body() body: any) {
    const dto: CreateAccountDto = {
      name: body?.Name || body?.name,
      apiKey: body?.apiKey || body?.ApiKey,
      storeId: body?.storeId || body?.StoreId,
    };
    return this.accountsService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.accountsService.delete(id);
  }

  @Post(':id/regenerate-token')
  async regenerateToken(@Param('id', ParseUUIDPipe) id: string) {
    const newToken = await this.accountsService.regenerateWebhookToken(id);
    return { webhookToken: newToken };
  }
}
