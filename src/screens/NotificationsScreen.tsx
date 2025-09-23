import { View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useCallback, useState } from 'react';
import { MessageSquare, Home, CheckCircle2, Trash2 } from 'lucide-react-native';

type NotificationType = 'message' | 'property_listing' | 'application_status';

interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  timestamp: string;
  read: boolean;
}

interface MessageNotification extends BaseNotification {
  type: 'message';
  senderId: string;
  senderName: string;
  message: string;
}

interface PropertyListingNotification extends BaseNotification {
  type: 'property_listing';
  propertyId: string;
  propertyName: string;
  description: string;
}

interface ApplicationStatusNotification extends BaseNotification {
  type: 'application_status';
  propertyId: string;
  propertyName: string;
  status: 'approved' | 'rejected' | 'pending';
}

type Notification = MessageNotification | PropertyListingNotification | ApplicationStatusNotification;

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      timestamp: '2025-09-21T10:00:00Z',
      read: false,
      senderId: 'user1',
      senderName: 'John Doe',
      message: 'Hi, I\'m interested in your property listing.'
    },
    {
      id: '2',
      type: 'property_listing',
      title: 'New Property Available',
      timestamp: '2025-09-21T09:30:00Z',
      read: true,
      propertyId: 'prop1',
      propertyName: 'Sunny Apartment',
      description: 'A beautiful 2-bedroom apartment is now available.'
    },
    {
      id: '3',
      type: 'application_status',
      title: 'Application Update',
      timestamp: '2025-09-21T08:45:00Z',
      read: false,
      propertyId: 'prop2',
      propertyName: 'Mountain View House',
      status: 'approved'
    }
  ]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotifications(prev => prev.filter(n => n.id !== id))
        }
      ]
    );
  }, []);

  const handleReply = useCallback((notification: MessageNotification) => {
    Alert.alert('Reply', `Replying to ${notification.senderName}`);
  }, []);

  const handleViewProperty = useCallback((notification: PropertyListingNotification | ApplicationStatusNotification) => {
    Alert.alert('View Property', `Viewing property: ${notification.propertyName}`);
  }, []);

  const NotificationIcon = ({ type, read }: { type: NotificationType; read: boolean }) => {
    const iconColor = read ? '#3b82f6' : '#2563eb';
    const iconSize = 24;

    const icons = {
      message: <MessageSquare size={iconSize} color={iconColor} />,
      property_listing: <Home size={iconSize} color={iconColor} />,
      application_status: <CheckCircle2 size={iconSize} color={iconColor} />
    };

    return (
      <View className={`mr-4 p-2 rounded-full ${read ? 'bg-blue-50' : 'bg-blue-100'}`}>
        {icons[type]}
      </View>
    );
  };

  const MessageContent = ({ notification }: { notification: MessageNotification }) => (
    <>
      <View className="flex-row items-center mb-3">
        <Image 
          source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.senderName)}&background=random&bold=true` }}
          className="w-8 h-8 rounded-full mr-3 border-2 border-white shadow-sm"
        />
        <View>
          <Text className="text-gray-900 font-semibold">{notification.senderName}</Text>
          <Text className="text-xs text-gray-500">Sender</Text>
        </View>
      </View>
      <Text className="text-gray-700 mb-4 leading-relaxed">{notification.message}</Text>
      <TouchableOpacity
        onPress={() => handleReply(notification)}
        className="bg-blue-500 py-2.5 px-5 rounded-full self-start shadow-sm active:bg-blue-600 flex-row items-center space-x-2"
      >
        <MessageSquare size={16} color="white" />
        <Text className="text-white font-semibold">Reply</Text>
      </TouchableOpacity>
    </>
  );

  const PropertyContent = ({ notification }: { notification: PropertyListingNotification }) => (
    <>
      <Text className="text-gray-700 mb-4 leading-relaxed">{notification.description}</Text>
      <View className="rounded-xl overflow-hidden mb-4 shadow-md">
        <Image 
          source={require('../assets/room1.jpg')}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      </View>
      <TouchableOpacity
        onPress={() => handleViewProperty(notification)}
        className="bg-blue-500 py-2.5 px-5 rounded-full self-start shadow-sm active:bg-blue-600 flex-row items-center space-x-2"
      >
        <Home size={16} color="white" />
        <Text className="text-white font-semibold">View Property</Text>
      </TouchableOpacity>
    </>
  );

  const ApplicationContent = ({ notification }: { notification: ApplicationStatusNotification }) => {
    const statusColors = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
    };

    const colors = statusColors[notification.status];

    return (
      <>
        <View className="bg-gray-50 rounded-lg p-3 mb-4">
          <Text className="text-gray-900 font-medium mb-1">Property</Text>
          <Text className="text-gray-700 font-semibold text-lg mb-2">{notification.propertyName}</Text>
          <View className={`flex-row items-center mb-3 px-3 py-2 rounded-lg ${colors.bg}`}>
            <View className={`w-2 h-2 rounded-full mr-2 ${colors.dot}`} />
            <Text className={`font-medium ${colors.text}`}>
              {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
            </Text>
          </View>
        </View>
        <View className="rounded-xl overflow-hidden mb-4 shadow-md">
          <Image 
            source={require('../assets/room2.jpg')}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        </View>
        <TouchableOpacity
          onPress={() => handleViewProperty(notification)}
          className="bg-blue-500 py-2.5 px-5 rounded-full self-start shadow-sm active:bg-blue-600 flex-row items-center space-x-2"
        >
          <Home size={16} color="white" />
          <Text className="text-white font-semibold">View Property</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderNotification = useCallback(({ item: notification }: { item: Notification }) => {
    const bgColor = notification.read ? 'bg-white' : 'bg-blue-50';

    return (
      <View className={`${bgColor} p-5 mb-4 rounded-xl border border-gray-100 shadow-sm`}>
        <View className="flex-row items-start">
          <NotificationIcon type={notification.type} read={notification.read} />
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">{notification.title}</Text>
              <TouchableOpacity 
                onPress={() => handleDelete(notification.id)}
                className="p-2 rounded-full bg-gray-50 active:bg-gray-100"
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500 mb-2">
              {new Date(notification.timestamp).toLocaleString()}
            </Text>

            {notification.type === 'message' && <MessageContent notification={notification} />}
            {notification.type === 'property_listing' && <PropertyContent notification={notification} />}
            {notification.type === 'application_status' && <ApplicationContent notification={notification} />}
          </View>
        </View>
      </View>
    );
  }, [handleReply, handleViewProperty, handleDelete]);

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
        <View className="bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-medium text-sm">
            {notifications.filter(n => !n.read).length} New
          </Text>
        </View>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      />
    </View>
  );
}