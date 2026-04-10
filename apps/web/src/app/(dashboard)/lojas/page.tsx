'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Plus, Store, Trash2, Link2, ExternalLink, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { clsx } from 'clsx';

interface StoreData {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  storeId: string;
  authType: 'api_key' | 'oauth';
  accessToken: string | null;
  webhookToken: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState<{ storeId: string; storeName: string } | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [showWebhookModal, setShowWebhookModal] = useState<{ accountId: string; webhookToken: string } | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [storesData, accountsData] = await Promise.all([
        apiClient<StoreData[]>('/stores'),
        apiClient<Account[]>('/accounts'),
      ]);
      console.log('fetchData - stores:', storesData);
      console.log('fetchData - accounts:', accountsData);
      setStores(storesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      fetchData();
    } catch (error) {
      console.error('Failed to create store:', error);
    }
  }

  async function handleDelete(storeId: string) {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
    try {
      await apiClient(`/stores/${storeId}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  }

  async function handleConnectOAuth(storeId: string) {
    try {
      const account = accounts.find(a => a.storeId === storeId);
      if (!account) {
        alert('É necessário criar uma conta primeiro nesta loja');
        return;
      }
      
      const accountId = account.id || (account as any)._id;
      if (!accountId) {
        alert('Conta sem ID válido');
        return;
      }
      
      const { url } = await apiClient<{ url: string }>('/auth/bling', {
        method: 'GET',
        query: { accountId },
      });
      setOauthUrl(url);
      const store = stores.find(s => s.id === storeId);
      setShowOAuthModal({ storeId, storeName: store?.name || '' });
    } catch (error) {
      console.error('Failed to start OAuth:', error);
    }
  }

  async function handleShowWebhookUrl(storeId: string) {
    try {
      const account = accounts.find(a => a.storeId === storeId);
      if (!account) {
        alert('É necessário criar uma conta primeiro nesta loja');
        return;
      }
      
      const accountId = account.id || (account as any)._id;
      if (!accountId) {
        alert('Conta sem ID válido');
        return;
      }
      
      const { url } = await apiClient<{ url: string }>('/auth/bling/webhook-url', {
        method: 'GET',
        query: { accountId },
      });
      setShowWebhookModal({ accountId, webhookToken: url });
    } catch (error) {
      console.error('Failed to get webhook URL:', error);
    }
  }

  async function handleCreateAccountForStore(storeId: string) {
    try {
      await apiClient<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify({ name: `Conta - ${storeId}`, storeId }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
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
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Store className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Nenhuma loja cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => {
            const storeAccount = accounts.find(a => a.storeId === store.id);
            const isConnected = storeAccount?.authType === 'oauth' && storeAccount?.accessToken;
            
            return (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <Store className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{store.name}</span>
                      {isConnected ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={14} className="text-green-600" />
                          <span className="text-xs text-green-600 font-medium">OAuth Conectado</span>
                        </div>
                      ) : storeAccount ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <XCircle size={14} className="text-orange-500" />
                          <span className="text-xs text-orange-500 font-medium">API Key</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-0.5">
                          <XCircle size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">Sem conta</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!storeAccount ? (
                    <button
                      onClick={() => handleCreateAccountForStore(store.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={14} />
                      Criar Conta
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleShowWebhookUrl(store.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Link2 size={14} />
                        Webhook
                      </button>
                      <button
                        onClick={() => handleConnectOAuth(store.id)}
                        className={clsx(
                          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                          isConnected
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                        )}
                      >
                        <ExternalLink size={14} />
                        {isConnected ? 'Reconectar OAuth' : 'Conectar OAuth'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
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

      {showOAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Conectar ao Bling</h2>
            <p className="text-sm text-gray-600 mb-4">
              Clique no botão abaixo para autorizar o acesso à sua conta Bling.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">URL de Autorização:</p>
              <code className="text-xs font-mono break-all text-gray-700">{oauthUrl}</code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(oauthUrl)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Copy size={16} />
                Copiar URL
              </button>
              <a
                href={oauthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <ExternalLink size={16} />
                Abrir Bling
              </a>
            </div>
            <button
              onClick={() => setShowOAuthModal(null)}
              className="w-full mt-3 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">URL do Webhook</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure esta URL no painel do Bling para receber notificações de pedidos.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">Webhook URL:</p>
              <code className="text-sm font-mono break-all text-gray-700">{showWebhookModal.webhookToken}</code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(showWebhookModal.webhookToken)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Copy size={16} />
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
