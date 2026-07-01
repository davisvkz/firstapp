import { Stack } from 'expo-router';

import { ConversaProvider } from '@/lib/ConversaContext';

export default function ConversaLayout() {
  return (
    <ConversaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Conversa' }} />
        <Stack.Screen name="chat" options={{ title: 'Chat sobre a conversa' }} />
        <Stack.Screen name="config" options={{ title: 'Config · Groq API' }} />
      </Stack>
    </ConversaProvider>
  );
}
