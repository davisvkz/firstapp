import { Stack } from 'expo-router';

export default function ConversaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Conversa' }} />
      <Stack.Screen name="chat" options={{ title: 'Chat sobre a conversa' }} />
    </Stack>
  );
}
