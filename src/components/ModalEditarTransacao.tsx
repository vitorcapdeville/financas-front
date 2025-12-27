'use client';

import { useState, useEffect } from 'react';
import { Transacao, TransacaoUpdate } from '@/types';

interface ModalEditarTransacaoProps {
  transacao: Transacao;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (id: number, data: TransacaoUpdate) => Promise<void>;
}

export default function ModalEditarTransacao({
  transacao,
  isOpen,
  onClose,
  onSalvar,
}: ModalEditarTransacaoProps) {
  const [formData, setFormData] = useState<TransacaoUpdate>({
    valor: transacao.valor,
    categoria: transacao.categoria || '',
    data_fatura: transacao.data_fatura || '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData({
      valor: transacao.valor,
      categoria: transacao.categoria || '',
      data_fatura: transacao.data_fatura || '',
    });
  }, [transacao]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar(transacao.id, formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Editar Transação
          </h2>
          <p className="text-sm text-gray-500 mt-1">{transacao.descricao}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: parseFloat(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.categoria || ''}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Alimentação, Transporte, Salário..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Fatura (Opcional)
              </label>
              <input
                type="date"
                value={formData.data_fatura || ''}
                onChange={(e) =>
                  setFormData({ ...formData, data_fatura: e.target.value || undefined })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Data de fechamento/pagamento da fatura (para compras no cartão)
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tipo:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    transacao.tipo === 'entrada'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Data da Transação:</span>
                <span className="text-gray-900">
                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {transacao.data_fatura && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Data da Fatura:</span>
                  <span className="text-gray-900">
                    {new Date(transacao.data_fatura).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
