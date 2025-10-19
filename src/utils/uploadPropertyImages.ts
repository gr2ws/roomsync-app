import { supabase } from './supabase';

/**
 * Uploads property images to Supabase Storage
 * @param imageUris - Array of local URIs of the images to upload
 * @param ownerId - Owner's user_id
 * @returns Array of public URLs of the uploaded images, or null on error
 */
export async function uploadPropertyImages(
  imageUris: string[],
  ownerId: number
): Promise<string[] | null> {
  try {
    const timestamp = Date.now();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const imageUri = imageUris[i];

      // Create unique file path - always use .jpg as default for consistency
      // React Native image picker URIs may not have reliable extensions
      const filePath = `${ownerId}/${timestamp}/${i + 1}.jpg`;

      // Fetch the image as ArrayBuffer (works in React Native)
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      // Use image/jpeg as default content type since most mobile images are JPEG
      const { error } = await supabase.storage
        .from('room-pics')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        // Clean up previously uploaded images on failure
        if (uploadedUrls.length > 0) {
          await cleanupUploadedImages(uploadedUrls);
        }
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('room-pics')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Unexpected error uploading property images:', error);
    return null;
  }
}

/**
 * Cleans up uploaded images in case of a partial failure
 * @param publicUrls - Array of public URLs to delete
 */
async function cleanupUploadedImages(publicUrls: string[]): Promise<void> {
  try {
    const filePaths = publicUrls.map((url) => {
      // Extract file path from public URL
      const urlParts = url.split('/room-pics/');
      return urlParts[1];
    });

    await supabase.storage.from('room-pics').remove(filePaths);
  } catch (error) {
    console.error('Error cleaning up uploaded images:', error);
  }
}
