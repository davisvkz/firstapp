/**
 * Cliente do bridge opencode — chat sobre a conversa.
 * O bridge (ver pasta bridge/) roda na LAN e adapta a requisição simples
 * { messages: [{role, content}] } para a API de sessões do opencode.
 * A transcrição de áudio continua em lib/groq.ts (Whisper).
 */

export type ChatRole = 'system' | 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };

/** Valor padrão da URL do bridge — porta padrão de bridge/server.mjs, ok para simulador/web. */
export const DEFAULT_BRIDGE_URL = 'http://localhost:8787';

export class OpencodeBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpencodeBridgeError';
  }
}

/**
 * Envia o histórico de mensagens ao bridge opencode e retorna a resposta do modelo.
 */
export async function chatViaBridge(messages: ChatMessage[], bridgeUrl: string): Promise<string> {
  if (!bridgeUrl) {
    throw new OpencodeBridgeError('URL do bridge opencode não configurada. Configure em "Config".');
  }

  const url = `${bridgeUrl.replace(/\/$/, '')}/chat`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    const detalhe = e instanceof Error ? e.message : String(e);
    throw new OpencodeBridgeError(
      `Não foi possível conectar ao bridge opencode. Verifique se ele está rodando e acessível na rede. (${detalhe})`
    );
  }

  if (!response.ok) {
    let mensagem = `Erro do bridge opencode (${response.status}).`;
    try {
      const corpo = await response.json();
      if (corpo && typeof corpo.error === 'string') {
        mensagem = corpo.error;
      }
    } catch {
      // corpo não é JSON — mantém a mensagem com o status.
    }
    throw new OpencodeBridgeError(mensagem);
  }

  const data = await response.json();
  return String(data.content ?? '');
}
