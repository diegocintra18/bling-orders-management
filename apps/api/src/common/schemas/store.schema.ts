import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  createdAt: Date;
  updatedAt: Date;
}

export type StoreDocument = Store & Document;

export const StoreSchema = SchemaFactory.createForClass(Store);
