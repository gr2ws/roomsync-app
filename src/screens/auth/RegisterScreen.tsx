import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { z } from 'zod';

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

export default function RegisterScreen({ navigation }: Props) {
  const { setIsLoggedIn, setUserRole, setUserProfile, userRole } = useLoggedIn();

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

    try {
      // Check for unique email in users table
      const { data: existingEmailUsers, error: emailCheckError } = await supabase
        .from('users')
        .select('user_id, email')
        .eq('email', email);

      if (emailCheckError) {
        throw new Error('Could not verify email uniqueness.');
      }

      if (existingEmailUsers && existingEmailUsers.length > 0) {
        setLoading(false);
        setFormErrors({ email: 'Email already in use' });
        return;
      }

      // Check for unique phone number in users table
      const { data: existingPhoneUsers, error: phoneCheckError } = await supabase
        .from('users')
        .select('user_id, phone_number')
        .eq('phone_number', phoneNumber);

      if (phoneCheckError) {
        throw new Error('Could not verify phone number uniqueness.');
      }

      if (existingPhoneUsers && existingPhoneUsers.length > 0) {
        setLoading(false);
        setFormErrors({ phoneNumber: 'Phone number already in use' });
        return;
      }

      // All checks passed - now create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Could not create authentication account.');
      }

      if (!authData.session) {
        setLoading(false);
        Alert.alert(
          'Email Verification Required',
          'Please check your email to verify your account before logging in.'
        );
        return;
      }

      // Set session context
      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      // Create user profile (this should succeed since we checked uniqueness)
      const { error: userError } = await supabase.from('users').insert([
        {
          auth_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phoneNumber,
          user_type: userRole ?? 'renter',
          // Profile picture, birth date, and preferences handled in PreferencesScreen
        },
      ]);

      if (userError) {
        // This shouldn't happen since we pre-checked, but if it does, clean up
        await supabase.auth.signOut();
        throw new Error('Failed to create user profile: ' + userError.message);
      }

      // Success - update local state
      setUserRole(userRole ?? 'renter');
      setUserProfile({
        auth_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        user_type: userRole ?? 'renter',
        // Profile picture, birth date, and preferences handled in PreferencesScreen
      });

      setLoading(false);

      // Navigate to Welcome screen for all users
      // Navigate to Welcome screen
      navigation.navigate('Welcome');
    } catch (error) {
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
    // Set the onboarding flag so next time app opens it goes to Auth screen
    await AsyncStorage.setItem('app_has_seen_onboarding', 'true');
    navigation.navigate('Auth');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service not yet available');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy not yet available');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerClassName="px-6 pb-8 pt-2"
        contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 36 : 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <BackButton onPress={handleGoBack} />
        <Text className="mb-2 mt-6 text-center text-4xl font-bold text-primary">
          Create your account
        </Text>
        <Text className="mb-8 text-center text-base text-muted-foreground">
          Your perfect place awaits
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
              <Button onPress={handleLogin} variant="text">
                Log in
              </Button>
            </View>
          </View>

          <View className="mt-4 items-center">
            <View className="flex-row flex-wrap justify-center">
              <Text className="text-center text-xs text-muted-foreground">
                By creating an account, you agree with our{' '}
              </Text>
              <Button onPress={handleTermsOfService} variant="text" size="sm">
                Terms of Service
              </Button>
              <Text className="text-xs text-muted-foreground"> and </Text>
              <Button onPress={handlePrivacyPolicy} variant="text" size="sm">
                Privacy Policy
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
