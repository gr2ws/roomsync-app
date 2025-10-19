import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface MultiImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  error?: string;
}

const MultiImagePicker: React.FC<MultiImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label,
  error,
}) => {
  const handlePickImages = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-2 text-base font-medium text-foreground">{label}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
        <View className="flex-row gap-3" style={{ overflow: 'visible' }}>
          {/* Existing Images */}
          {images.map((uri, index) => (
            <View key={index} className="relative" style={{ overflow: 'visible' }}>
              <Image source={{ uri }} className="h-24 w-24 rounded-lg" />
              {/* Remove Button */}
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5"
                style={{ overflow: 'visible' }}>
                <X size={14} color="white" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Photo Button */}
          {images.length < maxImages && (
            <TouchableOpacity
              onPress={handlePickImages}
              className="h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
              <Camera size={24} color="#888" />
              <Text className="mt-1 text-xs text-muted-foreground">Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      <Text className="mt-1 text-xs text-muted-foreground">
        {images.length} / {maxImages} images
      </Text>
    </View>
  );
};

export default MultiImagePicker;
