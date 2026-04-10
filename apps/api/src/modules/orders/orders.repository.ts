import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from '../../common/schemas';
import type {
  Order as OrderEntity,
  IOrderRepository,
  OrderFilters,
} from '@bling-orders/core';
import type { OrderFiltersDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersRepository implements IOrderRepository {
  constructor(
    @InjectModel('Order') private readonly model: Model<OrderDocument>,
  ) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByExternalId(externalId: number, accountId: string): Promise<OrderEntity | null> {
    const doc = await this.model.findOne({ externalOrderId: externalId, accountId }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByAccountId(accountId: string, filters?: OrderFilters): Promise<OrderEntity[]> {
    const query = this.buildQuery({ accountId, ...filters });
    const docs = await this.model.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(this.mapToEntity);
  }

  async findByStoreId(storeId: string, filters?: OrderFilters): Promise<OrderEntity[]> {
    const query = this.buildQuery({ storeId, ...filters });
    const docs = await this.model.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(this.mapToEntity);
  }

  async findDelayed(filters?: { hoursThreshold?: number; accountId?: string; storeId?: string }): Promise<OrderEntity[]> {
    const query: Record<string, unknown> = { isDelayed: true };

    if (filters?.accountId) {
      query.accountId = filters.accountId;
    }
    if (filters?.storeId) {
      query.storeId = filters.storeId;
    }

    const docs = await this.model.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(this.mapToEntity);
  }

  async findPendingPicked(): Promise<OrderEntity[]> {
    const thresholdHours = 24;
    const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

    const docs = await this.model.find({
      isPicked: false,
      createdAt: { $lt: thresholdDate },
      isDelayed: false,
    }).exec();

    return docs.map(this.mapToEntity);
  }

  async countByAccountId(accountId: string, filters?: OrderFilters): Promise<number> {
    const query = this.buildQuery({ accountId, ...filters });
    return this.model.countDocuments(query).exec();
  }

  async create(data: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity> {
    const doc = new this.model(data);
    const saved = await doc.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<OrderEntity>): Promise<OrderEntity | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async updateMany(ids: string[], data: Partial<OrderEntity>): Promise<void> {
    await this.model.updateMany({ _id: { $in: ids } }, data).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  private buildQuery(filters: {
    accountId?: string;
    storeId?: string;
    status?: string[];
    isDelayed?: boolean;
    isPicked?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filters.accountId) query.accountId = filters.accountId;
    if (filters.storeId) query.storeId = filters.storeId;
    if (filters.status?.length) query.status = { $in: filters.status };
    if (typeof filters.isDelayed === 'boolean') query.isDelayed = filters.isDelayed;
    if (typeof filters.isPicked === 'boolean') query.isPicked = filters.isPicked;

    if (filters.dateFrom || filters.dateTo) {
      query.dataEmissao = {};
      if (filters.dateFrom) {
        (query.dataEmissao as Record<string, Date>).$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (query.dataEmissao as Record<string, Date>).$lte = filters.dateTo;
      }
    }

    if (filters.search) {
      query.$or = [
        { numero: { $regex: filters.search, $options: 'i' } },
        { 'cliente.nome': { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  private mapToEntity(doc: OrderDocument): OrderEntity {
    return {
      id: doc._id.toString(),
      externalOrderId: doc.externalOrderId,
      accountId: doc.accountId,
      storeId: doc.storeId,
      numero: doc.numero,
      status: doc.status as OrderEntity['status'],
      isPicked: doc.isPicked,
      isDelayed: doc.isDelayed,
      cliente: doc.cliente,
      itens: doc.itens,
      valorTotal: doc.valorTotal,
      dataEmissao: doc.dataEmissao,
      dataPrevista: doc.dataPrevista,
      dataDespacho: doc.dataDespacho,
      trackingCode: doc.trackingCode,
      syncStatus: doc.syncStatus as OrderEntity['syncStatus'],
      dataFaturamento: doc.dataFaturamento,
      dataEmbalamento: doc.dataEmbalamento,
      dataUltimaAtualizacaoStatus: doc.dataUltimaAtualizacaoStatus,
      notaFiscal: doc.notaFiscal,
      blingSituacaoOriginal: doc.blingSituacaoOriginal,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
