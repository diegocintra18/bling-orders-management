'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  AlertTriangle,
  Package,
  Truck,
  Clock,
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
  };
  valorTotal: number;
  dataEmissao: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pago: { label: 'Pago', color: 'bg-blue-100 text-blue-800', icon: Package },
  separado: { label: 'Separado', color: 'bg-purple-100 text-purple-800', icon: Package },
  despachado: { label: 'Despachado', color: 'bg-green-100 text-green-800', icon: Truck },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: Package },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDelayed, setShowDelayed] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (showDelayed) queryParams.append('isDelayed', 'true');

      const data = await apiClient<Order[]>(`/orders?${queryParams.toString()}`);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, showDelayed]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número ou cliente..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-full md:w-64"
            />
          </div>

          <button
            onClick={() => setShowDelayed(!showDelayed)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              showDelayed
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            <AlertTriangle size={18} />
            Atrasados
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum pedido encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pendente;
                  const StatusIcon = config.icon;

                  return (
                    <tr
                      key={order.id}
                      className={clsx(
                        'hover:bg-gray-50 transition-colors',
                        order.isDelayed && 'bg-red-50',
                      )}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/pedidos/${order.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          #{order.numero}
                        </Link>
                        {order.isDelayed && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle size={12} />
                            Atrasado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{order.cliente.nome}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(order.dataEmissao), "d 'de' MMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                            config.color,
                          )}
                        >
                          <StatusIcon size={12} />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        R$ {order.valorTotal.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
