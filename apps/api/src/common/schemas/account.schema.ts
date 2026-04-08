import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: true })
  webhookToken: string;

  @Prop({ required: true })
  storeId: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type AccountDocument = Account & Document;

export const AccountSchema = SchemaFactory.createForClass(Account);
