import { View, Text, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

// Zod schema for registration form
const registerSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    email: z.email({ message: 'Invalid email address' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
    userType: z.enum(['renter', 'owner'], {
      error: 'User type is required',
    }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    profilePicture: z.string().optional().or(z.literal('')),
    birthDate: z.string().optional().or(z.literal('')),
    priceRange: z.string().optional().or(z.literal('')),
    roomPreference: z.string().optional().or(z.literal('')),
    occupation: z.string().optional().or(z.literal('')),
    placeOfWorkStudy: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormFields = z.infer<typeof registerSchema>;

// Helper function to convert string to title case
// Handles multiple words, hyphens, apostrophes, and other separators
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/(\s|-|')/) // Split on spaces, hyphens, and apostrophes while keeping delimiters
    .map((part) => {
      // Only capitalize if it's not a delimiter and has content
      if (part && part.length > 0 && ![' ', '-', "'"].includes(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return part;
    })
    .join('');
};

export default function RegisterScreen({ navigation }: Props) {
  const { setIsLoggedIn, setUserRole, setUserProfile, userRole } = useLoggedIn();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Remove userType state, will be set elsewhere
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Profile picture and birth date moved to PreferencesScreen

  const [loading, setLoading] = useState(false);

  // Zod validation error state
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterFormFields, string>>>(
    {}
  );

  const handleSignUp = async () => {
    console.log('[RegisterScreen] handleSignUp started');
    // Validate with Zod
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      phoneNumber,
      userType: userRole ?? 'renter',
      password,
      confirmPassword,
    });

    if (!result.success) {
      console.log('[RegisterScreen] Validation failed:', result.error);
      // Map errors to fields
      const errors: Partial<Record<keyof RegisterFormFields, string>> = {};
      (result.error as z.ZodError<RegisterFormFields>).issues.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormFields;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setLoading(true);
    console.log('[RegisterScreen] Starting registration process');

    try {
      // Check for unique email in users table
      console.log('[RegisterScreen] Checking email uniqueness');
      const { data: existingEmailUsers, error: emailCheckError } = await supabase
        .from('users')
        .select('user_id, email')
        .eq('email', email);

      if (emailCheckError) {
        console.error('[RegisterScreen] Email check error:', emailCheckError);
        throw new Error('Could not verify email uniqueness.');
      }

      if (existingEmailUsers && existingEmailUsers.length > 0) {
        console.log('[RegisterScreen] Email already in use');
        setLoading(false);
        setFormErrors({ email: 'Email already in use' });
        return;
      }

      // Check for unique phone number in users table
      console.log('[RegisterScreen] Checking phone number uniqueness');
      const { data: existingPhoneUsers, error: phoneCheckError } = await supabase
        .from('users')
        .select('user_id, phone_number')
        .eq('phone_number', phoneNumber);

      if (phoneCheckError) {
        console.error('[RegisterScreen] Phone check error:', phoneCheckError);
        throw new Error('Could not verify phone number uniqueness.');
      }

      if (existingPhoneUsers && existingPhoneUsers.length > 0) {
        console.log('[RegisterScreen] Phone number already in use');
        setLoading(false);
        setFormErrors({ phoneNumber: 'Phone number already in use' });
        return;
      }

      // All checks passed - now create auth user
      console.log('[RegisterScreen] Creating auth user');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error('[RegisterScreen] Auth error:', authError);
        throw new Error(authError?.message || 'Could not create authentication account.');
      }

      console.log('[RegisterScreen] Auth user created:', authData.user.id);

      if (!authData.session) {
        console.log('[RegisterScreen] No session, email verification required');
        setLoading(false);
        Alert.alert(
          'Email Verification Required',
          'Please check your email to verify your account before logging in.'
        );
        return;
      }

      // Create user profile immediately after auth user is created
      console.log('[RegisterScreen] Creating user profile in database');
      const createdDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const timestamp = new Date().toISOString().replace('Z', ''); // Remove 'Z' for timestamp without time zone

      const { error: userError } = await supabase.from('users').insert([
        {
          auth_id: authData.user.id,
          first_name: toTitleCase(firstName),
          last_name: toTitleCase(lastName),
          email,
          phone_number: phoneNumber,
          user_type: userRole ?? 'renter',
          account_created_date: createdDate,
          last_login_date: timestamp,
          // Profile picture, birth date, and preferences handled in PreferencesScreen
        },
      ]);

      if (userError) {
        console.error('[RegisterScreen] User profile creation error:', userError);
        // This shouldn't happen since we pre-checked, but if it does, clean up
        await supabase.auth.signOut();
        throw new Error('Failed to create user profile: ' + userError.message);
      }

      console.log('[RegisterScreen] User profile created, fetching complete profile');
      // Fetch the complete user profile including user_id
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (fetchError || !userData) {
        console.error('[RegisterScreen] Profile fetch error:', fetchError);
        await supabase.auth.signOut();
        throw new Error('Failed to fetch user profile after registration.');
      }

      console.log('[RegisterScreen] Profile fetched successfully:', userData.user_id);

      // Success - update local state with complete user profile
      // DO NOT set isLoggedIn yet - let the user complete onboarding flow first
      console.log('[RegisterScreen] Updating local state');
      setUserRole(userData.user_type);
      setUserProfile(userData);

      // Set device flag - this device has now been onboarded
      await AsyncStorage.setItem('DeviceOnboarded', 'true');

      console.log('[RegisterScreen] Registration complete, navigating to Welcome');
      setLoading(false);

      // Navigate to Welcome screen to continue onboarding
      // Note: Don't set isLoggedIn yet - Welcome screen is in the logged-out stack
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('[RegisterScreen] Registration error:', error);
      setLoading(false);
      Alert.alert(
        'Registration Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
      return;
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('RoleSelection');
    }
  };

  const handleLogin = async () => {
    // Set the device flag so next time app opens it goes to Auth screen
    await AsyncStorage.setItem('DeviceOnboarded', 'true');
    navigation.navigate('Auth');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service not yet available');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy not yet available');
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}>
        <BackButton onPress={handleGoBack} />
        <Text className="mb-2 mt-6 text-center text-4xl font-bold text-primary">
          Create your account
        </Text>
        <Text className="mb-8 text-center text-base italic text-muted-foreground">
          Your perfect place awaits!
        </Text>

        <View className="w-full max-w-sm gap-4 self-center">
          <Input
            placeholder="First Name"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
            error={formErrors.firstName}
          />
          <Input
            placeholder="Last Name"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
            error={formErrors.lastName}
          />
          <Input
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={formErrors.email}
          />
          <Input
            placeholder="Phone Number"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={formErrors.phoneNumber}
          />
          {/* Role selection removed as per request */}
          <Input
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={formErrors.password}
          />
          <Input
            placeholder="Confirm Password"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={formErrors.confirmPassword}
          />

          <Button onPress={handleSignUp} variant="primary" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <View className="mt-6 items-center">
            <View className="flex-row">
              <Text className="text-sm text-muted-foreground">Already have an account? </Text>
              <Button
                onPress={handleLogin}
                variant="text"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#000', // or any color
                }}>
                Log in
              </Button>
            </View>
          </View>

          <View className="mt-4 items-center">
            <View className="flex-row flex-wrap justify-center">
              <Text className="text-center  text-muted-foreground">
                By creating an account, you agree with our{' '}
              </Text>
              <Button onPress={handleTermsOfService} variant="text">
                Terms of Service
              </Button>
              <Text className=" text-muted-foreground"> and </Text>
              <Button onPress={handlePrivacyPolicy} variant="text">
                Privacy Policy
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
