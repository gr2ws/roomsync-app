import { View, Text, ScrollView, Alert, Platform, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoggedIn } from '../store/useLoggedIn';
import { supabase } from '../utils/supabase';
import { z } from 'zod';
import Button from '../components/Button';
import SmallButton from '../components/SmallButton';
import Input from '../components/Input';
import ProfilePicturePicker from '../components/ProfilePicturePicker';
import RadioGroup from '../components/RadioGroup';
import LocationPicker from '../components/LocationPicker';
import DatePicker from '../components/DatePicker';
import ConfirmationModal from '../components/ConfirmationModal';
import ReviewModal from '../components/ReviewModal';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationWithProperty } from '../types/property';
import { MapPin } from 'lucide-react-native';
import { RootStackParamList, RootTabParamList } from '../utils/navigation';

// Define the composite navigation prop type
type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Separate component for Current Rental to isolate re-renders
function CurrentRentalCard({
  currentRental,
  isEndingRental,
  onEndRental,
  onContactOwner,
  onReview,
  canReview,
}: {
  currentRental: ApplicationWithProperty;
  isEndingRental: boolean;
  onEndRental: () => void;
  onContactOwner: () => void;
  onReview: () => void;
  canReview: boolean;
}) {
  console.log('[CurrentRentalCard] Rendering');

  if (!currentRental.property) {
    return null;
  }

  return (
    <View className="overflow-hidden rounded-lg border border-input bg-card p-4 shadow-sm">
      {/* Property Details */}
      <Text className="mb-2 text-lg font-bold text-card-foreground">
        {currentRental.property.title || 'Untitled Property'}
      </Text>

      <View className="mb-2 flex-row items-center">
        <MapPin size={14} color="#888" />
        <Text className="ml-1 flex-1 text-sm text-muted-foreground">
          {currentRental.property.street && `${currentRental.property.street}, `}
          {currentRental.property.barangay}, {currentRental.property.city}
        </Text>
      </View>

      <Text className="mb-3 text-base font-semibold text-primary">
        ₱{(currentRental.property.rent || 0).toLocaleString()}/month
      </Text>

      {/* Action Buttons */}
      <View className="flex-row flex-wrap gap-2">
        <SmallButton
          variant="destructive"
          onPress={onEndRental}
          disabled={isEndingRental}
          className="flex-1">
          {isEndingRental ? <ActivityIndicator size="small" color="#fff" /> : 'End Rental'}
        </SmallButton>
        <SmallButton variant="secondary" onPress={onContactOwner} className="flex-1">
          Contact Owner
        </SmallButton>
        <SmallButton variant="primary" onPress={onReview} disabled={!canReview} className="flex-1">
          Review
        </SmallButton>
      </View>
    </View>
  );
}

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

export default function ProfileScreen() {
  console.log('[ProfileScreen] Component render started');
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  console.log('[ProfileScreen] useNavigation called, navigation exists:', !!navigation);
  const { setIsLoggedIn, userProfile, setUserProfile, userRole } = useLoggedIn();
  console.log('[ProfileScreen] useLoggedIn called, userRole:', userRole);
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
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState<string | null>(null);

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [endedRental, setEndedRental] = useState<ApplicationWithProperty | null>(null);

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
  const fetchCurrentRental = useCallback(async () => {
    console.log('[ProfileScreen - fetchCurrentRental] START');
    console.log('[ProfileScreen - fetchCurrentRental] userProfile:', {
      user_id: userProfile?.user_id,
      user_type: userRole,
      exists: !!userProfile,
    });

    if (!userProfile?.user_id) {
      console.log('[ProfileScreen - fetchCurrentRental] No user_id, aborting fetch');
      // Don't call setIsLoadingRental here - it may be called during render
      // The useEffect that calls this will handle setting isLoadingRental to false
      return;
    }

    console.log('[ProfileScreen - fetchCurrentRental] Setting isLoadingRental to true');
    setIsLoadingRental(true);

    try {
      console.log(
        '[ProfileScreen - fetchCurrentRental] Querying Supabase for renter_id:',
        userProfile.user_id
      );

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
          console.error('[ProfileScreen - fetchCurrentRental] ERROR fetching rental:', error);
          console.error('[ProfileScreen - fetchCurrentRental] Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
          });
        } else {
          console.log(
            '[ProfileScreen - fetchCurrentRental] No current rental found (PGRST116 - no rows)'
          );
        }
        console.log('[ProfileScreen - fetchCurrentRental] Setting currentRental to null');
        setCurrentRental(null);
      } else if (data) {
        console.log('[ProfileScreen - fetchCurrentRental] Data received from Supabase:', {
          application_id: data.application_id,
          property_id: data.property_id,
          has_property: !!data.property,
          property_type: Array.isArray(data.property) ? 'array' : typeof data.property,
        });

        console.log('[ProfileScreen - fetchCurrentRental] Raw property data:', data.property);

        // Ensure property is treated as a single object (Supabase foreign key relation)
        const property = Array.isArray(data.property) ? data.property[0] : data.property;
        console.log('[ProfileScreen - fetchCurrentRental] Property after array check:', {
          is_array: Array.isArray(data.property),
          property_exists: !!property,
          property_id: property?.property_id,
        });

        // Validate that property exists and has required fields
        if (!property || !property.property_id) {
          console.error(
            '[ProfileScreen - fetchCurrentRental] INVALID property data received:',
            property
          );
          console.error(
            '[ProfileScreen - fetchCurrentRental] Setting currentRental to null due to invalid property'
          );
          setCurrentRental(null);
          return;
        }

        console.log(
          '[ProfileScreen - fetchCurrentRental] Property validation passed, creating transformedData'
        );
        const transformedData: ApplicationWithProperty = {
          application_id: data.application_id,
          property_id: data.property_id,
          renter_id: data.renter_id,
          owner_id: data.owner_id,
          status: data.status,
          message: data.message,
          date_applied: data.date_applied,
          date_updated: data.date_updated,
          property: property,
        };
        console.log(
          '[ProfileScreen - fetchCurrentRental] Setting current rental with transformed data:',
          {
            has_property: !!transformedData.property,
            property_id: transformedData.property?.property_id,
            property_title: transformedData.property?.title,
            property_keys: transformedData.property ? Object.keys(transformedData.property) : [],
          }
        );
        console.log('[ProfileScreen - fetchCurrentRental] About to call setCurrentRental...');
        setCurrentRental(transformedData);
        console.log('[ProfileScreen - fetchCurrentRental] setCurrentRental called successfully');

        // Check if user has already reviewed this property
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('review_id')
          .eq('user_id', userProfile.user_id)
          .eq('property_id', data.property_id)
          .maybeSingle();

        if (reviewError) {
          console.error(
            '[ProfileScreen - fetchCurrentRental] Error checking for review:',
            reviewError
          );
        } else {
          setHasExistingReview(!!reviewData);
          console.log(
            '[ProfileScreen - fetchCurrentRental] User has existing review:',
            !!reviewData
          );
        }

        // Fetch owner's phone number
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('phone_number')
          .eq('user_id', data.owner_id)
          .single();

        if (ownerError) {
          console.error(
            '[ProfileScreen - fetchCurrentRental] Error fetching owner phone:',
            ownerError
          );
          setOwnerPhoneNumber(null);
        } else {
          setOwnerPhoneNumber(ownerData?.phone_number || null);
          console.log('[ProfileScreen - fetchCurrentRental] Owner phone fetched');
        }
      } else {
        console.log('[ProfileScreen - fetchCurrentRental] No data and no error (unexpected state)');
        setCurrentRental(null);
      }
    } catch (error) {
      console.error('[ProfileScreen - fetchCurrentRental] CATCH block - Unexpected error:', error);
      console.error(
        '[ProfileScreen - fetchCurrentRental] Error stack:',
        error instanceof Error ? error.stack : 'No stack'
      );
      setCurrentRental(null);
    } finally {
      console.log(
        '[ProfileScreen - fetchCurrentRental] FINALLY block - Setting isLoadingRental to false'
      );
      setIsLoadingRental(false);
      console.log('[ProfileScreen - fetchCurrentRental] END');
    }
  }, [userProfile]);

  useEffect(() => {
    console.log('[ProfileScreen - useEffect] Rental fetch effect triggered');
    console.log('[ProfileScreen - useEffect] userRole:', userRole);
    console.log('[ProfileScreen - useEffect] userProfile exists:', !!userProfile);
    console.log('[ProfileScreen - useEffect] isLoadingRental:', isLoadingRental);

    if (userRole === 'renter') {
      console.log('[ProfileScreen - useEffect] User is renter, calling fetchCurrentRental');
      if (userProfile?.user_id) {
        fetchCurrentRental();
      } else {
        console.log(
          '[ProfileScreen - useEffect] No userProfile.user_id, setting isLoadingRental to false'
        );
        setIsLoadingRental(false);
      }
    } else {
      console.log(
        '[ProfileScreen - useEffect] User is NOT renter, setting isLoadingRental to false'
      );
      setIsLoadingRental(false);
    }
  }, [userRole, fetchCurrentRental]);

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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
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

  const handleContactOwner = async () => {
    if (!ownerPhoneNumber) {
      Alert.alert('Error', 'Owner phone number not available');
      return;
    }

    try {
      const url = `sms:${ownerPhoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open messaging app');
      }
    } catch (error) {
      console.error('[ProfileScreen] Error opening SMS:', error);
      Alert.alert('Error', 'Failed to open messaging app');
    }
  };

  const handleReview = () => {
    if (!currentRental) return;

    if (hasExistingReview) {
      Alert.alert('Review Already Submitted', 'You have already reviewed this property.');
      return;
    }

    setShowReviewModal(true);
  };

  const submitReview = async (rating: number, comment: string) => {
    // Use endedRental if available (for post-rental reviews), otherwise use currentRental
    const rentalToReview = endedRental || currentRental;

    if (!rentalToReview || !userProfile?.user_id) {
      throw new Error('Unable to submit review. Please try again.');
    }

    console.log('[ProfileScreen] Submitting review:', {
      property_id: rentalToReview.property_id,
      user_id: userProfile.user_id,
      rating,
      comment,
    });

    try {
      // Insert review into database
      const { error: reviewError } = await supabase.from('reviews').insert({
        user_id: userProfile.user_id,
        property_id: rentalToReview.property_id,
        rating: rating,
        comment: comment || null,
        date_created: new Date().toISOString(),
      });

      if (reviewError) throw reviewError;
      console.log('[ProfileScreen] Review inserted successfully');

      // Recalculate property average rating
      const { data: reviews, error: fetchError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('property_id', rentalToReview.property_id);

      if (fetchError) {
        console.error('[ProfileScreen] Error fetching reviews for average:', fetchError);
        // Don't throw - review was submitted successfully
      } else if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        // Update property rating
        const { error: updateError } = await supabase
          .from('properties')
          .update({
            rating: averageRating,
            number_reviews: reviews.length,
          })
          .eq('property_id', rentalToReview.property_id);

        if (updateError) {
          console.error('[ProfileScreen] Error updating property rating:', updateError);
          // Don't throw - review was submitted successfully
        } else {
          console.log('[ProfileScreen] Property rating updated:', {
            rating: averageRating,
            number_reviews: reviews.length,
          });
        }
      }

      // Update local state
      setHasExistingReview(true);
      setShowReviewModal(false);
      setEndedRental(null); // Clear the ended rental after review is submitted
      Alert.alert('Success', 'Your review has been submitted successfully.');
    } catch (error) {
      console.error('[ProfileScreen] Error submitting review:', error);
      throw error; // Re-throw to let modal handle the error
    }
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

      console.log(
        '[ProfileScreen] Current renters count:',
        currentRentersCount,
        '/',
        currentRental.property.max_renters
      );

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

      // Store the rental info before clearing state
      const rentalToReview = currentRental;

      // Update local state
      setCurrentRental(null);
      setUserProfile({
        ...userProfile,
        rented_property: null,
      });

      // Prompt user to leave a review if they haven't already
      if (!hasExistingReview) {
        setEndedRental(rentalToReview);
        // Show review modal after a short delay
        setTimeout(() => {
          setShowReviewModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('[ProfileScreen] Error ending rental:', error);
      Alert.alert('Error', 'Failed to end rental. Please try again.');
    } finally {
      setIsEndingRental(false);
    }
  };

  const insets = useSafeAreaInsets();

  // Debug: Log when component renders with rental data
  useEffect(() => {
    if (currentRental) {
      console.log('[ProfileScreen] Rendering with current rental:', {
        has_property: !!currentRental.property,
        property_id: currentRental.property?.property_id,
        has_image: !!(
          currentRental.property?.image_url && currentRental.property.image_url.length > 0
        ),
      });
    }
  }, [currentRental]);

  console.log('[ProfileScreen] About to return JSX, currentRental exists:', !!currentRental);
  console.log('[ProfileScreen] About to return JSX, isLoadingRental:', isLoadingRental);
  console.log('[ProfileScreen] About to return JSX, navigation exists:', !!navigation);

  // Safety check - if navigation is not available, show error screen
  if (!navigation) {
    console.error('[ProfileScreen] Navigation context is missing!');
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-lg font-bold text-destructive">Navigation Error</Text>
        <Text className="text-center text-muted-foreground">
          Unable to load profile. Please restart the app.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-2"
        style={{ paddingTop: Platform.OS === 'ios' ? 55 : 0 }}>
        <View
          style={{
            paddingBottom: Platform.OS === 'ios' ? 0 : 32,
          }}>
          <Text
            className="mb-2 text-center text-3xl font-bold text-primary"
            onPress={handleNameTap}>
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

                {/* Current Rental Section - Below Place of Work/Study */}
                {(isLoadingRental || currentRental) && (
                  <View className="mb-4">
                    <Text className="mb-2 text-base font-medium text-foreground">
                      Current Rental
                    </Text>
                    {isLoadingRental ? (
                      <View className="items-center justify-center rounded-lg border border-input bg-card p-6">
                        <ActivityIndicator size="small" color="#644A40" />
                        <Text className="mt-2 text-sm text-muted-foreground">
                          Loading current rental...
                        </Text>
                      </View>
                    ) : currentRental && currentRental.property ? (
                      <CurrentRentalCard
                        currentRental={currentRental}
                        isEndingRental={isEndingRental}
                        onEndRental={() => setShowEndRentalModal(true)}
                        onContactOwner={handleContactOwner}
                        onReview={handleReview}
                        canReview={!hasExistingReview}
                      />
                    ) : null}
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View className="mt-2 gap-2">
              <Button onPress={handleSaveDetails} variant="primary">
                Save Details
              </Button>

              {userRole === 'renter' && (
                <Button
                  onPress={() => {
                    try {
                      const parent = navigation.getParent();
                      if (parent && typeof parent.navigate === 'function') {
                        parent.navigate('Preferences', { fromProfile: true });
                      } else {
                        console.warn('[ProfileScreen] Parent navigator not available');
                        Alert.alert(
                          'Navigation Error',
                          'Unable to navigate to preferences. Please try again.'
                        );
                      }
                    } catch (error) {
                      console.error('[ProfileScreen] Navigation error:', error);
                      Alert.alert('Navigation Error', 'Unable to navigate to preferences.');
                    }
                  }}
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
      </ScrollView>

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
        isLoading={isEndingRental}
        onConfirm={handleEndRental}
        onCancel={() => setShowEndRentalModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Review Modal */}
      {((currentRental && currentRental.property) || (endedRental && endedRental.property)) && (
        <ReviewModal
          visible={showReviewModal}
          propertyTitle={
            endedRental?.property?.title || currentRental?.property?.title || 'this property'
          }
          onConfirm={submitReview}
          onCancel={() => {
            setShowReviewModal(false);
            setEndedRental(null); // Clear ended rental if user cancels review
          }}
        />
      )}
    </View>
  );
}
