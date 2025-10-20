import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  Star,
  MapPin,
  CheckCircle,
  Wifi,
  Dog,
  Armchair,
  Wind,
  ShieldCheck,
  Car,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { Property, PropertyOwner, Review } from '../../types/property';
import { calculateDistanceFromStrings, formatDistance, parseCoordinates } from '../../utils/distance';
import Button from '../../components/Button';

// Dynamic import for react-native-maps (only loads if native modules are available)
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) {
  console.warn('react-native-maps not available, using fallback');
}

type PropertyDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PropertyDetails'
>;
type PropertyDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

interface PropertyDetailsScreenProps {
  navigation: PropertyDetailsScreenNavigationProp;
  route: PropertyDetailsScreenRouteProp;
}

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width;

// Map preference labels to property boolean fields
const PREFERENCE_MAP: Record<string, keyof Property> = {
  'Internet Availability': 'has_internet',
  'Pet Friendly': 'allows_pets',
  Furnished: 'is_furnished',
  'Air Conditioned': 'has_ac',
  'Gated/With CCTV': 'is_secure',
  Parking: 'has_parking',
};

// Icons for each preference
const PREFERENCE_ICONS: Record<string, any> = {
  'Internet Availability': Wifi,
  'Pet Friendly': Dog,
  Furnished: Armchair,
  'Air Conditioned': Wind,
  'Gated/With CCTV': ShieldCheck,
  Parking: Car,
};

export default function PropertyDetailsScreen({
  navigation,
  route,
}: PropertyDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Features' | 'Reviews' | 'Location'>(
    'Overview'
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchProperty(), fetchReviews(), loadUserPreferences()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperty = async () => {
    try {
      // Fetch property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      setProperty(propertyData);

      // Fetch owner information
      if (propertyData?.owner_id) {
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('user_id, first_name, last_name, email, phone_number, profile_picture')
          .eq('user_id', propertyData.owner_id)
          .single();

        if (!ownerError && ownerData) {
          setOwner(ownerData);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      Alert.alert('Error', 'Failed to load property details');
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          review_id,
          user_id,
          property_id,
          rating,
          comment,
          upvotes,
          downvotes,
          date_created,
          user:user_id (
            first_name,
            last_name,
            profile_picture
          )
        `
        )
        .eq('property_id', propertyId)
        .order('date_created', { ascending: false });

      if (error) throw error;

      setReviews((data as any) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('room_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        setUserPreferences(preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const parsePriceRange = (priceRange: string | null): { min: number; max: number } | null => {
    if (!priceRange) return null;

    try {
      const parts = priceRange.split(/[-,]/).map((s) => parseInt(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: parts[0], max: parts[1] };
      }
    } catch (error) {
      console.error('Error parsing price range:', error);
    }

    return null;
  };

  const matchesPriceRange = (): boolean => {
    if (!property || !userProfile?.price_range) return false;
    const priceRange = parsePriceRange(userProfile.price_range);
    if (!priceRange) return false;
    return property.rent >= priceRange.min && property.rent <= priceRange.max;
  };

  const matchesRoomPreference = (): boolean => {
    if (!property || !userProfile?.room_preference) return false;
    return property.category === userProfile.room_preference;
  };

  const getPreferenceLevel = (preferenceName: string): 'must-have' | 'nice-to-have' | null => {
    const index = userPreferences.indexOf(preferenceName);
    if (index === -1) return null;
    if (index < 3) return 'must-have';
    return 'nice-to-have';
  };

  const getDistanceToUser = (): number | null => {
    if (!property?.coordinates || !userProfile?.place_of_work_study) return null;
    return calculateDistanceFromStrings(property.coordinates, userProfile.place_of_work_study);
  };

  const handleContactOwner = async () => {
    if (!owner?.phone_number) {
      Alert.alert('Error', 'Owner phone number not available');
      return;
    }

    try {
      const url = `sms:${owner.phone_number}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open messaging app');
      }
    } catch (error) {
      console.error('Error opening SMS:', error);
      Alert.alert('Error', 'Failed to open messaging app');
    }
  };

  const handleFileApplication = () => {
    Alert.alert('Coming Soon', 'Application filing feature will be implemented soon!');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setActiveImageIndex(index);
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'bedspace') return 'Bed Space';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderFeatureItem = (label: string, fieldKey: keyof Property) => {
    const hasFeature = property?.[fieldKey] === true;
    const level = getPreferenceLevel(label);
    const Icon = PREFERENCE_ICONS[label];

    // Only show features that the property has OR that user has prioritized
    if (!hasFeature && !level) {
      return null;
    }

    return (
      <View
        key={label}
        className={`mb-2 flex-row items-center justify-between rounded-lg border p-3 ${
          level === 'must-have'
            ? 'border-green-500 bg-green-50'
            : level === 'nice-to-have'
              ? 'border-primary/30 bg-secondary/20'
              : 'border-input bg-card'
        }`}>
        <View className="flex-1 flex-row items-center">
          {Icon && (
            <Icon
              size={20}
              color={
                level === 'must-have' ? '#16a34a' : level === 'nice-to-have' ? '#644A40' : '#646464'
              }
            />
          )}
          <Text
            className={`ml-2 text-sm font-medium ${
              level === 'must-have'
                ? 'text-green-700'
                : level === 'nice-to-have'
                  ? 'text-secondary-foreground'
                  : 'text-foreground'
            }`}>
            {label}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {level === 'must-have' && (
            <View className="rounded-md bg-green-600 px-2 py-0.5">
              <Text className="text-xs font-semibold text-white">Must-have</Text>
            </View>
          )}
          {level === 'nice-to-have' && (
            <View className="rounded-md bg-primary/20 px-2 py-0.5">
              <Text className="text-xs font-medium text-primary">Nice-to-have</Text>
            </View>
          )}
          {hasFeature && (
            <CheckCircle size={20} color={level === 'must-have' ? '#16a34a' : '#644A40'} />
          )}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case 'Overview':
        return (
          <View>
            <Text className="mb-2 text-base font-semibold text-foreground">Description</Text>
            {property.description ? (
              <Text className="mb-4 text-sm leading-6 text-muted-foreground">
                {property.description}
              </Text>
            ) : (
              <Text className="mb-4 text-sm italic text-muted-foreground">
                No description available
              </Text>
            )}

            <Text className="mb-2 text-base font-semibold text-foreground">Property Details</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Type</Text>
                <Text className="text-sm font-medium text-foreground">
                  {getCategoryLabel(property.category)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Max Renters</Text>
                <Text className="text-sm font-medium text-foreground">{property.max_renters}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Status</Text>
                <Text className="text-sm font-medium text-foreground">
                  {property.is_available ? 'Available' : 'Not Available'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Verification</Text>
                <Text className="text-sm font-medium text-green-600">
                  {property.is_verified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'Features':
        return (
          <View>
            <Text className="mb-3 text-base font-semibold text-foreground">Property Features</Text>
            {Object.entries(PREFERENCE_MAP).map(([label, fieldKey]) =>
              renderFeatureItem(label, fieldKey)
            )}
          </View>
        );

      case 'Reviews':
        return (
          <View>
            <Text className="mb-3 text-base font-semibold text-foreground">
              Reviews ({reviews.length})
            </Text>
            {reviews.length === 0 ? (
              <View className="items-center py-8">
                <Star size={48} color="#EFEFEF" />
                <Text className="mt-2 text-muted-foreground">No reviews yet</Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View
                  key={review.review_id}
                  className="mb-3 rounded-lg border border-input bg-card p-3">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="font-semibold text-foreground">
                      {review.user?.first_name} {review.user?.last_name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text className="ml-1 text-sm font-medium text-foreground">
                        {review.rating}/5
                      </Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text className="mb-2 text-sm text-muted-foreground">{review.comment}</Text>
                  )}
                  <Text className="text-xs text-muted-foreground">
                    {new Date(review.date_created).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'Location':
        const distance = getDistanceToUser();
        const userCoords = parseCoordinates(userProfile?.place_of_work_study || null);
        const propertyCoords = parseCoordinates(property.coordinates);

        return (
          <View>
            <Text className="mb-2 text-base font-semibold text-foreground">Location</Text>
            <View className="mb-3 flex-row items-start">
              <MapPin size={18} color="#644A40" className="mt-0.5" />
              <Text className="ml-2 flex-1 text-sm text-foreground">
                {[property.street, property.barangay, property.city].filter(Boolean).join(', ')}
              </Text>
            </View>

            {distance !== null && (
              <View className="mb-3 rounded-lg border border-primary/20 bg-secondary/20 p-3">
                <Text className="text-sm font-medium text-secondary-foreground">
                  Distance from your work/study location
                </Text>
                <Text className="mt-1 text-lg font-bold text-primary">
                  {formatDistance(distance)}
                </Text>
              </View>
            )}

            {/* Map View */}
            <View className="mb-3 h-64 overflow-hidden rounded-lg border border-input">
              {MapView && propertyCoords ? (
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: propertyCoords.lat,
                    longitude: propertyCoords.lon,
                    latitudeDelta: userCoords ? 0.02 : 0.01,
                    longitudeDelta: userCoords ? 0.02 : 0.01,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={false}
                  rotateEnabled={false}>
                  {/* Property Marker */}
                  {Marker && (
                    <Marker
                      coordinate={{ latitude: propertyCoords.lat, longitude: propertyCoords.lon }}
                      title={property.title}
                      description="Property Location"
                      pinColor="#644A40"
                    />
                  )}

                  {/* User's Work/Study Location Marker */}
                  {Marker && userCoords && (
                    <Marker
                      coordinate={{ latitude: userCoords.lat, longitude: userCoords.lon }}
                      title="Your Work/Study Location"
                      pinColor="#3b82f6"
                    />
                  )}

                  {/* Line connecting property and user location */}
                  {Polyline && userCoords && (
                    <Polyline
                      coordinates={[
                        { latitude: propertyCoords.lat, longitude: propertyCoords.lon },
                        { latitude: userCoords.lat, longitude: userCoords.lon },
                      ]}
                      strokeColor="#644A40"
                      strokeWidth={2}
                      lineDashPattern={[5, 5]}
                    />
                  )}
                </MapView>
              ) : (
                <View className="flex-1 items-center justify-center bg-muted p-6">
                  <MapPin size={48} color="#EFEFEF" />
                  <Text className="mt-2 text-sm text-muted-foreground">
                    {propertyCoords ? 'Map requires development build' : 'No location coordinates'}
                  </Text>
                  {userCoords && propertyCoords && (
                    <Text className="mt-1 text-xs text-muted-foreground">
                      2 pins would be shown
                    </Text>
                  )}
                  {!userCoords && propertyCoords && (
                    <Text className="mt-1 text-xs text-muted-foreground">
                      1 pin would be shown
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Map Legend */}
            {propertyCoords && (
              <View className="rounded-lg border border-input bg-card p-3">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-4 w-4 rounded-full bg-[#644A40]" />
                  <Text className="text-sm text-foreground">Property Location</Text>
                </View>
                {userCoords && (
                  <View className="flex-row items-center">
                    <View className="mr-2 h-4 w-4 rounded-full bg-[#3b82f6]" />
                    <Text className="text-sm text-foreground">Your Work/Study Location</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#644A40" />
        <Text className="mt-4 text-muted-foreground">Loading property details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Property not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => navigation.goBack()}>
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerClassName="pb-8">
        {/* Image Carousel */}
        {property.image_url && property.image_url.length > 0 && (
          <View className="relative" style={{ marginTop: Platform.OS === 'ios' ? -40 : 0 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {property.image_url.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={{ width: IMAGE_WIDTH, height: 280 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="absolute left-4 rounded-full bg-white/90 p-2"
              style={{ top: Platform.OS === 'ios' ? insets.top + 8 : 16 }}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>

            {/* Image Indicators */}
            {property.image_url.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {property.image_url.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View className="px-6 pt-4">
          {/* Title and Category */}
          <View className="mb-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="flex-1 text-2xl font-bold text-foreground">{property.title}</Text>
              {matchesRoomPreference() && (
                <View className="ml-2 rounded-md bg-green-100 px-2 py-1">
                  <Text className="text-xs font-semibold text-green-700">Matches preference</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center">
              <View className="rounded-md border border-primary/20 bg-secondary/30 px-2 py-1">
                <Text className="text-sm font-medium text-secondary-foreground">
                  {getCategoryLabel(property.category)}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="mb-3 flex-row items-start">
            <MapPin size={18} color="#644A40" className="mt-0.5" />
            <Text className="ml-2 flex-1 text-sm text-muted-foreground">
              {[property.street, property.barangay, property.city].filter(Boolean).join(', ')}
            </Text>
          </View>

          {/* Price */}
          <View className="mb-4 flex-row items-center">
            <Text className="text-3xl font-bold text-primary">
              ₱{property.rent.toLocaleString()}
            </Text>
            <Text className="ml-1 text-base text-muted-foreground">/month</Text>
            {matchesPriceRange() && (
              <View className="ml-2 flex-row items-center rounded-md bg-green-100 px-2 py-1">
                <CheckCircle size={14} color="#16a34a" />
                <Text className="ml-1 text-xs font-semibold text-green-700">Within budget</Text>
              </View>
            )}
          </View>

          {/* Rating and Availability */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text className="ml-1 text-lg font-semibold text-foreground">
                {property.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text className="ml-2 text-sm text-muted-foreground">
                ({property.number_reviews || 0} reviews)
              </Text>
            </View>

            <View
              className={`rounded-full border px-3 py-1 ${
                property.is_available ? 'border-green-500 bg-green-50' : 'border-border bg-muted'
              }`}>
              <Text
                className={`text-xs font-medium ${
                  property.is_available ? 'text-green-700' : 'text-muted-foreground'
                }`}>
                {property.is_available ? 'Available' : 'Not Available'}
              </Text>
            </View>
          </View>

          {/* Action Buttons - Contact & Apply */}
          <View className="mb-4 gap-3">
            <Button variant="primary" onPress={handleFileApplication}>
              File an Application to Rent
            </Button>
            {owner?.phone_number && (
              <Button variant="secondary" onPress={handleContactOwner}>
                Contact Owner
              </Button>
            )}
          </View>

          {/* Tabs */}
          <View className="mb-4 flex-row border-b border-border">
            {(['Overview', 'Features', 'Reviews', 'Location'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 items-center pb-2 ${
                  activeTab === tab ? 'border-b-2 border-primary' : ''
                }`}
                onPress={() => setActiveTab(tab)}>
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === tab ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
