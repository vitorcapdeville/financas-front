'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transacoesService } from '@/services/api.service';
import { Transacao } from '@/types';
import { toast } from 'react-hot-toast';
import ModalEditarCategoria from '@/components/ModalEditarCategoria';
import ModalEditarValor from '@/components/ModalEditarValor';

interface BotoesAcaoTransacaoProps {
  transacao: Transacao;
}

export default function BotoesAcaoTransacao({ transacao }: BotoesAcaoTransacaoProps) {
  const router = useRouter();
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalValor, setModalValor] = useState(false);

  const handleSalvarCategoria = async (novaCategoria: string) => {
    try {
      await transacoesService.atualizar(transacao.id, { categoria: novaCategoria });
      toast.success('Categoria atualizada!');
      setModalCategoria(false);
      router.refresh(); // Revalida dados do servidor
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleSalvarValor = async (novoValor: number) => {
    try {
      await transacoesService.atualizar(transacao.id, { valor: novoValor });
      toast.success('Valor atualizado!');
      setModalValor(false);
      router.refresh(); // Revalida dados do servidor
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast.error('Erro ao atualizar valor');
    }
  };

  const handleRestaurarValor = async () => {
    try {
      await transacoesService.restaurarValorOriginal(transacao.id);
      toast.success('Valor original restaurado!');
      setModalValor(false);
      router.refresh(); // Revalida dados do servidor
    } catch (error) {
      console.error('Erro ao restaurar valor:', error);
      toast.error('Erro ao restaurar valor original');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setModalCategoria(true)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ✏️ Editar Categoria
          </button>
          <button
            onClick={() => setModalValor(true)}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            💰 Editar Valor
          </button>
        </div>
      </div>

      {/* Modals */}
      <ModalEditarCategoria
        isOpen={modalCategoria}
        onClose={() => setModalCategoria(false)}
        categoriaAtual={transacao.categoria || ''}
        onSalvar={handleSalvarCategoria}
      />

      <ModalEditarValor
        isOpen={modalValor}
        onClose={() => setModalValor(false)}
        valorAtual={transacao.valor}
        valorOriginal={transacao.valor_original}
        onSalvar={handleSalvarValor}
        onRestaurar={transacao.valor_original !== undefined ? handleRestaurarValor : undefined}
      />
    </>
  );
}
