/**
 * M04 — Consciência Espacial
 *
 * Cenário: "Galeria Responsiva"
 * useWindowDimensions fornece width/height que se atualizam a cada rotação.
 * O layout reage em tempo real — sem precisar de evento ou listener manual.
 *
 * Vetores explorados:
 *  - width/height para construir layout que se adapta (não só exibir os números)
 *  - Rotação: girar o celular re-renderiza o componente automaticamente
 *  - Desafio: card de destaque sempre a 80% da largura, em qualquer aparelho
 *  - Número de colunas calculado por width: <600px → 2 colunas, ≥600px → 3 colunas
 */
import { useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

const FOTOS = [
  { id: '1', emoji: '🌄', legenda: 'Amanhecer' },
  { id: '2', emoji: '🌊', legenda: 'Oceano' },
  { id: '3', emoji: '🏔️', legenda: 'Montanha' },
  { id: '4', emoji: '🌿', legenda: 'Floresta' },
  { id: '5', emoji: '🌙', legenda: 'Lua' },
  { id: '6', emoji: '🏙️', legenda: 'Cidade' },
];

export default function M04Dimensions() {
  // useWindowDimensions: retorna { width, height, scale, fontScale }.
  // Re-renderiza automaticamente quando o tamanho da janela muda (rotação, janela flutuante).
  const { width, height } = useWindowDimensions();

  const orientacao = width > height ? 'paisagem 🌄' : 'retrato 📱';

  // Número de colunas adaptado à largura:
  // < 600 px → 2 colunas (celulares em retrato)
  // ≥ 600 px → 3 colunas (tablets ou celular em paisagem)
  const numColunas = width < 600 ? 2 : 3;

  // Cada célula da grade ocupa 1/numColunas da largura menos as margens.
  const margemHorizontal = 16;
  const gap = 8;
  const larguraCelula = (width - margemHorizontal * 2 - gap * (numColunas - 1)) / numColunas;

  // Desafio: card de destaque sempre a 80% da largura, qualquer aparelho.
  const larguraDestaque = width * 0.8;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Painel de informações — mostra os valores em uso */}
      <View style={styles.painel}>
        <Text style={styles.painelTitulo}>Dimensões da janela</Text>
        <Text style={styles.painelLinha}>
          largura: <Text style={styles.valor}>{Math.round(width)} px</Text>
          {'   '}altura: <Text style={styles.valor}>{Math.round(height)} px</Text>
        </Text>
        <Text style={styles.painelLinha}>
          orientação: <Text style={styles.valor}>{orientacao}</Text>
        </Text>
        <Text style={styles.painelLinha}>
          colunas: <Text style={styles.valor}>{numColunas}</Text>
          {'  ('}width {width < 600 ? '<' : '≥'} 600 px{')'}
        </Text>
      </View>

      {/* Card de destaque: sempre 80% da largura — resolve o Desafio */}
      <View style={[styles.cardDestaque, { width: larguraDestaque }]}>
        <Text style={styles.destaqueEmoji}>⭐</Text>
        <Text style={styles.destaqueTitulo}>Card de Destaque</Text>
        <Text style={styles.destaqueInfo}>80% da largura = {Math.round(larguraDestaque)} px</Text>
        <Text style={styles.destaqueInfo}>Gire o celular para ver adaptar!</Text>
      </View>

      {/* Grade responsiva */}
      <Text style={styles.sectionTitulo}>Galeria ({numColunas} colunas)</Text>
      <View style={[styles.grade, { paddingHorizontal: margemHorizontal }]}>
        {FOTOS.map((foto) => (
          <View
            key={foto.id}
            style={[
              styles.celulaFoto,
              {
                width: larguraCelula,
                height: larguraCelula,
                marginBottom: gap,
                marginRight: gap,
              },
            ]}
          >
            <Text style={styles.fotoEmoji}>{foto.emoji}</Text>
            <Text style={styles.fotoLegenda}>{foto.legenda}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  painel: {
    width: '90%',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  painelTitulo: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'SpaceMono',
  },
  painelLinha: {
    fontSize: 13,
    opacity: 0.8,
  },
  valor: {
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  cardDestaque: {
    borderRadius: 14,
    backgroundColor: '#1d4ed8',
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  destaqueEmoji: {
    fontSize: 36,
  },
  destaqueTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  destaqueInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'SpaceMono',
  },
  sectionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  celulaFoto: {
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fotoEmoji: {
    fontSize: 32,
  },
  fotoLegenda: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.6,
  },
});
