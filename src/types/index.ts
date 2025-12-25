export enum TipoTransacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export interface Transacao {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: string;
  origem: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface TransacaoCreate {
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: string;
  origem?: string;
  observacoes?: string;
}

export interface TransacaoUpdate {
  data?: string;
  descricao?: string;
  valor?: number;
  tipo?: TipoTransacao;
  categoria?: string;
  observacoes?: string;
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<string, number>;
  saidas_por_categoria: Record<string, number>;
}
