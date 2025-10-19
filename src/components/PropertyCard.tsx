import { View, Text, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useState } from 'react';
import { MapPin, DollarSign, Edit, Trash2, Star } from 'lucide-react-native';
import PropertyStatusBadge from './PropertyStatusBadge';
import Button from './Button';

interface PropertyCardProps {
  property: {
    property_id: number;
    title: string;
    description: string | null;
    category: string;
    street: string | null;
    barangay: string | null;
    city: string;
    image_url: string[];
    rent: number;
    max_renters: number;
    is_available: boolean;
    is_verified: boolean;
    amenities: string[];
  };
  currentRenters: number;
  isUploading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewReviews: () => void;
}

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 48; // Account for padding

export default function PropertyCard({
  property,
  currentRenters,
  isUploading = false,
  onEdit,
  onDelete,
  onViewReviews,
}: PropertyCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setActiveImageIndex(index);
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'bedspace') return 'Bed Space';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <View className="flex-1 bg-background px-6 py-4">
      {/* Image Carousel */}
      {property.image_url && property.image_url.length > 0 && (
        <View className="mb-4">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            {property.image_url.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                className="rounded-xl"
                style={{ width: IMAGE_WIDTH, height: 240 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {property.image_url.length > 1 && (
            <View className="mt-2 flex-row justify-center gap-2">
              {property.image_url.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === activeImageIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Title and Category */}
      <View className="mb-3">
        <Text className="text-2xl font-bold text-foreground">{property.title}</Text>
        <Text className="mt-1 text-sm font-medium text-muted-foreground">
          {getCategoryLabel(property.category)}
        </Text>
      </View>

      {/* Status Badges */}
      <View className="mb-4">
        <PropertyStatusBadge
          isAvailable={property.is_available && currentRenters < property.max_renters}
          isVerified={property.is_verified}
          currentRenters={currentRenters}
          maxRenters={property.max_renters}
        />
      </View>

      {/* Description */}
      {property.description && (
        <View className="mb-4">
          <Text className="text-base leading-6 text-foreground">{property.description}</Text>
        </View>
      )}

      {/* Location */}
      <View className="mb-4 flex-row items-start">
        <MapPin size={20} color="#644A40" className="mt-0.5" />
        <View className="ml-2 flex-1">
          <Text className="text-base text-foreground">
            {[property.street, property.barangay, property.city].filter(Boolean).join(', ')}
          </Text>
        </View>
      </View>

      {/* Rent */}
      <View className="mb-4 flex-row items-center">
        <DollarSign size={20} color="#644A40" />
        <Text className="ml-2 text-2xl font-bold text-primary">
          ₱{property.rent.toLocaleString()}
        </Text>
        <Text className="ml-1 text-base text-muted-foreground">/month</Text>
      </View>

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-foreground">Amenities</Text>
          <View className="flex-row flex-wrap gap-2">
            {property.amenities.map((amenity, index) => (
              <View key={index} className="rounded-lg border border-input bg-card px-3 py-2">
                <Text className="text-sm text-card-foreground">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <Button variant="primary" className="flex-1" onPress={onEdit} disabled={isUploading}>
            <View className="flex-row items-center justify-center">
              <Edit size={18} color="white" />
              <Text className="ml-2 text-base font-semibold text-primary-foreground">
                {isUploading ? 'Uploading...' : 'Edit Property'}
              </Text>
            </View>
          </Button>

          <Button variant="secondary" className="flex-1" onPress={onViewReviews}>
            <View className="flex-row items-center justify-center">
              <Star size={18} color="#644A40" />
              <Text className="ml-2 text-base font-semibold text-secondary-foreground">
                Reviews
              </Text>
            </View>
          </Button>
        </View>

        <Button variant="destructive" onPress={onDelete}>
          <View className="flex-row items-center justify-center">
            <Trash2 size={18} color="#E54D2E" />
            <Text className="ml-2 text-base font-semibold text-destructive">Delete Property</Text>
          </View>
        </Button>
      </View>
    </View>
  );
}
