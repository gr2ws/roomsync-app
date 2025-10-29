import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Star, MapPin, Users, Image as ImageIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';
import { Property } from '../types/property';
import { useLoggedIn } from '../store/useLoggedIn';
import { calculateDistanceFromStrings, formatDistance } from '../utils/distance';
import ImageSkeleton from './ImageSkeleton';

interface ChatPropertyCardProps {
  property: Property;
  currentRenters?: number;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ChatPropertyCard({ property, currentRenters = 0 }: ChatPropertyCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { userProfile } = useLoggedIn();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const parsePriceRange = (priceRange: string | null): { min: number; max: number } | null => {
    if (!priceRange) return null;

    try {
      const parts = priceRange.split(/[-,]/).map((s) => parseInt(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: parts[0], max: parts[1] };
      }
    } catch (error) {
      console.error('Error parsing price range:', error);
    }

    return null;
  };

  const matchesPriceRange = (): boolean => {
    if (!userProfile?.price_range) return false;
    const priceRange = parsePriceRange(userProfile.price_range);
    if (!priceRange) return false;
    return property.rent >= priceRange.min && property.rent <= priceRange.max;
  };

  const getDistance = (): number | null => {
    if (!property.coordinates || !userProfile?.place_of_work_study) return null;
    return calculateDistanceFromStrings(property.coordinates, userProfile.place_of_work_study);
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'bedspace') return 'Bedspace';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const distance = getDistance();

  return (
    <TouchableOpacity
      className="my-1 h-36 flex-row overflow-hidden rounded-lg border border-input bg-card shadow-sm"
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.property_id })}
      activeOpacity={0.7}>
      {/* Image (35%) */}
      {property.image_url && property.image_url.length > 0 ? (
        <View className="w-[35%] overflow-hidden rounded-bl-xl rounded-tl-xl">
          {isImageLoading && (
            <View className="absolute inset-0 rounded-bl-xl rounded-tl-xl">
              <ImageSkeleton width="100%" height="100%" borderRadius={12} />
            </View>
          )}
          <Image
            source={{ uri: property.image_url[0] }}
            className="h-full w-full rounded-bl-xl rounded-tl-xl"
            resizeMode="cover"
            onLoadStart={() => setIsImageLoading(true)}
            onLoadEnd={() => setIsImageLoading(false)}
          />
        </View>
      ) : (
        <View className="w-[35%] items-center justify-center rounded-bl-xl rounded-tl-xl bg-muted">
          <ImageIcon size={28} color="#EFEFEF" />
        </View>
      )}

      {/* Details (65%) */}
      <View className="flex-1 justify-between p-2.5">
        {/* Title and Location */}
        <View className="mb-1">
          <Text numberOfLines={1} className="text-base font-bold text-primary">
            {property.title}
          </Text>
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {[property.barangay, property.city].filter(Boolean).join(', ')}
          </Text>
        </View>

        {/* Price */}
        <View className="mb-1 flex-row items-center">
          <Text
            className={`text-base font-bold ${matchesPriceRange() ? 'text-green-600' : 'text-foreground'}`}>
            ₱{property.rent.toLocaleString()}
          </Text>
          <Text className="text-sm text-muted-foreground">/mo</Text>
        </View>

        {/* Rating and Occupancy */}
        <View className="mb-1 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {property.rating && property.rating > 0 ? (
              <>
                <Star size={14} color="rgb(250, 204, 21)" fill="rgb(250, 204, 21)" />
                <Text className="ml-1 text-sm text-muted-foreground">
                  {property.rating.toFixed(1)} ({property.number_reviews || 0})
                </Text>
              </>
            ) : (
              <Text className="text-sm text-muted-foreground">No reviews</Text>
            )}
          </View>
          <View className="flex-row items-center">
            <Users size={14} color="#644A40" />
            <Text className="ml-1 text-sm text-muted-foreground">
              {currentRenters}/{property.max_renters}
            </Text>
          </View>
        </View>

        {/* Distance and Room Type Badge */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MapPin size={14} color="#644A40" />
            <Text className="ml-1 text-xs text-muted-foreground">
              {distance !== null
                ? `${formatDistance(distance)} from work/school`
                : 'Set location to see distance'}
            </Text>
          </View>
          <View className="rounded-full border border-primary/20 bg-secondary/30 px-2 py-0.5">
            <Text className="text-xs font-medium text-secondary-foreground">
              {getCategoryLabel(property.category)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
