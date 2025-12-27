import { transacoesServerService } from '@/services/api.server';
import { formatarData, formatarMoeda } from '@/utils/format';
import Link from 'next/link';
import BotoesAcaoTransacao from '@/components/BotoesAcaoTransacao';

interface TransacaoPageProps {
  params: {
    id: string;
  };
  searchParams: {
    periodo?: string;
    diaInicio?: string;
  };
}

export default async function TransacaoPage({ params, searchParams }: TransacaoPageProps) {
  const id = parseInt(params.id);
  
  // Constrói query string preservando período e diaInicio
  const queryParams = new URLSearchParams();
  if (searchParams.periodo) queryParams.set('periodo', searchParams.periodo);
  if (searchParams.diaInicio) queryParams.set('diaInicio', searchParams.diaInicio);
  const queryString = queryParams.toString();
  
  // Busca transação no servidor
  let transacao;
  try {
    transacao = await transacoesServerService.obter(id);
  } catch (error) {
    console.error('Erro ao carregar transação:', error);
    transacao = null;
  }

  if (!transacao) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Transação não encontrada</p>
          <Link
            href={`/transacoes?${queryString}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Voltar para transações
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/transacoes?${queryString}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Detalhes da Transação
          </h1>
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

        {/* Ações - Client Component */}
        <BotoesAcaoTransacao transacao={transacao} />
      </div>
    </main>
  );
}
