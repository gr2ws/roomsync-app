import { View, Text, TextInput, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(onboardingStatus === 'true');
    };
    checkOnboarding();
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

    setUserRole(userData.user_type);
    setUserProfile(userData);

    // Check if user has completed onboarding
    const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

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
    // Reset onboarding flag so user goes through the full onboarding flow
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'false');
    } catch (error) {
      console.error('Error resetting onboarding flag:', error);
    }
    // Navigate to Introduction screen to start onboarding, pass flag to show back button
    navigation.navigate('Introduction', { fromAuth: true });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
      {!hasCompletedOnboarding && (
        <View className="absolute left-0 top-10 z-10">
          <BackButton onPress={() => navigation.goBack()} />
        </View>
      )}
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 40,
          minHeight: '100%',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={30}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View className="w-full max-w-sm">
            <Text className="mb-4 text-center text-4xl font-bold text-primary">Welcome back!</Text>
            <Text className="mb-8 text-center text-base text-muted-foreground">
              Sign in to continue...
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
                  <Text className="text-sm text-muted-foreground">Don&apos;t have an account? </Text>
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
