import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Home } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { usePropertyEdit } from '../../store/usePropertyEdit';
import { usePropertyUpload } from '../../store/usePropertyUpload';
import PropertyListItem from '../../components/PropertyListItem';

interface Property {
  property_id: number;
  owner_id: number;
  title: string;
  description: string | null;
  category: 'apartment' | 'room' | 'bedspace';
  street: string | null;
  barangay: string | null;
  city: string;
  coordinates: string | null;
  image_url: string[];
  rent: number;
  max_renters: number;
  has_internet: boolean | null;
  allows_pets: boolean | null;
  is_furnished: boolean | null;
  has_ac: boolean | null;
  is_secure: boolean | null;
  has_parking: boolean | null;
  is_available: boolean;
  is_verified: boolean;
  amenities: string[] | null;
  rating: number | null;
  number_reviews: number;
}

interface PropertyWithRenters extends Property {
  currentRenters: number;
  applicationsCount: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchProperties = async (searchTerm?: string) => {
    if (!userProfile?.user_id) {
      Alert.alert('Error', 'User profile not found. Please log in again.');
      return;
    }

    try {
      if (searchTerm !== undefined) {
        setIsSearching(true);
      }

      // Fetch properties for current owner
      let query = supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userProfile.user_id)
        .order('property_id', { ascending: false });

      // Apply search if provided
      if (searchTerm && searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,street.ilike.%${searchTerm}%,barangay.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
        );
      }

      const { data: propertiesData, error: propertiesError } = await query;

      if (propertiesError) throw propertiesError;

      if (!propertiesData || propertiesData.length === 0) {
        setProperties([]);
        return;
      }

      console.log('[ManagePropertiesScreen] Properties fetched:', propertiesData.length);

      // Fetch current renters count and applications count for each property
      const propertiesWithRenters = await Promise.all(
        propertiesData.map(async (property) => {
          // Count current renters
          const { count: rentersCount, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('rented_property', property.property_id);

          if (countError) {
            console.error('[ManagePropertiesScreen] Error counting renters for property_id', property.property_id, ':', countError);
          }

          // Count applications
          const { count: appsCount, error: appsError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.property_id);

          if (appsError) {
            console.error('[ManagePropertiesScreen] Error counting applications for property_id', property.property_id, ':', appsError);
          }

          console.log('[ManagePropertiesScreen] Property', property.property_id, ':', {
            currentRenters: rentersCount || 0,
            maxRenters: property.max_renters,
            applicationsCount: appsCount || 0,
          });

          return {
            ...property,
            currentRenters: rentersCount || 0,
            applicationsCount: appsCount || 0,
          };
        })
      );

      setProperties(propertiesWithRenters as PropertyWithRenters[]);
      console.log('[ManagePropertiesScreen] All properties loaded with counts');
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [userProfile?.user_id]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProperties(searchQuery || undefined);
  }, [userProfile?.user_id, searchQuery]);

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

  const handleViewReviews = useCallback(
    (propertyId: number) => {
      navigation.navigate('ViewReviews' as never, { propertyId } as never);
    },
    [navigation]
  );

  const handleViewApplications = useCallback(
    (propertyId: number) => {
      navigation.navigate('ApplicationsList' as never, { propertyId } as never);
    },
    [navigation]
  );

  const handleSearch = () => {
    setSearchQuery(searchInput);
    fetchProperties(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchProperties();
  };

  const renderProperty = ({ item }: { item: PropertyWithRenters }) => (
    <PropertyListItem
      property={item}
      currentRenters={item.currentRenters}
      applicationsCount={item.applicationsCount}
      isUploading={isUploading}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.property_id, item.title)}
      onViewReviews={() => handleViewReviews(item.property_id)}
      onViewApplications={() => handleViewApplications(item.property_id)}
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
      {/* Fixed Header Section */}
      <View
        className="border-b border-border bg-background px-4 pb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        {/* Header Text */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-primary">Manage Properties</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            View and manage all your property listings.
          </Text>
        </View>

        {/* Search Bar */}
        <View
          className={`flex-row items-center rounded-lg border border-input bg-card ${
            isSearching ? 'opacity-60' : 'opacity-100'
          }`}>
          <TextInput
            placeholder="Search properties..."
            placeholderTextColor="#646464"
            className="flex-1 px-4 py-3 text-foreground"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            returnKeyType="search"
            editable={!isSearching}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} className="px-2" disabled={isSearching}>
              <Ionicons name="close-circle" size={20} color="#646464" />
            </TouchableOpacity>
          )}
          <View className="h-full w-px bg-input" />
          <TouchableOpacity className="px-3 py-3" onPress={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <ActivityIndicator size="small" color="#644A40" />
            ) : (
              <Ionicons name="search" size={20} color="#644A40" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Properties List */}
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.property_id.toString()}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#644A40']}
            tintColor="#644A40"
            title="Refreshing..."
            titleColor="#646464"
          />
        }
      />
    </View>
  );
}
