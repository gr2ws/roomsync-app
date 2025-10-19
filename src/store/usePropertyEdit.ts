import { create } from 'zustand';

interface PropertyData {
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
  amenities: string[];
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
