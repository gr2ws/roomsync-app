import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

export function MainScaffold({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background" edges={[]}>
        <View className="flex-1">{children}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
