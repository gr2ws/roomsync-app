import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
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
  // Optional fields
  const [profilePicture, setProfilePicture] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [roomPreference, setRoomPreference] = useState('');
  const [occupation, setOccupation] = useState('');
  const [placeOfWorkStudy, setPlaceOfWorkStudy] = useState('');

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
      profilePicture,
      birthDate,
      priceRange,
      roomPreference,
      occupation,
      placeOfWorkStudy,
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
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error || !data.user) {
      setLoading(false);
      Alert.alert('Registration Error', error?.message || 'Could not register user.');
      return;
    }
    if (!data.session) {
      setLoading(false);
      Alert.alert('Registration Successful', 'Please log in to complete your registration.');
      return;
    }
    // Ensure the client context is authenticated
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    // Insert into users table as authenticated user
    const { error: userError } = await supabase.from('users').insert([
      {
        auth_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        user_type: userRole ?? 'renter',
        profile_picture: profilePicture || null,
        birth_date: birthDate || null,
        price_range: priceRange || null,
        room_preference: roomPreference || null,
        occupation: occupation || null,
        place_of_work_study: placeOfWorkStudy || null,
      },
    ]);
    setLoading(false);
    if (userError) {
      Alert.alert('Registration Error', userError.message);
      return;
    }
    setUserRole(userRole ?? 'renter');
    setUserProfile({
      auth_id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      user_type: userRole ?? 'renter',
      profile_picture: profilePicture || null,
      birth_date: birthDate || null,
      price_range: priceRange || null,
      room_preference: roomPreference || null,
      occupation: occupation || null,
      place_of_work_study: placeOfWorkStudy || null,
    });
    setIsLoggedIn(true);
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google Registration', 'Google registration functionality not yet implemented');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service not yet available');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy not yet available');
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text className="mb-4 text-4xl font-bold text-gray-900">Join us</Text>
      <Text className="mb-8 text-center text-lg text-gray-600">Find your perfect place</Text>

      <View className="flex w-full max-w-sm gap-4 space-y-4">
        <TextInput
          placeholder="First Name"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
        />
        {formErrors.firstName && (
          <Text className="text-xs text-red-500">{formErrors.firstName}</Text>
        )}
        <TextInput
          placeholder="Last Name"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
        />
        {formErrors.lastName && <Text className="text-xs text-red-500">{formErrors.lastName}</Text>}
        <TextInput
          placeholder="Email"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {formErrors.email && <Text className="text-xs text-red-500">{formErrors.email}</Text>}
        <TextInput
          placeholder="Phone Number"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          keyboardType="phone-pad"
          autoCapitalize="none"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        {formErrors.phoneNumber && (
          <Text className="text-xs text-red-500">{formErrors.phoneNumber}</Text>
        )}
        {/* Role selection removed as per request */}
        <TextInput
          placeholder="Password"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        {formErrors.password && <Text className="text-xs text-red-500">{formErrors.password}</Text>}
        <TextInput
          placeholder="Confirm Password"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          secureTextEntry
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {formErrors.confirmPassword && (
          <Text className="text-xs text-red-500">{formErrors.confirmPassword}</Text>
        )}
        {/* Optional fields */}
        <TextInput
          placeholder="Profile Picture URL (optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={profilePicture}
          onChangeText={setProfilePicture}
        />
        {formErrors.profilePicture && (
          <Text className="text-xs text-red-500">{formErrors.profilePicture}</Text>
        )}
        <TextInput
          placeholder="Birth Date (YYYY-MM-DD, optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={birthDate}
          onChangeText={setBirthDate}
        />
        {formErrors.birthDate && (
          <Text className="text-xs text-red-500">{formErrors.birthDate}</Text>
        )}
        <TextInput
          placeholder="Price Range (optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={priceRange}
          onChangeText={setPriceRange}
        />
        {formErrors.priceRange && (
          <Text className="text-xs text-red-500">{formErrors.priceRange}</Text>
        )}
        <TextInput
          placeholder="Room Preference (optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={roomPreference}
          onChangeText={setRoomPreference}
        />
        {formErrors.roomPreference && (
          <Text className="text-xs text-red-500">{formErrors.roomPreference}</Text>
        )}
        <TextInput
          placeholder="Occupation (optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={occupation}
          onChangeText={setOccupation}
        />
        {formErrors.occupation && (
          <Text className="text-xs text-red-500">{formErrors.occupation}</Text>
        )}
        <TextInput
          placeholder="Place of Work/Study (optional)"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="none"
          value={placeOfWorkStudy}
          onChangeText={setPlaceOfWorkStudy}
        />
        {formErrors.placeOfWorkStudy && (
          <Text className="text-xs text-red-500">{formErrors.placeOfWorkStudy}</Text>
        )}

        <Button onPress={handleSignUp} variant="primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>

        <Button onPress={handleGoogleSignUp} variant="secondary">
          Continue with Google
        </Button>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Already have an account? </Text>
            <Button onPress={handleLogin} variant="text">
              Log in
            </Button>
          </View>
        </View>

        <View className="mt-4 items-center">
          <View className="flex-row flex-wrap justify-center">
            <Text className="text-center text-sm text-gray-600">
              By creating an account, you agree with our{' '}
            </Text>
            <Button onPress={handleTermsOfService} variant="text" size="sm">
              Terms of Service
            </Button>
            <Text className="text-sm text-gray-600"> and </Text>
            <Button onPress={handlePrivacyPolicy} variant="text" size="sm">
              Privacy Policy
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
