import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { RootStackParamList } from '../../utils/navigation';
import { Property, PropertyWithDistance, PropertyCategory } from '../../types/property';
import {
  calculateDistanceFromStrings,
  formatDistance,
  extractCityFromLocation,
} from '../../utils/distance';
import PropertyCardSkeleton from '../../components/PropertyCardSkeleton';

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const { userProfile } = useLoggedIn();
  const [selectedCategory, setSelectedCategory] = useState<'All' | PropertyCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [properties, setProperties] = useState<PropertyWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Re-sort and filter when category changes
    filterAndSortProperties();
  }, [selectedCategory, searchQuery]);

  const parsePriceRange = (priceRange: string | null): { min: number; max: number } | null => {
    if (!priceRange) return null;

    try {
      // Handle formats like "2000-5000" or "2000,5000"
      const parts = priceRange.split(/[-,]/).map((s) => parseInt(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: parts[0], max: parts[1] };
      }
    } catch (error) {
      console.error('Error parsing price range:', error);
    }

    return null;
  };

  const fetchProperties = async (searchTerm?: string, loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(searchTerm ? false : true);
        if (searchTerm !== undefined) setIsSearching(true);
        setCurrentPage(0);
        setHasMore(true);
      }

      const page = loadMore ? currentPage + 1 : 0;
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Build query with pagination
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)
        .eq('is_verified', true)
        .range(from, to);

      // Apply search if provided
      if (searchTerm && searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,street.ilike.%${searchTerm}%,barangay.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data) {
        if (!loadMore) setProperties([]);
        setHasMore(false);
        return;
      }

      // Check if there are more items
      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      // Get user preferences
      const priceRange = parsePriceRange(userProfile?.price_range);
      const userLocation = userProfile?.place_of_work_study;

      // Calculate distance and price match for each property
      const propertiesWithMetadata: PropertyWithDistance[] = data.map((property) => {
        const distance = calculateDistanceFromStrings(userLocation, property.coordinates);
        const matchesPriceRange = priceRange
          ? property.rent >= priceRange.min && property.rent <= priceRange.max
          : false;

        return {
          ...property,
          distance,
          matchesPriceRange,
        };
      });

      // Sort: price match first, then distance, then reviews
      const sorted = propertiesWithMetadata.sort((a, b) => {
        // First priority: matches price range
        if (a.matchesPriceRange !== b.matchesPriceRange) {
          return a.matchesPriceRange ? -1 : 1;
        }

        // Second priority: distance (ascending)
        if (a.distance !== null && b.distance !== null) {
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
        } else if (a.distance !== null) {
          return -1;
        } else if (b.distance !== null) {
          return 1;
        }

        // Third priority: number of reviews (descending)
        return (b.number_reviews || 0) - (a.number_reviews || 0);
      });

      if (loadMore) {
        setProperties((prev) => [...prev, ...sorted]);
        setCurrentPage(page);
      } else {
        setProperties(sorted);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  const filterAndSortProperties = () => {
    // Frontend filtering is already done by re-rendering based on selectedCategory
    // No need to re-fetch from database
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    setSearchQuery(searchInput);
    fetchProperties(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchProperties();
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchProperties(searchQuery || undefined, true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    fetchProperties(searchQuery || undefined, false).finally(() => {
      setIsRefreshing(false);
    });
  };

  const getCategoryLabel = (category: PropertyCategory) => {
    if (category === 'bedspace') return 'Bedspace';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filteredProperties = properties.filter((property) => {
    // Apply category filter
    const matchesCategory = selectedCategory === 'All' || property.category === selectedCategory;
    return matchesCategory;
  });

  const userCity = extractCityFromLocation(userProfile?.place_of_work_study);

  // Remove this - we'll use only RefreshControl's built-in spinner

  const renderPropertyCard = ({ item: property }: { item: PropertyWithDistance }) => {
    const isImageLoading = imageLoadingStates[property.property_id] ?? true;

    return (
      <TouchableOpacity
        className="my-1 h-40 flex-row border border-input bg-card shadow-sm"
        style={{ borderRadius: 12, overflow: 'hidden' }}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.property_id })}>
        {/* Image (35%) */}
        {property.image_url && property.image_url.length > 0 ? (
          <View className="w-[35%]" style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
            {isImageLoading && (
              <View
                className="absolute inset-0 items-center justify-center bg-muted"
                style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
                <ActivityIndicator size="small" color="#644A40" />
              </View>
            )}
            <Image
              source={{ uri: property.image_url[0] }}
              className="h-full w-full"
              style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoadingStates((prev) => ({ ...prev, [property.property_id]: true }));
              }}
              onLoadEnd={() => {
                setImageLoadingStates((prev) => ({ ...prev, [property.property_id]: false }));
              }}
            />
          </View>
        ) : (
          <View
            className="w-[35%] items-center justify-center bg-muted"
            style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
            <Ionicons name="image-outline" size={28} color="#EFEFEF" />
          </View>
        )}

        {/* Details (65%) */}
        <View className="flex-1 justify-between p-2.5">
          {/* Title and Location */}
          <View className="mb-1">
            <Text numberOfLines={1} className="text-base font-bold text-primary">
              {property.title}
            </Text>
            <Text numberOfLines={1} className="text-sm text-muted-foreground">
              {[property.barangay, property.city].filter(Boolean).join(', ')}
            </Text>
          </View>

          {/* Price and In Range Badge */}
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-base font-bold text-foreground">
                ₱{property.rent.toLocaleString()}
              </Text>
              <Text className="text-sm text-muted-foreground">/mo</Text>
            </View>
            {property.matchesPriceRange && (
              <View className="flex-row items-center rounded-full bg-success/10 px-2 py-0.5">
                <Ionicons name="checkmark-circle" size={14} color="rgb(76, 175, 80)" />
                <Text className="ml-1 text-xs font-medium text-success">In Range</Text>
              </View>
            )}
          </View>

          {/* Rating and Category Row */}
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {property.rating && property.rating > 0 ? (
                <>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text className="ml-1 text-sm text-muted-foreground">
                    {property.rating.toFixed(1)} ({property.number_reviews || 0} reviews)
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-muted-foreground">No reviews</Text>
              )}
            </View>
            <View className="rounded-full border border-primary/20 bg-secondary/30 px-2 py-0.5">
              <Text className="text-xs font-medium text-secondary-foreground">
                {getCategoryLabel(property.category)}
              </Text>
            </View>
          </View>

          {/* Distance and Amenities */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#644A40" />
              <Text className="ml-1 text-xs text-muted-foreground">
                {property.distance !== null
                  ? `${formatDistance(property.distance)} from work/study`
                  : 'Set location to see distance'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="items-center py-4">
          <ActivityIndicator color="#644A40" />
          <Text className="mt-2 text-sm text-muted-foreground">Loading more properties...</Text>
        </View>
      );
    }

    // Show "Pull up to load more" when near the end but not loading
    if (hasMore && filteredProperties.length > 0 && !isLoading) {
      return (
        <View className="items-center py-4">
          <Text className="text-sm text-muted-foreground">Pull up to load more</Text>
        </View>
      );
    }

    // Show end of results
    if (!hasMore && filteredProperties.length > 0) {
      return (
        <View className="items-center py-4">
          <Text className="text-sm text-muted-foreground">You've reached the end</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="home-outline" size={64} color="#EFEFEF" />
        <Text className="mt-4 text-lg font-semibold text-foreground">No properties found</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new listings'}
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
        className="bg-background px-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        {/* Header Text */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-primary">Find Your Room</Text>
          <Text className="mt-2 text-base text-muted-foreground">{userCity}</Text>
        </View>

        {/* Search Bar */}
        <View
          className={`mb-4 flex-row items-center rounded-lg border border-input bg-card ${
            isSearching ? 'opacity-60' : 'opacity-100'
          }`}>
          <TextInput
            placeholder="Search for rooms..."
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

        {/* Categories (Tabs style) */}
        <View className="flex-row border-b border-border">
          {(['All', 'room', 'apartment', 'bedspace'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              className={`flex-1 items-center pb-3 ${
                selectedCategory === category
                  ? 'border-b-2 border-primary bg-transparent'
                  : 'bg-transparent'
              }`}
              onPress={() => setSelectedCategory(category)}>
              <Text
                className={`font-semibold ${
                  selectedCategory === category ? 'text-primary' : 'text-muted-foreground'
                }`}>
                {category === 'All' ? 'All' : getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrollable Property List */}
      {isLoading && properties.length === 0 ? (
        <View className="flex-1 px-4 pt-1">
          {[...Array(8)].map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.property_id.toString()}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 12,
          }}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}
