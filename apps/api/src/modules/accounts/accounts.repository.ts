import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from '../../common/schemas';
import type { Account } from '@bling-orders/core';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectModel('Account') private readonly model: Model<AccountDocument>,
  ) {}

  async findById(id: string): Promise<Account | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByStoreId(storeId: string): Promise<Account[]> {
    const docs = await this.model.find({ storeId }).exec();
    return docs.map(this.mapToEntity);
  }

  async findAll(): Promise<Account[]> {
    const docs = await this.model.find().exec();
    return docs.map(this.mapToEntity);
  }

  async create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const doc = new this.model(data);
    const saved = await doc.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Account>): Promise<Account | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  private mapToEntity(doc: AccountDocument): Account {
    return {
      id: doc._id.toString(),
      name: doc.name,
      apiKey: doc.apiKey,
      webhookToken: doc.webhookToken,
      storeId: doc.storeId,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
