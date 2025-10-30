import { View, Text, TextInput, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

export default function AuthScreen({ navigation }: Props) {
  const { setIsLoggedIn, setUserRole, setUserProfile } = useLoggedIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [deviceOnboarded, setDeviceOnboarded] = useState(false);
  const [checkingInitialSession, setCheckingInitialSession] = useState(true);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingStatus = await AsyncStorage.getItem('DeviceOnboarded');
      setDeviceOnboarded(onboardingStatus === 'true');
    };
    checkOnboarding();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session) {
          setCheckingInitialSession(false);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    setAuthenticating(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setAuthenticating(false);
      Alert.alert('Login Error', error?.message || 'Could not log in.');
      return;
    }

    // Fetch full user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    if (userError || !userData) {
      setLoading(false);
      setAuthenticating(false);
      Alert.alert('Login Error', 'Could not fetch user profile.');
      return;
    }

    // Check if user is banned
    if (userData.is_banned) {
      console.log('[AuthScreen] User is banned, preventing login for user_id:', userData.user_id);
      setLoading(false);
      setAuthenticating(false);
      await supabase.auth.signOut();
      Alert.alert(
        'Account Banned',
        'Your account has been banned. Please contact support for more information.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if user is warned
    if (userData.is_warned) {
      console.log('[AuthScreen] User has warning, showing alert for user_id:', userData.user_id);
      Alert.alert(
        'Account Warning',
        'Your account has received a warning. Please review our community guidelines to avoid further action.',
        [{ text: 'I Understand' }]
      );
    }

    console.log('[AuthScreen] Login successful for user:', {
      user_id: userData.user_id,
      user_type: userData.user_type,
      is_verified: userData.is_verified,
    });

    // Update last login date
    const timestamp = new Date().toISOString().replace('Z', ''); // Remove 'Z' for timestamp without time zone
    await supabase.from('users').update({ last_login_date: timestamp }).eq('auth_id', data.user.id);

    setUserRole(userData.user_type);
    setUserProfile(userData);

    // Check if THIS USER has completed onboarding (user-specific flag)
    const hasCompletedOnboarding = await AsyncStorage.getItem(
      `user_${userData.user_id}_hasCompletedOnboarding`
    );

    // Keep loading and authenticating states true until navigation
    setLoading(false);

    if (hasCompletedOnboarding === 'true') {
      // User has already completed onboarding, go directly to Home
      setIsLoggedIn(true);
      // authenticating state will persist until component unmounts
    } else {
      // First time login, show Welcome screen
      navigation.navigate('Welcome');
      // authenticating state will persist until component unmounts
    }
  };

  const handleSignUp = async () => {
    // Reset DEVICE flag so new user goes through the full onboarding flow
    try {
      await AsyncStorage.setItem('DeviceOnboarded', 'false');
    } catch (error) {
      console.error('Error resetting onboarding flag:', error);
    }
    // Navigate to Introduction screen to start onboarding, pass flag to show back button
    navigation.navigate('Introduction', { fromAuth: true });
  };

  if (checkingInitialSession) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerClassName="px-6 min-h-full"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}>
        {!deviceOnboarded && (
          <View className="top-0 z-10">
            <BackButton onPress={() => navigation.goBack()} />
          </View>
        )}
        <View className="flex-1 items-center justify-center">
          <View className="w-full max-w-sm">
            <Image
              source={require('../../assets/Log In.png')}
              style={{
                width: 350,
                height: 350,
                alignSelf: 'center',
                marginBottom: 0,
                marginTop: -100,
              }}
              resizeMode="contain"
            />
            <Text className="mb-4 text-center text-4xl font-bold text-primary">Welcome back!</Text>
            <Text className="mb-8 text-center text-base text-muted-foreground">
              Sign in to continue
            </Text>

            <View className="flex w-full justify-center gap-4">
              <View className="">
                <TextInput
                  placeholder="Email"
                  className="text-md overflow-visible rounded-lg border border-input bg-card px-4 py-3 text-card-foreground"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <View className="">
                <TextInput
                  placeholder="Password"
                  className="text-md overflow-visible rounded-lg border border-input bg-card px-4 py-3 text-card-foreground"
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <Button onPress={handleLogin} variant="primary" disabled={loading || authenticating}>
                {loading || authenticating ? 'Logging In...' : 'Log In'}
              </Button>

              <View className="mt-2 items-center">
                <View className="flex-row">
                  <Text className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                  </Text>
                  <Button onPress={handleSignUp} variant="text" disabled={authenticating}>
                    Sign up
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
