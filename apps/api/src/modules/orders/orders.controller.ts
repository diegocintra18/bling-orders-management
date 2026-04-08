import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import type { OrderFiltersDto, UpdateOrderStatusDto, UpdateOrderPickedDto } from './dto/order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query() filters: OrderFiltersDto) {
    return this.ordersService.findAll(filters);
  }

  @Get('stats')
  async getStats(@Query('storeId') storeId?: string) {
    return this.ordersService.getStats(storeId);
  }

  @Get('delayed')
  async findDelayed(
    @Query('accountId') accountId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.ordersService.findDelayed(accountId, storeId);
  }

  @Get('by-account/:accountId')
  async findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query() filters: OrderFiltersDto,
  ) {
    return this.ordersService.findByAccountId(accountId, filters);
  }

  @Get('by-store/:storeId')
  async findByStore(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query() filters: OrderFiltersDto,
  ) {
    return this.ordersService.findByStoreId(storeId, filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Put(':id/picked')
  async updatePicked(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderPickedDto,
  ) {
    return this.ordersService.updatePicked(id, dto);
  }
}
