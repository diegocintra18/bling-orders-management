import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../../common/schemas';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = 'admin@blingorders.com';
    const existingAdmin = await this.userModel.findOne({ email: adminEmail }).exec();

    if (existingAdmin) {
      this.logger.log('Admin user already exists');
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = new this.userModel({
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'admin',
    });

    await admin.save();

    this.logger.log('Admin user created successfully');
    this.logger.log(`Email: ${adminEmail}`);
    this.logger.log('Password: admin123');
  }
}
