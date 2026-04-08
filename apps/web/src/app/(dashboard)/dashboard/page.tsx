'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/stats-card';
import { apiClient } from '@/lib/api';

interface OrderStats {
  total: number;
  pending: number;
  picked: number;
  delayed: number;
  dispatched: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiClient<OrderStats>('/orders/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total de Pedidos" value={stats?.total || 0} icon="total" />
        <StatsCard title="Aguardando Embalagem" value={stats?.pending || 0} icon="pending" />
        <StatsCard title="Atrasados" value={stats?.delayed || 0} icon="delayed" />
        <StatsCard title="Despachados" value={stats?.dispatched || 0} icon="dispatched" />
      </div>

      {stats && stats.delayed > 0 && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Atenção: {stats.delayed} pedido(s) atrasado(s)
          </h2>
          <p className="text-red-600">
            Existem pedidos que estão aguardando embalagem há mais de 24 horas.
          </p>
        </div>
      )}
    </div>
  );
}
