import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

/**
 * A safe wrapper around useNavigation that handles cases where
 * the navigation context might not be available yet.
 */
export function useSafeNavigation<T = any>() {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  let navigation: T | null = null;
  let navigationError: Error | null = null;

  try {
    navigation = useNavigation<T>();
    // If we got here without an error, navigation is available
    useEffect(() => {
      setIsNavigationReady(true);
    }, []);
  } catch (error) {
    navigationError = error as Error;
    console.warn('[useSafeNavigation] Navigation context not available:', error);
  }

  const safeNavigate = useCallback(
    (...args: any[]) => {
      if (navigation && isNavigationReady) {
        try {
          // @ts-ignore - navigation.navigate exists at runtime
          return navigation.navigate?.(...args);
        } catch (error) {
          console.error('[useSafeNavigation] Navigation error:', error);
        }
      } else {
        console.warn('[useSafeNavigation] Navigation not ready, skipping navigation call');
      }
    },
    [navigation, isNavigationReady]
  );

  return {
    navigation,
    isNavigationReady,
    navigationError,
    safeNavigate,
  };
}
