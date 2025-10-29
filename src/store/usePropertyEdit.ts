import { create } from 'zustand';

interface PropertyData {
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
  amenities: string[] | null;
  rating: number | null;
  number_reviews: number;
}

interface PropertyEditState {
  isEditing: boolean;
  propertyId: number | null;
  propertyData: PropertyData | null;
  startEdit: (propertyId: number, propertyData: PropertyData) => void;
  cancelEdit: () => void;
  completeEdit: () => void;
}

export const usePropertyEdit = create<PropertyEditState>((set) => ({
  isEditing: false,
  propertyId: null,
  propertyData: null,
  startEdit: (propertyId: number, propertyData: PropertyData) =>
    set({
      isEditing: true,
      propertyId,
      propertyData,
    }),
  cancelEdit: () =>
    set({
      isEditing: false,
      propertyId: null,
      propertyData: null,
    }),
  completeEdit: () =>
    set({
      isEditing: false,
      propertyId: null,
      propertyData: null,
    }),
}));
