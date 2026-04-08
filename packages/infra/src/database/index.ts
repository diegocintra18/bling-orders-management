import {
  type User,
  type Account,
  type Store,
  type Order,
  type RefreshToken,
  UserRole,
  OrderStatus,
  SyncStatus,
} from './types.js';
import mongoose, { Schema, type Document, type Model } from 'mongoose';



export interface UserDoc extends Document, Omit<User, 'id'> {}
export interface AccountDoc extends Document, Omit<Account, 'id'> {}
export interface StoreDoc extends Document, Omit<Store, 'id'> {}
export interface OrderDoc extends Document, Omit<Order, 'id'> {}
export interface RefreshTokenDoc extends Document, Omit<RefreshToken, 'id'> {}

const UserSchemaDef = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  },
  { timestamps: true }
);

const StoreSchemaDef = new Schema<StoreDoc>(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const AccountSchemaDef = new Schema<AccountDoc>(
  {
    name: { type: String, required: true },
    apiKey: { type: String, required: true },
    webhookToken: { type: String, required: true },
    storeId: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const OrderSchemaDef = new Schema<OrderDoc>(
  {
    externalOrderId: { type: Number, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    numero: { type: String, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDENTE },
    isPicked: { type: Boolean, default: false },
    isDelayed: { type: Boolean, default: false },
    cliente: {
      nome: { type: String, required: true },
      telefone: { type: String, default: null },
      email: { type: String, default: null },
    },
    itens: [
      {
        codigo: { type: String, required: true },
        descricao: { type: String, required: true },
        quantidade: { type: Number, required: true },
        valorUnitario: { type: Number, required: true },
      },
    ],
    valorTotal: { type: Number, required: true },
    dataEmissao: { type: Date, required: true },
    dataPrevista: { type: Date, default: null },
    dataDespacho: { type: Date, default: null },
    trackingCode: { type: String, default: null },
    syncStatus: { type: String, enum: Object.values(SyncStatus), default: SyncStatus.PENDING },
  },
  { timestamps: true }
);

OrderSchemaDef.index({ accountId: 1, externalOrderId: 1 }, { unique: true });
OrderSchemaDef.index({ storeId: 1, status: 1 });
OrderSchemaDef.index({ isDelayed: 1, isPicked: 1 });

const RefreshTokenSchemaDef = new Schema<RefreshTokenDoc>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const UserModel: Model<UserDoc> = mongoose.model('User', UserSchemaDef);
export const AccountModel: Model<AccountDoc> = mongoose.model('Account', AccountSchemaDef);
export const StoreModel: Model<StoreDoc> = mongoose.model('Store', StoreSchemaDef);
export const OrderModel: Model<OrderDoc> = mongoose.model('Order', OrderSchemaDef);
export const RefreshTokenModel: Model<RefreshTokenDoc> = mongoose.model('RefreshToken', RefreshTokenSchemaDef);

export const AccountSchema = AccountSchemaDef;
export const StoreSchema = StoreSchemaDef;
export const OrderSchema = OrderSchemaDef;
export const UserSchema = UserSchemaDef;
export const RefreshTokenSchema = RefreshTokenSchemaDef;
