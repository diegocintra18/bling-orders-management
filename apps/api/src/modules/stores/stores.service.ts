import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreDocument } from '../../common/schemas';
import type { Store as StoreEntity } from '@bling-orders/core';
import type { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel('Store') private readonly storeModel: Model<StoreDocument>,
  ) {}

  async findById(id: string): Promise<StoreEntity> {
    const store = await this.storeModel.findById(id).exec();
    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }
    return this.mapToEntity(store);
  }

  async findByOwnerId(ownerId: string): Promise<StoreEntity[]> {
    const stores = await this.storeModel.find({ ownerId }).exec();
    return stores.map(this.mapToEntity);
  }

  async findAll(): Promise<StoreEntity[]> {
    const stores = await this.storeModel.find().exec();
    return stores.map(this.mapToEntity);
  }

  async create(dto: CreateStoreDto, ownerId: string): Promise<StoreEntity> {
    const store = new this.storeModel({ ...dto, ownerId });
    const saved = await store.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, dto: UpdateStoreDto): Promise<StoreEntity> {
    const store = await this.storeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!store) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }
    return this.mapToEntity(store);
  }

  async delete(id: string): Promise<void> {
    const result = await this.storeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Store with id ${id} not found`);
    }
  }

  private mapToEntity(doc: StoreDocument): StoreEntity {
    return {
      id: doc._id.toString(),
      name: doc.name,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
