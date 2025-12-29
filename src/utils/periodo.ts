// Utilitários para calcular período baseado em dia de início customizado

export interface PeriodoCalculado {
  data_inicio: string;
  data_fim: string;
}

/**
 * Calcula o período customizado baseado em mês/ano e dia de início
 */
export function calcularPeriodoCustomizado(
  mes: number,
  ano: number,
  diaInicio: number
): PeriodoCalculado {
  const dataInicioCalc = new Date(ano, mes - 1, diaInicio);
  const dataFimCalc = new Date(ano, mes, diaInicio - 1);
  
  return {
    data_inicio: dataInicioCalc.toISOString().split('T')[0],
    data_fim: dataFimCalc.toISOString().split('T')[0]
  };
}

/**
 * Extrai período, diaInicio e criterio dos searchParams com defaults
 */
export function extrairPeriodoDaURL(searchParams: Record<string, string | undefined> | { get: (key: string) => string | null }) {
  // Suporta tanto objeto simples (Server Components) quanto URLSearchParams (Client Components)
  const getParam = (key: string) => {
    if ('get' in searchParams && typeof searchParams.get === 'function') {
      return searchParams.get(key);
    }
    return (searchParams as Record<string, string | undefined>)[key] || null;
  };
  
  const periodo = getParam('periodo') || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const diaInicio = parseInt(getParam('diaInicio') || '1');
  const criterio = getParam('criterio') || 'data_transacao';
  
  const mes = parseInt(periodo.split('-')[1]);
  const ano = parseInt(periodo.split('-')[0]);
  
  return { periodo, diaInicio, criterio, mes, ano };
}
