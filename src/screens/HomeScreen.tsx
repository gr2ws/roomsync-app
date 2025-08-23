import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="mb-2 text-3xl font-bold text-gray-900">Home</Text>
      <Text className="mb-8 text-center text-gray-600">Welcome to your app!</Text>
    </View>
  );
}
