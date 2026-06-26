/**
 * M03 — Feedback Físico
 *
 * Cenário: "Transferência PIX"
 * Cada ação no fluxo tem um haptic escolhido com justificativa explícita na tela.
 *
 * Mapeamento haptic → justificativa:
 *  selectionAsync()                          → alternar destinatário (tique discreto de seleção de lista)
 *  impactAsync(ImpactFeedbackStyle.Light)    → incrementar/decrementar valor (toque leve, ação reversível)
 *  impactAsync(ImpactFeedbackStyle.Heavy)    → pressionar Confirmar (peso = ação de peso/irreversível)
 *  notificationAsync(NotificationFeedbackType.Success) → transação aprovada (saldo suficiente)
 *  notificationAsync(NotificationFeedbackType.Error)   → transação negada (saldo insuficiente)
 *
 * Caveats:
 *  - iOS: Taptic Engine inativo em Low Power Mode, câmera ativa ou ditado.
 *  - Web: depende da Web Vibration API + hardware + permissão do usuário.
 */
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Text, View } from '@/components/Themed';

const DESTINATARIOS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes'];
const SALDO = 500;
const INCREMENTO = 50;

export default function M03Haptics() {
  const [destinatarioIdx, setDestinatarioIdx] = useState(0);
  const [valor, setValor] = useState(100);
  const [resultado, setResultado] = useState<'aguardando' | 'sucesso' | 'erro'>('aguardando');

  function trocarDestinatario() {
    // selectionAsync → tique discreto de seleção de item em lista
    Haptics.selectionAsync();
    setDestinatarioIdx((i) => (i + 1) % DESTINATARIOS.length);
    setResultado('aguardando');
  }

  function ajustarValor(delta: number) {
    const novo = Math.max(INCREMENTO, valor + delta);
    setValor(novo);
    // impactAsync Light → ação leve e reversível (incrementar/decrementar)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResultado('aguardando');
  }

  function confirmar() {
    // impactAsync Heavy → sensação de peso ao confirmar (ação irreversível)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (valor <= SALDO) {
      // notificationAsync Success → transação aprovada
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResultado('sucesso');
    } else {
      // notificationAsync Error → transação negada (saldo insuficiente)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setResultado('erro');
    }
  }

  const corResultado =
    resultado === 'sucesso' ? '#166534' : resultado === 'erro' ? '#991b1b' : 'transparent';

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Transferência PIX</Text>
      <Text style={styles.saldo}>Saldo disponível: R$ {SALDO},00</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* Destinatário — selectionAsync */}
      <View style={styles.campo}>
        <Text style={styles.label}>Destinatário</Text>
        <TouchableOpacity style={styles.seletorBtn} onPress={trocarDestinatario}>
          <Text style={styles.seletorTexto}>{DESTINATARIOS[destinatarioIdx]}</Text>
          <Text style={styles.seletorHint}>↕ trocar  ·  haptic: selectionAsync</Text>
        </TouchableOpacity>
      </View>

      {/* Valor — impactAsync Light */}
      <View style={styles.campo}>
        <Text style={styles.label}>Valor</Text>
        <View style={styles.valorRow}>
          <TouchableOpacity style={styles.ajusteBtn} onPress={() => ajustarValor(-INCREMENTO)}>
            <Text style={styles.ajusteBtnTexto}>−</Text>
          </TouchableOpacity>
          <Text style={styles.valorTexto}>R$ {valor},00</Text>
          <TouchableOpacity style={styles.ajusteBtn} onPress={() => ajustarValor(+INCREMENTO)}>
            <Text style={styles.ajusteBtnTexto}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintTexto}>haptic: impactAsync(Light)</Text>
      </View>

      {/* Confirmar — impactAsync Heavy + notificationAsync */}
      <TouchableOpacity style={styles.confirmarBtn} onPress={confirmar}>
        <Text style={styles.confirmarTexto}>Confirmar PIX</Text>
        <Text style={styles.confirmarHint}>haptic: Heavy → Success ou Error</Text>
      </TouchableOpacity>

      {resultado !== 'aguardando' && (
        <View style={[styles.resultado, { backgroundColor: corResultado }]}>
          <Text style={styles.resultadoTexto}>
            {resultado === 'sucesso'
              ? `✅ PIX de R$ ${valor},00 enviado para ${DESTINATARIOS[destinatarioIdx]}!`
              : `❌ Saldo insuficiente (R$ ${valor},00 > R$ ${SALDO},00)`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saldo: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
  separator: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  campo: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seletorBtn: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 14,
  },
  seletorTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  seletorHint: {
    fontSize: 11,
    opacity: 0.45,
    marginTop: 4,
    fontFamily: 'SpaceMono',
  },
  valorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 10,
  },
  ajusteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ajusteBtnTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  valorTexto: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  hintTexto: {
    fontSize: 11,
    opacity: 0.45,
    fontFamily: 'SpaceMono',
  },
  confirmarBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmarTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  confirmarHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'SpaceMono',
  },
  resultado: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  resultadoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
