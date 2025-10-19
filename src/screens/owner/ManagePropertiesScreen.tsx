import { View, Text, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { usePropertyEdit } from '../../store/usePropertyEdit';
import { usePropertyUpload } from '../../store/usePropertyUpload';
import PropertyCard from '../../components/PropertyCard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Tab = createMaterialTopTabNavigator();

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

  const PropertyTabScreen = ({ property }: { property: PropertyWithRenters }) => (
    <KeyboardAwareScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#644A40']}
          tintColor="#644A40"
        />
      }
      showsVerticalScrollIndicator={false}>
      <PropertyCard
        property={property}
        currentRenters={property.currentRenters}
        isUploading={isUploading}
        onEdit={() => handleEdit(property)}
        onDelete={() => handleDelete(property.property_id, property.title)}
        onViewReviews={() => handleViewReviews(property.property_id)}
      />
    </KeyboardAwareScrollView>
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
            You haven't added any properties yet. Tap the "Add" tab to list your first property.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#644A40',
          tabBarInactiveTintColor: 'rgba(100, 74, 64, 0.5)',
          tabBarIndicatorStyle: {
            backgroundColor: '#644A40',
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: '#FAF4EB',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E8E8E8',
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarScrollEnabled: properties.length > 3,
          tabBarItemStyle: {
            width: properties.length > 3 ? 120 : undefined,
          },
        }}>
        {properties.map((property) => (
          <Tab.Screen
            key={property.property_id}
            name={`Property${property.property_id}`}
            options={{
              tabBarLabel: property.title.length > 15
                ? property.title.substring(0, 15) + '...'
                : property.title,
            }}>
            {() => <PropertyTabScreen property={property} />}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </View>
  );
}
