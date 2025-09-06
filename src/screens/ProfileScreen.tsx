import { View, Text, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfileScreen() {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Juan Dela Cruz',
    email: 'juandelacruz@example.com',
    phone: '0912 345 6789',
    university: 'Silliman University',
    roomType: 'Solo Apartment/Single Room',
    budgetRange: 'P3000 - P4500'
  });
  const [editedInfo, setEditedInfo] = useState({...userInfo});

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
  };

  const handleSettings = () => {
    // Add settings navigation logic here
    console.log('Opening settings...');
  };

  const handleEditProfile = () => {
    setEditedInfo({...userInfo});
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    setUserInfo(editedInfo);
    setIsEditModalVisible(false);
  };

  const EditProfileModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View className="flex-1 justify-center bg-black/50">
        <View className="mx-4 rounded-lg bg-white p-4">
          <Text className="mb-4 text-xl font-bold text-gray-900">Edit Profile</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-500">Email</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 p-2"
                value={editedInfo.email}
                onChangeText={(text) => setEditedInfo({...editedInfo, email: text})}
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-500">Phone</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 p-2"
                value={editedInfo.phone}
                onChangeText={(text) => setEditedInfo({...editedInfo, phone: text})}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-500">Room Type</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 p-2"
                value={editedInfo.roomType}
                onChangeText={(text) => setEditedInfo({...editedInfo, roomType: text})}
              />
            </View>

            <View>
              <Text className="text-sm text-gray-500">Budget Range</Text>
              <TextInput
                className="mt-1 rounded-lg border border-gray-300 p-2"
                value={editedInfo.budgetRange}
                onChangeText={(text) => setEditedInfo({...editedInfo, budgetRange: text})}
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-end space-x-3">
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(false)}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSaveProfile}
              className="rounded-lg bg-blue-500 px-4 py-2"
            >
              <Text className="text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Settings Icon */}
      <TouchableOpacity 
        onPress={handleSettings}
        className="absolute right-4 top-4 z-10"
      >
        <Ionicons name="settings-outline" size={24} color="#4B5563" />
      </TouchableOpacity>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center pt-8 pb-4">
          {/* Profile Image */}
          <View className="relative">
            <Image
              source={{ uri: 'https://placeholderapi.com/user/150' }}
              className="h-32 w-32 rounded-full"
            />
            <TouchableOpacity 
              className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2"
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Name and Status */}
          <Text className="mt-4 text-2xl font-bold text-gray-900">{userInfo.name}</Text>
          <Text className="text-gray-600">Student</Text>
        </View>

        {/* Profile Sections */}
        <View className="px-4">
          {/* Personal Information */}
          <View className="mb-6 rounded-lg bg-gray-50 p-4">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Personal Information</Text>
            
            <View className="mb-3">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-gray-900">{userInfo.email}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-sm text-gray-500">Phone</Text>
              <Text className="text-gray-900">{userInfo.phone}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-sm text-gray-500">University</Text>
              <Text className="text-gray-900">{userInfo.university}</Text>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-6 rounded-lg bg-gray-50 p-4">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Room Preferences</Text>
            
            <View className="mb-3">
              <Text className="text-sm text-gray-500">Room Type</Text>
              <Text className="text-gray-900">{userInfo.roomType}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-sm text-gray-500">Budget Range</Text>
              <Text className="text-gray-900">{userInfo.budgetRange}</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <View className="mb-8">
            <TouchableOpacity 
              onPress={handleEditProfile}
              className="rounded-lg bg-blue-500 p-4"
            >
              <Text className="text-center font-semibold text-white">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="mb-8 rounded-lg bg-red-500 p-4"
          >
            <Text className="text-center font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditProfileModal />
    </View>
  );
}