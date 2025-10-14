import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ProfilePicturePicker from '../../components/ProfilePicturePicker';
import RadioGroup from '../../components/RadioGroup';
import LocationPicker from '../../components/LocationPicker';
import DatePicker from '../../components/DatePicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

type DetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Details'>;

type Props = {
  navigation: DetailsScreenNavigationProp;
};

// Schema for renters
const renterSchema = z
  .object({
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
  profilePicture: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
});

type RenterFormFields = z.infer<typeof renterSchema>;
type OwnerFormFields = z.infer<typeof ownerSchema>;

export default function DetailsScreen({ navigation }: Props) {
  const { userRole, setUserProfile, userProfile, setIsLoggedIn } = useLoggedIn();

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

  // Parse existing price range if available
  useState(() => {
    if (userProfile?.price_range) {
      const [min, max] = userProfile.price_range.split('-');
      if (min) setMinBudget(min);
      if (max) setMaxBudget(max);
    }
  });

  const handleSkip = async () => {
    // Set onboarding flag without saving
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setIsLoggedIn(true);
  };

  const handleSaveDetails = async () => {
    // Validate based on role
    if (userRole === 'renter') {
      const result = renterSchema.safeParse({
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

    // Build price range string for renters
    const priceRange =
      userRole === 'renter' && minBudget && maxBudget ? `${minBudget}-${maxBudget}` : null;

    // Update details in Supabase
    if (userProfile?.auth_id) {
      const updateData: any = {
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
      profile_picture: profilePicture || null,
      birth_date: birthDate || null,
      ...(userRole === 'renter' && {
        price_range: priceRange,
        room_preference: roomPreference || null,
        occupation: occupation || null,
        place_of_work_study: placeOfWorkStudy || null,
      }),
    });

    // Set onboarding flag
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

    setIsLoggedIn(true);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 py-8"
      style={{ paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
      <Text className="mb-2 text-center text-3xl font-bold text-primary">
        Complete Your Profile
      </Text>
      <Text className="mb-8 text-center text-base text-muted-foreground">
        Help us personalize your experience
      </Text>

      <View className="w-full max-w-sm self-center">
        {/* Profile Picture Picker - All roles */}
        <ProfilePicturePicker
          value={profilePicture}
          onChange={setProfilePicture}
          authId={userProfile?.auth_id || ''}
        />

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
            <View className="rounded-lg border border-primary bg-secondary p-4">
              <Text className="mb-2 text-lg font-semibold text-primary">
                Find Your Perfect Place
              </Text>
              <Text className="text-base leading-6 text-muted-foreground">
                These preferences are optional, but they help us recommend rentals that match you
                the best. The more you share, the more we can personalize your search!
              </Text>
            </View>
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

          <Button onPress={handleSkip} variant="secondary">
            Skip for Now
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
