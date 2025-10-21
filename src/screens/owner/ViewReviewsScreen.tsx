import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Star, X } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { Review } from '../../types/property';
import ReviewCard from '../../components/ReviewCard';
import { RootTabParamList } from '../../utils/navigation';

interface ReviewWithProperty extends Review {
  property?: {
    title: string;
  };
}

type ViewReviewsScreenRouteProp = RouteProp<RootTabParamList, 'ViewReviews'>;

export default function ViewReviewsScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ViewReviewsScreenRouteProp>();
  const navigation = useNavigation();
  const { userProfile } = useLoggedIn();
  const [reviews, setReviews] = useState<ReviewWithProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const REVIEWS_PER_PAGE = 12;

  // Get propertyId from route params if provided (for filtering)
  const filterPropertyId = route.params?.propertyId;

  useEffect(() => {
    fetchReviews(false);
  }, [filterPropertyId]); // Refetch when filterPropertyId changes

  const fetchReviews = async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setCurrentPage(0);
        setHasMore(true);
      }

      // If filterPropertyId is provided, only get reviews for that property
      // Otherwise, get all properties owned by the current user
      let propertyIds: number[];

      if (filterPropertyId) {
        // Verify the property belongs to the current user
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('property_id')
          .eq('property_id', filterPropertyId)
          .eq('owner_id', userProfile?.user_id)
          .single();

        if (propertyError || !property) {
          setReviews([]);
          setHasMore(false);
          setAverageRating(null);
          return;
        }

        propertyIds = [filterPropertyId];
      } else {
        // Get all properties owned by the current user
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('property_id')
          .eq('owner_id', userProfile?.user_id);

        if (propertiesError) throw propertiesError;

        if (!properties || properties.length === 0) {
          setReviews([]);
          setHasMore(false);
          setAverageRating(null);
          return;
        }

        propertyIds = properties.map((p) => p.property_id);
      }

      const page = loadMore ? currentPage + 1 : 0;
      const from = page * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      // Fetch reviews for those properties
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
          ),
          property:property_id (
            title
          )
        `
        )
        .in('property_id', propertyIds)
        .order('date_created', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const reviewsData = (data as any) || [];

      // Check if there are more items
      if (reviewsData.length < REVIEWS_PER_PAGE) {
        setHasMore(false);
      }

      if (loadMore) {
        setReviews((prev) => [...prev, ...reviewsData]);
        setCurrentPage(page);
      } else {
        setReviews(reviewsData);
        setCurrentPage(0);

        // Calculate average rating (only on initial load/refresh)
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
        } else {
          setAverageRating(null);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReviews(false).finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchReviews(true);
    }
  };

  const handleRemoveFilter = () => {
    // Navigate back to ViewReviews without params to show all reviews
    // The useEffect will automatically refresh when filterPropertyId changes
    navigation.navigate('ViewReviews' as never, undefined as never);
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="items-center py-4">
          <ActivityIndicator color="#644A40" />
          <Text className="mt-2 text-sm text-muted-foreground">Loading more reviews...</Text>
        </View>
      );
    }

    if (hasMore && reviews.length > 0 && !isLoading) {
      return (
        <View className="items-center py-4">
          <Text className="text-sm text-muted-foreground">Pull up to load more</Text>
        </View>
      );
    }

    if (!hasMore && reviews.length > 0) {
      return (
        <View className="items-center py-4">
          <Text className="text-sm text-muted-foreground">You've reached the end</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading || isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
          <ActivityIndicator size="large" color="#644A40" />
          <Text className="mt-4 text-muted-foreground">Loading reviews...</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Star size={64} color="#EFEFEF" />
        <Text className="mt-4 text-lg font-semibold text-foreground">No reviews yet</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          Reviews from renters will appear here
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
        <View className="flex-row items-center justify-between" style={{ minHeight: 40 }}>
          {/* Left side: Title and stats */}
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl font-bold text-primary">Property Reviews</Text>
              <View className="flex-row items-center">
                <Star size={18} color="#FFD700" fill="#FFD700" />
                <Text className="ml-1 text-base font-semibold text-foreground">
                  {averageRating ? averageRating.toFixed(1) : 'N/A'}
                </Text>
                <Text className="ml-1 text-sm text-muted-foreground">
                  ({reviews.length})
                </Text>
              </View>
            </View>
          </View>

          {/* Right side: Remove filter button - fixed width to prevent layout shift */}
          <View className="ml-3" style={{ width: 40, height: 40 }}>
            {filterPropertyId && (
              <TouchableOpacity onPress={handleRemoveFilter} className="p-2" activeOpacity={0.7}>
                <X size={24} color="#644A40" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Subtitle - fixed height container */}
        <View style={{ minHeight: 24 }}>
          {filterPropertyId && reviews.length > 0 && reviews[0].property?.title ? (
            <Text className="mt-1 text-sm text-muted-foreground">
              {reviews[0].property.title}
            </Text>
          ) : (
            <Text className="mt-1 text-sm text-muted-foreground">
              View and manage reviews across all your properties
            </Text>
          )}
        </View>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            showPropertyName={true}
            propertyName={item.property?.title || 'Unknown Property'}
          />
        )}
        keyExtractor={(item) => item.review_id.toString()}
        ListFooterComponent={renderFooter}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
