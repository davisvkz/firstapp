/**
 * Extração do .zip exportado do WhatsApp, em JS puro (sem dependências nativas).
 * Filtramos para pegar só o .txt da conversa e os áudios .opus — o zip de referência
 * tem ~30MB em imagens/vídeos/stickers que não interessam aqui.
 */
import { strFromU8, unzipSync } from 'fflate';

export type ExtractedConversation = {
  txt: string;
  audios: Record<string, Uint8Array>;
};

export function extractConversation(zipBytes: Uint8Array): ExtractedConversation {
  const files = unzipSync(zipBytes, {
    filter: (file) => file.name.endsWith('.txt') || file.name.endsWith('.opus'),
  });

  let txt = '';
  const audios: Record<string, Uint8Array> = {};

  for (const [name, data] of Object.entries(files)) {
    if (name.endsWith('.txt')) {
      // strFromU8 decodifica UTF-8 manualmente — Hermes não garante TextDecoder global.
      txt = strFromU8(data);
    } else if (name.endsWith('.opus')) {
      audios[name] = data;
    }
  }

  if (!txt) {
    throw new Error('Nenhum arquivo .txt de conversa encontrado dentro do .zip.');
  }

  return { txt, audios };
}
