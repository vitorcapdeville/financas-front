'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transacoesService } from '@/services/api.service';
import { Transacao } from '@/types';
import { formatarData, formatarMoeda } from '@/utils/format';
import { toast } from 'react-hot-toast';
import ModalEditarCategoria from '@/components/ModalEditarCategoria';
import ModalEditarValor from '@/components/ModalEditarValor';
import ModalConfirmacao from '@/components/ModalConfirmacao';

export default function TransacaoPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalValor, setModalValor] = useState(false);
  const [modalDeletar, setModalDeletar] = useState(false);

  useEffect(() => {
    carregarTransacao();
  }, [id]);

  const carregarTransacao = async () => {
    try {
      setLoading(true);
      const data = await transacoesService.obter(id);
      setTransacao(data);
    } catch (error) {
      console.error('Erro ao carregar transação:', error);
      toast.error('Erro ao carregar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarCategoria = async (novaCategoria: string) => {
    try {
      await transacoesService.atualizar(id, { categoria: novaCategoria });
      toast.success('Categoria atualizada!');
      setModalCategoria(false);
      carregarTransacao();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleSalvarValor = async (novoValor: number) => {
    try {
      await transacoesService.atualizar(id, { valor: novoValor });
      toast.success('Valor atualizado!');
      setModalValor(false);
      carregarTransacao();
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast.error('Erro ao atualizar valor');
    }
  };

  const handleDeletar = async () => {
    try {
      await transacoesService.deletar(id);
      toast.success('Transação deletada!');
      router.push('/transacoes');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar transação');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  if (!transacao) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Transação não encontrada</p>
          <a
            href="/transacoes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Voltar para transações
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">
              Detalhes da Transação
            </h1>
            <button
              onClick={() => setModalDeletar(true)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              🗑️ Deletar
            </button>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Valor Destaque */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <p className="text-sm font-medium mb-2 opacity-90">Valor</p>
            <p className="text-5xl font-bold mb-2">
              {transacao.tipo === 'entrada' ? '+' : '-'}
              {formatarMoeda(transacao.valor)}
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                transacao.tipo === 'entrada'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
            </span>
          </div>

          {/* Informações */}
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Descrição
              </label>
              <p className="text-lg text-gray-900">{transacao.descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Data
                </label>
                <p className="text-lg text-gray-900">
                  {formatarData(transacao.data)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Origem
                </label>
                <p className="text-lg text-gray-900">
                  {transacao.origem === 'manual'
                    ? 'Manual'
                    : transacao.origem === 'extrato_bancario'
                    ? 'Extrato Bancário'
                    : 'Fatura de Cartão'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Categoria
              </label>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-gray-100 rounded-lg text-lg text-gray-900">
                  {transacao.categoria || 'Sem categoria'}
                </span>
                <button
                  onClick={() => setModalCategoria(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ✏️ Alterar
                </button>
              </div>
            </div>

            {transacao.observacoes && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Observações
                </label>
                <p className="text-lg text-gray-900">{transacao.observacoes}</p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Criado em: {new Date(transacao.criado_em).toLocaleString('pt-BR')}
              </p>
              {transacao.atualizado_em !== transacao.criado_em && (
                <p className="text-sm text-gray-500 mt-1">
                  Atualizado em: {new Date(transacao.atualizado_em).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setModalCategoria(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              📁 Alterar Categoria
            </button>
            <button
              onClick={() => setModalValor(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              💰 Alterar Valor
            </button>
          </div>
        </div>
      </div>

      {/* Modais */}
      {transacao && (
        <>
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
            onSalvar={handleSalvarValor}
          />
          <ModalConfirmacao
            isOpen={modalDeletar}
            onClose={() => setModalDeletar(false)}
            onConfirm={handleDeletar}
            titulo="Deletar Transação"
            mensagem="Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita."
            textoBotaoConfirmar="Sim, deletar"
            textoBotaoCancelar="Cancelar"
            tipo="danger"
          />
        </>
      )}
    </main>
  );
}
