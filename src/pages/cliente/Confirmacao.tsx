import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scissors,
  Phone,
  ArrowLeft,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { Agendamento } from '../../types';
import { gerarMensagemWhatsApp } from '../../lib/utils';

export default function Confirmacao() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md text-center shadow-xl">
          <p className="text-slate-400 mb-6">Nenhum agendamento recente encontrado.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Ir para página inicial
          </Link>
        </div>
      </div>
    );
  }

  const agendamento = state as Agendamento;

  let dataFormatada = agendamento.data;
  try {
    dataFormatada = format(
      parseISO(agendamento.data),
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    );
  } catch (err) {
    console.error('Erro ao formatar data:', err);
  }

  // Prepara link do WhatsApp com mensagem pronta humanizada
  const msgTexto = gerarMensagemWhatsApp(
    agendamento.nome,
    agendamento.servico,
    agendamento.data,
    agendamento.horario
  );
  const mensagemWhatsApp = encodeURIComponent(msgTexto);
  const whatsappUrl = `https://wa.me/?text=${mensagemWhatsApp}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow de sucesso */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Agendamento Confirmado!
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Seu horário foi reservado com sucesso no sistema. Guarde as informações abaixo:
        </p>

        {/* Detalhes do Agendamento */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-left space-y-3.5 mb-6 text-sm">
          <div className="flex items-center gap-3 text-slate-200">
            <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Cliente</span>
              <span className="font-semibold">{agendamento.nome}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-200 border-t border-slate-700/40 pt-2.5">
            <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Telefone</span>
              <span className="font-semibold">{agendamento.telefone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-200 border-t border-slate-700/40 pt-2.5">
            <Scissors className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Serviço</span>
              <span className="font-semibold text-blue-300">
                {agendamento.servico}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-200 border-t border-slate-700/40 pt-2.5">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Data</span>
              <span className="font-semibold capitalize">{dataFormatada}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-200 border-t border-slate-700/40 pt-2.5">
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Horário</span>
              <span className="font-bold text-emerald-400 text-base">
                {agendamento.horario} h
              </span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Compartilhar no WhatsApp</span>
          </a>

          <Link
            to="/"
            className="w-full py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 text-sm border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Fazer Novo Agendamento</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
