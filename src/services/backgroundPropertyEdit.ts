import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { uploadPropertyImages } from '../utils/uploadPropertyImages';
import { PropertyFormData } from '../screens/owner/AddPropertyScreen';
import { usePropertyUpload } from '../store/usePropertyUpload';

/**
 * Handles background property edit:
 * 1. Uploads images to Supabase Storage (if changed)
 * 2. Updates property data in database
 * 3. Updates upload progress
 * 4. Shows notifications on success/failure
 */
export async function editPropertyInBackground(
  formData: PropertyFormData,
  propertyId: number,
  ownerId: number,
  existingImageUrls: string[]
): Promise<void> {
  const { updateProgress, completeUpload, failUpload } = usePropertyUpload.getState();

  try {
    // Check if images have changed
    const imagesChanged =
      formData.images.length !== existingImageUrls.length ||
      formData.images.some((img, idx) => img !== existingImageUrls[idx]);

    let finalImageUrls = existingImageUrls;

    if (imagesChanged) {
      // Upload new images with progress tracking
      const imageUrls = await uploadPropertyImages(formData.images, ownerId);

      if (!imageUrls) {
        throw new Error('Failed to upload images.');
      }

      finalImageUrls = imageUrls;
      updateProgress(formData.images.length, formData.images.length);
    }

    // Update property in database
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        street: formData.street || null,
        barangay: formData.barangay || null,
        city: formData.city,
        coordinates: formData.coordinates,
        image_url: finalImageUrls,
        rent: formData.rent,
        max_renters: formData.max_renters,
        has_internet: formData.has_internet,
        allows_pets: formData.allows_pets,
        is_furnished: formData.is_furnished,
        has_ac: formData.has_ac,
        is_secure: formData.is_secure,
        has_parking: formData.has_parking,
        amenities: formData.amenities,
      })
      .eq('property_id', propertyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Mark upload as complete
    completeUpload();

    // Show success notification
    Alert.alert('Success!', 'Property updated successfully!');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update property. Please try again.';

    // Mark upload as failed
    failUpload(errorMessage);

    // Show error notification
    Alert.alert('Update Failed', errorMessage);
  }
}
