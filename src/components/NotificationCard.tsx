import { View, Text, TouchableOpacity } from 'react-native';
import {
  Notification,
  getNotificationDetails,
  formatNotificationTime,
} from '../types/notifications';
import { Trash2 } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notifId: number) => void;
}

/**
 * Get icon color based on notification type
 */
const getIconColor = (type: Notification['notif_type']) => {
  if (
    [
      'rental_application_accepted',
      'user_account_verified',
      'property_verified',
      'rental_application_completed',
    ].includes(type)
  ) {
    return '#10B981'; // green-500
  }

  if (['user_account_warned', 'rental_application_rejected'].includes(type)) {
    return '#E54D2E'; // destructive
  }

  if (
    [
      'new_rental_application',
      'new_review',
      'new_property_submission',
      'new_report',
      'new_registration',
    ].includes(type)
  ) {
    return '#3B82F6'; // blue-500
  }

  return '#6B7280'; // gray-500
};

/**
 * Get icon background color based on notification type
 */
const getIconBackgroundColor = (type: Notification['notif_type']) => {
  if (
    [
      'rental_application_accepted',
      'user_account_verified',
      'property_verified',
      'rental_application_completed',
    ].includes(type)
  ) {
    return 'bg-green-100';
  }

  if (['user_account_warned', 'rental_application_rejected'].includes(type)) {
    return 'bg-red-100';
  }

  if (
    [
      'new_rental_application',
      'new_review',
      'new_property_submission',
      'new_report',
      'new_registration',
    ].includes(type)
  ) {
    return 'bg-blue-100';
  }

  return 'bg-gray-100';
};

export default function NotificationCard({ notification, onDelete }: NotificationCardProps) {
  const details = getNotificationDetails(notification.notif_type);
  const iconColor = getIconColor(notification.notif_type);
  const iconBgColor = getIconBackgroundColor(notification.notif_type);
  const formattedTime = formatNotificationTime(notification.created_at);

  // Dynamically get the icon component from lucide-react-native
  const IconComponent = (Icons as any)[details.icon] || Icons.Bell;

  return (
    <View className="mb-3 flex-row items-center rounded-lg border border-border bg-card p-4">
      {/* Icon with colored background */}
      <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}>
        <IconComponent size={20} color={iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-base font-semibold text-foreground">{details.title}</Text>
          <Text className="ml-2 text-xs text-muted-foreground">{formattedTime}</Text>
        </View>
        <Text className="mt-1 text-sm text-muted-foreground">{details.message}</Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => onDelete(notification.notif_id)}
        className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-destructive/10"
        activeOpacity={0.7}>
        <Trash2 size={16} color="#E54D2E" />
      </TouchableOpacity>
    </View>
  );
}
