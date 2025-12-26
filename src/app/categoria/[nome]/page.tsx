'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { transacoesService, configuracoesService } from '@/services/api.service';
import { Transacao } from '@/types';
import { formatarData, formatarMoeda, obterMesAtual, obterAnoAtual } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { usePeriodo } from '@/hooks/usePeriodo';

export default function CategoriaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = decodeURIComponent(params.nome as string);
  const tipo = searchParams.get('tipo') as 'entrada' | 'saida' | null;

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { periodo, setPeriodo, diaInicio, setDiaInicio } = usePeriodo();
  const [comparativoMeses, setComparativoMeses] = useState<
    { mes: string; total: number }[]
  >([]);

  const mes = parseInt(periodo.split('-')[1]);
  const ano = parseInt(periodo.split('-')[0]);

  useEffect(() => {
    const carregarDiaInicio = async () => {
      try {
        const config = await configuracoesService.obter('diaInicioPeriodo');
        if (config.valor) {
          setDiaInicio(parseInt(config.valor));
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    };
    carregarDiaInicio();
  }, []);

  const calcularPeriodo = (mesParam: number, anoParam: number) => {
    const dataInicioCalc = new Date(anoParam, mesParam - 1, diaInicio);
    const dataFimCalc = new Date(anoParam, mesParam, diaInicio - 1);

    return {
      data_inicio: dataInicioCalc.toISOString().split('T')[0],
      data_fim: dataFimCalc.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    carregarTransacoes();
    carregarComparativo();
  }, [periodo, diaInicio, categoria]);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const { data_inicio, data_fim } = calcularPeriodo(mes, ano);
      const data = await transacoesService.listar({
        data_inicio,
        data_fim,
        categoria: categoria === 'Sem categoria' ? undefined : categoria,
        tipo: tipo || undefined,
      });
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const carregarComparativo = async () => {
    try {
      const mesesAnteriores = [];
      for (let i = 1; i <= 3; i++) {
        let mesCalc = mes - i;
        let anoCalc = ano;
        if (mesCalc < 1) {
          mesCalc += 12;
          anoCalc -= 1;
        }

        const { data_inicio, data_fim } = calcularPeriodo(mesCalc, anoCalc);
        const transacoesMes = await transacoesService.listar({
          data_inicio,
          data_fim,
          categoria: categoria === 'Sem categoria' ? undefined : categoria,
          tipo: tipo || undefined,
        });

        const total = transacoesMes.reduce((sum, t) => sum + t.valor, 0);
        mesesAnteriores.push({
          mes: `${String(mesCalc).padStart(2, '0')}/${anoCalc}`,
          total,
        });
      }
      setComparativoMeses(mesesAnteriores.reverse());
    } catch (error) {
      console.error('Erro ao carregar comparativo:', error);
    }
  };

  const totalAtual = transacoes.reduce((sum, t) => sum + t.valor, 0);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Voltar ao Dashboard
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {categoria}
          </h1>
          <p className="text-gray-600">
            {tipo === 'entrada' ? 'Entradas' : tipo === 'saida' ? 'Saídas' : 'Transações'} desta categoria
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <input
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mt-6">
                Exibindo: <span className="font-semibold text-gray-900">
                  {new Date(ano, mes - 1, diaInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até{' '}
                  {new Date(ano, mes, diaInicio - 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparativo Mensal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1 border-2 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Mês Atual
            </h3>
            <p className={`text-2xl font-bold ${tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(totalAtual)}
            </p>
          </div>
          {comparativoMeses.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {item.mes}
              </h3>
              <p className="text-2xl font-bold text-gray-700">
                {formatarMoeda(item.total)}
              </p>
              {item.total > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {totalAtual > item.total ? (
                    <span className="text-red-600">
                      +{formatarMoeda(totalAtual - item.total)}
                    </span>
                  ) : totalAtual < item.total ? (
                    <span className="text-green-600">
                      {formatarMoeda(totalAtual - item.total)}
                    </span>
                  ) : (
                    'Sem mudança'
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Lista de Transações */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : transacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              Nenhuma transação encontrada nesta categoria
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Transações ({transacoes.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transacoes.map((transacao) => (
                <a
                  key={transacao.id}
                  href={`/transacao/${transacao.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {transacao.descricao}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatarData(transacao.data)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transacao.tipo === 'entrada'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transacao.tipo === 'entrada' ? '+' : '-'}
                        {formatarMoeda(transacao.valor)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {transacao.origem === 'manual'
                          ? 'Manual'
                          : transacao.origem === 'extrato_bancario'
                          ? 'Extrato'
                          : 'Fatura'}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
