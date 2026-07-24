import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Scissors,
  Check,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { SERVICOS, HORARIOS_DISPONIVEIS } from '../../lib/constants';
import { agendamentoService } from '../../lib/firebase';
import { AgendamentoFormData } from '../../types';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone: z
    .string()
    .min(11, 'Informe um telefone válido com DDD (mínimo 11 dígitos)'),
  servico: z.string().min(1, 'Selecione um serviço'),
  data: z.string().min(1, 'Selecione uma data para o agendamento'),
  horario: z.string().min(1, 'Selecione um horário disponível'),
  observacao: z.string().optional(),
});

export default function Agendar() {
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erroAgendamento, setErroAgendamento] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  const hoje = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      telefone: '',
      servico: '',
      data: hoje,
      horario: '',
      observacao: '',
    },
  });

  const dataSelecionada = watch('data');
  const servicoSelecionado = watch('servico');
  const horarioSelecionado = watch('horario');

  // Format phone automatically
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setValue('telefone', value, { shouldValidate: true });
  };

  // Buscar horários ocupados quando a data muda
  useEffect(() => {
    if (dataSelecionada) {
      buscarHorariosOcupados(dataSelecionada);
    }
  }, [dataSelecionada]);

  async function buscarHorariosOcupados(data: string) {
    setCarregandoHorarios(true);
    setErroAgendamento(null);
    try {
      const ocupados = await agendamentoService.buscarHorariosOcupados(data);
      setHorariosOcupados(ocupados);

      // Se o horário selecionado atualmente agora estiver ocupado na nova data, limpa a seleção
      if (horarioSelecionado && ocupados.includes(horarioSelecionado)) {
        setValue('horario', '', { shouldValidate: true });
      }
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  async function onSubmit(dados: AgendamentoFormData) {
    setEnviando(true);
    setErroAgendamento(null);

    try {
      // Encontrar preço do serviço selecionado
      const servicoInfo = SERVICOS.find((s) => s.nome === dados.servico);

      const novoAgendamento = await agendamentoService.criarAgendamento({
        nome: dados.nome,
        telefone: dados.telefone,
        servico: dados.servico,
        preco: servicoInfo?.preco || 35,
        duracao: servicoInfo?.duracao || '30 min',
        data: dados.data,
        horario: dados.horario,
        observacao: dados.observacao,
      });

      // Redireciona para tela de confirmação com os dados do agendamento
      navigate('/confirmacao', { state: novoAgendamento });
    } catch (err: any) {
      console.error('Erro ao agendar:', err);
      const mensagem =
        err?.message || 'Não foi possível concluir seu agendamento. Tente novamente.';
      setErroAgendamento(mensagem);
      // Se deu conflito de horário, atualiza os horários ocupados
      if (dados.data) {
        buscarHorariosOcupados(dados.data);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Banner de apresentação */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Agende seu Serviço
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Escolha o serviço, a data e o melhor horário disponível em poucos cliques.
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {erroAgendamento && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold block mb-0.5">Atenção!</span>
                {erroAgendamento}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nome */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register('nome')}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.nome ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {errors.nome.message}
                </p>
              )}
            </div>

            {/* Campo Telefone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register('telefone')}
                  onChange={handlePhoneChange}
                  placeholder="(73) 9 9999-9999"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.telefone ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.telefone && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {errors.telefone.message}
                </p>
              )}
            </div>

            {/* Seleção de Serviço */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Selecione o Serviço
              </label>
              <div className="relative mb-3">
                <Scissors className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('servico')}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/80 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
                    errors.servico ? 'border-red-500' : 'border-slate-700'
                  }`}
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Clique para escolher o serviço
                  </option>
                  {SERVICOS.map((item) => (
                    <option
                      key={item.id}
                      value={item.nome}
                      className="bg-slate-900 text-white"
                    >
                      {item.nome} — R$ {item.preco.toFixed(2)} ({item.duracao})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid visual dos serviços */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {SERVICOS.map((item) => {
                  const isSelected = servicoSelecionado === item.nome;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setValue('servico', item.nome, { shouldValidate: true })
                      }
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-sm block">
                          {item.nome}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {item.duracao}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-blue-400 ml-2">
                        R$ {item.preco.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.servico && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.servico.message}
                </p>
              )}
            </div>

            {/* Seleção de Data */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Data do Agendamento
              </label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  min={hoje}
                  {...register('data')}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/80 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.data ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.data && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {errors.data.message}
                </p>
              )}
            </div>

            {/* Seleção de Horários */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Horário Disponível
                </label>
                {carregandoHorarios && (
                  <span className="text-xs text-blue-400 animate-pulse">
                    Verificando agenda...
                  </span>
                )}
              </div>

              {/* Select tradicional */}
              <div className="relative mb-3">
                <Clock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('horario')}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/80 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
                    errors.horario ? 'border-red-500' : 'border-slate-700'
                  }`}
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Selecione o horário
                  </option>
                  {HORARIOS_DISPONIVEIS.map((h) => {
                    const ocupado = horariosOcupados.includes(h);
                    return (
                      <option
                        key={h}
                        value={h}
                        disabled={ocupado}
                        className="bg-slate-900 text-white disabled:text-slate-600"
                      >
                        {h} {ocupado ? '(Ocupado)' : '✓ Disponível'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Chips Interativos dos Horários */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {HORARIOS_DISPONIVEIS.map((h) => {
                  const ocupado = horariosOcupados.includes(h);
                  const isSelected = horarioSelecionado === h;

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={ocupado}
                      onClick={() =>
                        setValue('horario', h, { shouldValidate: true })
                      }
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                        ocupado
                          ? 'bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-105'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800'
                      }`}
                    >
                      <span>{h}</span>
                      {ocupado ? (
                        <span className="text-[9px] font-normal no-underline text-slate-500 mt-0.5">
                          Ocupado
                        </span>
                      ) : isSelected ? (
                        <span className="text-[9px] text-blue-100 flex items-center gap-0.5 mt-0.5">
                          <Check className="w-2.5 h-2.5" /> Escolhido
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-normal mt-0.5">
                          Livre
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.horario && (
                <p className="mt-2 text-xs text-red-400 font-medium">
                  {errors.horario.message}
                </p>
              )}
            </div>

            {/* Observação Opicional */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Observação (Opcional)
              </label>
              <textarea
                {...register('observacao')}
                rows={2}
                placeholder="Preferência de barbeiro, observações especiais, etc..."
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
            >
              {enviando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirmando Agendamento...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Confirmar Agendamento</span>
                </>
              )}
            </button>
          </form>

          {/* Rodapé do Form */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Bloqueio automático de horário duplo ativado em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
