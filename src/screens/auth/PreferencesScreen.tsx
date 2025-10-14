import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import { z } from 'zod';

type PreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preferences'>;

type Props = {
  navigation: PreferencesScreenNavigationProp;
};

const preferencesSchema = z.object({
  profilePicture: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  priceRange: z.string().optional().or(z.literal('')),
  roomPreference: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  placeOfWorkStudy: z.string().optional().or(z.literal('')),
});

type PreferencesFormFields = z.infer<typeof preferencesSchema>;

export default function PreferencesScreen({ navigation }: Props) {
  const { userRole, setUserProfile, userProfile, setIsLoggedIn } = useLoggedIn();

  const [profilePicture, setProfilePicture] = useState(userProfile?.profile_picture || '');
  const [birthDate, setBirthDate] = useState(userProfile?.birth_date || '');
  const [priceRange, setPriceRange] = useState(userProfile?.price_range || '');
  const [roomPreference, setRoomPreference] = useState(userProfile?.room_preference || '');
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');
  const [placeOfWorkStudy, setPlaceOfWorkStudy] = useState(userProfile?.place_of_work_study || '');
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PreferencesFormFields, string>>
  >({});

  const handleSavePreferences = async () => {
    const result = preferencesSchema.safeParse({
      profilePicture,
      birthDate,
      priceRange,
      roomPreference,
      occupation,
      placeOfWorkStudy,
    });

    if (!result.success) {
      const errors: Partial<Record<keyof PreferencesFormFields, string>> = {};
      (result.error as z.ZodError<PreferencesFormFields>).issues.forEach((err) => {
        const field = err.path[0] as keyof PreferencesFormFields;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    // Update preferences in Supabase
    if (userProfile?.auth_id) {
      const { error } = await supabase
        .from('users')
        .update({
          profile_picture: profilePicture || null,
          birth_date: birthDate || null,
          price_range: priceRange,
          room_preference: roomPreference,
          occupation,
          place_of_work_study: placeOfWorkStudy,
        })
        .eq('auth_id', userProfile.auth_id);
      if (error) {
        alert('Failed to save preferences: ' + error.message);
        return;
      }
    }

    setUserProfile({
      ...userProfile,
      profile_picture: profilePicture || null,
      birth_date: birthDate || null,
      price_range: priceRange,
      room_preference: roomPreference,
      occupation,
      place_of_work_study: placeOfWorkStudy,
    });
    setIsLoggedIn(true);
  };

  if (userRole !== 'renter') {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Preferences are only available for renters.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={undefined} className="flex-1 items-center justify-center">
      <Button
        variant="text"
        onPress={() => navigation.goBack()}
        className="mb-0 ml-4 mt-4 self-start">
        Back
      </Button>
      <Text className="mb-4 text-2xl font-bold text-gray-900">Complete Your Profile</Text>
      <View className="flex w-full max-w-sm gap-4 space-y-4">
        <Input
          placeholder="Profile Picture URL (optional)"
          autoCapitalize="none"
          value={profilePicture}
          onChangeText={setProfilePicture}
          error={formErrors.profilePicture}
        />
        <Input
          placeholder="Birth Date (YYYY-MM-DD, optional)"
          autoCapitalize="none"
          value={birthDate}
          onChangeText={setBirthDate}
          error={formErrors.birthDate}
        />
        <Input
          placeholder="Price Range (optional)"
          autoCapitalize="none"
          value={priceRange}
          onChangeText={setPriceRange}
          error={formErrors.priceRange}
        />
        <Input
          placeholder="Room Preference (optional)"
          autoCapitalize="none"
          value={roomPreference}
          onChangeText={setRoomPreference}
          error={formErrors.roomPreference}
        />
        <Input
          placeholder="Occupation (optional)"
          autoCapitalize="none"
          value={occupation}
          onChangeText={setOccupation}
          error={formErrors.occupation}
        />
        <Input
          placeholder="Place of Work/Study (optional)"
          autoCapitalize="none"
          value={placeOfWorkStudy}
          onChangeText={setPlaceOfWorkStudy}
          error={formErrors.placeOfWorkStudy}
        />
        <Button onPress={handleSavePreferences} variant="primary">
          Save Details
        </Button>
      </View>
    </ScrollView>
  );
}
