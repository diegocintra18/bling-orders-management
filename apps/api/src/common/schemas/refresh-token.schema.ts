import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type RefreshTokenDocument = RefreshToken & Document;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
