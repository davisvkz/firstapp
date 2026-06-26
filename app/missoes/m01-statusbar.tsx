/**
 * M01 — Interface do Sistema
 *
 * Cenário: "Sala de Controle"
 * A status bar (hora, bateria, sinal) muda de aparência conforme o estado de alerta do app.
 *
 * Vetores explorados:
 *  - style="dark"  → ícones escuros (para fundos claros)
 *  - style="light" → ícones claros  (para fundos escuros / modo alerta)
 *  - style="auto"  → segue o tema do sistema operacional
 * A mudança acontece em runtime via estado — não é fixada na montagem.
 */
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Text, View } from '@/components/Themed';

export default function M01StatusBar() {
  const [alerta, setAlerta] = useState(false);

  return (
    // O fundo muda junto com o estado para deixar o efeito da status bar visível.
    <View style={[styles.container, alerta ? styles.fundoAlerta : styles.fundoNormal]}>
      {/*
       * style muda em runtime: quando alerta=true usamos "light" (ícones brancos
       * ficam visíveis sobre o fundo vermelho escuro); quando false usamos "dark"
       * (ícones pretos sobre fundo claro). animated=true suaviza a transição.
       */}
      <StatusBar style={alerta ? 'light' : 'dark'} animated />

      <Text style={[styles.indicador, alerta ? styles.textoAlerta : styles.textoNormal]}>
        {alerta ? '🚨 ALERTA ATIVO' : '✅ SISTEMA NORMAL'}
      </Text>

      <Text style={[styles.descricao, alerta ? styles.textoAlerta : styles.textoNormal]}>
        {alerta
          ? 'Status bar: style="light"\nÍcones brancos → visíveis no fundo escuro.'
          : 'Status bar: style="dark"\nÍcones pretos → visíveis no fundo claro.'}
      </Text>

      <TouchableOpacity
        style={[styles.botao, alerta ? styles.botaoDesarmar : styles.botaoDisparar]}
        onPress={() => setAlerta((v) => !v)}
      >
        <Text style={styles.botaoTexto}>
          {alerta ? 'Desarmar alerta' : 'Disparar alerta'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.nota, alerta ? styles.textoAlerta : styles.textoNormal]}>
        Observe a barra de status do SO acima — hora, bateria e sinal mudam de cor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 24,
  },
  fundoNormal: {
    backgroundColor: '#f0f4f8',
  },
  fundoAlerta: {
    backgroundColor: '#7f1d1d',
  },
  indicador: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descricao: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
  },
  textoNormal: {
    color: '#1a1a1a',
  },
  textoAlerta: {
    color: '#fef2f2',
  },
  botao: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  botaoDisparar: {
    backgroundColor: '#dc2626',
  },
  botaoDesarmar: {
    backgroundColor: '#166534',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nota: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },
});
