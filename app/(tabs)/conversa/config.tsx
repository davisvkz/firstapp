/**
 * Config — chave da API do Groq (usada para transcrever áudios com Whisper
 * e para o chat). Guardada com expo-secure-store, nunca no código.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { Text, View } from '@/components/Themed';
import { useConversa } from '@/lib/ConversaContext';

const GROQ_KEYS_URL = 'https://console.groq.com/keys';

export default function ConversaConfig() {
  const { apiKey, saveApiKey } = useConversa();
  const [valor, setValor] = useState(apiKey ?? '');
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    await saveApiKey(valor.trim());
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Chave da API do Groq</Text>
      <Text style={styles.descricao}>
        Usada para transcrever os áudios (Whisper) e para o chat sobre a conversa. Fica salva
        apenas neste aparelho.
      </Text>

      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="gsk_..."
        placeholderTextColor="#94a3b8"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={salvar} disabled={!valor.trim()}>
        <Text style={styles.btnSalvarTexto}>{salvo ? '✅ Chave salva' : 'Salvar chave'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(GROQ_KEYS_URL)}>
        <Text style={styles.link}>Obter uma chave em console.groq.com/keys ↗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  descricao: {
    fontSize: 13,
    opacity: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: 'SpaceMono',
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  btnSalvar: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  btnSalvarTexto: {
    color: '#fff',
    fontWeight: '700',
  },
  link: {
    color: '#1d4ed8',
    fontSize: 13,
    textAlign: 'center',
  },
});
