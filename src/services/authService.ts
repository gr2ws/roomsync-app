import { supabase } from '~/utils/supabase';
import { UserRole } from '~/store/useLoggedIn';

/**
 * Auth service for handling Supabase authentication state changes
 */

export interface UserProfile {
  user_id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: UserRole;
  profile_picture?: string;
  birth_date?: string;
  price_range?: string;
  room_preference?: string;
  occupation?: string;
  place_of_work_study?: string;
  rented_property?: number;
  is_warned: boolean;
  is_banned: boolean;
  is_verified: boolean;
}

export interface AuthStateCallbacks {
  onSignedIn: (profile: UserProfile) => void;
  onSignedOut: () => void;
  onTokenRefreshed: () => void;
  onInitialSession: (profile: UserProfile | null) => void;
}

/**
 * Fetches user profile from database using auth_id
 */
export const fetchUserProfile = async (authId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) throw error;

    return profile as UserProfile;
  } catch (error) {
    console.error('[AuthService] Error fetching user profile:', error);
    return null;
  }
};

/**
 * Sets up Supabase auth state listener
 * Returns cleanup function to unsubscribe
 */
export const setupAuthListener = (callbacks: AuthStateCallbacks) => {
  console.log('[AuthService] Setting up auth state listener');

  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[AuthService] Auth state changed:', event);

    switch (event) {
      case 'SIGNED_IN':
        if (session) {
          console.log('[AuthService] User signed in, fetching profile');
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            console.log('[AuthService] Profile fetched:', profile.user_type);
            callbacks.onSignedIn(profile);
          }
        }
        break;

      case 'SIGNED_OUT':
        console.log('[AuthService] User signed out');
        callbacks.onSignedOut();
        break;

      case 'TOKEN_REFRESHED':
        console.log('[AuthService] Token refreshed successfully');
        callbacks.onTokenRefreshed();
        break;

      case 'INITIAL_SESSION':
        // Handle initial session on app start (restore logged-in user)
        if (session) {
          console.log('[AuthService] Initial session found, restoring user');
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            console.log('[AuthService] Profile restored:', profile.user_type);
            callbacks.onInitialSession(profile);
          } else {
            console.log('[AuthService] Session found but no profile, signing out.');
            await supabase.auth.signOut();
            callbacks.onInitialSession(null);
          }
        } else {
          console.log('[AuthService] No initial session found');
          callbacks.onInitialSession(null);
        }
        break;

      default:
        break;
    }
  });

  // Return cleanup function
  return () => {
    console.log('[AuthService] Cleaning up auth listener');
    authListener?.subscription.unsubscribe();
  };
};

/**
 * Manually check if there's an active session
 */
export const checkActiveSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  } catch (error) {
    console.error('[AuthService] Error checking active session:', error);
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[AuthService] User signed out successfully');
    return true;
  } catch (error) {
    console.error('[AuthService] Error signing out:', error);
    return false;
  }
};
