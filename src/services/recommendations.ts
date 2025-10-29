import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { useLoggedIn } from '../store/useLoggedIn';
import {
  Property,
  PropertyWithScore,
  PropertyCategory,
  RecommendationResult,
} from '../types/property';
import { calculateDistanceFromStrings, parseCoordinates } from '../utils/distance';

/**
 * Mapping of preference labels to property boolean fields
 */
const PREFERENCE_MAP: Record<string, keyof Property> = {
  'Internet Availability': 'has_internet',
  'Pet Friendly': 'allows_pets',
  Furnished: 'is_furnished',
  'Air Conditioned': 'has_ac',
  'Gated/With CCTV': 'is_secure',
  Parking: 'has_parking',
};

/**
 * Parse user preferences from AsyncStorage
 * Returns array of preference labels in priority order
 */
async function parsePreferences(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem('room_preferences');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }

  // Return default order if no preferences saved
  return [
    'Internet Availability',
    'Pet Friendly',
    'Furnished',
    'Air Conditioned',
    'Gated/With CCTV',
    'Parking',
  ];
}

/**
 * Calculate amenity-based score for a property
 * Based on user's preference ordering
 * This is the ONLY ranking factor for recommendations
 */
function calculateAmenityScore(property: Property, preferences: string[]): number {
  let score = 0;

  preferences.forEach((prefLabel, index) => {
    const propertyField = PREFERENCE_MAP[prefLabel];
    if (!propertyField) return;

    const hasAmenity = property[propertyField] as boolean | null;

    // Top 3 preferences (must-haves)
    if (index === 0) {
      // Top 1: +10 if present, -6 if absent
      score += hasAmenity === true ? 10 : -6;
    } else if (index === 1) {
      // Top 2: +8 if present, -6 if absent
      score += hasAmenity === true ? 8 : -6;
    } else if (index === 2) {
      // Top 3: +6 if present, -2 if absent
      score += hasAmenity === true ? 6 : -2;
    } else {
      // Bottom 3 (nice-to-have): +2 if present, 0 if absent
      score += hasAmenity === true ? 2 : 0;
    }
  });

  return score;
}

/**
 * Check if property rent is within user's price range
 */
function isWithinPriceRange(rent: number, priceRange: string | null): boolean {
  if (!priceRange) return true;

  try {
    const range = priceRange.toLowerCase();

    if (range.includes('under')) {
      const max = parseInt(range.match(/\d+/)?.[0] || '0');
      return rent <= max;
    }

    if (range.includes('+') || range.includes('above')) {
      const min = parseInt(range.match(/\d+/)?.[0] || '0');
      return rent >= min;
    }

    // Range format: "3000-5000" or "3000 - 5000"
    const matches = range.match(/(\d+)\s*-\s*(\d+)/);
    if (matches) {
      const min = parseInt(matches[1]);
      const max = parseInt(matches[2]);
      return rent >= min && rent <= max;
    }
  } catch (error) {
    console.error('Error parsing price range:', error);
  }

  return true;
}

/**
 * Get recommended properties based on user preferences and single priority filter
 * @param excludedPropertyIds - Optional array of property IDs to exclude (rejected recommendations)
 * @param priority - User-selected priority: 'distance', 'price', or 'room_type'
 * @returns Object containing top 3 recommended properties as both array and JSON string (or fewer if less than 3 available)
 */
export async function getRecommendedProperties(
  excludedPropertyIds: number[] = [],
  priority: 'distance' | 'price' | 'room_type'
): Promise<RecommendationResult> {
  try {
    // Get user profile from Zustand store
    const userProfile = useLoggedIn.getState().userProfile;
    if (!userProfile) {
      console.warn('User not logged in');
      return { properties: [], json: '[]' };
    }

    // Fetch user preferences
    const preferences = await parsePreferences();

    // Fetch all verified and available properties from database
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_verified', true)
      .eq('is_available', true)
      .order('property_id', { ascending: true });

    if (error) {
      console.error('Error fetching properties:', error);
      return { properties: [], json: '[]' };
    }

    if (!properties || properties.length === 0) {
      return { properties: [], json: '[]' };
    }

    // Filter out excluded properties
    let filteredProperties = properties.filter(
      (prop) => !excludedPropertyIds.includes(prop.property_id)
    );

    if (filteredProperties.length === 0) {
      return { properties: [], json: '[]' };
    }

    // Apply filter based on user's chosen priority
    if (priority === 'distance') {
      // Filter: Only properties within 2-5km
      filteredProperties = filteredProperties.filter((property) => {
        const distance = calculateDistanceFromStrings(
          property.coordinates,
          userProfile.place_of_work_study
        );
        return distance !== null && distance >= 2 && distance <= 5;
      });
    } else if (priority === 'price') {
      // Filter: Only properties within user's price range
      filteredProperties = filteredProperties.filter((property) => {
        return isWithinPriceRange(property.rent, userProfile.price_range);
      });
    } else if (priority === 'room_type') {
      // Filter: Only properties matching user's preferred category
      filteredProperties = filteredProperties.filter((property) => {
        return property.category === userProfile.room_preference;
      });
    }

    if (filteredProperties.length === 0) {
      return { properties: [], json: '[]' };
    }

    // Calculate amenity score for filtered properties (ONLY ranking factor)
    const propertiesWithScore: PropertyWithScore[] = filteredProperties.map((property) => {
      const amenityScore = calculateAmenityScore(property, preferences);

      // Calculate and add formatted distance
      const distance = calculateDistanceFromStrings(
        property.coordinates,
        userProfile.place_of_work_study
      );
      const distance_formatted =
        distance !== null ? `${distance.toFixed(1)} km away` : 'Distance unavailable';

      return {
        ...property,
        amenityScore,
        distance_formatted,
      };
    });

    // Sort by amenity score ONLY (descending)
    propertiesWithScore.sort((a, b) => b.amenityScore - a.amenityScore);

    // Return top 3 properties (or fewer if less than 3 available)
    const topProperties = propertiesWithScore.slice(0, 3);

    // Return both formats
    return {
      properties: topProperties,
      json: JSON.stringify(topProperties),
    };
  } catch (error) {
    console.error('Error in getRecommendedProperties:', error);
    return { properties: [], json: '[]' };
  }
}
