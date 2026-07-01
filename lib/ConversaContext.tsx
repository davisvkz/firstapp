/**
 * Estado compartilhado da aba "Conversa": importação do .zip, transcrição dos
 * áudios e a chave da API do Groq. Fica no _layout da aba para as telas
 * (importar, chat, config) lerem/escreverem o mesmo estado.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { GroqApiError, transcribeAudio } from './groq';
import { DEFAULT_BRIDGE_URL } from './opencode';
import {
  clearConversa,
  getApiKey,
  getBridgeUrl,
  loadConversa,
  saveConversa,
  setApiKey as persistApiKey,
  setBridgeUrl as persistBridgeUrl,
  writeCacheAudio,
} from './store';
import {
  buildTranscriptText,
  listAudioFiles,
  listParticipants,
  parseConversation,
  type WhatsAppMessage,
} from './whatsapp';
import { extractConversation } from './zip';

const AUDIO_CACHE_DIR = 'conversa-audios';

export type ConversaStatus = 'idle' | 'importing' | 'ready' | 'transcribing' | 'error';
export type TranscribeProgress = { done: number; total: number } | null;

type ConversaContextValue = {
  messages: WhatsAppMessage[];
  transcripts: Record<string, string>;
  participants: string[];
  audioFiles: string[];
  status: ConversaStatus;
  error: string | null;
  transcribeProgress: TranscribeProgress;
  apiKey: string | null;
  apiKeyReady: boolean;
  bridgeUrl: string;
  bridgeUrlReady: boolean;
  transcriptText: string;
  importZip: () => Promise<void>;
  transcribeAll: () => Promise<void>;
  reset: () => void;
  saveApiKey: (value: string) => Promise<void>;
  saveBridgeUrl: (value: string) => Promise<void>;
};

const ConversaContext = createContext<ConversaContextValue | null>(null);

export function ConversaProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ConversaStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcribeProgress, setTranscribeProgress] = useState<TranscribeProgress>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [bridgeUrl, setBridgeUrlState] = useState(DEFAULT_BRIDGE_URL);
  const [bridgeUrlReady, setBridgeUrlReady] = useState(false);

  // Carrega o que já foi importado/transcrito, a chave da API e a URL do bridge salvos de sessões anteriores.
  useEffect(() => {
    const stored = loadConversa();
    if (stored) {
      setMessages(stored.messages);
      setTranscripts(stored.transcripts);
      setStatus('ready');
    }
    getApiKey()
      .then(setApiKeyState)
      .finally(() => setApiKeyReady(true));
    getBridgeUrl()
      .then((url) => setBridgeUrlState(url ?? DEFAULT_BRIDGE_URL))
      .finally(() => setBridgeUrlReady(true));
  }, []);

  const importZip = useCallback(async () => {
    setError(null);
    setStatus('importing');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setStatus(messages.length > 0 ? 'ready' : 'idle');
        return;
      }

      const asset = result.assets[0];
      const zipBytes = await new File(asset.uri).bytes();
      const { txt, audios } = extractConversation(zipBytes);
      const parsedMessages = parseConversation(txt);

      // Grava cada áudio extraído no cache — a Groq lê a partir de um file:// URI.
      for (const [name, bytes] of Object.entries(audios)) {
        writeCacheAudio(name, bytes);
      }

      setMessages(parsedMessages);
      setTranscripts({});
      saveConversa({ messages: parsedMessages, transcripts: {}, importedAt: new Date().toISOString() });
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao importar o arquivo .zip.');
      setStatus('error');
    }
  }, [messages.length]);

  const transcribeAll = useCallback(async () => {
    if (!apiKey) {
      setError('Configure a chave da API do Groq antes de transcrever.');
      setStatus('error');
      return;
    }

    const pending = listAudioFiles(messages).filter((name) => !transcripts[name]);
    if (pending.length === 0) return;

    setError(null);
    setStatus('transcribing');
    setTranscribeProgress({ done: 0, total: pending.length });

    const nextTranscripts = { ...transcripts };
    try {
      for (let i = 0; i < pending.length; i++) {
        const name = pending[i];
        const file = new File(Paths.cache, AUDIO_CACHE_DIR, name);
        nextTranscripts[name] = file.exists
          ? await transcribeAudio(file.uri, name, apiKey)
          : '[arquivo de áudio não encontrado — reimporte o .zip]';
        setTranscribeProgress({ done: i + 1, total: pending.length });
        setTranscripts({ ...nextTranscripts });
      }
      saveConversa({ messages, transcripts: nextTranscripts, importedAt: new Date().toISOString() });
      setStatus('ready');
    } catch (e) {
      setError(e instanceof GroqApiError ? e.message : 'Falha ao transcrever os áudios.');
      setStatus('error');
    } finally {
      setTranscribeProgress(null);
    }
  }, [apiKey, messages, transcripts]);

  const reset = useCallback(() => {
    setMessages([]);
    setTranscripts({});
    setError(null);
    setStatus('idle');
    clearConversa();
    const audioDir = new Directory(Paths.cache, AUDIO_CACHE_DIR);
    if (audioDir.exists) audioDir.delete();
  }, []);

  const saveApiKeyValue = useCallback(async (value: string) => {
    await persistApiKey(value);
    setApiKeyState(value || null);
  }, []);

  const saveBridgeUrlValue = useCallback(async (value: string) => {
    await persistBridgeUrl(value);
    setBridgeUrlState(value);
  }, []);

  const participants = useMemo(() => listParticipants(messages), [messages]);
  const audioFiles = useMemo(() => listAudioFiles(messages), [messages]);
  const transcriptText = useMemo(() => buildTranscriptText(messages, transcripts), [messages, transcripts]);

  const value: ConversaContextValue = {
    messages,
    transcripts,
    participants,
    audioFiles,
    status,
    error,
    transcribeProgress,
    apiKey,
    apiKeyReady,
    bridgeUrl,
    bridgeUrlReady,
    transcriptText,
    importZip,
    transcribeAll,
    reset,
    saveApiKey: saveApiKeyValue,
    saveBridgeUrl: saveBridgeUrlValue,
  };

  return <ConversaContext.Provider value={value}>{children}</ConversaContext.Provider>;
}

export function useConversa(): ConversaContextValue {
  const ctx = useContext(ConversaContext);
  if (!ctx) throw new Error('useConversa deve ser usado dentro de <ConversaProvider>');
  return ctx;
}
