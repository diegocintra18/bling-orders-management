import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../../common/schemas';
import type { User } from '@bling-orders/core';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.mapToEntity(user) : null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  }): Promise<User> {
    const user = new this.userModel(data);
    const saved = await user.save();
    return this.mapToEntity(saved);
  }

  private mapToEntity(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      name: doc.name,
      role: doc.role as User['role'],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
