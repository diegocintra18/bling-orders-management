import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from '../../common/schemas';
import type { RefreshToken } from '@bling-orders/core';

@Injectable()
export class RefreshTokensService implements OnModuleInit {
  constructor(
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async onModuleInit() {
    await this.deleteExpired();
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const doc = await this.refreshTokenModel.findOne({ token }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const docs = await this.refreshTokenModel.find({ userId }).exec();
    return docs.map(this.mapToEntity);
  }

  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const doc = new this.refreshTokenModel(data);
    const saved = await doc.save();
    return this.mapToEntity(saved);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId }).exec();
  }

  async deleteByToken(token: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ token }).exec();
  }

  async deleteExpired(): Promise<void> {
    await this.refreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();
  }

  private mapToEntity(doc: RefreshTokenDocument): RefreshToken {
    return {
      id: doc._id.toString(),
      token: doc.token,
      userId: doc.userId,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }
}
