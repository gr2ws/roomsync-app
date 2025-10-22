import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { ApplicationWithProperty } from '../types/property';
import { MapPin } from 'lucide-react-native';
import Button from './Button';
import SmallButton from './SmallButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';

interface ApplicationCardProps {
  application: ApplicationWithProperty;
  onCancel?: (applicationId: number) => Promise<void>;
  onReapply?: (propertyId: number) => Promise<void>;
  onContactOwner?: (ownerId: number) => void;
  canReapply?: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onCancel,
  onReapply,
  onContactOwner,
  canReapply = false,
}) => {
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

  const getStatusColors = () => {
    switch (application.status) {
      case 'pending':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          textColor: 'rgb(120, 90, 20)',
        };
      case 'approved':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          textColor: 'rgb(76, 175, 80)',
        };
      case 'rejected':
        return {
          backgroundColor: 'rgba(229, 77, 46, 0.1)',
          textColor: 'rgb(229, 77, 46)',
        };
      case 'cancelled':
        return {
          backgroundColor: 'rgb(239, 239, 239)',
          textColor: 'rgb(100, 100, 100)',
        };
      case 'completed':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          textColor: 'rgb(59, 130, 246)',
        };
      default:
        return {
          backgroundColor: 'rgb(239, 239, 239)',
          textColor: 'rgb(100, 100, 100)',
        };
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
      className="mb-3 overflow-hidden rounded-lg border border-input bg-card p-4 shadow-sm"
      onPress={handleCardPress}>
      {/* Header with Title and Status */}
      <View className="mb-2 flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-lg font-bold text-card-foreground" numberOfLines={2}>
          {application.property.title}
        </Text>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: getStatusColors().backgroundColor, flexShrink: 0 }}>
          <Text className="text-xs font-semibold" style={{ color: getStatusColors().textColor }}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View className="mb-2 flex-row items-center">
        <MapPin size={14} color="#888" />
        <Text className="ml-1 flex-1 text-sm text-muted-foreground" numberOfLines={1}>
          {application.property.street && `${application.property.street}, `}
          {application.property.barangay}, {application.property.city}
        </Text>
      </View>

      {/* Rent and Date */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-primary">
          ₱{application.property.rent.toLocaleString()}/mo
        </Text>
        <Text className="text-xs text-muted-foreground">
          Applied {formatDate(application.date_applied)}
        </Text>
      </View>

      {/* Message */}
      {application.message && (
        <View className="mb-3 rounded-lg bg-secondary p-2.5">
          <Text className="text-xs font-semibold text-muted-foreground">Message:</Text>
          <Text className="mt-1 text-sm leading-5 text-foreground" numberOfLines={2}>
            {application.message}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {application.status === 'pending' && (
        <View className="mt-2 flex-row gap-2">
          {onCancel && (
            <View className="flex-1">
              <SmallButton variant="destructive" onPress={handleCancel} disabled={isActionLoading}>
                {isActionLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Cancel'}
              </SmallButton>
            </View>
          )}
          {onContactOwner && (
            <View className="flex-1">
              <SmallButton variant="secondary" onPress={() => onContactOwner(application.owner_id)}>
                Contact Owner
              </SmallButton>
            </View>
          )}
        </View>
      )}

      {application.status === 'cancelled' && canReapply && onReapply && (
        <View className="mt-2 flex-row justify-end">
          <View style={{ width: '25%' }}>
            <SmallButton variant="primary" onPress={handleReapply} disabled={isActionLoading}>
              {isActionLoading ? 'Reapplying...' : 'Reapply'}
            </SmallButton>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default ApplicationCard;
