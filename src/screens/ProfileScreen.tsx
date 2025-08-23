import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-4">
      <Text className="text-3xl font-bold mb-2 text-gray-900">Profile</Text>
      <Text className="text-gray-600 mb-8 text-center">
        Your profile information
      </Text>
      
      <TouchableOpacity
        className="bg-green-500 w-full py-4 rounded-lg mb-4"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-center text-lg font-medium">Back</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-gray-500 w-full py-4 rounded-lg"
        onPress={() => navigation.navigate('Home')}
      >
        <Text className="text-white text-center text-lg font-medium">Home</Text>
      </TouchableOpacity>
    </View>
  );
}
