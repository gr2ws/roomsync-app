import { View, Text, Image } from 'react-native';
import { MapPin, Edit, Trash2, Star, Users, FileText } from 'lucide-react-native';
import SmallButton from './SmallButton';

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
    amenities: string[] | null;
    number_reviews: number;
  };
  currentRenters: number;
  applicationsCount?: number;
  isUploading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewReviews: () => void;
  onViewApplications: () => void;
}

export default function PropertyListItem({
  property,
  currentRenters,
  applicationsCount = 0,
  isUploading = false,
  onEdit,
  onDelete,
  onViewReviews,
  onViewApplications,
}: PropertyListItemProps) {
  const getLocation = () => {
    return [property.street, property.barangay, property.city].filter(Boolean).join(', ');
  };

  const isAtFullCapacity = currentRenters >= property.max_renters;
  const isOccupied = currentRenters > 0;

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

          {/* Status Badge and Renter Count */}
          <View className="mt-3 flex-row items-center justify-between">
            {/* Verification Status Badge */}
            {property.is_verified ? (
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                <Text className="text-xs font-semibold" style={{ color: 'rgb(76, 175, 80)' }}>
                  Verified
                </Text>
              </View>
            ) : (
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <Text className="text-xs font-semibold" style={{ color: 'rgb(251, 191, 36)' }}>
                  Pending
                </Text>
              </View>
            )}

            {/* Renter Count */}
            <View className="flex-row items-center">
              <Users size={16} color={isAtFullCapacity ? 'rgb(229, 77, 46)' : '#644A40'} />
              <Text
                className={`ml-1 text-sm font-medium ${isAtFullCapacity ? 'text-destructive' : 'text-primary'}`}>
                {currentRenters}/{property.max_renters}
              </Text>
              {isAtFullCapacity && (
                <Text className="ml-2 text-xs font-semibold text-destructive">(Full)</Text>
              )}
            </View>
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

      {/* Action Buttons Row - Below the main card */}
      <View className="flex-row gap-2 border-t border-input p-3">
        <SmallButton
          text={isUploading ? 'Uploading...' : 'Edit'}
          Icon={Edit}
          variant="primary"
          disabled={isUploading}
          onPress={onEdit}
          className="flex-1"
        />

        <SmallButton
          text={`Applications (${applicationsCount})`}
          Icon={FileText}
          variant="secondary"
          onPress={onViewApplications}
          className="flex-1"
        />

        <SmallButton
          text={`Reviews (${property.number_reviews || 0})`}
          Icon={Star}
          variant="secondary"
          onPress={onViewReviews}
          className="flex-1"
        />

        <SmallButton Icon={Trash2} variant="destructive" onPress={onDelete} disabled={isOccupied} />
      </View>
    </View>
  );
}
