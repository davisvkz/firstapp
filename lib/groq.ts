/**
 * Cliente da API da Groq — transcrição de áudio (Whisper) e chat (LLM).
 * https://console.groq.com/docs
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const WHISPER_MODEL = 'whisper-large-v3';
const CHAT_MODEL = 'llama-3.3-70b-versatile';

export type ChatRole = 'system' | 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };

export class GroqApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GroqApiError';
    this.status = status;
  }
}

function friendlyErrorMessage(status: number, body: string): string {
  if (status === 401) {
    return 'Chave da API do Groq inválida ou ausente. Configure em "Config".';
  }
  if (status === 413) {
    return 'Arquivo grande demais para a API do Groq.';
  }
  if (status === 429) {
    return 'Limite de requisições da API do Groq atingido. Aguarde um pouco e tente de novo.';
  }
  return `Erro na API do Groq (${status}): ${body.slice(0, 200)}`;
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

/**
 * Transcreve um arquivo de áudio local (ex.: um .opus extraído do WhatsApp) usando o Whisper da Groq.
 * WhatsApp grava PTTs em Ogg-Opus; enviamos como audio/ogg, que a Groq aceita nativamente.
 */
export async function transcribeAudio(
  fileUri: string,
  filename: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new GroqApiError('Chave da API do Groq não configurada.');
  }

  const uploadName = filename.replace(/\.opus$/i, '.ogg');

  const form = new FormData();
  // @ts-expect-error — formato de upload de arquivo do React Native (uri/name/type), sem tipo no DOM.
  form.append('file', { uri: fileUri, name: uploadName, type: 'audio/ogg' });
  form.append('model', WHISPER_MODEL);
  form.append('response_format', 'json');
  form.append('language', 'pt');

  const response = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    throw new GroqApiError(
      friendlyErrorMessage(response.status, await readErrorBody(response)),
      response.status
    );
  }

  const data = await response.json();
  return String(data.text ?? '').trim();
}

/**
 * Envia uma conversa (histórico de mensagens) ao modelo de chat da Groq e retorna a resposta.
 */
export async function chatCompletion(messages: ChatMessage[], apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new GroqApiError('Chave da API do Groq não configurada.');
  }

  const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new GroqApiError(
      friendlyErrorMessage(response.status, await readErrorBody(response)),
      response.status
    );
  }

  const data = await response.json();
  return String(data.choices?.[0]?.message?.content ?? '');
}
