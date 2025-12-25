import api from '@/lib/api';
import { Transacao, TransacaoCreate, TransacaoUpdate, ResumoMensal } from '@/types';

export const transacoesService = {
  async listar(params?: {
    mes?: number;
    ano?: number;
    categoria?: string;
    tipo?: string;
  }): Promise<Transacao[]> {
    const { data } = await api.get('/transacoes', { params });
    return data;
  },

  async obter(id: number): Promise<Transacao> {
    const { data } = await api.get(`/transacoes/${id}`);
    return data;
  },

  async criar(transacao: TransacaoCreate): Promise<Transacao> {
    const { data } = await api.post('/transacoes', transacao);
    return data;
  },

  async atualizar(id: number, transacao: TransacaoUpdate): Promise<Transacao> {
    const { data } = await api.patch(`/transacoes/${id}`, transacao);
    return data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/transacoes/${id}`);
  },

  async resumoMensal(mes: number, ano: number): Promise<ResumoMensal> {
    const { data } = await api.get('/transacoes/resumo/mensal', {
      params: { mes, ano },
    });
    return data;
  },
};

export const importacaoService = {
  async importarExtrato(arquivo: File): Promise<Transacao[]> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const { data } = await api.post('/importacao/extrato', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async importarFatura(arquivo: File): Promise<Transacao[]> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const { data } = await api.post('/importacao/fatura', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
