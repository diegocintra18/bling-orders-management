import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoresService } from './stores.service';
import type { UpdateStoreDto } from './dto/store.dto';
import { Request as ExpressRequest } from 'express';

@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storesService.findById(id);
  }

  @Post()
  async create(@Body() body: any, @Request() req: ExpressRequest & { user: { sub: string } }) {
    const name = body?.Name || body?.name;
    return this.storesService.create({ name }, req.user?.sub || 'unknown');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.storesService.delete(id);
  }
}
