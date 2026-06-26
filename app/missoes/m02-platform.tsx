/**
 * M02 — Inteligência de Sistema
 *
 * Cenário: "Crachá do Dispositivo"
 * Um card que se parece e se comporta diferente em Android e iOS,
 * usando apenas APIs do core do React Native (sem instalação extra).
 *
 * Vetores explorados:
 *  - Platform.OS      → 'android' | 'ios' | 'web'
 *  - Platform.Version → número da versão da API no Android (ex.: 34)
 *                       string da versão do iOS (ex.: "17.2")
 *  - Platform.select  → usado direto no StyleSheet para estilo idiomático por plataforma
 */
import { Platform, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

// Platform.Version: no Android é um número (API level, ex.: 34 = Android 14).
//                   no iOS é uma string (ex.: "17.2"). Convertemos para exibição uniforme.
const versao = String(Platform.Version);

// O que acontece em cada plataforma (para demonstração sem precisar dos dois aparelhos):
const DESCRICAO_PLATAFORMA = Platform.select({
  ios: 'Cantos arredondados (borderRadius maior), sombra nativa (shadow*) e texto em minúsculas — estilo iOS.',
  android: 'Sombra via elevation, texto em MAIÚSCULAS e borda de destaque — Material Design.',
  default: 'Sem estilos nativos específicos (web/outro).',
});

export default function M02Platform() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crachá do Dispositivo</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* O card abaixo usa Platform.select no StyleSheet — cada plataforma recebe seu estilo */}
      <View style={styles.cracha}>
        <Text style={styles.crachaOs}>
          {Platform.OS.toUpperCase()}
        </Text>
        <Text style={styles.crachaVersao}>versão {versao}</Text>
        <Text style={styles.crachaDescricao}>{DESCRICAO_PLATAFORMA}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitulo}>Como Platform.Version se comporta:</Text>
        <Text style={styles.infoTexto}>
          • Android → número inteiro (API level){'\n'}
          {'  '}ex.: 34 = Android 14, 33 = Android 13{'\n'}
          • iOS → string de versão{'\n'}
          {'  '}ex.: "17.2", "16.4"
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitulo}>Platform.select no StyleSheet:</Text>
        <Text style={styles.infoTexto}>
          Permite passar um objeto {'{ ios, android, default }'} e{'\n'}
          receber o valor correto em tempo de execução.{'\n'}
          Aplicado no estilo do crachá acima.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '80%',
    marginVertical: 8,
  },

  // Platform.select aplicado diretamente no StyleSheet:
  // iOS → sombra nativa + cantos bem arredondados
  // Android → elevation + borda azul + texto em caps
  cracha: {
    width: '90%',
    alignItems: 'center',
    padding: 24,
    ...Platform.select({
      ios: {
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 6,
        borderLeftWidth: 5,
        borderLeftColor: '#1d4ed8',
      },
      default: {
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
      },
    }),
  },
  crachaOs: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Platform.select({ ios: '#0f172a', android: '#1d4ed8', default: '#333' }),
    ...Platform.select({
      android: { textTransform: 'uppercase', letterSpacing: 2 },
      default: {},
    }),
  },
  crachaVersao: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  crachaDescricao: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    color: '#555',
  },
  infoBox: {
    width: '90%',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'SpaceMono',
  },
  infoTexto: {
    fontSize: 12,
    lineHeight: 20,
    opacity: 0.75,
  },
});
