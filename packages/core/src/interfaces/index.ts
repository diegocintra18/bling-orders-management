import type { Account, Order, RefreshToken, Store, User } from '../entities';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<void>;
}

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByStoreId(storeId: string): Promise<Account[]>;
  findAll(): Promise<Account[]>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  update(id: string, data: Partial<Account>): Promise<Account | null>;
  delete(id: string): Promise<void>;
}

export interface IStoreRepository {
  findById(id: string): Promise<Store | null>;
  findByOwnerId(ownerId: string): Promise<Store[]>;
  findAll(): Promise<Store[]>;
  create(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store>;
  update(id: string, data: Partial<Store>): Promise<Store | null>;
  delete(id: string): Promise<void>;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByExternalId(externalId: number, accountId: string): Promise<Order | null>;
  findByAccountId(accountId: string, filters?: OrderFilters): Promise<Order[]>;
  findByStoreId(storeId: string, filters?: OrderFilters): Promise<Order[]>;
  findDelayed(filters?: DelayedOrderFilters): Promise<Order[]>;
  findPendingPicked(): Promise<Order[]>;
  countByAccountId(accountId: string, filters?: OrderFilters): Promise<number>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, data: Partial<Order>): Promise<Order | null>;
  updateMany(ids: string[], data: Partial<Order>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface OrderFilters {
  status?: string[];
  isDelayed?: boolean;
  isPicked?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface DelayedOrderFilters {
  hoursThreshold?: number;
  accountId?: string;
  storeId?: string;
}

export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  create(token: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export interface IBlingClient {
  getOrder(orderId: number): Promise<BlingOrderResponse | null>;
  getOrders(params?: BlingOrdersParams): Promise<BlingOrdersResponse>;
  validateWebhook(data: unknown, token: string): boolean;
}

export interface BlingOrderResponse {
  id: number;
  numero: string;
  situacao: string;
  cliente: {
    nome: string;
    telefone?: string;
    email?: string;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  valorTotal: number;
  dataEmissao: string;
  dataPrevista?: string;
  dataSaida?: string;
  codigosRastreamento?: string[];
}

export interface BlingOrdersParams {
  dataEmissao?: { inicio: string; fim: string };
  situacao?: number;
  pagina?: number;
  limite?: number;
}

export interface BlingOrdersResponse {
  data: BlingOrderResponse[];
  totalPages: number;
  currentPage: number;
}

export interface BlingWebhookPayload {
  id: number;
  tipo: 'pedido' | 'rastreamento' | 'nota';
  data: unknown;
}
