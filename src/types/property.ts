export type PropertyCategory = 'apartment' | 'room' | 'bedspace';

export interface Property {
  property_id: number;
  owner_id: number;
  title: string;
  description: string | null;
  category: PropertyCategory;
  street: string | null;
  barangay: string | null;
  city: string;
  coordinates: string | null;
  image_url: string[];
  rent: number;
  amenities: string[] | null;
  rating: number | null;
  max_renters: number;
  is_available: boolean;
  is_verified: boolean;
  has_internet: boolean | null;
  allows_pets: boolean | null;
  is_furnished: boolean | null;
  has_ac: boolean | null;
  is_secure: boolean | null;
  has_parking: boolean | null;
  number_reviews: number;
}

export interface PropertyWithDistance extends Property {
  distance: number | null;
  matchesPriceRange: boolean;
  currentRenters?: number;
}

export interface PropertyOwner {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
}

export interface PropertyWithOwner extends Property {
  owner: PropertyOwner;
}

export interface Review {
  review_id: number;
  user_id: number;
  property_id: number;
  rating: number;
  comment: string | null;
  upvotes: number;
  downvotes: number;
  date_created: string;
  user?: {
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  };
}

export interface UserPreferences {
  price_range: string | null;
  room_preference: PropertyCategory | null;
  place_of_work_study: string | null;
  preferences_order: string[]; // Array of preference labels from AsyncStorage
}
