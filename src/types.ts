export type StatusAgendamento = 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado';

export interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  servico: string;
  preco?: number;
  duracao?: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  status: StatusAgendamento;
  observacao?: string;
  created_at: string;
}

export interface ServicoItem {
  id: string;
  nome: string;
  preco: number;
  duracao: string;
  descricao: string;
  icone: string;
}

export interface AgendamentoFormData {
  nome: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  observacao?: string;
}
