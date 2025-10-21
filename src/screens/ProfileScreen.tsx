import { View, Text, ScrollView, Alert, Platform, Image, ActivityIndicator } from 'react-native';
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
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationWithProperty } from '../types/property';
import { MapPin } from 'lucide-react-native';

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

  // Current Rental state
  const [currentRental, setCurrentRental] = useState<ApplicationWithProperty | null>(null);
  const [isLoadingRental, setIsLoadingRental] = useState(true);
  const [showEndRentalModal, setShowEndRentalModal] = useState(false);
  const [isEndingRental, setIsEndingRental] = useState(false);

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

  // Fetch current rental for renters
  useEffect(() => {
    if (userRole === 'renter') {
      fetchCurrentRental();
    } else {
      setIsLoadingRental(false);
    }
  }, [userProfile, userRole]);

  const fetchCurrentRental = async () => {
    if (!userProfile?.user_id) {
      setIsLoadingRental(false);
      return;
    }

    try {
      console.log('[ProfileScreen] Fetching current rental for renter_id:', userProfile.user_id);

      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          application_id,
          property_id,
          renter_id,
          owner_id,
          status,
          message,
          date_applied,
          date_updated,
          property:properties (
            property_id,
            owner_id,
            title,
            description,
            category,
            street,
            barangay,
            city,
            coordinates,
            image_url,
            rent,
            amenities,
            rating,
            max_renters,
            is_available,
            is_verified,
            has_internet,
            allows_pets,
            is_furnished,
            has_ac,
            is_secure,
            has_parking,
            number_reviews
          )
        `
        )
        .eq('renter_id', userProfile.user_id)
        .eq('status', 'approved')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned", which is fine
          console.error('[ProfileScreen] Error fetching current rental:', error);
        } else {
          console.log('[ProfileScreen] No current rental found (approved application)');
        }
        setCurrentRental(null);
      } else if (data) {
        console.log('[ProfileScreen] Current rental found:', {
          application_id: data.application_id,
          property_id: data.property_id,
        });

        const transformedData: ApplicationWithProperty = {
          application_id: data.application_id,
          property_id: data.property_id,
          renter_id: data.renter_id,
          owner_id: data.owner_id,
          status: data.status,
          message: data.message,
          date_applied: data.date_applied,
          date_updated: data.date_updated,
          property: data.property,
        };
        setCurrentRental(transformedData);
      }
    } catch (error) {
      console.error('[ProfileScreen] Error fetching current rental:', error);
      setCurrentRental(null);
    } finally {
      setIsLoadingRental(false);
    }
  };

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
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', 'Failed to log out: ' + error.message);
              return;
            }
            setIsLoggedIn(false);
          },
        },
      ]
    );
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
            // Only remove user-specific flag, NOT the device flag
            if (userProfile?.user_id) {
              await AsyncStorage.removeItem(`user_${userProfile.user_id}_hasCompletedOnboarding`);
            }
            // Do NOT remove 'DeviceOnboarded' - that's device-specific
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

  const handleEndRental = async (optionalMessage?: string) => {
    if (!currentRental || !userProfile?.user_id) {
      Alert.alert('Error', 'Unable to end rental. Please try again.');
      return;
    }

    setIsEndingRental(true);
    setShowEndRentalModal(false);

    try {
      const endDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const message = `Rental ended by tenant on ${endDate}.${optionalMessage ? ' ' + optionalMessage : ''}`;

      console.log('[ProfileScreen] Ending rental:', {
        application_id: currentRental.application_id,
        property_id: currentRental.property_id,
        message: message,
      });

      // Update application status to completed
      const { error: appError } = await supabase
        .from('applications')
        .update({
          status: 'completed',
          message: message,
          date_updated: new Date().toISOString(),
        })
        .eq('application_id', currentRental.application_id);

      if (appError) throw appError;
      console.log('[ProfileScreen] Application status updated to completed');

      // Remove rented_property FK from users table
      const { error: userError } = await supabase
        .from('users')
        .update({ rented_property: null })
        .eq('user_id', userProfile.user_id);

      if (userError) throw userError;
      console.log('[ProfileScreen] User rented_property FK removed');

      // Query current renters count for the property
      const { count: currentRentersCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rented_property', currentRental.property_id);

      if (countError) throw countError;

      console.log('[ProfileScreen] Current renters count:', currentRentersCount, '/', currentRental.property.max_renters);

      // If current renters < max_renters, set property to available
      if (
        currentRentersCount !== null &&
        currentRental.property.max_renters &&
        currentRentersCount < currentRental.property.max_renters
      ) {
        const { error: propError } = await supabase
          .from('properties')
          .update({ is_available: true })
          .eq('property_id', currentRental.property_id);

        if (propError) {
          console.error('[ProfileScreen] Error updating property availability:', propError);
          // Don't throw - rental ending was successful even if this fails
        } else {
          console.log('[ProfileScreen] Property set to available');
        }
      } else {
        console.log('[ProfileScreen] Property remains unavailable (still at capacity)');
      }

      console.log('[ProfileScreen] Rental ended successfully');
      Alert.alert('Success', 'Your rental has been ended successfully.');

      // Update local state
      setCurrentRental(null);
      setUserProfile({
        ...userProfile,
        rented_property: null,
      });
    } catch (error) {
      console.error('[ProfileScreen] Error ending rental:', error);
      Alert.alert('Error', 'Failed to end rental. Please try again.');
    } finally {
      setIsEndingRental(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-2"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 40 : 0,
          paddingBottom: Platform.OS === 'ios' ? 0 : 32,
        }}>
        <Text className="mb-2 text-center text-3xl font-bold text-primary" onPress={handleNameTap}>
          {userProfile?.full_name || 'Your Profile'}
        </Text>
        <Text className="mb-8 text-center text-base text-muted-foreground">
          {userRole === 'renter' ? 'Renter' : 'Property Owner'}
        </Text>

        {/* Current Rental Section - Renters only */}
        {userRole === 'renter' && (
          <View className="mb-6">
            {isLoadingRental ? (
              <View className="items-center justify-center rounded-xl border border-input bg-card p-6">
                <ActivityIndicator size="small" color="#644A40" />
                <Text className="mt-2 text-sm text-muted-foreground">
                  Loading current rental...
                </Text>
              </View>
            ) : currentRental ? (
              <View className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
                <View className="rounded-t-xl bg-primary px-4 py-3">
                  <Text className="text-lg font-bold text-primary-foreground">Current Rental</Text>
                </View>

                {/* Property Image */}
                {currentRental.property.image_url &&
                currentRental.property.image_url.length > 0 ? (
                  <Image
                    source={{ uri: currentRental.property.image_url[0] }}
                    className="h-48 w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-48 w-full items-center justify-center bg-secondary">
                    <Text className="text-muted-foreground">No Image</Text>
                  </View>
                )}

                {/* Property Details */}
                <View className="p-4">
                  <Text className="mb-2 text-xl font-bold text-card-foreground">
                    {currentRental.property.title}
                  </Text>

                  <View className="mb-2 flex-row items-center">
                    <MapPin size={14} color="#888" />
                    <Text className="ml-1 text-sm text-muted-foreground">
                      {currentRental.property.street && `${currentRental.property.street}, `}
                      {currentRental.property.barangay}, {currentRental.property.city}
                    </Text>
                  </View>

                  <Text className="mb-3 text-lg font-semibold text-primary">
                    ₱{currentRental.property.rent.toLocaleString()}/month
                  </Text>

                  <Button
                    variant="destructive"
                    onPress={() => setShowEndRentalModal(true)}
                    disabled={isEndingRental}>
                    {isEndingRental ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      'End Rental'
                    )}
                  </Button>
                </View>
              </View>
            ) : null}
          </View>
        )}

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
              <Button
                onPress={() => navigation.navigate('Preferences', { fromProfile: true })}
                variant="secondary">
                Edit Preferences
              </Button>
            )}

            <Button onPress={handleLogout} variant="destructive">
              Log Out
            </Button>
          </View>
        </View>
      </View>

      {/* End Rental Confirmation Modal */}
      <ConfirmationModal
        visible={showEndRentalModal}
        title="End Rental"
        message="Are you sure you want to end your current rental? This action will cancel your approved application and make the property available again."
        confirmText="End Rental"
        cancelText="Cancel"
        showMessageInput
        messageInputPlaceholder="Add an optional message (e.g., reason for ending rental)"
        messageInputLabel="Optional Message"
        confirmVariant="destructive"
        onConfirm={handleEndRental}
        onCancel={() => setShowEndRentalModal(false)}
      />
    </ScrollView>
  );
}
