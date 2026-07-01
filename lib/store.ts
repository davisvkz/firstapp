/**
 * Persistência local: chave da API do Groq (SecureStore) e a conversa já
 * importada/transcrita (arquivo JSON no diretório de documentos do app),
 * para sobreviver a reloads sem precisar reimportar o .zip.
 */
import * as SecureStore from 'expo-secure-store';
import { Directory, File, Paths } from 'expo-file-system';

import type { WhatsAppMessage } from './whatsapp';

const API_KEY_STORAGE_KEY = 'groq_api_key';
const BRIDGE_URL_STORAGE_KEY = 'opencode_bridge_url';
const CONVERSA_FILE_NAME = 'conversa.json';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function setApiKey(value: string): Promise<void> {
  if (!value) {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    return;
  }
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, value);
}

export async function getBridgeUrl(): Promise<string | null> {
  return SecureStore.getItemAsync(BRIDGE_URL_STORAGE_KEY);
}

export async function setBridgeUrl(value: string): Promise<void> {
  if (!value) {
    await SecureStore.deleteItemAsync(BRIDGE_URL_STORAGE_KEY);
    return;
  }
  await SecureStore.setItemAsync(BRIDGE_URL_STORAGE_KEY, value);
}

export type StoredConversa = {
  messages: WhatsAppMessage[];
  transcripts: Record<string, string>;
  importedAt: string;
};

function conversaFile(): File {
  return new File(Paths.document, CONVERSA_FILE_NAME);
}

export function saveConversa(data: StoredConversa): void {
  conversaFile().write(JSON.stringify(data));
}

export function loadConversa(): StoredConversa | null {
  const file = conversaFile();
  if (!file.exists) return null;
  try {
    return JSON.parse(file.textSync()) as StoredConversa;
  } catch {
    return null;
  }
}

export function clearConversa(): void {
  const file = conversaFile();
  if (file.exists) file.delete();
}

/**
 * Grava bytes (ex.: um áudio .opus extraído do zip) num diretório de cache dedicado,
 * para que a Groq possa lê-los a partir de um file:// URI ao transcrever.
 */
export function writeCacheAudio(name: string, bytes: Uint8Array): string {
  const dir = new Directory(Paths.cache, 'conversa-audios');
  if (!dir.exists) dir.create({ intermediates: true });

  const file = new File(dir, name);
  if (file.exists) file.delete();
  file.write(bytes);
  return file.uri;
}
