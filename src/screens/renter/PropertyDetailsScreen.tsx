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
  Animated,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import {
  Star,
  MapPin,
  Check,
  Wifi,
  Dog,
  Armchair,
  Wind,
  ShieldCheck,
  Car,
  Bed,
  Bath,
  ArrowLeft,
  CheckCircle,
  Users,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { Property, PropertyOwner, Review, Application } from '../../types/property';
import {
  calculateDistanceFromStrings,
  formatDistance,
  parseCoordinates,
} from '../../utils/distance';
import Button from '../../components/Button';
import ReviewCard from '../../components/ReviewCard';
import ConfirmationModal from '../../components/ConfirmationModal';

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

const { width, height } = Dimensions.get('window');
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

export default function PropertyDetailsScreen({ navigation, route }: PropertyDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [currentRenters, setCurrentRenters] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Features' | 'Reviews' | 'Location'>(
    'Overview'
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const imageHeightAnim = useRef(new Animated.Value(280)).current;

  // Reviews pagination state
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isRefreshingReviews, setIsRefreshingReviews] = useState(false);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [currentReviewsPage, setCurrentReviewsPage] = useState(0);
  const REVIEWS_PER_PAGE = 5;

  // Application state
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);
  const [hasPendingApplicationToThisProperty, setHasPendingApplicationToThisProperty] =
    useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchProperty(),
        fetchReviews(false),
        loadUserPreferences(),
        fetchApplications(),
      ]);
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

      // Fetch current renters count
      const { count: rentersCount, error: rentersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rented_property', propertyId);

      if (!rentersError && rentersCount !== null) {
        setCurrentRenters(rentersCount);
      }

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

  const fetchReviews = async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setIsLoadingMoreReviews(true);
      } else {
        setIsLoadingReviews(true);
        setCurrentReviewsPage(0);
        setHasMoreReviews(true);
      }

      const page = loadMore ? currentReviewsPage + 1 : 0;
      const from = page * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          review_id,
          user_id,
          property_id,
          rating,
          comment,
          date_created,
          user:user_id (
            first_name,
            last_name,
            profile_picture
          )
        `
        )
        .eq('property_id', propertyId)
        .order('date_created', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const reviewsData = (data as any) || [];

      // Check if there are more items
      if (reviewsData.length < REVIEWS_PER_PAGE) {
        setHasMoreReviews(false);
      }

      if (loadMore) {
        setReviews((prev) => [...prev, ...reviewsData]);
        setCurrentReviewsPage(page);
      } else {
        setReviews(reviewsData);
        setCurrentReviewsPage(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
      setIsLoadingMoreReviews(false);
    }
  };

  const handleRefreshReviews = () => {
    setIsRefreshingReviews(true);
    fetchReviews(false).finally(() => {
      setIsRefreshingReviews(false);
    });
  };

  const handleLoadMoreReviews = () => {
    if (!isLoadingMoreReviews && hasMoreReviews && !isLoadingReviews) {
      fetchReviews(true);
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

  const fetchApplications = async () => {
    if (!userProfile?.user_id) return;

    try {
      console.log('[PropertyDetails] Fetching applications for renter_id:', userProfile.user_id);

      // Fetch all user's applications
      const { data: applications, error } = await supabase
        .from('applications')
        .select('application_id, property_id, status')
        .eq('renter_id', userProfile.user_id);

      if (error) throw error;

      console.log('[PropertyDetails] Applications fetched:', applications?.length || 0);

      if (applications) {
        // Count pending applications
        const pendingCount = applications.filter((app) => app.status === 'pending').length;
        setPendingApplicationsCount(pendingCount);
        console.log('[PropertyDetails] Pending applications count:', pendingCount);

        // Check for approved application
        const hasApproved = applications.some((app) => app.status === 'approved');
        setHasApprovedApplication(hasApproved);
        console.log('[PropertyDetails] Has approved application:', hasApproved);

        // Check for pending application to this property
        const hasPendingToThisProperty = applications.some(
          (app) => app.property_id === propertyId && app.status === 'pending'
        );
        setHasPendingApplicationToThisProperty(hasPendingToThisProperty);
        console.log(
          '[PropertyDetails] Has pending to property_id',
          propertyId,
          ':',
          hasPendingToThisProperty
        );
      }
    } catch (error) {
      console.error('[PropertyDetails] Error fetching applications:', error);
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
    // Show confirmation modal if user is allowed to apply
    if (
      !hasApprovedApplication &&
      !hasPendingApplicationToThisProperty &&
      pendingApplicationsCount < 5
    ) {
      setShowApplicationModal(true);
    }
  };

  const submitApplication = async () => {
    if (!userProfile?.user_id || !property?.owner_id) {
      Alert.alert('Error', 'Unable to submit application. Please try again.');
      return;
    }

    setIsSubmittingApplication(true);
    setShowApplicationModal(false);

    try {
      console.log('[PropertyDetails] Submitting application:', {
        property_id: propertyId,
        renter_id: userProfile.user_id,
        owner_id: property.owner_id,
      });

      const { error } = await supabase.from('applications').insert({
        property_id: propertyId,
        renter_id: userProfile.user_id,
        owner_id: property.owner_id,
        status: 'pending',
        message: null,
        date_applied: new Date().toISOString(),
        date_updated: null,
      });

      if (error) throw error;

      console.log('[PropertyDetails] Application submitted successfully');
      Alert.alert('Success', 'Your application has been submitted successfully!');

      // Refresh applications data
      await fetchApplications();
    } catch (error) {
      console.error('[PropertyDetails] Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setActiveImageIndex(index);
  };

  const handleImagePress = () => {
    const toValue = isImageExpanded ? 280 : height * 0.8;
    Animated.timing(imageHeightAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setIsImageExpanded(!isImageExpanded);
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'bedspace') return 'Bed Space';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderFeatureItem = (label: string, fieldKey: keyof Property, index: number) => {
    const hasFeature = property?.[fieldKey] === true;
    const level = getPreferenceLevel(label);
    const Icon = PREFERENCE_ICONS[label];
    const preferenceIndex = userPreferences.indexOf(label);

    // Calculate number of checks (top 3 preferences only, and property must have it)
    let numChecks = 0;
    if (hasFeature && preferenceIndex !== -1 && preferenceIndex < 3) {
      numChecks = 3 - preferenceIndex; // Top 1 = 3 checks, Top 2 = 2 checks, Top 3 = 1 check
    }

    return (
      <View
        key={label}
        style={
          !hasFeature
            ? {
                borderColor: '#d4d4d8',
                borderWidth: 1,
                borderStyle: 'dashed',
              }
            : undefined
        }
        className={`mb-3 flex-row items-center justify-between rounded-lg p-3 ${
          hasFeature
            ? level === 'must-have'
              ? 'border border-green-500 bg-green-50'
              : 'border border-primary bg-secondary'
            : 'bg-muted/20'
        }`}>
        <View className="flex-1 flex-row items-center">
          {Icon && (
            <Icon
              size={20}
              color={hasFeature ? (level === 'must-have' ? '#16a34a' : '#644A40') : '#d4d4d8'}
            />
          )}
          <Text
            style={!hasFeature ? { color: '#d4d4d8' } : undefined}
            className={`ml-2 text-sm font-medium ${
              hasFeature
                ? level === 'must-have'
                  ? 'text-green-700'
                  : 'text-secondary-foreground'
                : ''
            }`}>
            {label}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          {numChecks > 0 &&
            Array.from({ length: numChecks }).map((_, i) => (
              <Check key={i} size={16} color="#16a34a" strokeWidth={3} />
            ))}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case 'Overview':
        return (
          <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Property Details at top */}
              <View className="mb-4 mt-2">
                <Text className="mb-2 text-base font-semibold text-foreground">
                  Property Details
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Type</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {getCategoryLabel(property.category)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Max Renters</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {property.max_renters}
                    </Text>
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

              {/* Description at bottom */}
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
              </View>
            </ScrollView>
          </View>
        );

      case 'Features':
        // Order features: top 3 preferences (present) -> other present features -> non-present features
        const orderedFeatures = Object.entries(PREFERENCE_MAP).sort(
          ([labelA, fieldA], [labelB, fieldB]) => {
            const indexA = userPreferences.indexOf(labelA);
            const indexB = userPreferences.indexOf(labelB);
            const hasA = property?.[fieldA] === true;
            const hasB = property?.[fieldB] === true;

            // Group 1: Top 3 preferences that are present (sorted by preference order)
            const isTopThreeA = hasA && indexA !== -1 && indexA < 3;
            const isTopThreeB = hasB && indexB !== -1 && indexB < 3;

            if (isTopThreeA && isTopThreeB) {
              return indexA - indexB; // Sort by preference order (1, 2, 3)
            }
            if (isTopThreeA) return -1; // A is top 3, put it first
            if (isTopThreeB) return 1; // B is top 3, put it first

            // Group 2: Present features that are not in top 3
            if (hasA && hasB) {
              // Both present but not top 3, maintain arbitrary order
              return 0;
            }
            if (hasA) return -1; // A is present, B is not
            if (hasB) return 1; // B is present, A is not

            // Group 3: Non-present features (maintain arbitrary order)
            return 0;
          }
        );

        // If amenities is null or empty, provide a fallback
        const amenitiesList = property.amenities || [];

        const bedroomsBathrooms = amenitiesList.filter(
          (amenity) => amenity.includes('Bedroom') || amenity.includes('Bathroom')
        );

        const otherAmenities = amenitiesList.filter(
          (amenity) => !amenity.includes('Bedroom') && !amenity.includes('Bathroom')
        );

        // Extract bedroom and bathroom counts
        const bedroomCount =
          bedroomsBathrooms.find((a) => a.includes('Bedroom'))?.match(/\d+/)?.[0] || '?';
        const bathroomCount =
          bedroomsBathrooms.find((a) => a.includes('Bathroom'))?.match(/\d+/)?.[0] || '?';

        return (
          <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amenities Section */}
              <View className="mb-4 mt-2">
                <Text className="mb-3 text-base font-semibold text-foreground">Amenities</Text>
                <View className="flex-row gap-3">
                  {/* Bedrooms and Bathrooms stacked - outside the box */}
                  <View className="gap-2" style={{ height: 110 }}>
                    {/* Bedrooms */}
                    <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-primary/30 bg-secondary/20 px-3 py-2">
                      <Bed size={20} color="#644A40" />
                      <Text className="text-xl font-bold text-primary">{bedroomCount}</Text>
                      <Text className="text-xs text-muted-foreground">
                        Bedroom{bedroomCount !== '1' ? 's' : ''}
                      </Text>
                    </View>

                    {/* Bathrooms */}
                    <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-primary/30 bg-secondary/20 px-3 py-2">
                      <Bath size={20} color="#644A40" />
                      <Text className="text-xl font-bold text-primary">{bathroomCount}</Text>
                      <Text className="text-xs text-muted-foreground">
                        Bathroom{bathroomCount !== '1' ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Other Amenities as Bullet Points - in the box */}
                  <View
                    className="flex-1 rounded-lg border border-input bg-card p-2"
                    style={{ height: 110 }}>
                    {otherAmenities.length > 0 ? (
                      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {otherAmenities.map((amenity, index) => (
                          <View key={index} className="mb-0.5 flex-row items-start">
                            <Text className="mr-1.5 text-xs text-muted-foreground">•</Text>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              className="flex-1 text-xs text-muted-foreground">
                              {amenity}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={{ flex: 1 }} className="items-center justify-center">
                        <Text className="text-xs italic text-muted-foreground">
                          No additional amenities listed...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Property Features */}
              <Text className="mb-3 text-base font-semibold text-foreground">
                Property Features
              </Text>
              {orderedFeatures.map(([label, fieldKey], index) =>
                renderFeatureItem(label, fieldKey, index)
              )}
            </ScrollView>
          </View>
        );

      case 'Reviews':
        const renderReviewFooter = () => {
          if (isLoadingMoreReviews) {
            return (
              <View className="items-center">
                <ActivityIndicator color="#644A40" />
                <Text className="mt-2 text-sm text-muted-foreground">Loading more reviews...</Text>
              </View>
            );
          }

          if (hasMoreReviews && reviews.length > 0 && !isLoadingReviews) {
            return (
              <View className="items-center py-4">
                <Text className="text-sm text-muted-foreground">Pull up to load more</Text>
              </View>
            );
          }

          if (!hasMoreReviews && reviews.length > 0) {
            return (
              <View className="items-center pb-8 pt-2">
                <Text className="text-sm text-muted-foreground">You&apos;ve reached the end</Text>
              </View>
            );
          }

          return null;
        };

        const renderEmptyReviews = () => {
          if (isLoadingReviews) return null;
          return (
            <View className="items-center py-8">
              <Star size={48} color="#EFEFEF" />
              <Text className="mt-2 text-muted-foreground">No reviews yet</Text>
            </View>
          );
        };

        return (
          <View className="flex-1">
            <FlatList
              data={reviews}
              renderItem={({ item }) => <ReviewCard review={item} />}
              keyExtractor={(item) => item.review_id.toString()}
              ListHeaderComponent={
                <Text className="mb-3 mt-2 text-base font-semibold text-foreground">
                  Reviews ({reviews.length})
                </Text>
              }
              ListFooterComponent={renderReviewFooter}
              ListEmptyComponent={renderEmptyReviews}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshingReviews}
                  onRefresh={handleRefreshReviews}
                  colors={['#644A40']}
                  tintColor="#644A40"
                />
              }
              onEndReached={handleLoadMoreReviews}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      case 'Location':
        const distance = getDistanceToUser();
        const userCoords = parseCoordinates(userProfile?.place_of_work_study || null);
        const propertyCoords = parseCoordinates(property.coordinates);

        // Calculate midpoint and region to show both pins
        const getMapRegion = () => {
          if (!propertyCoords) return null;

          if (!userCoords) {
            // Only property pin
            return {
              latitude: propertyCoords.lat,
              longitude: propertyCoords.lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
          }

          // Calculate midpoint
          const midLat = (propertyCoords.lat + userCoords.lat) / 2;
          const midLon = (propertyCoords.lon + userCoords.lon) / 2;

          // Calculate distance between points and set appropriate zoom
          const latDiff = Math.abs(propertyCoords.lat - userCoords.lat);
          const lonDiff = Math.abs(propertyCoords.lon - userCoords.lon);

          // Add padding (multiply by 1.5 to ensure both pins are visible with margin)
          const latDelta = Math.max(latDiff * 1.5, 0.01);
          const lonDelta = Math.max(lonDiff * 1.5, 0.01);

          return {
            latitude: midLat,
            longitude: midLon,
            latitudeDelta: latDelta,
            longitudeDelta: lonDelta,
          };
        };

        const mapRegion = getMapRegion();

        return (
          <View className="flex-1">
            {/* Distance and Legend Row */}
            <View className="mb-2 mt-2 flex-row items-center justify-between gap-3">
              {/* Distance */}
              <View className="flex-1 rounded-lg border border-primary/20 bg-secondary/20 p-3">
                <Text className="text-xs font-medium text-secondary-foreground">Distance</Text>
                {distance !== null ? (
                  <Text className="mt-0.5 text-base font-bold text-primary">
                    {formatDistance(distance)}
                  </Text>
                ) : (
                  <Text className="mt-0.5 text-sm italic text-muted-foreground">
                    Location unset
                  </Text>
                )}
              </View>

              {/* Legend */}
              {propertyCoords && (
                <View className="flex-1 rounded-lg border border-input bg-card p-3">
                  <View className="mb-1.5 flex-row items-center">
                    <View className="mr-1.5 h-3 w-3 rounded-full bg-[#644A40]" />
                    <Text className="text-xs text-foreground">Property</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="mr-1.5 h-3 w-3 rounded-full"
                      style={{ backgroundColor: userCoords ? '#3b82f6' : '#d4d4d8' }}
                    />
                    <Text
                      className={`text-xs ${userCoords ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Work/Study
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Map View - fills remaining space */}
            <View className="mb-3 flex-1 overflow-hidden rounded-lg border border-input">
              {MapView && mapRegion && propertyCoords ? (
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={mapRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
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
                      strokeWidth={0.3}
                      lineDashPattern={[3, 3]}
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
                    <Text className="mt-1 text-xs text-muted-foreground">1 pin would be shown</Text>
                  )}
                </View>
              )}
            </View>
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
      {/* Tap outside overlay when expanded */}
      {isImageExpanded && (
        <Pressable
          onPress={handleImagePress}
          style={{
            position: 'absolute',
            top: height * 0.7,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
        />
      )}
      <View
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0, paddingBottom: 70 }}>
        {/* Image Carousel */}
        {property.image_url && property.image_url.length > 0 && (
          <View
            className="relative"
            style={{
              marginTop: Platform.OS === 'ios' ? -40 : 0,
              zIndex: isImageExpanded ? 10 : 1,
            }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {property.image_url.map((url, index) => (
                <Pressable key={index} onPress={handleImagePress}>
                  <Animated.Image
                    source={{ uri: url }}
                    style={{ width: IMAGE_WIDTH, height: imageHeightAnim }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="absolute left-4 z-20 rounded-full border border-primary bg-background p-2"
              style={{ top: Platform.OS === 'ios' ? insets.top + 8 : 16 }}>
              <ArrowLeft size={24} color="#222" />
            </TouchableOpacity>

            {/* Image Indicators */}
            {property.image_url.length > 1 && (
              <View
                className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2"
                style={{ zIndex: 20 }}>
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

        <View className="flex-1 px-6 pt-4">
          {/* Title */}
          <View className="mb-3">
            <Text className="text-2xl font-bold text-primary">{property.title}</Text>
          </View>

          {/* Location */}
          <View className="mb-3 flex-row items-start">
            <MapPin size={18} color="#644A40" className="mt-0.5" />
            <Text className="ml-2 flex-1 text-sm text-muted-foreground">
              {[property.street, property.barangay, property.city].filter(Boolean).join(', ')}
            </Text>
          </View>

          {/* Price, Reviews and Category Badge */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              {/* Price */}
              <View className="flex-row items-center">
                <Text
                  className={`text-2xl font-bold ${matchesPriceRange() ? 'text-green-600' : 'text-primary'}`}>
                  ₱{property.rent.toLocaleString()}
                </Text>
                <Text className="text-sm text-muted-foreground">/mo</Text>
              </View>

              {/* Reviews */}
              <View className="flex-row items-center">
                <Star size={20} color="rgb(250, 204, 21)" fill="rgb(250, 204, 21)" />
                <Text className="ml-1 text-lg font-semibold text-foreground">
                  {property.rating?.toFixed(1) || 'N/A'}
                </Text>
                <Text className="ml-2 text-sm text-muted-foreground">
                  {property.number_reviews === 0
                    ? '(No reviews)'
                    : property.number_reviews === 1
                      ? '(1 review)'
                      : `(${property.number_reviews} reviews)`}
                </Text>
              </View>
            </View>

            {/* Renters Count and Category Badge */}
            <View className="flex-row items-center gap-2">
              {/* Current/Max Renters */}
              <View className="flex-row items-center">
                <Users size={14} color="#644A40" />
                <Text className="ml-1 text-sm text-muted-foreground">
                  {currentRenters}/{property.max_renters}
                </Text>
              </View>

              {/* Category Badge */}
              <View className="rounded-full border border-primary/20 bg-secondary/30 px-3 py-1">
                <Text className="text-xs font-medium text-secondary-foreground">
                  {getCategoryLabel(property.category)}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-border">
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
      </View>

      {/* Fixed Action Buttons at Bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 py-2"
        style={{ paddingBottom: Platform.OS === 'ios' ? 19 : insets.bottom + 6 }}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="primary"
              onPress={handleFileApplication}
              disabled={
                isSubmittingApplication ||
                hasApprovedApplication ||
                hasPendingApplicationToThisProperty ||
                pendingApplicationsCount >= 5 ||
                userProfile?.is_banned ||
                !userProfile?.is_verified
              }>
              {isSubmittingApplication ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : userProfile?.is_banned ? (
                'Account Banned'
              ) : !userProfile?.is_verified ? (
                'Account Not Verified'
              ) : hasPendingApplicationToThisProperty ? (
                'Application Pending'
              ) : hasApprovedApplication ? (
                'Apply (Approved)'
              ) : pendingApplicationsCount >= 5 ? (
                'Apply (5/5)'
              ) : pendingApplicationsCount > 0 ? (
                `Apply (${pendingApplicationsCount}/5)`
              ) : (
                'Apply'
              )}
            </Button>
          </View>
          {owner?.phone_number && (
            <View className="flex-1">
              <Button variant="secondary" onPress={handleContactOwner}>
                Contact
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* Application Confirmation Modal */}
      <ConfirmationModal
        visible={showApplicationModal}
        title="Apply to this Property"
        message="Are you sure you want to apply to this property? You can have up to 5 pending applications at a time."
        confirmText="Apply"
        cancelText="Cancel"
        onConfirm={submitApplication}
        onCancel={() => setShowApplicationModal(false)}
      />
    </View>
  );
}
