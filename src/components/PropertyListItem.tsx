import { View, Text, Image, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react-native';

interface PropertyListItemProps {
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

export default function PropertyListItem({
  property,
  currentRenters,
  isUploading = false,
  onEdit,
  onDelete,
  onViewReviews,
}: PropertyListItemProps) {
  const getLocation = () => {
    return [property.street, property.barangay, property.city].filter(Boolean).join(', ');
  };

  const isAvailable = property.is_available && currentRenters < property.max_renters;

  return (
    <View className="mx-4 mb-2 overflow-hidden rounded-2xl border border-input bg-card">
      <View className="flex-row">
        {/* Right: Property Info */}
        <View className="flex-1 p-3 pl-[37%]">
          {/* Title */}
          <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
            {property.title}
          </Text>

          {/* Location */}
          <View className="mt-2 flex-row items-start">
            <MapPin size={14} color="#644A40" className="mt-0.5" />
            <Text className="ml-1 flex-1 text-xs text-muted-foreground" numberOfLines={2}>
              {getLocation()}
            </Text>
          </View>

          {/* Price */}
          <View className="mt-2 flex-row items-center">
            <Text className="text-xl font-bold text-primary">
              ₱{property.rent.toLocaleString()}
            </Text>
            <Text className="ml-1 text-xs text-muted-foreground">/month</Text>
          </View>

          {/* Status Indicators */}
          <View className="mt-3 flex-row items-center justify-between">
            {/* Availability */}
            <View className="flex-row items-center">
              <CheckCircle size={16} color={isAvailable ? '#16a34a' : '#dc2626'} />
              <Text
                className={`ml-1 text-sm font-medium ${
                  isAvailable ? 'text-green-700' : 'text-red-700'
                }`}>
                {isAvailable ? 'Available' : 'Full'}
              </Text>
            </View>

            {/* Verification */}
            <View className="flex-row items-center">
              {property.is_verified ? (
                <CheckCircle size={16} color="#16a34a" />
              ) : (
                <Clock size={16} color="#ca8a04" />
              )}
              <Text
                className={`ml-1 text-sm font-medium ${
                  property.is_verified ? 'text-green-700' : 'text-yellow-700'
                }`}>
                {property.is_verified ? 'Verified' : 'Pending'}
              </Text>
            </View>

            {/* Renter Count */}
            <View className="flex-row items-center">
              <Users size={16} color="#644A40" />
              <Text className="ml-1 text-sm font-medium text-primary">
                {currentRenters}/{property.max_renters}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-3 flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-lg border border-primary bg-primary px-3 py-2 ${
                isUploading ? 'opacity-50' : ''
              }`}
              onPress={onEdit}
              disabled={isUploading}>
              <Edit size={14} color="white" />
              <Text className="ml-1 text-xs font-semibold text-primary-foreground">
                {isUploading ? 'Uploading...' : 'Edit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-lg border border-input bg-card px-3 py-2"
              onPress={onViewReviews}>
              <Star size={14} color="#644A40" />
              <Text className="ml-1 text-xs font-semibold text-secondary-foreground">Reviews</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center rounded-lg border border-destructive bg-card px-3 py-2"
              onPress={onDelete}>
              <Trash2 size={14} color="#E54D2E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Left: Image */}
        <View className="absolute bottom-0 left-0 top-0 w-[35%] overflow-hidden">
          {property.image_url && property.image_url.length > 0 ? (
            <Image
              source={{ uri: property.image_url[0] }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-muted">
              <Text className="text-muted-foreground">No Image</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
