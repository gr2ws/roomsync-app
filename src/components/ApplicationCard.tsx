import React, { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { ApplicationWithProperty } from '../types/property';
import { MapPin } from 'lucide-react-native';
import ImageSkeleton from './ImageSkeleton';
import Button from './Button';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';

interface ApplicationCardProps {
  application: ApplicationWithProperty;
  onCancel?: (applicationId: number) => Promise<void>;
  onReapply?: (propertyId: number) => Promise<void>;
  canReapply?: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onCancel,
  onReapply,
  canReapply = false,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = () => {
    switch (application.status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    return application.status.charAt(0).toUpperCase() + application.status.slice(1);
  };

  const handleCardPress = () => {
    navigation.navigate('PropertyDetails', { propertyId: application.property_id });
  };

  const handleCancel = async () => {
    if (!onCancel) return;

    setIsActionLoading(true);
    try {
      await onCancel(application.application_id);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel application. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReapply = async () => {
    if (!onReapply) return;

    setIsActionLoading(true);
    try {
      await onReapply(application.property_id);
    } catch (error) {
      // Error already handled in onReapply
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-xl border border-input bg-card shadow-sm"
      onPress={handleCardPress}>
      {/* Property Image */}
      <View className="relative h-48 w-full">
        {application.property.image_url && application.property.image_url.length > 0 && !imageError ? (
          <>
            {isImageLoading && (
              <View className="absolute inset-0">
                <ImageSkeleton width="100%" height={192} borderRadius={0} />
              </View>
            )}
            <Image
              source={{ uri: application.property.image_url[0] }}
              className="h-full w-full"
              resizeMode="cover"
              onLoadStart={() => setIsImageLoading(true)}
              onLoadEnd={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <View className="h-full w-full items-center justify-center bg-secondary">
            <Text className="text-muted-foreground">No Image</Text>
          </View>
        )}

        {/* Status Badge */}
        <View className="absolute right-3 top-3">
          <View className={`rounded-full px-3 py-1 ${getStatusColor()}`}>
            <Text className="text-xs font-semibold text-white">{getStatusText()}</Text>
          </View>
        </View>
      </View>

      {/* Property Details */}
      <View className="p-4">
        <Text className="mb-1 text-lg font-bold text-card-foreground" numberOfLines={1}>
          {application.property.title}
        </Text>

        <View className="mb-2 flex-row items-center">
          <MapPin size={14} color="#888" />
          <Text className="ml-1 text-sm text-muted-foreground" numberOfLines={1}>
            {application.property.street && `${application.property.street}, `}
            {application.property.barangay}, {application.property.city}
          </Text>
        </View>

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-primary">
            ₱{application.property.rent.toLocaleString()}/month
          </Text>
          <Text className="text-xs text-muted-foreground">
            Applied: {formatDate(application.date_applied)}
          </Text>
        </View>

        {/* Message */}
        {application.message && (
          <View className="mb-3 rounded-lg bg-secondary p-3">
            <Text className="text-xs font-semibold text-muted-foreground">Message:</Text>
            <Text className="mt-1 text-sm leading-5 text-foreground">{application.message}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {application.status === 'pending' && onCancel && (
          <Button
            variant="destructive"
            size="sm"
            onPress={handleCancel}
            disabled={isActionLoading}
            className="mt-2">
            {isActionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              'Cancel Application'
            )}
          </Button>
        )}

        {application.status === 'cancelled' && canReapply && onReapply && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleReapply}
            disabled={isActionLoading}
            className="mt-2">
            {isActionLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Reapply'}
          </Button>
        )}
      </View>
    </Pressable>
  );
};

export default ApplicationCard;
