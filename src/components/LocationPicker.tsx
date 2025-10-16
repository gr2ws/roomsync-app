import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import * as Location from 'expo-location';
import Button from './Button';

// Dynamic import for react-native-maps (only loads if native modules are available)
let MapView: any = null;
let Marker: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  // Maps not available in Expo Go
  console.warn('react-native-maps not available, using fallback');
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface LocationPickerProps {
  value: string; // Format: "latitude,longitude"
  onChange: (coordinates: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Location',
  error,
  label,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 10.3157, // Dumaguete City default
    longitude: 123.8854,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [locationName, setLocationName] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (value) {
      const [lat, lng] = value.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
      }
    }
  }, [value]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant location permission to use this feature.');
      return false;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setIsLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setSelectedLocation({ latitude, longitude });
      reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const address = results[0];
        const name = [address.street, address.city, address.region].filter(Boolean).join(', ');
        setLocationName(name || 'Selected Location');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName('Selected Location');
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      const coordinates = `${selectedLocation.latitude},${selectedLocation.longitude}`;
      onChange(coordinates);
      setIsModalOpen(false);
    } else {
      Alert.alert('No Location Selected', 'Please select a location on the map.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // Reset to current value
    if (value) {
      const [lat, lng] = value.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ latitude: lat, longitude: lng });
      }
    }
  };

  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-base font-medium text-foreground">{label}</Text>}

      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        className={`flex-row items-center justify-between rounded-lg border bg-card px-4 py-3 ${
          error ? 'border-destructive' : 'border-input'
        }`}>
        <View className="flex-1 flex-row items-center">
          <MapPin size={20} color="#888" />
          <Text
            className={`ml-2 text-base ${locationName || value ? 'text-card-foreground' : 'text-muted-foreground'}`}
            style={{ color: locationName || value ? undefined : '#888' }}>
            {locationName || placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      <Modal visible={isModalOpen} animationType="slide" onRequestClose={handleCancel}>
        <View
          className="flex-1 bg-background"
          style={{ paddingTop: Platform.OS === 'ios' ? 35 : 0 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3">
            <Text className="text-lg font-semibold text-card-foreground">Select Location</Text>
            <TouchableOpacity onPress={handleCancel}>
              <X size={24} color="#644A40" />
            </TouchableOpacity>
          </View>

          {/* Map or Fallback */}
          {MapView ? (
            <MapView
              style={{ flex: 1 }}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}>
              {selectedLocation && Marker && <Marker coordinate={selectedLocation} />}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center bg-muted p-6">
              <MapPin size={48} color="#644A40" />
              <Text className="mt-4 text-center text-lg font-semibold text-card-foreground">
                Map Not Available
              </Text>
              <Text className="mt-2 text-center text-sm text-muted-foreground">
                Maps require a development build.
              </Text>
              <Text className="mt-4 text-center text-xs text-muted-foreground">
                Selected: {locationName || 'No location selected'}
              </Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View
            className="border-t border-border bg-card p-4"
            style={{ paddingBottom: Platform.OS === 'ios' ? 35 : 10 }}>
            {MapView && (
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}
                className="mb-3 flex-row items-center justify-center rounded-lg border border-primary bg-background px-4 py-2">
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#644A40" />
                ) : (
                  <>
                    <MapPin size={16} color="#644A40" />
                    <Text className="ml-2 text-sm font-medium text-primary">
                      Use Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button variant="secondary" onPress={handleCancel}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button variant="primary" onPress={handleConfirm}>
                  Confirm Location
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LocationPicker;
