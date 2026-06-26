import { StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import { Text, View } from '@/components/Themed';

type MissaoCard = {
  id: string;
  titulo: string;
  api: string;
  rota: string;
};

const MISSOES: MissaoCard[] = [
  { id: 'M01', titulo: 'Interface do Sistema', api: 'expo-status-bar', rota: '/missoes/m01-statusbar' },
  { id: 'M02', titulo: 'Inteligência de Sistema', api: 'Platform', rota: '/missoes/m02-platform' },
  { id: 'M03', titulo: 'Feedback Físico', api: 'expo-haptics', rota: '/missoes/m03-haptics' },
  { id: 'M04', titulo: 'Consciência Espacial', api: 'useWindowDimensions', rota: '/missoes/m04-dimensions' },
];

export default function HubScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🎯 Expo Hunters</Text>
      <Text style={styles.subtitulo}>Selecione uma missão</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {MISSOES.map((m) => (
        <Link key={m.id} href={m.rota as any} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardId}>[{m.id}]</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo}>{m.titulo}</Text>
              <Text style={styles.cardApi}>{m.api}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 4,
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 14,
    fontFamily: 'SpaceMono',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardApi: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
    fontFamily: 'SpaceMono',
  },
});
