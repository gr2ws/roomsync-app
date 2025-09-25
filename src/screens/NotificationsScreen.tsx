import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Bell, MessageCircle, Home, User, Calendar } from 'lucide-react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'message' | 'property' | 'booking' | 'profile';
  read: boolean;
}

export default function NotificationsScreen() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Message',
      message: 'John sent you a message about your property',
      time: '2 mins ago',
      type: 'message',
      read: false
    },
    {
      id: '2',
      title: 'Property Update',
      message: 'Your property listing has been approved',
      time: '1 hour ago',
      type: 'property',
      read: false
    },
    {
      id: '3',
      title: 'Booking Request',
      message: 'Sarah wants to schedule a viewing',
      time: '3 hours ago',
      type: 'booking',
      read: true
    },
    {
      id: '4',
      title: 'Profile Update',
      message: 'Please complete your profile information',
      time: '1 day ago',
      type: 'profile',
      read: true
    }
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={24} color="#3B82F6" />;
      case 'property':
        return <Home size={24} color="#10B981" />;
      case 'booking':
        return <Calendar size={24} color="#8B5CF6" />;
      case 'profile':
        return <User size={24} color="#F59E0B" />;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        item.read ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <View className="mr-4">
        {getIcon(item.type)}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
          <Text className="text-xs text-gray-500">{item.time}</Text>
        </View>
        <Text className="text-gray-600 mt-1" numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <Bell size={48} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            No notifications yet
          </Text>
          <Text className="text-center text-gray-600 mt-2">
            We will notify you when something arrives
          </Text>
        </View>
      )}
    </View>
  );
}