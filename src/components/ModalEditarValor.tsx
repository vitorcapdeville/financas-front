'use client';

import { useState } from 'react';

interface ModalEditarValorProps {
  isOpen: boolean;
  onClose: () => void;
  valorAtual: number;
  valorOriginal?: number; // Valor original antes de edições
  onSalvar: (novoValor: number) => Promise<void>;
  onRestaurar?: () => Promise<void>; // Callback para restaurar valor original
  isPending: boolean;
}

export default function ModalEditarValor({
  isOpen,
  onClose,
  valorAtual,
  valorOriginal,
  onSalvar,
  onRestaurar,
  isPending,
}: ModalEditarValorProps) {
  const [valor, setValor] = useState(valorAtual);

  if (!isOpen) return null;

  const aplicarPercentual = (percentual: number) => {
    // Usa valor original se disponível, senão usa valor atual
    const baseValor = valorOriginal ?? valorAtual;
    const novoValor = (baseValor * percentual) / 100;
    setValor(Number(novoValor.toFixed(2)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSalvar(valor);
  };

  const handleRestaurar = async () => {
    if (!onRestaurar) return;
    await onRestaurar();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const baseValor = valorOriginal ?? valorAtual;
  const foiEditado = valorOriginal !== undefined && valorOriginal !== valorAtual;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Alterar Valor</h2>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500">
              Valor atual: {formatarMoeda(valorAtual)}
            </p>
            {foiEditado && valorOriginal && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-amber-600">
                  Valor original: {formatarMoeda(valorOriginal)}
                </p>
                {onRestaurar && (
                  <button
                    type="button"
                    onClick={handleRestaurar}
                    className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                    disabled={isPending}
                  >
                    Restaurar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Input de Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isPending}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Novo valor: {formatarMoeda(valor)}
              </p>
            </div>

            {/* Botões de Percentual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ou escolha um percentual:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => aplicarPercentual(0)}
                  className="bg-red-100 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  disabled={isPending}
                >
                  0%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(50)}
                  className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                  disabled={isPending}
                >
                  50%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(valorAtual * 0.5)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(100)}
                  className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                  disabled={isPending}
                >
                  100%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(baseValor)}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                0% = Desativar transação (valor zerado) | 50% = Metade | 100% = Valor {foiEditado ? 'original' : 'atual'}
              </p>
            </div>

            {/* Diferença */}
            {valor !== valorAtual && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Diferença
                </p>
                <p
                  className={`text-lg font-bold ${
                    valor > valorAtual ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {valor > valorAtual ? '+' : ''}
                  {formatarMoeda(valor - valorAtual)}
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-400"
              disabled={isPending || valor === valorAtual}
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
