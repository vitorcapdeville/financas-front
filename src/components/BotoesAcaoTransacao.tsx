'use client';

import { useState, useTransition } from 'react';
import { atualizarCategoriaAction, atualizarValorAction, restaurarValorOriginalAction } from '@/app/transacao/[id]/actions';
import { Transacao } from '@/types';
import { toast } from 'react-hot-toast';
import ModalEditarCategoria from '@/components/ModalEditarCategoria';
import ModalEditarValor from '@/components/ModalEditarValor';

interface BotoesAcaoTransacaoProps {
  transacao: Transacao;
}

export default function BotoesAcaoTransacao({ transacao }: BotoesAcaoTransacaoProps) {
  const [isPending, startTransition] = useTransition();
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalValor, setModalValor] = useState(false);

  const handleSalvarCategoria = async (novaCategoria: string) => {
    startTransition(async () => {
      try {
        await atualizarCategoriaAction(transacao.id, novaCategoria);
        toast.success('Categoria atualizada!');
        setModalCategoria(false);
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast.error('Erro ao atualizar categoria');
      }
    });
  };

  const handleSalvarValor = async (novoValor: number) => {
    startTransition(async () => {
      try {
        await atualizarValorAction(transacao.id, novoValor);
        toast.success('Valor atualizado!');
        setModalValor(false);
      } catch (error) {
        console.error('Erro ao atualizar valor:', error);
        toast.error('Erro ao atualizar valor');
      }
    });
  };

  const handleRestaurarValor = async () => {
    startTransition(async () => {
      try {
        await restaurarValorOriginalAction(transacao.id);
        toast.success('Valor original restaurado!');
        setModalValor(false);
      } catch (error) {
        console.error('Erro ao restaurar valor:', error);
        toast.error('Erro ao restaurar valor original');
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setModalCategoria(true)}
            disabled={isPending}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            ✏️ Editar Categoria
          </button>
          <button
            onClick={() => setModalValor(true)}
            disabled={isPending}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
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
        isPending={isPending}
      />

      <ModalEditarValor
        isOpen={modalValor}
        onClose={() => setModalValor(false)}
        valorAtual={transacao.valor}
        valorOriginal={transacao.valor_original}
        onSalvar={handleSalvarValor}
        onRestaurar={transacao.valor_original !== undefined ? handleRestaurarValor : undefined}
        isPending={isPending}
      />
    </>
  );
}
