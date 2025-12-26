'use client';

import { useState, useEffect } from 'react';
import { transacoesService, configuracoesService } from '@/services/api.service';
import { Transacao } from '@/types';
import { formatarData, formatarMoeda, obterMesAtual, obterAnoAtual } from '@/utils/format';
import { toast } from 'react-hot-toast';

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(
    `${obterAnoAtual()}-${String(obterMesAtual()).padStart(2, '0')}`
  );
  const [diaInicio, setDiaInicio] = useState(1);

  const mes = parseInt(periodo.split('-')[1]);
  const ano = parseInt(periodo.split('-')[0]);

  // Carrega dia de início do banco de dados
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

  // Salva dia de início no banco de dados
  const handleDiaInicioChange = async (novoDia: number) => {
    setDiaInicio(novoDia);
    try {
      await configuracoesService.salvar('diaInicioPeriodo', novoDia.toString());
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  // Calcula as datas de início e fim baseado no dia configurado
  const calcularPeriodo = () => {
    const dataInicioCalc = new Date(ano, mes - 1, diaInicio);
    const dataFimCalc = new Date(ano, mes, diaInicio - 1);
    
    return {
      data_inicio: dataInicioCalc.toISOString().split('T')[0],
      data_fim: dataFimCalc.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    carregarTransacoes();
  }, [periodo, diaInicio]);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const { data_inicio, data_fim } = calcularPeriodo();
      const data = await transacoesService.listar({ data_inicio, data_fim });
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Todas as Transações
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie suas transações financeiras
          </p>
        </header>

        {/* Filtros */}
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
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de Início do Período
              </label>
              <select
                value={diaInicio}
                onChange={(e) => handleDiaInicioChange(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mt-6">
                Exibindo: <span className="font-semibold text-gray-900">
                  {new Date(ano, mes - 1, diaInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até {' '}
                  {new Date(ano, mes, diaInicio - 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="ml-auto mt-6">
              <a
                href="/"
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                ← Voltar
              </a>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : transacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Nenhuma transação encontrada
            </p>
            <a
              href="/importar"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Importar Dados
            </a>
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
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {transacao.descricao}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transacao.tipo === 'entrada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatarData(transacao.data)}</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {transacao.categoria || 'Sem categoria'}
                        </span>
                        <span>•</span>
                        <span className="text-xs">
                          {transacao.origem === 'manual'
                            ? 'Manual'
                            : transacao.origem === 'extrato_bancario'
                            ? 'Extrato'
                            : 'Fatura'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
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
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total de {transacoes.length} transaç
                  {transacoes.length === 1 ? 'ão' : 'ões'}
                </span>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Entradas</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatarMoeda(
                        transacoes
                          .filter((t) => t.tipo === 'entrada')
                          .reduce((sum, t) => sum + t.valor, 0)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saídas</p>
                    <p className="text-sm font-semibold text-red-600">
                      {formatarMoeda(
                        transacoes
                          .filter((t) => t.tipo === 'saida')
                          .reduce((sum, t) => sum + t.valor, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
