/**
 * Chat sobre a conversa importada.
 * O texto completo da conversa (com as transcrições disponíveis) vai como
 * contexto no system prompt; o modelo (llama-3.3-70b, 131k tokens) responde
 * com base nele.
 */
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useConversa } from '@/lib/ConversaContext';
import { chatCompletion, type ChatMessage, GroqApiError } from '@/lib/groq';

// ~200k caracteres cobre boa parte do contexto de 131k tokens do modelo,
// deixando espaço para o histórico do chat e a resposta.
const MAX_CONTEXT_CHARS = 200_000;

type UiMessage = { id: string; role: 'user' | 'assistant'; content: string };

function buildSystemPrompt(transcriptText: string): string {
  const truncado = transcriptText.length > MAX_CONTEXT_CHARS;
  const corpo = truncado ? transcriptText.slice(-MAX_CONTEXT_CHARS) : transcriptText;
  const aviso = truncado
    ? '[conversa truncada — mostrando apenas a parte mais recente]\n\n'
    : '';

  return (
    'Você responde perguntas sobre a conversa de WhatsApp abaixo. ' +
    'Use apenas o que está no texto para responder; se não souber, diga que não sabe. ' +
    'Áudios aparecem como "[áudio transcrito]: ..." ou "[áudio não transcrito]".\n\n' +
    aviso +
    corpo
  );
}

export default function ConversaChat() {
  const { messages, transcriptText, apiKey } = useConversa();
  const [chat, setChat] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const listRef = useRef<FlatList<UiMessage>>(null);

  const enviar = useCallback(async () => {
    const pergunta = input.trim();
    if (!pergunta || enviando) return;
    if (!apiKey) {
      setErro('Configure a chave da API do Groq em "Config" antes de conversar.');
      return;
    }

    const userMsg: UiMessage = { id: `u-${chat.length}`, role: 'user', content: pergunta };
    const historico = [...chat, userMsg];
    setChat(historico);
    setInput('');
    setErro(null);
    setEnviando(true);

    try {
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: buildSystemPrompt(transcriptText) },
        ...historico.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
      ];
      const resposta = await chatCompletion(apiMessages, apiKey);
      setChat((atual) => [...atual, { id: `a-${atual.length}`, role: 'assistant', content: resposta }]);
    } catch (e) {
      setErro(e instanceof GroqApiError ? e.message : 'Falha ao consultar a API do Groq.');
    } finally {
      setEnviando(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [apiKey, chat, enviando, input, transcriptText]);

  if (messages.length === 0) {
    return (
      <View style={styles.vazioContainer}>
        <Text style={styles.vazioTexto}>Importe uma conversa antes de abrir o chat.</Text>
        <Link href="/conversa" asChild>
          <TouchableOpacity style={styles.vazioBtn}>
            <Text style={styles.vazioBtnTexto}>Voltar</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={chat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.dica}>
            Pergunte algo sobre a conversa, ex.: "quem criou o grupo?" ou "resuma os áudios do dia 20/05".
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bolha,
              item.role === 'user' ? styles.bolhaUsuario : styles.bolhaAssistente,
            ]}
          >
            <Text style={item.role === 'user' ? styles.textoUsuario : styles.textoAssistente}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {erro && (
        <View style={styles.erro}>
          <Text style={styles.erroTexto}>{erro}</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte sobre a conversa…"
          placeholderTextColor="#94a3b8"
          multiline
          editable={!enviando}
        />
        <TouchableOpacity
          style={[styles.enviarBtn, (enviando || !input.trim()) && styles.btnDesabilitado]}
          onPress={enviar}
          disabled={enviando || !input.trim()}
        >
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.enviarTexto}>➤</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  vazioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  vazioTexto: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  vazioBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  vazioBtnTexto: {
    color: '#fff',
    fontWeight: '700',
  },
  lista: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  dica: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 24,
  },
  bolha: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: 12,
  },
  bolhaUsuario: {
    backgroundColor: '#1d4ed8',
    alignSelf: 'flex-end',
  },
  bolhaAssistente: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
  },
  textoUsuario: {
    color: '#fff',
    fontSize: 14,
  },
  textoAssistente: {
    color: '#0f172a',
    fontSize: 14,
  },
  erro: {
    backgroundColor: '#fee2e2',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 10,
  },
  erroTexto: {
    color: '#991b1b',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  enviarBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarTexto: {
    color: '#fff',
    fontSize: 18,
  },
  btnDesabilitado: {
    opacity: 0.5,
  },
});
