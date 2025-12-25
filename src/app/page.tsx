'use client';

import { useState, useEffect } from 'react';
import { transacoesService } from '@/services/api.service';
import { ResumoMensal } from '@/types';
import { formatarMes, formatarMoeda, obterMesAtual, obterAnoAtual } from '@/utils/format';

export default function Home() {
  const [periodo, setPeriodo] = useState(
    `${obterAnoAtual()}-${String(obterMesAtual()).padStart(2, '0')}`
  );
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [loading, setLoading] = useState(true);

  const mes = parseInt(periodo.split('-')[1]);
  const ano = parseInt(periodo.split('-')[0]);

  useEffect(() => {
    carregarResumo();
  }, [periodo]);

  const carregarResumo = async () => {
    try {
      setLoading(true);
      const data = await transacoesService.resumoMensal(mes, ano);
      setResumo(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Finanças Pessoais
          </h1>
          <p className="text-gray-600">
            Gerencie suas entradas e saídas de forma inteligente
          </p>
        </header>

        {/* Seletor de Período */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 items-center">
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
                Visualizando: <span className="font-semibold text-gray-900">{formatarMes(mes)} de {ano}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : resumo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Entradas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total de Entradas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {formatarMoeda(resumo.total_entradas)}
              </p>
            </div>

            {/* Card Saídas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total de Saídas
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {formatarMoeda(resumo.total_saidas)}
              </p>
            </div>

            {/* Card Saldo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Saldo do Mês
              </h3>
              <p
                className={`text-3xl font-bold ${
                  resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(resumo.saldo)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        )}

        {/* Categorias */}
        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entradas por Categoria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Entradas por Categoria
              </h3>
              {Object.keys(resumo.entradas_por_categoria).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(resumo.entradas_por_categoria).map(
                    ([categoria, valor]) => (
                      <li
                        key={categoria}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-700">{categoria}</span>
                        <span className="font-semibold text-green-600">
                          {formatarMoeda(valor)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma entrada registrada
                </p>
              )}
            </div>

            {/* Saídas por Categoria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Saídas por Categoria
              </h3>
              {Object.keys(resumo.saidas_por_categoria).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(resumo.saidas_por_categoria).map(
                    ([categoria, valor]) => (
                      <li
                        key={categoria}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-700">{categoria}</span>
                        <span className="font-semibold text-red-600">
                          {formatarMoeda(valor)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma saída registrada
                </p>
              )}
            </div>
          </div>
        )}

        {/* Links de Navegação */}
        <div className="mt-8 flex gap-4">
          <a
            href="/transacoes"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Ver Todas as Transações
          </a>
          <a
            href="/importar"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Importar Dados
          </a>
        </div>
      </div>
    </main>
  );
}
