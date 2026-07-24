/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro DD/MM/YYYY
 */
export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '';
  try {
    const parts = dataIso.split('-');
    if (parts.length === 3) {
      const [ano, mes, dia] = parts;
      return `${dia}/${mes}/${ano}`;
    }
    return dataIso;
  } catch {
    return dataIso;
  }
}

/**
 * Gera mensagem profissional, polida e humanizada para envio via WhatsApp
 */
export function gerarMensagemWhatsApp(
  nome: string,
  servico: string,
  dataStr: string,
  horario: string
): string {
  const primeiroNome = nome ? nome.trim().split(' ')[0] : 'Cliente';
  const dataFormatada = formatarDataBR(dataStr);

  return (
    `Olá, ${primeiroNome}!\n\n` +
    `Tudo bem? Passando para confirmar seu agendamento no Agendify:\n\n` +
    `*Serviço:* ${servico}\n` +
    `*Data:* ${dataFormatada}\n` +
    `*Horário:* ${horario}h\n\n` +
    `Te esperamos! Caso precise de alguma alteração ou reagendamento, basta nos avisar por aqui. Abraços!`
  );
}
