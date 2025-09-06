import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export function MainScaffold({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">{children}</SafeAreaView>
    </SafeAreaProvider>
  );
}
