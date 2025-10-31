import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { User, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture } from '../utils/uploadProfilePicture';
import { useLoggedIn } from '../store/useLoggedIn';
import ImageSkeleton from './ImageSkeleton';

interface ProfilePicturePickerProps {
  value: string | null;
  onChange: (url: string) => void;
  authId: string;
}

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({ value, onChange, authId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { userProfile } = useLoggedIn();
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Reset imageError when value changes
    if (value) {
      setImageError(false);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getUserInitials = () => {
    const firstName = userProfile?.first_name || '';
    const lastName = userProfile?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const requestPermissions = async (type: 'camera' | 'library') => {
    console.log('[ProfilePicturePicker] Requesting permissions for type:', type);

    try {
      if (type === 'camera') {
        console.log('[ProfilePicturePicker] Requesting camera permission...');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('[ProfilePicturePicker] Camera permission status:', status);

        if (status !== 'granted') {
          console.log('[ProfilePicturePicker] Camera permission denied');
          Alert.alert(
            'Permission Required',
            'Please grant camera permission to take photos.'
          );
          return false;
        }
      } else {
        console.log('[ProfilePicturePicker] Requesting media library permission...');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('[ProfilePicturePicker] Media library permission status:', status);

        if (status !== 'granted') {
          console.log('[ProfilePicturePicker] Media library permission denied');
          Alert.alert(
            'Permission Required',
            'Please grant photo library permission to choose photos.'
          );
          return false;
        }
      }

      console.log('[ProfilePicturePicker] Permission granted');
      return true;
    } catch (error) {
      console.error('[ProfilePicturePicker] Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
      return false;
    }
  };

  const handleImagePick = async (type: 'camera' | 'library') => {
    console.log('[ProfilePicturePicker] handleImagePick called with type:', type);
    const hasPermissions = await requestPermissions(type);
    if (!hasPermissions) {
      console.log('[ProfilePicturePicker] Permissions not granted, aborting');
      return;
    }

    try {
      let result;

      if (type === 'camera') {
        console.log('[ProfilePicturePicker] Launching camera...');
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });
      } else {
        console.log('[ProfilePicturePicker] Launching image library...');
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });
      }

      console.log('[ProfilePicturePicker] Image picker result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets?.[0],
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const imageUri = result.assets[0].uri;
        console.log('[ProfilePicturePicker] Image selected, URI:', imageUri);
        console.log('[ProfilePicturePicker] Starting upload with authId:', authId);

        // Upload to Supabase in background
        uploadProfilePicture(imageUri, authId)
          .then((publicUrl) => {
            console.log('[ProfilePicturePicker] Upload completed, publicUrl:', publicUrl);

            // Always call onChange to update database and global state
            if (publicUrl) {
              console.log('[ProfilePicturePicker] Calling onChange with URL:', publicUrl);
              onChange(publicUrl);
            } else {
              console.log('[ProfilePicturePicker] No publicUrl returned from upload');
            }

            // Always reset uploading state, even if unmounted
            setIsUploading(false);

            // Only show alerts if component is still mounted
            if (!isMountedRef.current) {
              console.log('[ProfilePicturePicker] Component unmounted, skipping UI updates');
              return;
            }

            if (publicUrl) {
              console.log('[ProfilePicturePicker] Showing success alert');
              Alert.alert('Success', 'Profile picture uploaded successfully!');
            } else {
              console.log('[ProfilePicturePicker] Showing error alert - no URL');
              Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
            }
          })
          .catch((error) => {
            console.error('[ProfilePicturePicker] Upload error:', error);
            console.error('[ProfilePicturePicker] Error details:', {
              message: error.message,
              stack: error.stack,
            });

            // Always reset uploading state, even if unmounted
            setIsUploading(false);

            // Only show alert if component is still mounted
            if (!isMountedRef.current) {
              console.log('[ProfilePicturePicker] Component unmounted, skipping error alert');
              return;
            }

            Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
          });
      } else {
        console.log('[ProfilePicturePicker] Image picker canceled or no asset selected');
      }
    } catch (error) {
      console.error('[ProfilePicturePicker] Error in handleImagePick:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'An error occurred while selecting the image.');
      }
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    console.log('[ProfilePicturePicker] showImagePickerOptions called');
    Alert.alert('Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => {
          console.log('[ProfilePicturePicker] Take Photo selected');
          handleImagePick('camera');
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          console.log('[ProfilePicturePicker] Choose from Gallery selected');
          handleImagePick('library');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => console.log('[ProfilePicturePicker] Image picker canceled'),
      },
    ]);
  };

  return (
    <View className="mb-4 items-center">
      <TouchableOpacity
        onPress={showImagePickerOptions}
        disabled={isUploading}
        className="relative">
        <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted">
          {isUploading ? (
            <ImageSkeleton width={96} height={96} borderRadius={48} />
          ) : value && !imageError ? (
            <>
              {imageLoading && (
                <View className="absolute inset-0">
                  <ImageSkeleton width={96} height={96} borderRadius={48} />
                </View>
              )}
              <Image
                source={{ uri: value }}
                className="h-full w-full rounded-full"
                onLoadStart={() => {
                  console.log('[ProfilePicturePicker] Image load started for URI:', value);
                  setImageLoading(true);
                }}
                onLoadEnd={() => {
                  console.log('[ProfilePicturePicker] Image load completed for URI:', value);
                  setImageLoading(false);
                }}
                onError={(error) => {
                  console.error('[ProfilePicturePicker] Image load error for URI:', value);
                  console.error('[ProfilePicturePicker] Error details:', error.nativeEvent);
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : userProfile?.first_name && userProfile?.last_name ? (
            <View className="h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <Text className="text-2xl font-bold text-primary">{getUserInitials()}</Text>
            </View>
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
