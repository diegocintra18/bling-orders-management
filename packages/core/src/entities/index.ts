export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface Account {
  id: string;
  name: string;
  apiKey: string;
  webhookToken: string;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  externalOrderId: number;
  accountId: string;
  storeId: string;
  numero: string;
  status: OrderStatus;
  isPicked: boolean;
  isDelayed: boolean;
  cliente: OrderCliente;
  itens: OrderItem[];
  valorTotal: number;
  dataEmissao: Date;
  dataPrevista: Date | null;
  dataDespacho: Date | null;
  trackingCode: string | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  SEPARADO = 'separado',
  DESPACHADO = 'despachado',
  ENTREGUE = 'entregue',
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  ERROR = 'error',
}

export interface OrderCliente {
  nome: string;
  telefone: string | null;
  email: string | null;
}

export interface OrderItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
