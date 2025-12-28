'use client';

import { useState, useEffect } from 'react';
import { transacoesService } from '@/services/api.service';

interface ModalEditarCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaAtual: string;
  onSalvar: (novaCategoria: string) => Promise<void>;
  isPending: boolean;
}

export default function ModalEditarCategoria({
  isOpen,
  onClose,
  categoriaAtual,
  onSalvar,
  isPending,
}: ModalEditarCategoriaProps) {
  const [categoria, setCategoria] = useState(categoriaAtual);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [modoCustom, setModoCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
      setCategoria(categoriaAtual);
      setModoCustom(false);
    }
  }, [isOpen, categoriaAtual]);

  const carregarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await transacoesService.listarCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria.trim()) {
      alert('Digite uma categoria');
      return;
    }

    await onSalvar(categoria.trim());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Alterar Categoria</h2>
          <p className="text-sm text-gray-500 mt-1">
            Categoria atual: {categoriaAtual || 'Sem categoria'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Toggle entre lista e custom */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModoCustom(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !modoCustom
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isPending}
              >
                Selecionar
              </button>
              <button
                type="button"
                onClick={() => setModoCustom(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  modoCustom
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isPending}
              >
                Nova Categoria
              </button>
            </div>

            {/* Modo: Selecionar da lista */}
            {!modoCustom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha uma categoria existente:
                </label>
                {loadingCategorias ? (
                  <p className="text-gray-500 text-sm">Carregando categorias...</p>
                ) : categorias.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Nenhuma categoria cadastrada. Crie uma nova!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {categorias.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoria(cat)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          categoria === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                        disabled={isPending}
                      >
                        <span className="font-medium">{cat}</span>
                        {cat === categoriaAtual && (
                          <span className="ml-2 text-xs opacity-75">(atual)</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modo: Nova categoria (custom) */}
            {modoCustom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite uma nova categoria:
                </label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Alimentação, Transporte, Lazer..."
                  disabled={isPending}
                  autoFocus
                />
              </div>
            )}

            {/* Preview da seleção */}
            {categoria && categoria !== categoriaAtual && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Nova categoria:
                </p>
                <p className="text-lg font-bold text-blue-700">{categoria}</p>
              </div>
            )}

            {/* Sugestões rápidas */}
            {!modoCustom && categorias.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Sugestões de categorias:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Alimentação',
                    'Transporte',
                    'Saúde',
                    'Lazer',
                    'Educação',
                    'Moradia',
                    'Salário',
                    'Investimentos',
                  ].map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => {
                        setModoCustom(true);
                        setCategoria(sugestao);
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      disabled={isPending}
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
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
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isPending || !categoria.trim() || categoria === categoriaAtual}
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
