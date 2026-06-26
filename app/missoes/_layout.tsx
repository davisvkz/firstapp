import { Stack } from 'expo-router';

export default function MissoesLayout() {
  return (
    <Stack>
      <Stack.Screen name="m01-statusbar" options={{ title: 'M01 · Interface do Sistema' }} />
      <Stack.Screen name="m02-platform" options={{ title: 'M02 · Inteligência de Sistema' }} />
      <Stack.Screen name="m03-haptics" options={{ title: 'M03 · Feedback Físico' }} />
      <Stack.Screen name="m04-dimensions" options={{ title: 'M04 · Consciência Espacial' }} />
    </Stack>
  );
}
