import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AccountDocument } from '../../common/schemas';
import type { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<AccountDocument>,
  ) {}

  async findById(id: string): Promise<AccountDocument | null> {
    return this.accountModel.findById(id).exec();
  }

  async findByStoreId(storeId: string): Promise<AccountDocument[]> {
    return this.accountModel.find({ storeId }).exec();
  }

  async findAll(): Promise<AccountDocument[]> {
    return this.accountModel.find().exec();
  }

  async findAllActive(): Promise<AccountDocument[]> {
    return this.accountModel.find({ isActive: true }).exec();
  }

  async create(dto: CreateAccountDto): Promise<AccountDocument> {
    const webhookToken = uuidv4();
    const account = new this.accountModel({
      ...dto,
      webhookToken,
      isActive: true,
    });
    return account.save();
  }

  async update(id: string, dto: UpdateAccountDto): Promise<AccountDocument | null> {
    return this.accountModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.deleteOne({ _id: id }).exec();
  }

  async regenerateWebhookToken(id: string): Promise<string> {
    const newToken = uuidv4();
    await this.accountModel.findByIdAndUpdate(id, { webhookToken: newToken }).exec();
    return newToken;
  }
}
