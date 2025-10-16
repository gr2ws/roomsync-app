import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoggedIn } from '../store/useLoggedIn';
import { supabase } from '../utils/supabase';
import { z } from 'zod';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfilePicturePicker from '../components/ProfilePicturePicker';
import RadioGroup from '../components/RadioGroup';
import LocationPicker from '../components/LocationPicker';
import DatePicker from '../components/DatePicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';

// Schema for renters
const renterSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
    profilePicture: z.string().optional().or(z.literal('')),
    birthDate: z.string().optional().or(z.literal('')),
    minBudget: z.string().optional().or(z.literal('')),
    maxBudget: z.string().optional().or(z.literal('')),
    roomPreference: z.string().optional().or(z.literal('')),
    occupation: z.string().optional().or(z.literal('')),
    placeOfWorkStudy: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.minBudget && data.maxBudget) {
        const min = parseFloat(data.minBudget);
        const max = parseFloat(data.maxBudget);
        return !isNaN(min) && !isNaN(max) && min < max;
      }
      return true;
    },
    {
      message: 'Minimum budget must be less than maximum budget',
      path: ['maxBudget'],
    }
  );

// Schema for owners
const ownerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  profilePicture: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
});

type RenterFormFields = z.infer<typeof renterSchema>;
type OwnerFormFields = z.infer<typeof ownerSchema>;

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { setIsLoggedIn, userProfile, setUserProfile, userRole } = useLoggedIn();
  const [tapCount, setTapCount] = useState(0);

  // Form fields
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');
  const [profilePicture, setProfilePicture] = useState(userProfile?.profile_picture || '');
  const [birthDate, setBirthDate] = useState(userProfile?.birth_date || '');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [roomPreference, setRoomPreference] = useState(userProfile?.room_preference || '');
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');
  const [placeOfWorkStudy, setPlaceOfWorkStudy] = useState(userProfile?.place_of_work_study || '');

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RenterFormFields | keyof OwnerFormFields, string>>
  >({});

  // Initialize budget fields from price_range and reset fields when userProfile changes
  useEffect(() => {
    setFirstName(userProfile?.first_name || '');
    setLastName(userProfile?.last_name || '');
    setPhoneNumber(userProfile?.phone_number || '');
    setProfilePicture(userProfile?.profile_picture || '');
    setBirthDate(userProfile?.birth_date || '');
    setRoomPreference(userProfile?.room_preference || '');
    setOccupation(userProfile?.occupation || '');
    setPlaceOfWorkStudy(userProfile?.place_of_work_study || '');

    if (userProfile?.price_range) {
      const [min, max] = userProfile.price_range.split('-');
      if (min) setMinBudget(min);
      if (max) setMaxBudget(max);
    } else {
      setMinBudget('');
      setMaxBudget('');
    }
  }, [userProfile]);

  // Store initial values to detect changes
  const initialValues = useMemo(
    () => ({
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
      phoneNumber: userProfile?.phone_number || '',
      profilePicture: userProfile?.profile_picture || '',
      birthDate: userProfile?.birth_date || '',
      minBudget: userProfile?.price_range ? userProfile.price_range.split('-')[0] : '',
      maxBudget: userProfile?.price_range ? userProfile.price_range.split('-')[1] : '',
      roomPreference: userProfile?.room_preference || '',
      occupation: userProfile?.occupation || '',
      placeOfWorkStudy: userProfile?.place_of_work_study || '',
    }),
    [userProfile]
  );

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return (
      firstName !== initialValues.firstName ||
      lastName !== initialValues.lastName ||
      phoneNumber !== initialValues.phoneNumber ||
      profilePicture !== initialValues.profilePicture ||
      birthDate !== initialValues.birthDate ||
      minBudget !== initialValues.minBudget ||
      maxBudget !== initialValues.maxBudget ||
      roomPreference !== initialValues.roomPreference ||
      occupation !== initialValues.occupation ||
      placeOfWorkStudy !== initialValues.placeOfWorkStudy
    );
  }, [
    firstName,
    lastName,
    phoneNumber,
    profilePicture,
    birthDate,
    minBudget,
    maxBudget,
    roomPreference,
    occupation,
    placeOfWorkStudy,
    initialValues,
  ]);

  const handleProfilePictureChange = async (newUrl: string) => {
    setProfilePicture(newUrl);

    // Update the database with the new profile picture URL
    if (userProfile?.auth_id && newUrl) {
      const { error } = await supabase
        .from('users')
        .update({ profile_picture: newUrl })
        .eq('auth_id', userProfile.auth_id);

      if (error) {
        console.error('Error updating profile picture in database:', error);
      }
    }

    // Update global state to reflect the change immediately in UI
    setUserProfile({
      ...userProfile,
      profile_picture: newUrl,
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'Failed to log out: ' + error.message);
      return;
    }
    setIsLoggedIn(false);
  };

  const handleNameTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 5) {
      Alert.alert('Developer Options', 'Reset onboarding and logout?', [
        {
          text: 'Cancel',
          onPress: () => setTapCount(0),
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            if (userProfile?.user_id) {
              await AsyncStorage.removeItem(`user_${userProfile.user_id}_has_completed_onboarding`);
            }
            await AsyncStorage.removeItem('hasCompletedOnboarding');
            setIsLoggedIn(false);
            setTapCount(0);
          },
          style: 'destructive',
        },
      ]);
    }

    // Reset tap count after 2 seconds
    setTimeout(() => setTapCount(0), 2000);
  };

  const handleSaveDetails = async () => {
    // Check if there are any changes
    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes have been made to save.');
      return;
    }

    // Validate based on role
    if (userRole === 'renter') {
      const result = renterSchema.safeParse({
        firstName,
        lastName,
        phoneNumber,
        profilePicture,
        birthDate,
        minBudget,
        maxBudget,
        roomPreference,
        occupation,
        placeOfWorkStudy,
      });

      if (!result.success) {
        const errors: Partial<Record<keyof RenterFormFields, string>> = {};
        (result.error as z.ZodError<RenterFormFields>).issues.forEach((err) => {
          const field = err.path[0] as keyof RenterFormFields;
          errors[field] = err.message;
        });
        setFormErrors(errors);
        return;
      }
    } else {
      // Owner validation
      const result = ownerSchema.safeParse({
        firstName,
        lastName,
        phoneNumber,
        profilePicture,
        birthDate,
      });

      if (!result.success) {
        const errors: Partial<Record<keyof OwnerFormFields, string>> = {};
        (result.error as z.ZodError<OwnerFormFields>).issues.forEach((err) => {
          const field = err.path[0] as keyof OwnerFormFields;
          errors[field] = err.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setFormErrors({});

    // Check if phone number has changed and verify uniqueness
    if (phoneNumber !== userProfile?.phone_number) {
      const { data: existingPhoneUsers, error: phoneCheckError } = await supabase
        .from('users')
        .select('user_id, phone_number')
        .eq('phone_number', phoneNumber)
        .neq('auth_id', userProfile?.auth_id || '');

      if (phoneCheckError) {
        Alert.alert('Error', 'Could not verify phone number uniqueness.');
        return;
      }

      if (existingPhoneUsers && existingPhoneUsers.length > 0) {
        setFormErrors({ phoneNumber: 'Phone number already in use' });
        return;
      }
    }

    // Build price range string for renters
    const priceRange =
      userRole === 'renter' && minBudget && maxBudget ? `${minBudget}-${maxBudget}` : null;

    // Update details in Supabase
    if (userProfile?.auth_id) {
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        birth_date: birthDate || null,
        profile_picture: profilePicture || null,
      };

      // Add renter-specific fields
      if (userRole === 'renter') {
        updateData.price_range = priceRange;
        updateData.room_preference = roomPreference || null;
        updateData.occupation = occupation || null;
        updateData.place_of_work_study = placeOfWorkStudy || null;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('auth_id', userProfile.auth_id);

      if (error) {
        Alert.alert('Error', 'Failed to save details: ' + error.message);
        return;
      }
    }

    // Update local state
    setUserProfile({
      ...userProfile,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      profile_picture: profilePicture || null,
      birth_date: birthDate || null,
      ...(userRole === 'renter' && {
        price_range: priceRange,
        room_preference: roomPreference || null,
        occupation: occupation || null,
        place_of_work_study: placeOfWorkStudy || null,
      }),
    });

    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 py-8"
      style={{ paddingTop: Platform.OS === 'ios' ? 40 : 20 }}>
      <Text className="mb-2 text-center text-3xl font-bold text-primary" onPress={handleNameTap}>
        {userProfile?.full_name || 'Your Profile'}
      </Text>
      <Text className="mb-8 text-center text-base text-muted-foreground">
        {userRole === 'renter' ? 'Renter' : 'Property Owner'}
      </Text>

      <View className="w-full max-w-sm self-center">
        {/* Profile Picture Picker - All roles */}
        <ProfilePicturePicker
          value={profilePicture}
          onChange={handleProfilePictureChange}
          authId={userProfile?.auth_id || ''}
        />

        {/* Basic Information - All roles */}
        <View className="gap-4">
          <View>
            <Text className="mb-2 text-base font-medium text-foreground">First Name</Text>
            <Input
              placeholder="Enter your first name"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
              error={formErrors.firstName}
            />
          </View>
          <View>
            <Text className="mb-2 text-base font-medium text-foreground">Last Name</Text>
            <Input
              placeholder="Enter your last name"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
              error={formErrors.lastName}
            />
          </View>
          <View>
            <Text className="mb-2 text-base font-medium text-foreground">Phone Number</Text>
            <Input
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={formErrors.phoneNumber}
            />
          </View>
        </View>

        {/* Birth Date - All roles */}
        <DatePicker
          label="Birth Date"
          placeholder="Select your birth date"
          value={birthDate}
          onChange={setBirthDate}
          error={formErrors.birthDate}
        />

        {/* Renter-specific fields */}
        {userRole === 'renter' && (
          <View className="flex-1 gap-4">
            <View>
              <Text className="mb-2 text-base font-medium text-foreground">
                Monthly Budget Range
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    placeholder="Min. Budget"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    value={minBudget}
                    onChangeText={setMinBudget}
                    error={formErrors.minBudget}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    placeholder="Max. Budget"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    error={formErrors.maxBudget}
                  />
                </View>
              </View>
            </View>

            {/* Room Preference Radio Group */}
            <RadioGroup
              label="Room Preference"
              options={['Bedspace', 'Room', 'Apartment']}
              value={roomPreference}
              onChange={setRoomPreference}
              error={formErrors.roomPreference}
            />

            {/* Occupation Radio Group */}
            <RadioGroup
              label="Occupation"
              options={['Student', 'Employee']}
              value={occupation}
              onChange={setOccupation}
              error={formErrors.occupation}
            />

            {/* Place of Work/Study - Map Picker */}
            <LocationPicker
              label="Place of Work/Study"
              value={placeOfWorkStudy}
              onChange={setPlaceOfWorkStudy}
              placeholder="Select location on map"
              error={formErrors.placeOfWorkStudy}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View className="mt-2 gap-2">
          <Button onPress={handleSaveDetails} variant="primary">
            Save Details
          </Button>

          {userRole === 'renter' && (
            <Button onPress={() => navigation.navigate('Preferences', { fromProfile: true })} variant="secondary">
              Edit Preferences
            </Button>
          )}

          <Button onPress={handleLogout} variant="secondary">
            Log Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
