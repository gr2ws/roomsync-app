import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Preload all local image assets used in the app
 * This function caches images so they load instantly when screens render
 */
export async function preloadAssets(): Promise<void> {
  try {
    // Define all assets to preload
    const imageAssets = [
      require('../assets/Log In.png'),
      require('../assets/Renter.png'),
      require('../assets/Owner.png'),
      require('../assets/Admin.png'),
      require('../assets/What brings you here.png'),
      require('../assets/Logo.png'),
    ];

    // Preload all images
    const cacheImages = imageAssets.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(cacheImages);
    console.log('[PreloadAssets] All assets preloaded successfully');
  } catch (error) {
    console.warn('[PreloadAssets] Error preloading assets:', error);
    // Don't throw error - allow app to continue even if preloading fails
  }
}

/**
 * Hide the splash screen after assets are loaded
 */
export async function hideSplashScreen(): Promise<void> {
  try {
    await SplashScreen.hideAsync();
  } catch (error) {
    console.warn('[PreloadAssets] Error hiding splash screen:', error);
  }
}
