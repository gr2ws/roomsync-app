import { View, Text } from 'react-native';
import { CheckCircle, AlertCircle, Users, Clock } from 'lucide-react-native';

interface PropertyStatusBadgeProps {
  isAvailable: boolean;
  isVerified: boolean;
  currentRenters: number;
  maxRenters: number;
}

export default function PropertyStatusBadge({
  isAvailable,
  isVerified,
  currentRenters,
  maxRenters,
}: PropertyStatusBadgeProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {/* Availability Badge */}
      <View
        className={`flex-row items-center rounded-full px-3 py-1.5 ${
          isAvailable ? 'bg-green-100' : 'bg-red-100'
        }`}>
        <CheckCircle size={14} color={isAvailable ? '#16a34a' : '#dc2626'} />
        <Text
          className={`ml-1 text-xs font-semibold ${
            isAvailable ? 'text-green-700' : 'text-red-700'
          }`}>
          {isAvailable ? 'Available' : 'Full'}
        </Text>
      </View>

      {/* Verification Badge */}
      <View
        className={`flex-row items-center rounded-full px-3 py-1.5 ${
          isVerified ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
        {isVerified ? (
          <CheckCircle size={14} color="#16a34a" />
        ) : (
          <Clock size={14} color="#ca8a04" />
        )}
        <Text
          className={`ml-1 text-xs font-semibold ${
            isVerified ? 'text-green-700' : 'text-yellow-700'
          }`}>
          {isVerified ? 'Verified' : 'Pending'}
        </Text>
      </View>

      {/* Occupancy Indicator */}
      <View className="flex-row items-center rounded-full bg-blue-100 px-3 py-1.5">
        <Users size={14} color="#2563eb" />
        <Text className="ml-1 text-xs font-semibold text-blue-700">
          {currentRenters}/{maxRenters} Renters
        </Text>
      </View>
    </View>
  );
}
