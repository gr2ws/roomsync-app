import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-3xl font-bold mb-2 text-gray-900">Home</Text>
      <Text className="text-gray-600 mb-8 text-center">
        Welcome to your app!
      </Text>
      
      <TouchableOpacity
        className="bg-blue-500 w-full py-4 rounded-lg mb-4"
        onPress={() => navigation.navigate('Profile')}
      >
        <Text className="text-white text-center text-lg font-medium">Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
