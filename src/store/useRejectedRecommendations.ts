import { create } from 'zustand';
import { Property } from '../types/property';

interface RejectedRecommendationsState {
  rejectedIds: number[];
  recommendationQueue: Property[];
  shownPropertyIds: number[];
  currentPropertyId: number | null;
  addRejectedProperty: (propertyId: number) => void;
  clearRejectedProperties: () => void;
  getRejectedIds: () => number[];
  setRecommendationQueue: (properties: Property[]) => void;
  getNextRecommendation: () => Property | null;
  clearRecommendationQueue: () => void;
  markPropertyAsShown: (propertyId: number) => void;
  hasMoreRecommendations: () => boolean;
  setCurrentProperty: (propertyId: number) => void;
  getCurrentPropertyId: () => number | null;
}

/**
 * Session-based store for tracking rejected property recommendations and recommendation queue
 * Data is stored in memory only and resets on app restart
 */
export const useRejectedRecommendations = create<RejectedRecommendationsState>((set, get) => ({
  rejectedIds: [],
  recommendationQueue: [],
  shownPropertyIds: [],
  currentPropertyId: null,

  /**
   * Add a property ID to the rejection list
   * Prevents duplicate entries
   */
  addRejectedProperty: (propertyId: number) =>
    set((state) => {
      if (state.rejectedIds.includes(propertyId)) {
        return state; // Already rejected, no change
      }
      return { rejectedIds: [...state.rejectedIds, propertyId] };
    }),

  /**
   * Clear all rejected properties
   * Useful for resetting recommendations
   */
  clearRejectedProperties: () => set({ rejectedIds: [] }),

  /**
   * Get the current list of rejected property IDs
   */
  getRejectedIds: () => get().rejectedIds,

  /**
   * Set the recommendation queue with a list of properties
   */
  setRecommendationQueue: (properties: Property[]) =>
    set({ recommendationQueue: properties, shownPropertyIds: [] }),

  /**
   * Get the next property from the queue that hasn't been shown
   * Returns null if no more properties available
   */
  getNextRecommendation: () => {
    const state = get();
    const nextProperty = state.recommendationQueue.find(
      (prop) => !state.shownPropertyIds.includes(prop.property_id)
    );
    return nextProperty || null;
  },

  /**
   * Clear the recommendation queue
   */
  clearRecommendationQueue: () => set({ recommendationQueue: [], shownPropertyIds: [] }),

  /**
   * Mark a property as shown (displayed to the user)
   */
  markPropertyAsShown: (propertyId: number) =>
    set((state) => {
      if (state.shownPropertyIds.includes(propertyId)) {
        return state;
      }
      return { shownPropertyIds: [...state.shownPropertyIds, propertyId] };
    }),

  /**
   * Check if there are more recommendations in the queue
   */
  hasMoreRecommendations: () => {
    const state = get();
    return state.recommendationQueue.some(
      (prop) => !state.shownPropertyIds.includes(prop.property_id)
    );
  },

  /**
   * Set the currently displayed property ID
   */
  setCurrentProperty: (propertyId: number) => set({ currentPropertyId: propertyId }),

  /**
   * Get the currently displayed property ID
   */
  getCurrentPropertyId: () => get().currentPropertyId,
}));
