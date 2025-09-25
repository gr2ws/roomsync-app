import { View, Text, FlatList, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Home, Star, Users, MapPin, Plus, Edit, Trash2 } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';

type RootStackParamList = {
  ManageProperties: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ManageProperties'>;

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  totalReviews: number;
  image: number;
  occupancy: number;
  totalRooms: number;
}

export default function ManagePropertiesScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Silliman Residences',
      address: 'Hibbard Avenue, Dumaguete City',
      price: 15000,
      rating: 4.5,
      totalReviews: 12,
      image: require('../../assets/room1.jpg'),
      occupancy: 3,
      totalRooms: 4
    },
    {
      id: '2',
      name: 'Portal West Apartments',
      address: 'Portal West, Bantayan, Dumaguete City',
      price: 12000,
      rating: 4.8,
      totalReviews: 8,
      image: require('../../assets/room2.jpg'),
      occupancy: 2,
      totalRooms: 3
    },
    {
      id: '3',
      name: 'Rizal Boulevard Suites',
      address: 'Rizal Boulevard, Dumaguete City',
      price: 18000,
      rating: 4.2,
      totalReviews: 15,
      image: require('../../assets/room3.jpg'),
      occupancy: 4,
      totalRooms: 4
    }
  ]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh properties');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleDeleteProperty = useCallback((propertyId: string, propertyName: string) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${propertyName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setProperties(prev => prev.filter(p => p.id !== propertyId));
              setIsLoading(false);
            }, 1000);
          }
        }
      ]
    );
  }, []);

  const renderProperty = useCallback(({ item }: { item: Property }) => (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <View className="relative">
        <Image
          source={item.image}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-semibold text-gray-900 flex-1 mr-2">{item.name}</Text>
          <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
            <Star size={16} color="#FBC02D" fill="#FBC02D" />
            <Text className="ml-1 text-gray-700 font-medium">{item.rating}</Text>
            <Text className="text-xs text-gray-500 ml-1">({item.totalReviews})</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#6B7280" />
          <Text className="ml-1 text-gray-600 flex-1">{item.address}</Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            ₱{item.price.toLocaleString()}
            <Text className="text-base font-normal text-gray-600">/mo</Text>
          </Text>
          <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
            <Users size={16} color="#3B82F6" />
            <Text className="ml-1 text-blue-600 font-medium">
              {item.occupancy}/{item.totalRooms} rooms
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-2">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('EditProperty', { propertyId: item.id })}
            className="px-6 py-2.55"
          >
            <View className="flex-row items-center justify-center">
              <Edit size={16} color="#4B5563" />
              <Text className="ml-2 text-gray-700">Edit</Text>
            </View>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => handleDeleteProperty(item.id, item.name)}
            className="px-4 py-2 bg-red-50 border-red-200"
          >
            <View className="flex-row items-center justify-center">
              <Trash2 size={16} color="#EF4444" />
              <Text className="ml-2 text-red-500 font-medium">Delete</Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  ), [navigation, handleDeleteProperty]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading properties...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 border-b border-gray-200 bg-white">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">My Properties</Text>
            <Text className="text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('AddProperty')}
          >
            <View className="flex-row items-center">
              <Plus size={16} color="white" />
              <Text className="ml-2 text-white">Add New</Text>
            </View>
          </Button>
        </View>
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Home size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No properties listed yet
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Add your first property to get started
            </Text>
          </View>
        }
      />
    </View>
  );
}