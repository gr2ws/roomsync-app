import { SafeAreaView, View } from 'react-native';

export function MainScaffold({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 bg-white">{children}</SafeAreaView>
    </View>
  );
}
