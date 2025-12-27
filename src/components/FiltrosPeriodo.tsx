'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { configuracoesService } from '@/services/api.service';
import { CriterioDataTransacao } from '@/types';

interface FiltrosPeriodoProps {
  showDiaInicio?: boolean;
  showCriterioData?: boolean;
}

export default function FiltrosPeriodo({ 
  showDiaInicio = true,
  showCriterioData = true 
}: FiltrosPeriodoProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtém valores da URL ou usa defaults
  const periodoAtual = searchParams.get('periodo') || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const diaInicioAtual = parseInt(searchParams.get('diaInicio') || '1');
  
  const [criterioData, setCriterioData] = useState<CriterioDataTransacao>(
    CriterioDataTransacao.DATA_TRANSACAO
  );

  const mes = parseInt(periodoAtual.split('-')[1]);
  const ano = parseInt(periodoAtual.split('-')[0]);

  // Carrega configurações do banco
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        // Carrega dia de início
        if (!searchParams.get('diaInicio')) {
          const configDia = await configuracoesService.obter('diaInicioPeriodo');
          if (configDia.valor) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('diaInicio', configDia.valor);
            router.replace(`?${params.toString()}`);
          }
        }
        
        // Carrega critério de data
        const configCriterio = await configuracoesService.obter('criterio_data_transacao');
        if (configCriterio.valor) {
          setCriterioData(configCriterio.valor as CriterioDataTransacao);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    carregarConfiguracoes();
  }, [searchParams, router]);

  const handlePeriodoChange = (novoPeriodo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('periodo', novoPeriodo);
    router.push(`?${params.toString()}`);
  };

  const handleDiaInicioChange = async (novoDia: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('diaInicio', novoDia.toString());
    router.push(`?${params.toString()}`);
    
    // Salva no banco de dados
    try {
      await configuracoesService.salvar('diaInicioPeriodo', novoDia.toString());
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleCriterioDataChange = async (novoCriterio: CriterioDataTransacao) => {
    setCriterioData(novoCriterio);
    
    // Salva no banco de dados
    try {
      await configuracoesService.salvar('criterio_data_transacao', novoCriterio);
      // Força recarregamento da página para aplicar o novo filtro
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <input
            type="month"
            value={periodoAtual}
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {showCriterioData && (
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critério de Data
            </label>
            <select
              value={criterioData}
              onChange={(e) => handleCriterioDataChange(e.target.value as CriterioDataTransacao)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={CriterioDataTransacao.DATA_TRANSACAO}>
                Data da Transação
              </option>
              <option value={CriterioDataTransacao.DATA_FATURA}>
                Data da Fatura
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {criterioData === CriterioDataTransacao.DATA_TRANSACAO 
                ? 'Mostra gastos na data em que ocorreram'
                : 'Mostra gastos na data de pagamento da fatura'}
            </p>
          </div>
        )}
        
        {showDiaInicio && (
          <>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de Início do Período
              </label>
              <select
                value={diaInicioAtual}
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
                Visualizando: <span className="font-semibold text-gray-900">
                  {new Date(ano, mes - 1, diaInicioAtual).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até {' '}
                  {new Date(ano, mes, diaInicioAtual - 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
