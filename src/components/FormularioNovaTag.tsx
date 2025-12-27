'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tagsService } from '@/services/api.service';
import { TagCreate } from '@/types';

export default function FormularioNovaTag() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TagCreate>({
    nome: '',
    cor: '#3B82F6',
    descricao: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await tagsService.criar(formData);
      setFormData({ nome: '', cor: '#3B82F6', descricao: '' });
      setShowForm(false);
      router.refresh(); // Revalida Server Component
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      alert('Erro ao criar tag. Tente novamente.');
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nova Tag'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Tag</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Assinaturas, Esporádico, Essencial"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.cor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição opcional da tag"
                rows={3}
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Criar Tag
            </button>
          </form>
        </div>
      )}
    </>
  );
}
