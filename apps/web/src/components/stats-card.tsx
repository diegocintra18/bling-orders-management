'use client';

import { clsx } from 'clsx';
import { AlertTriangle, Package, Clock, CheckCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: 'total' | 'pending' | 'delayed' | 'dispatched';
}

const icons = {
  total: Package,
  pending: Clock,
  delayed: AlertTriangle,
  dispatched: CheckCircle,
};

const colors = {
  total: 'bg-blue-50 text-blue-600',
  pending: 'bg-yellow-50 text-yellow-600',
  delayed: 'bg-red-50 text-red-600',
  dispatched: 'bg-green-50 text-green-600',
};

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const Icon = icons[icon];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={clsx('p-3 rounded-lg', colors[icon])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
