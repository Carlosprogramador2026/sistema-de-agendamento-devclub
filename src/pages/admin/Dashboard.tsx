import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  Trash2,
  Filter,
  Search,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  X,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { agendamentoService } from '../../lib/firebase';
import { Agendamento, StatusAgendamento } from '../../types';
import { SERVICOS, HORARIOS_DISPONIVEIS } from '../../lib/constants';
import { gerarMensagemWhatsApp, formatarDataBR } from '../../lib/utils';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filtroData, setFiltroData] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalNovo, setModalNovo] = useState<boolean>(false);

  // Form state for manual booking modal
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoServico, setNovoServico] = useState(SERVICOS[0].nome);
  const [novaData, setNovaData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [novoHorario, setNovoHorario] = useState(HORARIOS_DISPONIVEIS[0]);
  const [erroModal, setErroModal] = useState('');
  const [salvandoModal, setSalvandoModal] = useState(false);

  // Gemini AI Insights state
  const [carregandoAi, setCarregandoAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [copiadoMsg, setCopiadoMsg] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summary?: string;
    occupancyRate?: string;
    highlights?: string[];
    actionableTips?: string[];
    suggestedMessage?: string;
  } | null>(null);

  // Gemini Sentiment state
  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const [carregandoSentiment, setCarregandoSentiment] = useState(false);
  const [sentimentData, setSentimentData] = useState<{
    label?: string;
    score?: number;
    summary?: string;
    recommendation?: string;
    detectedNeeds?: string[];
    clientName?: string;
  } | null>(null);

  // Edit / Reschedule Modal state
  const [agendamentoEdicao, setAgendamentoEdicao] = useState<Agendamento | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editServico, setEditServico] = useState('');
  const [editPreco, setEditPreco] = useState<number>(35);
  const [editData, setEditData] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editStatus, setEditStatus] = useState<StatusAgendamento>('Agendado');
  const [editObservacao, setEditObservacao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');

  function getInitials(nome: string) {
    if (!nome) return 'AG';
    const parts = nome.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  function getAvatarColor(nome: string) {
    const colors = [
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash += nome.charCodeAt(i);
    return colors[hash % colors.length];
  }

  async function handleAnaliseSentimentoNota(text: string, servico: string, clientName: string) {
    setCarregandoSentiment(true);
    setSentimentData(null);
    setShowSentimentModal(true);
    try {
      const response = await fetch('/api/gemini/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, serviceName: servico }),
      });
      const data = await response.json();
      if (data.sentiment) {
        setSentimentData({ ...data.sentiment, clientName });
      }
    } catch (err) {
      console.error('Erro na análise de sentimento:', err);
    } finally {
      setCarregandoSentiment(false);
    }
  }

  async function handleRunAiInsights() {
    setCarregandoAi(true);
    try {
      const response = await fetch('/api/gemini/admin-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments: agendamentos }),
      });
      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
        setShowAiModal(true);
      }
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      alert('Erro ao consultar o Assistente Gemini.');
    } finally {
      setCarregandoAi(false);
    }
  }

  const hoje = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    buscar();
  }, [filtroData]);

  async function buscar() {
    setCarregando(true);
    try {
      const lista = await agendamentoService.listarAgendamentos(
        filtroData || undefined
      );
      setAgendamentos(lista);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarStatus(id: string, status: StatusAgendamento) {
    try {
      await agendamentoService.atualizarStatus(id, status);
      await buscar();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status.');
    }
  }

  async function excluir(id: string) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await agendamentoService.excluirAgendamento(id);
        await buscar();
      } catch (err) {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir agendamento.');
      }
    }
  }

  async function handleCriarManual(e: React.FormEvent) {
    e.preventDefault();
    setErroModal('');
    setSalvandoModal(true);

    try {
      const servicoInfo = SERVICOS.find((s) => s.nome === novoServico);
      await agendamentoService.criarAgendamento({
        nome: novoNome,
        telefone: novoTelefone,
        servico: novoServico,
        preco: servicoInfo?.preco || 35,
        duracao: servicoInfo?.duracao || '30 min',
        data: novaData,
        horario: novoHorario,
      });

      setModalNovo(false);
      setNovoNome('');
      setNovoTelefone('');
      await buscar();
    } catch (err: any) {
      setErroModal(err?.message || 'Erro ao criar agendamento.');
    } finally {
      setSalvandoModal(false);
    }
  }

  function abrirModalEdicao(agendamento: Agendamento) {
    setAgendamentoEdicao(agendamento);
    setEditNome(agendamento.nome || '');
    setEditTelefone(agendamento.telefone || '');
    setEditServico(agendamento.servico || SERVICOS[0].nome);
    setEditPreco(agendamento.preco || 35);
    setEditData(agendamento.data || format(new Date(), 'yyyy-MM-dd'));
    setEditHorario(agendamento.horario || HORARIOS_DISPONIVEIS[0]);
    setEditStatus(agendamento.status || 'Agendado');
    setEditObservacao(agendamento.observacao || '');
    setErroEdicao('');
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!agendamentoEdicao) return;
    setErroEdicao('');
    setSalvandoEdicao(true);

    try {
      const servicoInfo = SERVICOS.find((s) => s.nome === editServico);
      await agendamentoService.atualizarAgendamento(agendamentoEdicao.id, {
        nome: editNome,
        telefone: editTelefone,
        servico: editServico,
        preco: editPreco,
        duracao: servicoInfo?.duracao || '30 min',
        data: editData,
        horario: editHorario,
        status: editStatus,
        observacao: editObservacao,
      });

      setAgendamentoEdicao(null);
      await buscar();
    } catch (err: any) {
      setErroEdicao(err?.message || 'Erro ao salvar alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // Filtragem por busca textual (nome ou telefone)
  const agendamentosFiltrados = agendamentos.filter((a) => {
    const termo = busca.toLowerCase();
    const bateNome = a.nome.toLowerCase().includes(termo);
    const bateTelefone = a.telefone.includes(termo);
    const bateServico = a.servico.toLowerCase().includes(termo);
    return bateNome || bateTelefone || bateServico;
  });

  // Estatísticas do topo
  const totalGeral = agendamentos.length;
  const totalAgendados = agendamentos.filter((a) => a.status === 'Agendado').length;
  const totalConfirmados = agendamentos.filter(
    (a) => a.status === 'Confirmado'
  ).length;
  const totalConcluidos = agendamentos.filter(
    (a) => a.status === 'Concluído'
  ).length;
  const faturamentoEstimado = agendamentos
    .filter((a) => a.status !== 'Cancelado')
    .reduce((acc, cur) => acc + (cur.preco || 35), 0);

  const getStatusBadge = (status: StatusAgendamento) => {
    switch (status) {
      case 'Agendado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock3 className="w-3 h-3" /> Agendado
          </span>
        );
      case 'Confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Confirmado
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Painel Administrativo
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gerencie agendamentos, confirme status e controle a agenda da equipe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAiInsights}
              disabled={carregandoAi}
              className="py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-purple-200 ${carregandoAi ? 'animate-spin' : ''}`} />
              <span>{carregandoAi ? 'Analisando Agenda...' : 'Consultor IA Gemini'}</span>
            </button>

            <button
              onClick={() => buscar()}
              disabled={carregando}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => setModalNovo(true)}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Métrica Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Agendados
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalGeral}
              </span>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {totalAgendados} aguardando confirmação
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Confirmados
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                {totalConfirmados}
              </span>
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Prontos para atendimento
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Concluídos
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {totalConcluidos}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Atendimentos realizados
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Receita Estimada
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                R$ {faturamentoEstimado.toFixed(2)}
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Total bruto projetado
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Campo Data */}
            <div className="relative w-full sm:w-48">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick date filters */}
            <button
              onClick={() => setFiltroData(hoje)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filtroData === hoje
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Hoje
            </button>

            {filtroData && (
              <button
                onClick={() => setFiltroData('')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Limpar
              </button>
            )}
          </div>

          {/* Campo Busca por Nome/Telefone */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente ou fone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Tabela de Agendamentos (Desktop) & Cards (Mobile) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {carregando ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Carregando agendamentos...</p>
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">
                Nenhum agendamento encontrado
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {filtroData || busca
                  ? 'Tente remover os filtros de busca ou escolher outra data.'
                  : 'Nenhum horário agendado até o momento.'}
              </p>
            </div>
          ) : (
            <>
              {/* Visão em Tabela (Desktop) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4 pl-6">CLIENTE</th>
                      <th className="p-4">SERVIÇO</th>
                      <th className="p-4">HORÁRIO</th>
                      <th className="p-4">VALOR</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 pr-6 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {agendamentosFiltrados.map((a) => {
                      const numFone = (a.telefone || '').replace(/\D/g, '');
                      const mensagemPronta = gerarMensagemWhatsApp(
                        a.nome,
                        a.servico,
                        a.data,
                        a.horario
                      );
                      const waLink = `https://wa.me/55${numFone}?text=${encodeURIComponent(
                        mensagemPronta
                      )}`;

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* CLIENTE */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${getAvatarColor(
                                  a.nome
                                )}`}
                              >
                                {getInitials(a.nome)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">
                                  {a.nome}
                                </div>
                                <div className="text-xs text-slate-400 font-mono">
                                  {a.telefone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SERVIÇO */}
                          <td className="p-4">
                            <div className="font-bold text-slate-200">
                              {a.servico}
                            </div>
                            <div className="text-xs text-slate-400 italic max-w-xs truncate">
                              "{a.observacao || 'Sem observações adicionais.'}"
                            </div>
                          </td>

                          {/* HORÁRIO */}
                          <td className="p-4">
                            <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                              <span>{a.horario}h</span>
                              <span className="text-xs font-normal text-slate-400">
                                ({formatarDataBR(a.data)})
                              </span>
                            </div>
                          </td>

                          {/* VALOR */}
                          <td className="p-4">
                            <div className="font-extrabold text-emerald-400 text-sm">
                              R$ {(a.preco || 35).toFixed(2)}
                            </div>
                          </td>

                          {/* STATUS & GEMINI AI BUTTON */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={a.status}
                                onChange={(e) =>
                                  atualizarStatus(
                                    a.id,
                                    e.target.value as StatusAgendamento
                                  )
                                }
                                className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                              >
                                <option value="Agendado">Agendado</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Concluído">Concluído</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>

                              <button
                                onClick={() =>
                                  handleAnaliseSentimentoNota(
                                    a.observacao || 'Sem observações do cliente.',
                                    a.servico,
                                    a.nome
                                  )
                                }
                                className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wider uppercase rounded-full transition-all flex items-center gap-1 cursor-pointer"
                                title="Analisar tom e observações com Gemini AI"
                              >
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>GEMINI AI</span>
                              </button>
                            </div>
                          </td>

                          {/* AÇÕES */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => abrirModalEdicao(a)}
                                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                                title="Reagendar data/horário ou editar todos os dados"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Reagendar / Editar</span>
                              </button>

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                title="Enviar mensagem de confirmação no WhatsApp"
                              >
                                💬 WhatsApp
                              </a>

                              <button
                                onClick={() => excluir(a.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Excluir agendamento"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visão em Cards (Mobile) */}
              <div className="md:hidden divide-y divide-slate-800/80">
                {agendamentosFiltrados.map((a) => {
                  const numFone = (a.telefone || '').replace(/\D/g, '');
                  const mensagemPronta = gerarMensagemWhatsApp(
                    a.nome,
                    a.servico,
                    a.data,
                    a.horario
                  );
                  const waLinkMobile = `https://wa.me/55${numFone}?text=${encodeURIComponent(
                    mensagemPronta
                  )}`;

                  return (
                    <div key={a.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base">
                            {a.nome}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {a.telefone}
                          </p>
                        </div>
                        <button
                          onClick={() => excluir(a.id)}
                          className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-800/60 p-3 rounded-xl space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Serviço:</span>
                          <span className="font-semibold text-white">
                            {a.servico} (R$ {(a.preco || 35).toFixed(2)})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Data e Hora:</span>
                          <span className="font-bold text-emerald-400">
                            {formatarDataBR(a.data)} às {a.horario}h
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>{getStatusBadge(a.status)}</div>

                        <select
                          value={a.status}
                          onChange={(e) =>
                            atualizarStatus(a.id, e.target.value as StatusAgendamento)
                          }
                          className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200"
                        >
                          <option value="Agendado">Agendado</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => abrirModalEdicao(a)}
                          className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Reagendar / Editar</span>
                        </button>

                        <a
                          href={waLinkMobile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra inferior de sincronização e IA */}
              <div className="bg-slate-900/90 border-t border-slate-800/80 p-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-400">
                    Sistema sincronizado em tempo real
                  </span>
                </div>

                <button
                  onClick={() => {
                    const primeiro = agendamentosFiltrados[0];
                    if (primeiro) {
                      handleAnaliseSentimentoNota(
                        primeiro.observacao || 'Primeira consulta. Gostaria de um atendimento especial.',
                        primeiro.servico,
                        primeiro.nome
                      );
                    } else {
                      handleAnaliseSentimentoNota(
                        'Cliente solicitou cuidados com pele sensível.',
                        'Limpeza de Pele Profunda',
                        'Mariana Costa Ramos'
                      );
                    }
                  }}
                  className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold tracking-wider uppercase rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>ANÁLISE DE SENTIMENTO GEMINI AI</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento Manual */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setModalNovo(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" /> Agendamento Manual
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Cadastre um cliente presencial ou por telefone direto na agenda.
            </p>

            {erroModal && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {erroModal}
              </div>
            )}

            <form onSubmit={handleCriarManual} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  placeholder="(73) 9 9999-9999"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Serviço
                </label>
                <select
                  value={novoServico}
                  onChange={(e) => setNovoServico(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  {SERVICOS.map((s) => (
                    <option key={s.id} value={s.nome}>
                      {s.nome} — R$ {s.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Horário
                  </label>
                  <select
                    value={novoHorario}
                    onChange={(e) => setNovoHorario(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  >
                    {HORARIOS_DISPONIVEIS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoModal}
                  className="w-1/2 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                >
                  {salvandoModal ? 'Salvando...' : 'Salvar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Insights Gemini IA */}
      {showAiModal && aiInsights && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">
                Consultor IA Gemini - Relatório de Agenda
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Análise gerada em tempo real com structured output do modelo @google/genai.
            </p>

            <div className="space-y-5 text-sm">
              {/* Resumo executivo */}
              <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-2xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1">
                  Resumo Executivo
                </h3>
                <p className="text-slate-200">{aiInsights.summary}</p>
                {aiInsights.occupancyRate && (
                  <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg">
                    Ocupação estimada: {aiInsights.occupancyRate}
                  </span>
                )}
              </div>

              {/* Destaques */}
              {aiInsights.highlights && aiInsights.highlights.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Destaques da Agenda
                  </h3>
                  <ul className="space-y-1.5">
                    {aiInsights.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-slate-300 flex items-start gap-2 text-xs sm:text-sm bg-slate-800/60 p-2.5 rounded-xl border border-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dicas acionáveis */}
              {aiInsights.actionableTips && aiInsights.actionableTips.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Dicas Práticas para Aumentar Vendas
                  </h3>
                  <ul className="space-y-1.5">
                    {aiInsights.actionableTips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="text-slate-300 flex items-start gap-2 text-xs sm:text-sm bg-slate-800/60 p-2.5 rounded-xl border border-slate-800"
                      >
                        <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mensagem para WhatsApp */}
              {aiInsights.suggestedMessage && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-2xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">
                    Mensagem Sugerida para Clientes (WhatsApp)
                  </h3>
                  <p className="text-slate-200 text-xs sm:text-sm italic bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-3">
                    "{aiInsights.suggestedMessage}"
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiInsights.suggestedMessage || '');
                      setCopiadoMsg(true);
                      setTimeout(() => setCopiadoMsg(false), 2000);
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {copiadoMsg ? 'Copiado para a área de transferência!' : 'Copiar Mensagem'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Análise de Sentimento (Gemini AI) */}
      {showSentimentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowSentimentModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">
                Análise de Sentimento das Notas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Análise de linguagem natural do cliente realizada com Gemini AI.
            </p>

            {carregandoSentiment ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Analisando observações do cliente...</p>
              </div>
            ) : sentimentData ? (
              <div className="space-y-4 text-sm">
                {sentimentData.clientName && (
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Cliente: <span className="text-white">{sentimentData.clientName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 font-medium">Classificação do Tom</span>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-full border border-indigo-500/30">
                    {sentimentData.label || 'Positivo'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Resumo da Observação</h4>
                  <p className="text-slate-200 text-xs sm:text-sm">{sentimentData.summary}</p>
                </div>

                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl">
                  <h4 className="text-xs font-semibold text-emerald-300 mb-1">Recomendação para a Equipe</h4>
                  <p className="text-slate-200 text-xs sm:text-sm">{sentimentData.recommendation}</p>
                </div>

                {sentimentData.detectedNeeds && sentimentData.detectedNeeds.length > 0 && (
                  <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                    <h4 className="text-xs font-semibold text-slate-400 mb-1.5">Necessidades Detectadas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {sentimentData.detectedNeeds.map((need, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-700/60 text-slate-300 text-xs rounded-lg">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSentimentModal(false)}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar / Reagendar Agendamento */}
      {agendamentoEdicao && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setAgendamentoEdicao(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1 text-amber-400">
              <Pencil className="w-6 h-6" />
              <h2 className="text-xl font-extrabold text-white">
                Reagendar & Editar Agendamento
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Altere a data, horário de atendimento, informações do cliente ou status.
            </p>

            <form onSubmit={handleSalvarEdicao} className="space-y-4 text-sm">
              {erroEdicao && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold">
                  {erroEdicao}
                </div>
              )}

              {/* Bloco de Reagendamento (Data & Horário) */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Reagendamento (Data & Horário)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nova Data
                    </label>
                    <input
                      type="date"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Novo Horário
                    </label>
                    <select
                      value={editHorario}
                      onChange={(e) => setEditHorario(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      {HORARIOS_DISPONIVEIS.map((h) => (
                        <option key={h} value={h}>
                          {h} h
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    required
                    placeholder="Nome completo"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Serviço e Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Serviço
                  </label>
                  <select
                    value={editServico}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setEditServico(sel);
                      const sInfo = SERVICOS.find((s) => s.nome === sel);
                      if (sInfo) setEditPreco(sInfo.preco);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {SERVICOS.map((s) => (
                      <option key={s.id} value={s.nome}>
                        {s.nome} - R$ {s.preco.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPreco}
                    onChange={(e) => setEditPreco(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status do Agendamento
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as StatusAgendamento)
                  }
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer font-bold"
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações / Preferências do Cliente
                </label>
                <textarea
                  value={editObservacao}
                  onChange={(e) => setEditObservacao(e.target.value)}
                  rows={3}
                  placeholder="Observações do atendimento, restrições ou preferências..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Botoes de Acao */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAgendamentoEdicao(null)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {salvandoEdicao ? 'Salvando Alterações...' : 'Salvar & Reagendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
