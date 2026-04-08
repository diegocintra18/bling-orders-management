'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Order {
  id: string;
  numero: string;
  status: string;
  isPicked: boolean;
  isDelayed: boolean;
  cliente: {
    nome: string;
    telefone: string | null;
    email: string | null;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  valorTotal: number;
  dataEmissao: string;
  dataPrevista: string | null;
  dataDespacho: string | null;
  trackingCode: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pago: { label: 'Pago', color: 'bg-blue-100 text-blue-800', icon: Package },
  separado: { label: 'Separado', color: 'bg-purple-100 text-purple-800', icon: Package },
  despachado: { label: 'Despachado', color: 'bg-green-100 text-green-800', icon: Truck },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: Package },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await apiClient<Order>(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        router.push('/pedidos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [id, router]);

  if (isLoading || !order) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-300 rounded w-32"></div>
        <div className="h-64 bg-gray-300 rounded-xl"></div>
      </div>
    );
  }

  const config = statusConfig[order.status] || statusConfig.pendente;
  const StatusIcon = config.icon;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.numero}</h1>
                <p className="text-gray-500 mt-1">
                  Emitido em{' '}
                  {format(new Date(order.dataEmissao), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {order.isDelayed && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    <AlertTriangle size={14} />
                    Atrasado
                  </span>
                )}
                <span
                  className={clsx(
                    'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                    config.color,
                  )}
                >
                  <StatusIcon size={14} />
                  {config.label}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
              <div className="space-y-3">
                {order.itens.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.descricao}</p>
                      <p className="text-sm text-gray-500">Código: {item.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        R$ {item.valorUnitario.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantidade}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  R$ {order.valorTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {order.trackingCode && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rastreamento</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Truck className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Código de rastreamento</p>
                  <p className="font-mono font-medium text-gray-900">{order.trackingCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-80 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" size={20} />
                <span className="text-gray-900">{order.cliente.nome}</span>
              </div>
              {order.cliente.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <span className="text-gray-900">{order.cliente.telefone}</span>
                </div>
              )}
              {order.cliente.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <span className="text-gray-900">{order.cliente.email}</span>
                </div>
              )}
            </div>
          </div>

          {order.dataPrevista && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Previsão</h2>
              <p className="text-gray-600">
                {format(new Date(order.dataPrevista), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
