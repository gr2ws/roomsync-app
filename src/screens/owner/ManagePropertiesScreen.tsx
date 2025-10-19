import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Home, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { usePropertyEdit } from '../../store/usePropertyEdit';
import { usePropertyUpload } from '../../store/usePropertyUpload';
import PropertyListItem from '../../components/PropertyListItem';

interface Property {
  property_id: number;
  title: string;
  description: string | null;
  category: 'apartment' | 'room' | 'bedspace';
  street: string | null;
  barangay: string | null;
  city: string;
  coordinates: string;
  image_url: string[];
  rent: number;
  max_renters: number;
  has_internet: boolean;
  allows_pets: boolean;
  is_furnished: boolean;
  has_ac: boolean;
  is_secure: boolean;
  has_parking: boolean;
  is_available: boolean;
  is_verified: boolean;
  amenities: string[];
}

interface PropertyWithRenters extends Property {
  currentRenters: number;
}

export default function ManagePropertiesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userProfile } = useLoggedIn();
  const { startEdit } = usePropertyEdit();
  const { isUploading } = usePropertyUpload();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [properties, setProperties] = useState<PropertyWithRenters[]>([]);

  const fetchProperties = async () => {
    if (!userProfile?.user_id) {
      Alert.alert('Error', 'User profile not found. Please log in again.');
      return;
    }

    try {
      // Fetch properties for current owner
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userProfile.user_id)
        .order('property_id', { ascending: false });

      if (propertiesError) throw propertiesError;

      if (!propertiesData || propertiesData.length === 0) {
        setProperties([]);
        return;
      }

      // Fetch current renters count for each property
      const propertiesWithRenters = await Promise.all(
        propertiesData.map(async (property) => {
          const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('rented_property', property.property_id);

          if (countError) {
            console.error('Error counting renters:', countError);
            return { ...property, currentRenters: 0 };
          }

          return { ...property, currentRenters: count || 0 };
        })
      );

      setProperties(propertiesWithRenters as PropertyWithRenters[]);
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [userProfile?.user_id]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProperties();
  }, [userProfile?.user_id]);

  const handleEdit = useCallback(
    (property: PropertyWithRenters) => {
      if (isUploading) {
        Alert.alert(
          'Upload in Progress',
          'Please wait for the current property upload/update to finish before editing another property.'
        );
        return;
      }
      startEdit(property.property_id, property);
      navigation.navigate('AddProperty' as never);
    },
    [navigation, startEdit, isUploading]
  );

  const handleDelete = useCallback(
    (propertyId: number, propertyTitle: string) => {
      Alert.alert(
        'Delete Property',
        `Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                const { error } = await supabase
                  .from('properties')
                  .delete()
                  .eq('property_id', propertyId);

                if (error) throw error;

                Alert.alert('Success', 'Property deleted successfully.');
                await fetchProperties();
              } catch (error) {
                console.error('Error deleting property:', error);
                Alert.alert('Error', 'Failed to delete property. Please try again.');
                setIsLoading(false);
              }
            },
          },
        ]
      );
    },
    [fetchProperties]
  );

  const handleViewReviews = useCallback((propertyId: number) => {
    Alert.alert(
      'Reviews',
      'To be implemented: Navigate to Reviews screen with automatic filtering by property_id ' +
        propertyId
    );
  }, []);

  const renderProperty = ({ item }: { item: PropertyWithRenters }) => (
    <PropertyListItem
      property={item}
      currentRenters={item.currentRenters}
      isUploading={isUploading}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.property_id, item.title)}
      onViewReviews={() => handleViewReviews(item.property_id)}
    />
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#644A40" />
        <Text className="mt-4 text-base text-muted-foreground">Loading properties...</Text>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Home size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-muted-foreground">
            No Properties Listed
          </Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            You haven&apos;t added any properties yet. Tap the &quot;Add&quot; tab to list your
            first property.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.property_id.toString()}
        ListHeaderComponent={
          <View className="mb-6 px-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-primary">Manage Properties</Text>
                <Text className="mt-2 text-base text-muted-foreground">
                  View and manage all your property listings.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRefresh}
                disabled={isRefreshing}
                className="ml-4">
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#644A40" />
                ) : (
                  <RefreshCw size={24} color="#644A40" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? 50 : 8,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressViewOffset={-1000}
            progressBackgroundColor="transparent"
            style={{ backgroundColor: 'transparent' }}
          />
        }
      />
    </View>
  );
}
