import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Wifi, PawPrint, Armchair, Wind, ShieldCheck, Car, X, Plus } from 'lucide-react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import { usePropertyUpload } from '../../store/usePropertyUpload';
import { usePropertyEdit } from '../../store/usePropertyEdit';
import { uploadPropertyInBackground } from '../../services/backgroundPropertyUpload';
import { editPropertyInBackground } from '../../services/backgroundPropertyEdit';
import { z } from 'zod';

import Input from '../../components/Input';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import RadioGroup from '../../components/RadioGroup';
import MultiImagePicker from '../../components/MultiImagePicker';
import LocationPicker from '../../components/LocationPicker';
import NumericStepper from '../../components/NumericStepper';

// Property validation schema
export const propertySchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  description: z.string().optional(),
  category: z.enum(['apartment', 'room', 'bedspace'], 'Please select a property category'),
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.enum(['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'], 'Please select a city'),
  coordinates: z.string().min(1, 'Location is required'),
  rent: z.number().positive('Rent must be greater than 0'),
  max_renters: z.number().int().positive().min(1, 'At least 1 renter is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  has_internet: z.boolean(),
  allows_pets: z.boolean(),
  is_furnished: z.boolean(),
  has_ac: z.boolean(),
  is_secure: z.boolean(),
  has_parking: z.boolean(),
  amenities: z.array(z.string()).min(2, 'Bedrooms and bathrooms are required'),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export default function AddPropertyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userProfile } = useLoggedIn();
  const { isUploading, startUpload } = usePropertyUpload();
  const { isEditing, propertyId, propertyData, completeEdit } = usePropertyEdit();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [rent, setRent] = useState('');
  const [maxRenters, setMaxRenters] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  // Amenities state
  const [numBedrooms, setNumBedrooms] = useState(1);
  const [numBathrooms, setNumBathrooms] = useState(1);
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  // Features state (matching user preferences)
  const [hasInternet, setHasInternet] = useState(false);
  const [allowsPets, setAllowsPets] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);
  const [hasAc, setHasAc] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [hasParking, setHasParking] = useState(false);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  const cityOptions = ['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'];
  const categoryOptions = ['Apartment', 'Room', 'Bed Space'];

  // Helper function to reset form to initial state
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setStreet('');
    setBarangay('');
    setCity('');
    setCoordinates('');
    setRent('');
    setMaxRenters(1);
    setImages([]);
    setNumBedrooms(1);
    setNumBathrooms(1);
    setCustomAmenities([]);
    setNewAmenityInput('');
    setHasInternet(false);
    setAllowsPets(false);
    setIsFurnished(false);
    setHasAc(false);
    setIsSecure(false);
    setHasParking(false);
    setFormErrors({});
  };

  // Clear form when screen gains focus and not in edit mode
  useFocusEffect(
    React.useCallback(() => {
      if (!isEditing) {
        resetForm();
      }
    }, [isEditing])
  );

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditing && propertyData) {
      setTitle(propertyData.title);
      setDescription(propertyData.description || '');

      // Convert category to display format
      const categoryDisplay =
        propertyData.category === 'bedspace'
          ? 'Bed Space'
          : propertyData.category.charAt(0).toUpperCase() + propertyData.category.slice(1);
      setCategory(categoryDisplay);

      setStreet(propertyData.street || '');
      setBarangay(propertyData.barangay || '');
      setCity(propertyData.city);
      setCoordinates(propertyData.coordinates);
      setRent(propertyData.rent.toString());
      setMaxRenters(propertyData.max_renters);
      setImages(propertyData.image_url);

      // Parse amenities
      const bedroomMatch = propertyData.amenities.find((a) => a.includes('Bedroom'));
      const bathroomMatch = propertyData.amenities.find((a) => a.includes('Bathroom'));

      if (bedroomMatch) {
        const bedroomCount = parseInt(bedroomMatch.split(' ')[0]);
        setNumBedrooms(bedroomCount || 1);
      }

      if (bathroomMatch) {
        const bathroomCount = parseInt(bathroomMatch.split(' ')[0]);
        setNumBathrooms(bathroomCount || 1);
      }

      // Get custom amenities (exclude bedrooms and bathrooms)
      const customAms = propertyData.amenities.filter(
        (a) => !a.includes('Bedroom') && !a.includes('Bathroom')
      );
      setCustomAmenities(customAms);

      // Set features
      setHasInternet(propertyData.has_internet);
      setAllowsPets(propertyData.allows_pets);
      setIsFurnished(propertyData.is_furnished);
      setHasAc(propertyData.has_ac);
      setIsSecure(propertyData.is_secure);
      setHasParking(propertyData.has_parking);
    }
  }, [isEditing, propertyData]);

  // Handle adding custom amenity
  const handleAddAmenity = () => {
    const trimmedInput = newAmenityInput.trim();

    if (!trimmedInput) {
      Alert.alert('Empty Input', 'Please enter an amenity.');
      return;
    }

    if (customAmenities.length >= 5) {
      Alert.alert('Maximum Reached', 'You can add a maximum of 5 additional amenities.');
      return;
    }

    if (customAmenities.includes(trimmedInput)) {
      Alert.alert('Duplicate Amenity', 'This amenity has already been added.');
      return;
    }

    setCustomAmenities([...customAmenities, trimmedInput]);
    setNewAmenityInput('');
  };

  // Handle removing custom amenity
  const handleRemoveAmenity = (index: number) => {
    setCustomAmenities(customAmenities.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Construct amenities array
    const amenitiesArray = [
      `${numBedrooms} Bedroom${numBedrooms !== 1 ? 's' : ''}`,
      `${numBathrooms} Bathroom${numBathrooms !== 1 ? 's' : ''}`,
      ...customAmenities,
    ];

    // Convert category to database format (handle "Bed Space" -> "bedspace")
    const categoryValue = category.toLowerCase().replace(/\s+/g, '') as
      | 'apartment'
      | 'room'
      | 'bedspace';

    // Validate form data
    const formData = {
      title,
      description: description || undefined,
      category: categoryValue,
      street: street || undefined,
      barangay: barangay || undefined,
      city: city as 'Dumaguete City' | 'Valencia' | 'Bacong' | 'Sibulan',
      coordinates,
      rent: parseFloat(rent),
      max_renters: maxRenters,
      images,
      has_internet: hasInternet,
      allows_pets: allowsPets,
      is_furnished: isFurnished,
      has_ac: hasAc,
      is_secure: isSecure,
      has_parking: hasParking,
      amenities: amenitiesArray,
    };

    const result = propertySchema.safeParse(formData);

    if (!result.success) {
      // Map errors to fields
      const errors: Partial<Record<keyof PropertyFormData, string>> = {};
      (result.error as z.ZodError<PropertyFormData>).issues.forEach((err) => {
        const field = err.path[0] as keyof PropertyFormData;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    setFormErrors({});

    if (!userProfile?.user_id) {
      Alert.alert('Error', 'User profile not found. Please log in again.');
      return;
    }

    // Handle edit mode
    if (isEditing && propertyId && propertyData) {
      // Start background upload for edit
      startUpload(formData);

      // Get existing image URLs
      const existingImageUrls = propertyData.image_url;

      // Trigger background edit asynchronously
      editPropertyInBackground(formData, propertyId, userProfile.user_id, existingImageUrls);

      // Show brief notification
      Alert.alert(
        'Updating Property',
        'Your property is being updated! You will be notified when it is complete.',
        [{ text: 'OK' }]
      );

      // Complete edit state and navigate back
      completeEdit();
      navigation.navigate('ManageProperties' as never);
      return;
    }

    // Start background upload for new property
    startUpload(formData);

    // Trigger background upload asynchronously (fire and forget)
    uploadPropertyInBackground(formData, userProfile.user_id);

    // Show brief notification
    Alert.alert(
      'Uploading Property',
      'Your property is being uploaded! You will be notified when it is complete.',
      [{ text: 'OK' }]
    );

    // Reset form immediately
    resetForm();

    // Navigate to Manage Properties screen
    navigation.navigate('ManageProperties' as never);
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      {/* Full-screen blocker when upload is in progress */}
      {isUploading && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-background/95">
          <View className="items-center rounded-lg bg-card p-8 shadow-lg">
            <ActivityIndicator size="large" color="#644A40" />
            <Text className="mt-4 text-center text-lg font-semibold text-foreground">
              {isEditing ? 'Property Update in Progress' : 'Property Upload in Progress'}
            </Text>
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              {isEditing
                ? 'Please wait while your property is being updated...'
                : 'Please wait while your property is being uploaded...'}
            </Text>
          </View>
        </View>
      )}

      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}
        contentContainerClassName="px-6 pb-4"
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-primary">
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </Text>
          <Text className="mt-2 text-base text-muted-foreground">
            {isEditing
              ? 'Update the details of your property below.'
              : 'Fill in the details of your property and apply to make it available for recommendation.'}
          </Text>
        </View>

        {/* Property Images */}
        <MultiImagePicker
          images={images}
          onImagesChange={setImages}
          maxImages={10}
          label="Property Images *"
          error={formErrors.images}
        />

        {/* Property Title */}
        <Input
          label="Property Title *"
          placeholder="e.g., Cozy Studio Apartment near Silliman"
          value={title}
          onChangeText={setTitle}
          error={formErrors.title}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="Describe your property..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          error={formErrors.description}
        />

        {/* Property Category */}
        <RadioGroup
          label="Property Category *"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          error={formErrors.category}
        />

        {/* Location Section */}
        <Text className="mb-2 mt-4 text-lg font-semibold text-foreground">Location</Text>

        <Input
          label="Street"
          placeholder="e.g., Hibbard Avenue"
          value={street}
          onChangeText={setStreet}
          error={formErrors.street}
        />

        <Input
          label="Barangay"
          placeholder="e.g., Poblacion 1"
          value={barangay}
          onChangeText={setBarangay}
          error={formErrors.barangay}
        />

        <View className="mb-4">
          <RadioGroup
            label="City *"
            options={cityOptions}
            value={city}
            onChange={setCity}
            error={formErrors.city}
          />
        </View>

        <LocationPicker
          label="Map Location *"
          value={coordinates}
          onChange={setCoordinates}
          onAddressChange={(address) => {
            if (address.street) setStreet(address.street);
            if (address.barangay) setBarangay(address.barangay);
            if (address.city) setCity(address.city);
          }}
          enableAddressAutofill={true}
          placeholder="Select location"
          error={formErrors.coordinates}
        />

        {/* Pricing & Capacity */}
        <Text className="mb-2 mt-4 text-lg font-semibold text-foreground">Pricing & Capacity</Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Monthly Rent (₱) *"
              placeholder="e.g., 5000"
              value={rent}
              onChangeText={setRent}
              keyboardType="numeric"
              error={formErrors.rent}
            />
          </View>

          <View className="flex-1">
            <NumericStepper
              label="Maximum Renters *"
              value={maxRenters}
              onChange={setMaxRenters}
              min={1}
              max={10}
              error={formErrors.max_renters}
            />
          </View>
        </View>

        {/* Amenities */}
        <Text className="mb-2 mt-4 text-lg font-semibold text-foreground">Amenities</Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <NumericStepper
              label="Bedrooms *"
              value={numBedrooms}
              onChange={setNumBedrooms}
              min={1}
              max={5}
              error={formErrors.amenities}
            />
          </View>

          <View className="flex-1">
            <NumericStepper
              label="Bathrooms *"
              value={numBathrooms}
              onChange={setNumBathrooms}
              min={0}
              max={5}
            />
          </View>
        </View>

        {/* Custom Amenities Input */}
        <View className="mb-4 w-full">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-base font-medium text-foreground">Additional Amenities</Text>
            <Text className="text-sm text-muted-foreground">{customAmenities.length}/5</Text>
          </View>
          <View className="flex-row items-center rounded-lg border border-input bg-card">
            <TextInput
              className="flex-1 px-4 py-3 text-base text-card-foreground"
              placeholder="e.g., Kitchen, Balcony, Laundry Area"
              placeholderTextColor="#888"
              value={newAmenityInput}
              onChangeText={setNewAmenityInput}
              onSubmitEditing={handleAddAmenity}
              returnKeyType="done"
              editable={customAmenities.length < 5}
            />
            <View className="border-l border-input">
              <TouchableOpacity
                onPress={handleAddAmenity}
                disabled={!newAmenityInput.trim() || customAmenities.length >= 5}
                className={`px-3 py-3 ${!newAmenityInput.trim() || customAmenities.length >= 5 ? 'opacity-50' : ''}`}>
                <Plus
                  size={20}
                  color={newAmenityInput.trim() && customAmenities.length < 5 ? '#644A40' : '#888'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Custom Amenities List */}
        {customAmenities.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Added Amenities ({customAmenities.length})
            </Text>
            {customAmenities.map((amenity, index) => (
              <View
                key={index}
                className="mb-2 flex-row items-center rounded-lg border border-input bg-card">
                <View className="flex-1 flex-row items-center px-4 py-3">
                  <Text className="mr-2 text-base font-semibold text-primary">{index + 1}.</Text>
                  <Text className="flex-1 text-base text-card-foreground">{amenity}</Text>
                </View>
                <View className="border-l border-input">
                  <TouchableOpacity
                    onPress={() => handleRemoveAmenity(index)}
                    className="px-3 py-3">
                    <X size={20} color="#644A40" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Features */}
        <Text className="mb-3 mt-2 text-lg font-semibold text-foreground">Features</Text>

        <Checkbox
          label="Internet Availability"
          checked={hasInternet}
          onToggle={() => setHasInternet(!hasInternet)}
          icon={Wifi}
        />

        <Checkbox
          label="Pet Friendly"
          checked={allowsPets}
          onToggle={() => setAllowsPets(!allowsPets)}
          icon={PawPrint}
        />

        <Checkbox
          label="Furnished"
          checked={isFurnished}
          onToggle={() => setIsFurnished(!isFurnished)}
          icon={Armchair}
        />

        <Checkbox
          label="Air Conditioned"
          checked={hasAc}
          onToggle={() => setHasAc(!hasAc)}
          icon={Wind}
        />

        <Checkbox
          label="Gated/With CCTV"
          checked={isSecure}
          onToggle={() => setIsSecure(!isSecure)}
          icon={ShieldCheck}
        />

        <Checkbox
          label="Parking"
          checked={hasParking}
          onToggle={() => setHasParking(!hasParking)}
          icon={Car}
        />

        {/* Submit Button */}
        <Button
          variant="primary"
          className="mt-2"
          onPress={handleSubmit}
          disabled={loading || isUploading}>
          {loading
            ? isEditing
              ? 'Updating...'
              : 'Submitting...'
            : isEditing
              ? 'Update Property'
              : 'Submit Property for Verification'}
        </Button>
      </KeyboardAwareScrollView>
    </View>
  );
}
