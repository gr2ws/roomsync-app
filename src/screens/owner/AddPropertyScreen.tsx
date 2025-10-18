import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Wifi, PawPrint, Armchair, Wind, ShieldCheck, Car } from 'lucide-react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import { supabase } from '../../utils/supabase';
import { uploadPropertyImages } from '../../utils/uploadPropertyImages';
import { propertySchema, PropertyFormData } from '../../schemas/propertySchema';
import { z } from 'zod';

import Input from '../../components/Input';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import RadioGroup from '../../components/RadioGroup';
import Picker from '../../components/Picker';
import MultiImagePicker from '../../components/MultiImagePicker';
import LocationPicker from '../../components/LocationPicker';

export default function AddPropertyScreen() {
  const { userProfile } = useLoggedIn();
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
  const [maxRenters, setMaxRenters] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Amenities state (matching user preferences)
  const [hasInternet, setHasInternet] = useState(false);
  const [allowsPets, setAllowsPets] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);
  const [hasAc, setHasAc] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [hasParking, setHasParking] = useState(false);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  const cityOptions = ['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'];
  const categoryOptions = ['Apartment', 'Dormitory', 'Boarding House'];

  const handleSubmit = async () => {
    // Validate form data
    const formData = {
      title,
      description: description || undefined,
      category: category.toLowerCase() as 'apartment' | 'dormitory' | 'boarding house',
      street: street || undefined,
      barangay: barangay || undefined,
      city,
      coordinates,
      rent: parseFloat(rent),
      max_renters: parseInt(maxRenters, 10),
      images,
      has_internet: hasInternet,
      allows_pets: allowsPets,
      is_furnished: isFurnished,
      has_ac: hasAc,
      is_secure: isSecure,
      has_parking: hasParking,
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

    setLoading(true);

    try {
      // Upload images to Supabase Storage
      const imageUrls = await uploadPropertyImages(images, userProfile.user_id);

      if (!imageUrls) {
        throw new Error('Failed to upload images.');
      }

      // Insert property into database
      const { error: insertError } = await supabase.from('properties').insert([
        {
          owner_id: userProfile.user_id,
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          street: formData.street || null,
          barangay: formData.barangay || null,
          city: formData.city,
          coordinates: formData.coordinates,
          image_url: imageUrls,
          rent: formData.rent,
          max_renters: formData.max_renters,
          has_internet: formData.has_internet,
          allows_pets: formData.allows_pets,
          is_furnished: formData.is_furnished,
          has_ac: formData.has_ac,
          is_secure: formData.is_secure,
          has_parking: formData.has_parking,
          is_available: true,
          is_verified: false,
          rating: null,
          amenities: null,
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setLoading(false);
      Alert.alert(
        'Success!',
        'Property submitted successfully! It will be available once approved by an admin.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setCategory('');
              setStreet('');
              setBarangay('');
              setCity('');
              setCoordinates('');
              setRent('');
              setMaxRenters('');
              setImages([]);
              setHasInternet(false);
              setAllowsPets(false);
              setIsFurnished(false);
              setHasAc(false);
              setIsSecure(false);
              setHasParking(false);
            },
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit property. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-primary">Add New Property</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Fill in the details of your property
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
        <Text className="mb-3 mt-2 text-lg font-semibold text-foreground">Location</Text>

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

        <Picker
          label="City *"
          options={cityOptions}
          value={city}
          onChange={setCity}
          placeholder="Select city"
          error={formErrors.city}
        />

        <LocationPicker
          label="Pin Location on Map *"
          value={coordinates}
          onChange={setCoordinates}
          placeholder="Select location"
          error={formErrors.coordinates}
        />

        {/* Pricing & Capacity */}
        <Text className="mb-3 mt-2 text-lg font-semibold text-foreground">Pricing & Capacity</Text>

        <Input
          label="Monthly Rent (₱) *"
          placeholder="e.g., 5000"
          value={rent}
          onChangeText={setRent}
          keyboardType="numeric"
          error={formErrors.rent}
        />

        <Input
          label="Maximum Renters *"
          placeholder="e.g., 2"
          value={maxRenters}
          onChangeText={setMaxRenters}
          keyboardType="numeric"
          error={formErrors.max_renters}
        />

        {/* Amenities */}
        <Text className="mb-3 mt-2 text-lg font-semibold text-foreground">Amenities</Text>

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
        <Button variant="primary" className="mb-8 mt-6" onPress={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Property'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
