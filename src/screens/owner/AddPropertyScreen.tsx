import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { Home, BedDouble, Bath, MapPin, Camera, Plus } from 'lucide-react-native';
import Button from '../../components/Button';

interface Amenity {
  id: string;
  name: string;
  selected: boolean;
}

interface FormData {
  name: string;
  address: string;
  price: string;
  rooms: string;
  bathrooms: string;
  description: string;
}

export default function AddPropertyScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    price: '',
    rooms: '',
    bathrooms: '',
    description: ''
  });
  const [amenities] = useState<Amenity[]>([
    { id: '1', name: 'WiFi', selected: false },
    { id: '2', name: 'Parking', selected: false },
    { id: '3', name: 'Air Conditioning', selected: false },
    { id: '4', name: 'Laundry', selected: false },
    { id: '5', name: 'Security', selected: false },
    { id: '6', name: 'Kitchen', selected: false },
  ]);

  const handleAddImage = () => {
    // TODO: Implement image picker
    console.log('Add image');
  };

  const renderFormField = (
    label: string, 
    placeholder: string, 
    icon: React.ReactNode,
    field: keyof FormData,
    multiline?: boolean,
    prefix?: string
  ) => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
        {icon && (
          <View className="p-3.5 border-r border-gray-300">
            {icon}
          </View>
        )}
        <View className="flex-row items-center flex-1">
          {prefix && (
            <Text className="text-gray-700 text-base pl-4">
              {prefix}
            </Text>
          )}
          <TextInput
            placeholder={placeholder}
            value={formData[field]}
            onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
            className="flex-1 px-4 py-3"
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={field === 'price' || field === 'rooms' || field === 'bathrooms' ? 'numeric' : 'default'}
          />
        </View>
      </View>
    </View>
  );

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    console.log('Selected Amenities:', amenities.filter(a => a.selected));
  };

  const toggleAmenity = (id: string) => {
    const newAmenities = amenities.map(amenity => 
      amenity.id === id ? { ...amenity, selected: !amenity.selected } : amenity
    );
    // Update amenities state here
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">Add New Property</Text>
          <Text className="text-gray-600 mt-2">Fill in the details of your property</Text>
        </View>

        {/* Image Upload Section */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-3">Property Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  className="w-24 h-24 rounded-lg"
                />
              ))}
              <TouchableOpacity
                onPress={handleAddImage}
                className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
              >
                <Camera size={24} color="#6B7280" />
                <Text className="text-sm text-gray-500 mt-1">Add Photo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Property Name */}
        {renderFormField(
          'Property Name',
          'Enter property name',
          <Home size={20} color="#6B7280" />,
          'name'
        )}

        {/* Address */}
        {renderFormField(
          'Address',
          'Enter full address',
          <MapPin size={20} color="#6B7280" />,
          'address'
        )}
        
        {/* Monthly Rent */}
        {renderFormField(
          'Monthly Rent',
          'Enter amount',
          <Home size={20} color="#6B7280" />,
          'price',
          false,
          '₱'
        )}

        {/* Rooms */}
        {renderFormField(
          'Rooms',
          'No. of rooms',
          <BedDouble size={20} color="#6B7280" />,
          'rooms'
        )}
        
        {/* Bathrooms */}
        {renderFormField(
          'Bathrooms',
          'No. of bathrooms',
          <Bath size={20} color="#6B7280" />,
          'bathrooms'
        )}

        {/* Description */}
        {renderFormField(
          'Description',
          'Describe your property...',
          <Plus size={20} color="#6B7280" />,
          'description',
          true
        )}

        {/* Amenities */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-3">Amenities</Text>
          <View className="flex-row flex-wrap gap-3">
            {amenities.map((amenity) => (
              <TouchableOpacity
                key={amenity.id}
                onPress={() => toggleAmenity(amenity.id)}
                className={`px-4 py-2 rounded-full border ${
                  amenity.selected ? 'bg-blue-50 border-blue-500' : 'border-gray-300 bg-white'
                }`}
              >
                <Text
                  className={`text-sm ${
                    amenity.selected ? 'text-blue-500' : 'text-gray-700'
                  }`}
                >
                  {amenity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          className="mt-6 mb-4"
          onPress={handleSubmit}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white font-semibold text-base">List Property</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}