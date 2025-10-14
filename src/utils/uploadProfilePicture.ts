import { supabase } from './supabase';

/**
 * Uploads a profile picture to Supabase Storage
 * @param imageUri - Local URI of the image to upload
 * @param authId - User's auth_id from Supabase Auth
 * @returns Public URL of the uploaded image, or null on error
 */
export async function uploadProfilePicture(
  imageUri: string,
  authId: string
): Promise<string | null> {
  try {
    // Create file path using auth_id (ensures single file per user)
    const filePath = `${authId}/avatar.jpg`;

    // For React Native, we need to create a FormData-like structure
    // Get the file extension from URI
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `avatar.${fileExtension}`;

    // Fetch the image as ArrayBuffer (works in React Native)
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-profile')
      .upload(filePath, fileData, {
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        upsert: true, // Overwrite existing file
      });

    if (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-profile')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading profile picture:', error);
    return null;
  }
}
