/**
 * Parser do .txt exportado pelo WhatsApp ("Exportar conversa" → sem mídia/com mídia).
 * Formato de cada linha: "DD/MM/AAAA HH:MM - Remetente: mensagem"
 * Mensagens de sistema (entrou/saiu/criou grupo etc.) não têm "Remetente:".
 */

export type WhatsAppMessage = {
  id: number;
  date: string; // DD/MM/AAAA
  time: string; // HH:MM
  sender: string | null; // null = mensagem de sistema
  text: string;
  audioFile?: string; // nome do .opus, se a mensagem for um áudio anexado
};

// Marca de direção de texto (LRM/RLM) que o WhatsApp insere antes de nomes/arquivos.
const INVISIBLE_MARK_RE = /[‎‏]/g;
const LINE_RE = /^(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) - (?:([^:]+): )?(.*)$/;
const AUDIO_RE = /([\w-]+\.opus) \(arquivo anexado\)/i;

export function parseConversation(txt: string): WhatsAppMessage[] {
  const lines = txt.split(/\r?\n/);
  const messages: WhatsAppMessage[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(INVISIBLE_MARK_RE, '');
    if (!line.trim()) continue;

    const match = line.match(LINE_RE);
    if (match) {
      const [, date, time, sender, text] = match;
      const audioMatch = text.match(AUDIO_RE);
      messages.push({
        id: messages.length,
        date,
        time,
        sender: sender ?? null,
        text,
        audioFile: audioMatch ? audioMatch[1] : undefined,
      });
    } else if (messages.length > 0) {
      // Linha sem o cabeçalho "data - remetente:" é continuação da mensagem anterior (texto multi-linha).
      messages[messages.length - 1].text += `\n${line}`;
    }
  }

  return messages;
}

export function listAudioFiles(messages: WhatsAppMessage[]): string[] {
  return messages
    .filter((m) => !!m.audioFile)
    .map((m) => m.audioFile as string);
}

export function listParticipants(messages: WhatsAppMessage[]): string[] {
  const participants = new Set<string>();
  for (const m of messages) {
    if (m.sender) participants.add(m.sender);
  }
  return Array.from(participants);
}

/**
 * Serializa a conversa em texto plano para servir de contexto ao LLM,
 * substituindo cada linha de áudio pela transcrição disponível.
 */
export function buildTranscriptText(
  messages: WhatsAppMessage[],
  transcripts: Record<string, string>
): string {
  return messages
    .map((m) => {
      const who = m.sender ?? '(sistema)';
      let text = m.text;
      if (m.audioFile) {
        text = transcripts[m.audioFile]
          ? `[áudio transcrito]: ${transcripts[m.audioFile]}`
          : '[áudio não transcrito]';
      }
      return `${m.date} ${m.time} - ${who}: ${text}`;
    })
    .join('\n');
}
