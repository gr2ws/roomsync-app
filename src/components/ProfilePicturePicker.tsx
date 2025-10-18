import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { User, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture } from '../utils/uploadProfilePicture';

interface ProfilePicturePickerProps {
  value: string | null;
  onChange: (url: string) => void;
  authId: string;
}

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({ value, onChange, authId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera and photo library permissions to upload a profile picture.'
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async (type: 'camera' | 'library') => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      let result;

      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const imageUri = result.assets[0].uri;

        // Upload to Supabase
        const publicUrl = await uploadProfilePicture(imageUri, authId);

        if (publicUrl) {
          onChange(publicUrl);
          Alert.alert('Success', 'Profile picture uploaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
        }

        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => handleImagePick('camera'),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => handleImagePick('library'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <View className="mb-4 items-center">
      <TouchableOpacity
        onPress={showImagePickerOptions}
        disabled={isUploading}
        className="relative">
        <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-muted">
          {isUploading ? (
            <ActivityIndicator size="large" color="#644A40" />
          ) : value ? (
            <Image source={{ uri: value }} className="h-full w-full rounded-full" />
          ) : (
            <User size={48} color="#644A40" />
          )}
        </View>

        {/* Edit badge */}
        <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary">
          <Camera size={16} color="white" />
        </View>
      </TouchableOpacity>
      <Text className="mt-2 text-sm text-muted-foreground">
        {isUploading ? 'Uploading...' : 'Tap to change profile picture'}
      </Text>
    </View>
  );
};

export default ProfilePicturePicker;
