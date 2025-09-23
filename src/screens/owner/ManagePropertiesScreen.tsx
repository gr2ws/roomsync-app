import { View, Text } from 'react-native';

export default function ManagePropertiesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="mb-2 text-3xl font-bold text-gray-900">Manage Properties</Text>
      <Text className="mb-8 text-center text-gray-600">Your latest updates will appear here.</Text>
    </View>
  );
}
