import { View, Text, Image } from 'react-native';
import { useState } from 'react';
import { Star, User, MapPin } from 'lucide-react-native';
import { Review } from '../types/property';
import ImageSkeleton from './ImageSkeleton';

interface ReviewCardProps {
  review: Review;
  showPropertyName?: boolean;
  propertyName?: string;
}

export default function ReviewCard({ review, showPropertyName, propertyName }: ReviewCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const starColor = 'rgb(250, 204, 21)'; // star color from tailwind config
    return (
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</Text>
        <View className="flex-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              color={starColor}
              fill={star <= rating ? starColor : 'transparent'}
              strokeWidth={2}
            />
          ))}
        </View>
      </View>
    );
  };

  const getUserInitials = () => {
    const firstName = review.user?.first_name || '';
    const lastName = review.user?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <View className="mb-3 rounded-lg border border-input bg-card p-3">
      {/* First line: Profile picture and name on left, stars on right */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* Profile Picture */}
          <View className="relative mr-2 h-8 w-8 overflow-hidden rounded-full">
            {review.user?.profile_picture && !imageError ? (
              <>
                {isImageLoading && (
                  <View className="absolute inset-0">
                    <ImageSkeleton width={32} height={32} borderRadius={16} />
                  </View>
                )}
                <Image
                  source={{ uri: review.user.profile_picture }}
                  className="h-8 w-8 rounded-full"
                  onLoadStart={() => setIsImageLoading(true)}
                  onLoadEnd={() => setIsImageLoading(false)}
                  onError={() => {
                    setIsImageLoading(false);
                    setImageError(true);
                  }}
                />
              </>
            ) : (
              <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
                {review.user?.first_name && review.user?.last_name ? (
                  <Text className="text-xs font-semibold text-primary">{getUserInitials()}</Text>
                ) : (
                  <User size={16} color="#644A40" />
                )}
              </View>
            )}
          </View>

          {/* User Name and Property Name */}
          <View>
            <Text className="text-sm font-semibold text-foreground">
              {review.user?.first_name || 'Unknown'} {review.user?.last_name || 'User'}
            </Text>
            {showPropertyName && propertyName && (
              <View className="flex-row items-center">
                <MapPin size={12} color="#888" />
                <Text className="ml-1 text-xs text-muted-foreground" numberOfLines={1}>
                  {propertyName}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating Stars on the right */}
        {renderStars(review.rating)}
      </View>

      {/* Review text */}
      {review.comment && (
        <Text className="mb-2 text-sm leading-6 text-muted-foreground">{review.comment}</Text>
      )}

      {/* Date */}
      <Text className="text-xs text-muted-foreground">{formatDate(review.date_created)}</Text>
    </View>
  );
}
