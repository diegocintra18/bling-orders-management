import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  externalOrderId: number;

  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  storeId: string;

  @Prop({ required: true })
  numero: string;

  @Prop({ type: String, enum: ['pendente', 'pago', 'faturado', 'embalado', 'separado', 'despachado', 'entregue'], default: 'pendente' })
  status: string;

  @Prop({ default: false })
  isPicked: boolean;

  @Prop({ default: false })
  isDelayed: boolean;

  @Prop({ type: Object, required: true })
  cliente: {
    nome: string;
    telefone: string | null;
    email: string | null;
  };

  @Prop({ type: Array, required: true })
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;

  @Prop({ required: true })
  valorTotal: number;

  @Prop({ required: true })
  dataEmissao: Date;

  @Prop({ type: Date, default: null })
  dataPrevista: Date | null;

  @Prop({ type: Date, default: null })
  dataDespacho: Date | null;

  @Prop({ type: String, default: null })
  trackingCode: string | null;

  @Prop({ type: String, enum: ['synced', 'pending', 'error'], default: 'pending' })
  syncStatus: string;

  @Prop({ type: Date, default: null })
  dataFaturamento: Date | null;

  @Prop({ type: Date, default: null })
  dataEmbalamento: Date | null;

  @Prop({ type: Date, default: null })
  dataUltimaAtualizacaoStatus: Date | null;

  @Prop({ type: Object, default: null })
  notaFiscal: {
    numero: string;
    serie: string;
    chaveAcesso?: string | null;
    dataEmissao?: string | null;
  } | null;

  @Prop({ type: Object, default: null })
  blingSituacaoOriginal: {
    id: number;
    nome: string;
  } | null;

  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ accountId: 1, externalOrderId: 1 }, { unique: true });
OrderSchema.index({ storeId: 1, status: 1 });
OrderSchema.index({ isDelayed: 1, isPicked: 1 });
OrderSchema.index({ dataFaturamento: 1 });
OrderSchema.index({ dataEmbalamento: 1 });
