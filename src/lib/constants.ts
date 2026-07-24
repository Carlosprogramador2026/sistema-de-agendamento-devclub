import { ServicoItem } from '../types';

export const SERVICOS: ServicoItem[] = [
  {
    id: 'corte',
    nome: 'Corte de Cabelo',
    preco: 35.0,
    duracao: '30 min',
    descricao: 'Corte moderno ou clássico com lavagem e finalização.',
    icone: 'Scissors',
  },
  {
    id: 'barba',
    nome: 'Barba Completa',
    preco: 25.0,
    duracao: '30 min',
    descricao: 'Modelagem de barba com toalha quente e pós-barba premium.',
    icone: 'UserCheck',
  },
  {
    id: 'manicure',
    nome: 'Manicure & Pedicure',
    preco: 30.0,
    duracao: '40 min',
    descricao: 'Cuidados completos com cutilagem e esmaltação.',
    icone: 'Sparkles',
  },
  {
    id: 'combo',
    nome: 'Combo Corte + Barba',
    preco: 55.0,
    duracao: '50 min',
    descricao: 'O pacote completo para dar aquele tapa no visual com desconto.',
    icone: 'Award',
  },
  {
    id: 'sobrancelha',
    nome: 'Sobrancelha',
    preco: 20.0,
    duracao: '20 min',
    descricao: 'Design e alinhamento de sobrancelhas na navalha ou pinça.',
    icone: 'Smile',
  },
];

export const HORARIOS_DISPONIVEIS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];
