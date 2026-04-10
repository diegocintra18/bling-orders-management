import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, default: null })
  apiKey: string | null;

  @Prop({ required: true })
  webhookToken: string;

  @Prop({ required: true })
  storeId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  accessToken: string | null;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ type: Date, default: null })
  tokenExpiresAt: Date | null;

  @Prop({ type: Number, default: null })
  blingCompanyId: number | null;

  @Prop({ type: String, enum: ['api_key', 'oauth'], default: 'api_key' })
  authType: string;

  createdAt: Date;
  updatedAt: Date;
}

export type AccountDocument = Account & Document;

export const AccountSchema = SchemaFactory.createForClass(Account);
