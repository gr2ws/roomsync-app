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
  console.log('[uploadProfilePicture] Starting upload...');
  console.log('[uploadProfilePicture] Input params:', { imageUri, authId });

  try {
    // Create file path using auth_id (ensures single file per user)
    const filePath = `${authId}/avatar.jpg`;
    console.log('[uploadProfilePicture] File path:', filePath);

    // For React Native, we need to create a FormData-like structure
    // Get the file extension from URI
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `avatar.${fileExtension}`;
    console.log('[uploadProfilePicture] File extension:', fileExtension);
    console.log('[uploadProfilePicture] File name:', fileName);

    // Fetch the image as ArrayBuffer (works in React Native)
    console.log('[uploadProfilePicture] Fetching image from URI...');
    const response = await fetch(imageUri);
    console.log('[uploadProfilePicture] Fetch response status:', response.status);

    const arrayBuffer = await response.arrayBuffer();
    console.log('[uploadProfilePicture] ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');

    const fileData = new Uint8Array(arrayBuffer);
    console.log('[uploadProfilePicture] FileData created, size:', fileData.length, 'bytes');

    // Upload to Supabase Storage
    console.log('[uploadProfilePicture] Uploading to Supabase storage bucket "user-profile"...');
    const { data, error } = await supabase.storage.from('user-profile').upload(filePath, fileData, {
      contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
      upsert: true, // Overwrite existing file
    });

    if (error) {
      console.error('[uploadProfilePicture] Supabase upload error:', error);
      console.error('[uploadProfilePicture] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      return null;
    }

    console.log('[uploadProfilePicture] Upload successful, data:', data);

    // Get public URL with cache-busting timestamp
    console.log('[uploadProfilePicture] Getting public URL...');
    const { data: publicUrlData } = supabase.storage.from('user-profile').getPublicUrl(filePath);
    console.log('[uploadProfilePicture] Public URL data:', publicUrlData);

    // Add timestamp to bust React Native image cache
    const urlWithCacheBuster = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    console.log('[uploadProfilePicture] Final URL with cache buster:', urlWithCacheBuster);

    return urlWithCacheBuster;
  } catch (error) {
    console.error('[uploadProfilePicture] Unexpected error:', error);
    console.error('[uploadProfilePicture] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}
