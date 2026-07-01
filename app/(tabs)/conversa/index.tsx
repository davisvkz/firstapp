/**
 * Conversa — tela inicial
 *
 * 1. Importa o .zip exportado do WhatsApp ("Exportar conversa" → com mídia).
 * 2. Transcreve todos os áudios (.opus) com o Whisper da Groq, sob demanda.
 * 3. Abre o chat para perguntar qualquer coisa sobre a conversa.
 */
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useConversa } from '@/lib/ConversaContext';

export default function ConversaIndex() {
  const router = useRouter();
  const {
    messages,
    transcripts,
    participants,
    audioFiles,
    status,
    error,
    transcribeProgress,
    apiKey,
    apiKeyReady,
    importZip,
    transcribeAll,
    reset,
  } = useConversa();

  const transcritos = useMemo(
    () => audioFiles.filter((name) => !!transcripts[name]).length,
    [audioFiles, transcripts]
  );
  const pendentes = audioFiles.length - transcritos;

  const importando = status === 'importing';
  const transcrevendo = status === 'transcribing';
  const temConversa = messages.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.titulo}>💬 Conversa do WhatsApp</Text>
      <Text style={styles.subtitulo}>
        Importe o .zip exportado, transcreva os áudios e pergunte qualquer coisa sobre a conversa.
      </Text>

      {apiKeyReady && !apiKey && (
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Configure a chave da API do Groq antes de transcrever ou conversar.
          </Text>
          <Link href="/conversa/config" asChild>
            <TouchableOpacity style={styles.avisoBtn}>
              <Text style={styles.avisoBtnTexto}>Abrir Config</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      {error && (
        <View style={styles.erro}>
          <Text style={styles.erroTexto}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnPrimario, importando && styles.btnDesabilitado]}
        onPress={importZip}
        disabled={importando || transcrevendo}
      >
        {importando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnPrimarioTexto}>📂 Importar conversa (.zip)</Text>
        )}
      </TouchableOpacity>

      {temConversa && (
        <>
          <View style={styles.resumo}>
            <Text style={styles.resumoTitulo}>Conversa importada</Text>
            <Text style={styles.resumoLinha}>
              {messages.length} mensagens · {participants.length} participantes
            </Text>
            <Text style={styles.resumoLinha}>
              {audioFiles.length} áudios · {transcritos} transcritos · {pendentes} pendentes
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.btnSecundario,
              (transcrevendo || pendentes === 0 || !apiKey) && styles.btnDesabilitado,
            ]}
            onPress={transcribeAll}
            disabled={transcrevendo || pendentes === 0 || !apiKey}
          >
            {transcrevendo ? (
              <>
                <ActivityIndicator color="#1d4ed8" />
                <Text style={styles.btnSecundarioTexto}>
                  Transcrevendo {transcribeProgress?.done ?? 0}/{transcribeProgress?.total ?? 0}…
                </Text>
              </>
            ) : (
              <Text style={styles.btnSecundarioTexto}>
                {pendentes === 0 ? '🎙️ Todos os áudios já transcritos' : `🎙️ Transcrever ${pendentes} áudio(s) com Whisper`}
              </Text>
            )}
          </TouchableOpacity>

          {audioFiles.length > 0 && (
            <View style={styles.listaAudios}>
              {audioFiles.map((name) => (
                <View key={name} style={styles.audioItem}>
                  <Text style={styles.audioNome}>{name}</Text>
                  <Text style={styles.audioTranscricao} numberOfLines={2}>
                    {transcripts[name] ?? '— não transcrito ainda —'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push('/conversa/chat')}>
            <Text style={styles.btnPrimarioTexto}>💬 Abrir chat sobre a conversa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPerigo} onPress={reset}>
            <Text style={styles.btnPerigoTexto}>Limpar conversa importada</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.6,
  },
  aviso: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  avisoTexto: {
    color: '#92400e',
    fontSize: 13,
  },
  avisoBtn: {
    backgroundColor: '#92400e',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  avisoBtnTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  erro: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 14,
  },
  erroTexto: {
    color: '#991b1b',
    fontSize: 13,
  },
  btnPrimario: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  btnPrimarioTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecundario: {
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecundarioTexto: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPerigo: {
    borderWidth: 1,
    borderColor: '#991b1b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  btnPerigoTexto: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
  },
  btnDesabilitado: {
    opacity: 0.5,
  },
  resumo: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  resumoTitulo: {
    fontSize: 13,
    fontWeight: '700',
  },
  resumoLinha: {
    fontSize: 12,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
  },
  listaAudios: {
    gap: 8,
  },
  audioItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  audioNome: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    opacity: 0.5,
  },
  audioTranscricao: {
    fontSize: 13,
  },
});
