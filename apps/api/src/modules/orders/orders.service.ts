import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { AccountsService } from '../accounts/accounts.service';
import type { Order, OrderStatus } from '@bling-orders/core';
import type { OrderFiltersDto, OrderStatsDto, UpdateOrderStatusDto, UpdateOrderPickedDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly accountsService: AccountsService,
  ) {}

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async findByAccountId(accountId: string, filters?: OrderFiltersDto): Promise<Order[]> {
    return this.ordersRepository.findByAccountId(accountId, this.mapFilters(filters));
  }

  async findByStoreId(storeId: string, filters?: OrderFiltersDto): Promise<Order[]> {
    return this.ordersRepository.findByStoreId(storeId, this.mapFilters(filters));
  }

  async findAll(filters?: OrderFiltersDto): Promise<Order[]> {
    const allAccounts = await this.accountsService.findAllActive();
    const allOrders: Order[] = [];

    for (const account of allAccounts) {
      const orders = await this.ordersRepository.findByAccountId(account.id, this.mapFilters(filters));
      allOrders.push(...orders);
    }

    return allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findDelayed(accountId?: string, storeId?: string): Promise<Order[]> {
    return this.ordersRepository.findDelayed({ accountId, storeId });
  }

  async getStats(storeId?: string): Promise<OrderStatsDto> {
    const accounts = storeId
      ? await this.accountsService.findByStoreId(storeId)
      : await this.accountsService.findAllActive();

    let total = 0;
    let pending = 0;
    let picked = 0;
    let delayed = 0;
    let dispatched = 0;

    for (const account of accounts) {
      const allOrders = await this.ordersRepository.findByAccountId(account.id);
      const filteredOrders = storeId
        ? allOrders.filter(o => o.storeId === storeId)
        : allOrders;

      total += filteredOrders.length;
      pending += filteredOrders.filter(o => !o.isPicked && o.status === 'pendente').length;
      picked += filteredOrders.filter(o => o.isPicked && o.status !== 'despachado').length;
      delayed += filteredOrders.filter(o => o.isDelayed).length;
      dispatched += filteredOrders.filter(o => o.status === 'despachado').length;
    }

    return { total, pending, picked, delayed, dispatched };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.ordersRepository.update(id, { status: dto.status as OrderStatus });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async updatePicked(id: string, dto: UpdateOrderPickedDto): Promise<Order> {
    const order = await this.ordersRepository.update(id, { isPicked: dto.isPicked });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  private mapFilters(filters?: OrderFiltersDto): {
    status?: string[];
    isDelayed?: boolean;
    isPicked?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  } {
    if (!filters) return {};

    return {
      status: filters.status,
      isDelayed: filters.isDelayed,
      isPicked: filters.isPicked,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      search: filters.search,
    };
  }
}
