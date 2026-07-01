/**
 * Config — chave da API do Groq (usada para transcrever áudios com Whisper)
 * e a URL do bridge opencode (usada para o chat sobre a conversa).
 * Guardadas com expo-secure-store, nunca no código.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { Text, View } from '@/components/Themed';
import { useConversa } from '@/lib/ConversaContext';

const GROQ_KEYS_URL = 'https://console.groq.com/keys';

export default function ConfigScreen() {
  const { apiKey, saveApiKey, bridgeUrl, saveBridgeUrl } = useConversa();
  const [valor, setValor] = useState(apiKey ?? '');
  const [urlBridge, setUrlBridge] = useState(bridgeUrl);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    if (valor.trim()) {
      await saveApiKey(valor.trim());
    }
    if (urlBridge.trim()) {
      await saveBridgeUrl(urlBridge.trim());
    }
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Chave Groq (transcrição de áudio)</Text>
      <Text style={styles.descricao}>
        Usada apenas para transcrever os áudios da conversa (Whisper). Fica salva apenas neste
        aparelho.
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

      <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(GROQ_KEYS_URL)}>
        <Text style={styles.link}>Obter uma chave em console.groq.com/keys ↗</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>URL do bridge opencode</Text>
      <Text style={styles.descricao}>
        Usada para o chat sobre a conversa. O processo do bridge precisa estar rodando e acessível
        na mesma rede do celular.
      </Text>

      <TextInput
        style={styles.input}
        value={urlBridge}
        onChangeText={setUrlBridge}
        placeholder="http://192.168.x.x:8787"
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
        <Text style={styles.btnSalvarTexto}>{salvo ? '✅ Salvo' : 'Salvar'}</Text>
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
