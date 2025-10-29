import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { uploadPropertyImages } from '../utils/uploadPropertyImages';
import { PropertyFormData } from '../screens/owner/AddPropertyScreen';
import { usePropertyUpload } from '../store/usePropertyUpload';

/**
 * Handles background property upload:
 * 1. Uploads images to Supabase Storage
 * 2. Inserts property data into database
 * 3. Updates upload progress
 * 4. Shows notifications on success/failure
 */
export async function uploadPropertyInBackground(
  formData: PropertyFormData,
  ownerId: number
): Promise<void> {
  const { updateProgress, completeUpload, failUpload } = usePropertyUpload.getState();

  try {
    // Upload images with progress tracking
    const imageUrls = await uploadPropertyImages(formData.images, ownerId);

    if (!imageUrls) {
      throw new Error('Failed to upload images.');
    }

    // Update progress to show images are uploaded
    updateProgress(formData.images.length, formData.images.length);

    // Insert property into database
    const { error: insertError } = await supabase.from('properties').insert([
      {
        owner_id: ownerId,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        street: formData.street || null,
        barangay: formData.barangay || null,
        city: formData.city,
        coordinates: formData.coordinates,
        image_url: imageUrls,
        rent: formData.rent,
        max_renters: formData.max_renters,
        has_internet: formData.has_internet,
        allows_pets: formData.allows_pets,
        is_furnished: formData.is_furnished,
        has_ac: formData.has_ac,
        is_secure: formData.is_secure,
        has_parking: formData.has_parking,
        is_available: true,
        is_verified: false,
        rating: null,
        amenities: formData.amenities,
      },
    ]);

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Mark upload as complete
    completeUpload();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to upload property. Please try again.';

    // Mark upload as failed
    failUpload(errorMessage);

    // Show error notification
    Alert.alert('Upload Failed', errorMessage);
  }
}
