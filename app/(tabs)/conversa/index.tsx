/**
 * Conversa — tela inicial
 *
 * 1. Importa o .zip exportado do WhatsApp ("Exportar conversa" → com mídia).
 * 2. Abre o chat para perguntar qualquer coisa sobre a conversa.
 *
 * A transcrição de áudio (Whisper/Groq) foi removida da UI por enquanto;
 * o suporte continua em lib/ConversaContext.tsx e lib/groq.ts.
 */
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useConversa } from '@/lib/ConversaContext';

export default function ConversaIndex() {
  const router = useRouter();
  const { messages, participants, audioFiles, status, error, importZip, reset } = useConversa();

  const importando = status === 'importing';
  const temConversa = messages.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.titulo}>💬 Conversa do WhatsApp</Text>
      <Text style={styles.subtitulo}>
        Importe o .zip exportado e pergunte qualquer coisa sobre a conversa.
      </Text>

      {error && (
        <View style={styles.erro}>
          <Text style={styles.erroTexto}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnPrimario, importando && styles.btnDesabilitado]}
        onPress={importZip}
        disabled={importando}
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
            <Text style={styles.resumoLinha}>{audioFiles.length} áudios</Text>
          </View>

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
});
