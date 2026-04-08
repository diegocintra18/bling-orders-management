'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Plus, Store, Trash2 } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setIsLoading(true);
    try {
      const data = await apiClient<StoreData[]>('/stores');
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient<StoreData>('/stores', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ name: '' });
      fetchStores();
    } catch (error) {
      console.error('Failed to create store:', error);
    }
  }

  async function handleDelete(storeId: string) {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
    try {
      await apiClient(`/stores/${storeId}`, { method: 'DELETE' });
      fetchStores();
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nova Loja
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Store className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Nenhuma loja cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Store className="text-primary-600" size={20} />
                  </div>
                  <span className="font-medium text-gray-900">{store.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Loja</h2>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
