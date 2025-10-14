import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export function MainScaffold({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-background flex-1">{children}</SafeAreaView>
    </SafeAreaProvider>
  );
}
