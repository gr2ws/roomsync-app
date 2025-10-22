import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Bell } from 'lucide-react-native';
import { useLoggedIn } from '../store/useLoggedIn';
import { useNotificationCount } from '../store/useNotificationCount';
import { supabase } from '../utils/supabase';
import { Notification } from '../types/notifications';
import NotificationCard from '../components/NotificationCard';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();
  const { hideBadge, showBadgeWithCount } = useNotificationCount();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hide badge when user navigates to or from this screen
  useFocusEffect(
    useCallback(() => {
      console.log('[NotificationsScreen] Screen focused, hiding badge');
      hideBadge();

      // Also hide when navigating away
      return () => {
        console.log('[NotificationsScreen] Screen unfocused, hiding badge');
        hideBadge();
      };
    }, [hideBadge])
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!userProfile?.auth_id) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      console.log('[NotificationsScreen] Fetching notifications for user_auth_id:', userProfile.auth_id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_auth_id', userProfile.auth_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[NotificationsScreen] Notifications fetched:', data?.length || 0);

      setNotifications(data || []);
      // Don't update badge count on initial fetch
    } catch (error) {
      console.error('[NotificationsScreen] Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    if (!userProfile?.auth_id) {
      setIsRefreshing(false);
      return;
    }

    try {
      console.log('[NotificationsScreen] Refreshing notifications for user_auth_id:', userProfile.auth_id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_auth_id', userProfile.auth_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[NotificationsScreen] Notifications refreshed:', data?.length || 0);

      setNotifications(data || []);

      // Show badge with count after refresh
      showBadgeWithCount(data?.length || 0);
    } catch (error) {
      console.error('[NotificationsScreen] Error refreshing notifications:', error);
      Alert.alert('Error', 'Failed to refresh notifications. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteNotification = async (notifId: number) => {
    try {
      console.log('[NotificationsScreen] Deleting notification_id:', notifId);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('notif_id', notifId);

      if (error) throw error;

      console.log('[NotificationsScreen] Notification deleted successfully');

      // Update local state
      setNotifications((prev) => prev.filter((notif) => notif.notif_id !== notifId));
    } catch (error) {
      console.error('[NotificationsScreen] Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification. Please try again.');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard notification={item} onDelete={handleDeleteNotification} />
  );

  const renderEmpty = () => {
    if (isLoading || isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
          <ActivityIndicator size="large" color="#644A40" />
          <Text className="mt-4 text-muted-foreground">Loading notifications...</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Bell size={48} color="#9CA3AF" />
        <Text className="mt-4 text-lg font-semibold text-foreground">No Notifications Yet</Text>
        <Text className="mt-2 text-center text-base text-muted-foreground">
          We'll notify you when something important happens
        </Text>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      {/* Fixed Header Section */}
      <View
        className="border-b border-border bg-background px-4 pb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        <Text className="text-3xl font-bold text-primary">Notifications</Text>
        <Text className="mt-2.5 text-muted-foreground">
          Stay updated with important alerts about your applications and properties
        </Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.notif_id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#644A40']}
            tintColor="#644A40"
          />
        }
      />
    </View>
  );
}
