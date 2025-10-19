import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from 'react-native';
import { MapPin, X, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Button from './Button';
import RadioGroup from './RadioGroup';
import Input from './Input';

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
  onAddressChange?: (address: { street?: string; barangay?: string; city?: string }) => void;
  enableAddressAutofill?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Location',
  error,
  label,
  onAddressChange,
  enableAddressAutofill = false,
}) => {
  const insets = useSafeAreaInsets();
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
  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(-700)).current; // Start off-screen

  // Address search fields
  const [searchCity, setSearchCity] = useState('');
  const [searchBarangay, setSearchBarangay] = useState('');
  const [searchStreet, setSearchStreet] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Extracted address for auto-fill
  const [extractedAddress, setExtractedAddress] = useState<{
    street?: string;
    barangay?: string;
    city?: string;
  }>({});

  // Animate search panel
  useEffect(() => {
    if (isModalOpen) {
      Animated.timing(slideAnim, {
        toValue: showSearchPanel ? 0 : -700,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showSearchPanel, isModalOpen]);

  useEffect(() => {
    if (value) {
      const [lat, lng] = value.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
      }
    }
  }, [value]);

  // Reset map to Dumaguete City center when modal opens
  useEffect(() => {
    if (isModalOpen) {
      // Reset search panel animation state
      setShowSearchPanel(false);
      slideAnim.setValue(-700);

      // If there's a saved value, center on that, otherwise Dumaguete City
      if (value) {
        const [lat, lng] = value.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          const savedRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(savedRegion);
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.animateToRegion(savedRegion, 500);
            }, 100);
          }
        }
      } else {
        // No saved value, center on Dumaguete City
        const dumagueteRegion = {
          latitude: 10.3157, // Dumaguete City center
          longitude: 123.8854,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(dumagueteRegion);
        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current?.animateToRegion(dumagueteRegion, 500);
          }, 100);
        }
      }
    }
  }, [isModalOpen, value]);

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

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      // Update selected location first
      setSelectedLocation({ latitude, longitude });

      // Animate to region using map ref if available
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      } else {
        setRegion(newRegion);
      }

      // Reverse geocode to get address and update search fields
      await reverseGeocode(latitude, longitude);
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

        // Extract address components for auto-fill
        const extracted: { street?: string; barangay?: string; city?: string } = {};

        // Extract street
        if (address.street) {
          extracted.street = address.street;
        } else if (address.name) {
          extracted.street = address.name;
        }

        // Extract city (validate against allowed cities)
        const allowedCities = ['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'];
        if (address.city) {
          // Try exact match first
          let matchedCity = allowedCities.find(
            (c) => c.toLowerCase() === address.city?.toLowerCase()
          );

          // If no exact match, try partial match (e.g., "Dumaguete" matches "Dumaguete City")
          if (!matchedCity) {
            matchedCity = allowedCities.find((c) =>
              c.toLowerCase().includes(address.city?.toLowerCase() || '')
            );
          }

          extracted.city = matchedCity || '';
        }

        // Extract barangay (from subregion or district)
        if (address.subregion) {
          extracted.barangay = address.subregion;
        } else if (address.district) {
          extracted.barangay = address.district;
        }

        setExtractedAddress(extracted);

        // Update search fields with extracted data
        setSearchStreet(extracted.street || '');
        setSearchBarangay(extracted.barangay || '');
        // Keep city in proper case - RadioGroup handles lowercase conversion internally
        setSearchCity(extracted.city || '');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName('Selected Location');
      setExtractedAddress({});
    }
  };

  const handleAddressSearch = async () => {
    // Require at least city to search
    if (!searchCity) {
      Alert.alert('City Required', 'Please select a city to search.');
      return;
    }

    setIsSearching(true);
    try {
      // Convert city back to proper case for geocoding
      const allowedCities = ['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'];
      const properCaseCity =
        allowedCities.find((c) => c.toLowerCase() === searchCity.toLowerCase()) || searchCity;

      // Build search query
      const queryParts = [searchStreet, searchBarangay, properCaseCity, 'Philippines'].filter(
        Boolean
      );
      const searchQuery = queryParts.join(', ');

      const results = await Location.geocodeAsync(searchQuery);

      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        // Set marker
        setSelectedLocation({ latitude, longitude });

        // Animate to region using map ref if available
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 500);
        } else {
          setRegion(newRegion);
        }

        // Reverse geocode to update location name and extracted address
        await reverseGeocode(latitude, longitude);

        // Close search panel after successful search
        setShowSearchPanel(false);
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find the specified address. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      Alert.alert('Search Error', 'Could not search for the address. Please try again.');
    } finally {
      setIsSearching(false);
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

      // Call address change callback if auto-fill is enabled
      if (enableAddressAutofill && onAddressChange) {
        onAddressChange(extractedAddress);
      }

      // Reset search panel state before closing modal
      setShowSearchPanel(false);
      setIsModalOpen(false);
    } else {
      Alert.alert('No Location Selected', 'Please select a location on the map.');
    }
  };

  const handleCancel = () => {
    // Reset search panel state before closing modal
    setShowSearchPanel(false);
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
        className={`flex-row items-center rounded-lg border bg-card px-4 py-3 ${
          error ? 'border-destructive' : 'border-input'
        }`}>
        <MapPin size={20} color="#888" className="mr-2" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingRight: 8 }}>
          <Text
            className={`text-base ${locationName || value ? 'text-card-foreground' : 'text-muted-foreground'}`}
            style={{ color: locationName || value ? undefined : '#888' }}
            numberOfLines={1}>
            {locationName || placeholder}
          </Text>
        </ScrollView>
      </TouchableOpacity>

      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      <Modal visible={isModalOpen} animationType="slide" onRequestClose={handleCancel}>
        <View
          className="flex-1 bg-background"
          style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
          {/* Address Search Panel - Animated */}
          {isModalOpen && (
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                paddingTop: Platform.OS === 'ios' ? 40 : 0,
              }}
              className="absolute left-0 right-0 top-0 z-10 border-b border-border bg-background p-4 shadow-lg">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Search by Address</Text>
                <TouchableOpacity onPress={() => setShowSearchPanel(false)}>
                  <X size={20} color="#644A40" />
                </TouchableOpacity>
              </View>

              {/* City RadioGroup */}
              <View className="pb-4">
                <RadioGroup
                  label="City *"
                  options={['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan']}
                  value={searchCity}
                  onChange={setSearchCity}
                />
              </View>

              {/* Barangay Input */}
              <Input
                label="Barangay"
                placeholder="e.g., Poblacion 1"
                value={searchBarangay}
                onChangeText={setSearchBarangay}
              />

              {/* Street Input */}
              <Input
                label="Street"
                placeholder="e.g., Hibbard Avenue"
                value={searchStreet}
                onChangeText={setSearchStreet}
              />

              {/* Search Button */}
              <Button
                variant="primary"
                onPress={handleAddressSearch}
                disabled={isSearching || !searchCity}>
                {isSearching ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 font-medium text-white">Searching...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Search size={20} color="white" />
                    <Text className="ml-2 font-medium text-white">Search Location</Text>
                  </View>
                )}
              </Button>
            </Animated.View>
          )}

          {/* Map or Fallback */}
          <TouchableWithoutFeedback onPress={() => showSearchPanel && setShowSearchPanel(false)}>
            <View className="relative flex-1">
              {MapView ? (
                <MapView
                  ref={mapRef}
                  style={{ flex: 1 }}
                  region={region}
                  onRegionChangeComplete={setRegion}
                  onPress={(e) => {
                    handleMapPress(e);
                    if (showSearchPanel) setShowSearchPanel(false);
                  }}>
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

              {/* Floating Search Button */}
              <TouchableOpacity
                onPress={() => setShowSearchPanel(!showSearchPanel)}
                className=" absolute bottom-4 right-4 rounded-full border border-primary bg-secondary p-4 shadow-lg"
                style={{ elevation: 4 }}>
                <Search size={24} color="#644A40" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

          {/* Bottom Controls */}
          <View
            className="border-t border-border bg-card p-4"
            style={{ paddingBottom: Platform.OS === 'ios' ? 35 : 10 }}>
            {/* Selected Address Display */}
            {locationName && (
              <View className="mb-3 rounded-lg bg-muted p-3">
                <Text className="text-xs font-medium text-muted-foreground">Selected Address</Text>
                <Text className="mt-1 text-sm text-foreground">{locationName}</Text>
              </View>
            )}

            {MapView && (
              <View className="mb-3">
                <Button
                  variant="secondary"
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}>
                  {isLoadingLocation ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator size="small" color="#644A40" />
                      <Text className="ml-2 text-sm font-medium text-primary">Loading...</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <MapPin size={20} color="#644A40" />
                      <Text className="ml-2 font-medium text-primary">Use Current Location</Text>
                    </View>
                  )}
                </Button>
              </View>
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
