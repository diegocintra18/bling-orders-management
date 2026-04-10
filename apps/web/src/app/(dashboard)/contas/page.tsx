'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Plus, Store, Key, RefreshCw, Trash2, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Account {
  id: string;
  name: string;
  apiKey: string | null;
  webhookToken: string;
  storeId: string;
  isActive: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  blingCompanyId: number | null;
  authType: 'api_key' | 'oauth';
}

interface StoreData {
  id: string;
  name: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [formData, setFormData] = useState({ name: '', apiKey: '', storeId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [accountsData, storesData] = await Promise.all([
        apiClient<Account[]>('/accounts'),
        apiClient<StoreData[]>('/stores'),
      ]);
      setAccounts(accountsData);
      setStores(storesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ name: '', apiKey: '', storeId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  }

  async function handleConnectOAuth(accountId: string) {
    try {
      const { url } = await apiClient<{ url: string }>('/auth/bling', {
        method: 'GET',
        query: { accountId },
      });
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start OAuth:', error);
    }
  }

  async function handleShowWebhookUrl(accountId: string) {
    try {
      const { url } = await apiClient<{ url: string }>('/auth/bling/webhook-url', {
        method: 'GET',
        query: { accountId },
      });
      setWebhookUrl(url);
      setShowWebhookModal(accountId);
    } catch (error) {
      console.error('Failed to get webhook URL:', error);
    }
  }

  async function handleRegenerateToken(accountId: string) {
    try {
      const response = await apiClient<{ webhookToken: string }>(
        `/accounts/${accountId}/regenerate-token`,
        { method: 'POST' }
      );
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, webhookToken: response.webhookToken } : acc
        )
      );
    } catch (error) {
      console.error('Failed to regenerate token:', error);
    }
  }

  async function handleToggleActive(accountId: string, isActive: boolean) {
    try {
      await apiClient(`/accounts/${accountId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  }

  async function handleDelete(accountId: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    try {
      await apiClient(`/accounts/${accountId}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('URL copiada para a área de transferência!');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contas Bling</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Store className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Nenhuma conta cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const store = stores.find((s) => s.id === account.storeId);
            const isConnected = account.authType === 'oauth' && account.accessToken;
            
            return (
              <div
                key={account.id}
                className={clsx(
                  'bg-white rounded-xl shadow-sm border p-6',
                  account.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          account.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        )}
                      >
                        {account.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      {isConnected ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <CheckCircle2 size={12} />
                          OAuth Conectado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <XCircle size={12} />
                          API Key
                        </span>
                      )}
                    </div>
                    {store && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loja: {store.name}
                      </p>
                    )}
                    
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleShowWebhookUrl(account.id)}
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Link2 size={16} />
                        Ver URL do Webhook
                      </button>
                      
                      {!isConnected && (
                        <button
                          onClick={() => handleConnectOAuth(account.id)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Link2 size={16} />
                          Conectar com OAuth
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleRegenerateToken(account.id)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                      title="Regenerar token"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(account.id, account.isActive)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        account.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      )}
                    >
                      {account.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Conta Bling</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (opcional - use OAuth para conectar)
                </label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loja
                </label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Selecione uma loja</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
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

      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">URL do Webhook</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure esta URL no painel do Bling para receber notificações de pedidos.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm font-mono break-all">{webhookUrl}</code>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Copiar URL
              </button>
              <button
                onClick={() => setShowWebhookModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
