'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from '@/types';
import { tagsService, transacoesService } from '@/services/api.service';

interface SeletorTagsProps {
  transacaoId: number;
  tagsAtuais: Tag[];
}

export default function SeletorTags({ transacaoId, tagsAtuais }: SeletorTagsProps) {
  const router = useRouter();
  const [todasTags, setTodasTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarTodasTags();
  }, []);

  async function carregarTodasTags() {
    try {
      const tags = await tagsService.listar();
      setTodasTags(tags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  }

  async function adicionarTag(tagId: number) {
    try {
      setLoading(true);
      await transacoesService.adicionarTag(transacaoId, tagId);
      router.refresh(); // Revalida Server Component
      setShowDropdown(false);
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removerTag(tagId: number) {
    try {
      setLoading(true);
      await transacoesService.removerTag(transacaoId, tagId);
      router.refresh(); // Revalida Server Component
    } catch (error) {
      console.error('Erro ao remover tag:', error);
    } finally {
      setLoading(false);
    }
  }

  const tagsDisponiveis = todasTags.filter(
    (tag) => !tagsAtuais.some((t) => t.id === tag.id)
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags
      </label>
      
      {/* Tags atuais */}
      <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
        {tagsAtuais.length === 0 ? (
          <span className="text-sm text-gray-400">Nenhuma tag</span>
        ) : (
          tagsAtuais.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.cor || '#3B82F6' }}
            >
              {tag.nome}
              <button
                type="button"
                onClick={() => removerTag(tag.id)}
                disabled={loading}
                className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        )}
      </div>

      {/* Botão para adicionar tags */}
      {tagsDisponiveis.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Adicionar tag
          </button>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="py-1 max-h-60 overflow-y-auto">
                {tagsDisponiveis.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => adicionarTag(tag.id)}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.cor || '#3B82F6' }}
                    />
                    <span className="text-gray-900">{tag.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
