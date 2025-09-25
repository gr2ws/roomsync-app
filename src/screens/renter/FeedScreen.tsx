import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import FeedScreenModal from './FeedScreenModal';

type Room = {
  id: number;
  image: any;
  title: string;
  location: string;
  price: number;
  rating: number;
  category: string;
  amenities: string[];
};

export default function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const rooms = [
    {
      id: 1,
      image: require('../../assets/room1.jpg'),
      title: 'Cozy Room Near Silliman University',
      location: 'Dumaguete City',
      price: 3500,
      rating: 4.5,
      category: 'Rooms',
      amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    },
    {
      id: 2,
      image: require('../../assets/room2.jpg'),
      title: 'Modern Studio Apartment',
      location: 'Dumaguete City',
      price: 4000,
      rating: 4.0,
      category: 'Apartments',
      amenities: ['Kitchen', 'WiFi', 'Furnished'],
    },
    {
      id: 3,
      image: require('../../assets/room3.jpg'),
      title: 'Student Bedspace near Foundation',
      location: 'Dumaguete City',
      price: 2500,
      rating: 4.2,
      category: 'Bedspace',
      amenities: ['WiFi', 'Study Area', 'Shared Bathroom'],
    },
    {
      id: 4,
      image: require('../../assets/room4.jpg'),
      title: 'Family Apartment with Garden',
      location: 'Dumaguete City',
      price: 3800,
      rating: 4.8,
      category: 'Apartments',
      amenities: ['Garden', 'Parking', 'Full Kitchen'],
    },
    {
      id: 5,
      image: require('../../assets/room5.jpg'),
      title: 'Downtown Studio Unit',
      location: 'Dumaguete City',
      price: 3200,
      rating: 4.3,
      category: 'Rooms',
      amenities: ['WiFi', 'Security', 'Balcony'],
    },
  ];

  const filteredRooms = rooms.filter((room) => {
    // Apply category filter
    const matchesCategory = selectedCategory === 'All' || room.category === selectedCategory;

    // Apply search filter
    const matchesSearch =
      searchQuery.length === 0
        ? true
        : room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.amenities.some((amenity) =>
            amenity.toLowerCase().includes(searchQuery.toLowerCase())
          );

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Modal for Room Details */}
      <FeedScreenModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        room={selectedRoom}
      />

      {/* Main Feed Content */}
      <ScrollView className="flex-1 bg-white">
        <View className="px-4 pt-4">
          {/* Header Text */}
          <View className="mb-4">
            <Text className="text-3xl font-bold text-gray-900">Find Your Room</Text>
            <Text className="text-gray-600">Dumaguete City</Text>
          </View>

          {/* Search Bar and Filter */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-2 flex-1 flex-row items-center rounded-lg bg-gray-100 p-3">
              <Ionicons name="search" size={20} color="gray" />
              <TextInput
                placeholder="Search for rooms..."
                className="ml-2 flex-1 overflow-visible"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity className="rounded-lg bg-gray-100 p-3">
              <Ionicons name="filter" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Categories (Tabs style) */}
          <View className="mb-4 flex-row border-b border-gray-200">
            {['All', 'Rooms', 'Apartments', 'Bedspace'].map((category) => (
              <TouchableOpacity
                key={category}
                className={`flex-1 items-center pb-2 ${selectedCategory === category ? 'border-b-2 border-blue-600 bg-transparent' : 'bg-transparent'}`}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  className={`text-xs font-semibold ${selectedCategory === category ? 'text-blue-600' : 'text-gray-400'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Room Cards */}
          <View className="mt-4">
            {filteredRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                className="mb-3 h-48 flex-row overflow-hidden rounded-lg bg-white shadow-md"
                onPress={() => {
                  setSelectedRoom(room);
                  setModalVisible(true);
                }}>
                {/* Image (40%) */}
                <Image source={room.image} className="h-full w-[40%]" resizeMode="cover" />

                {/* Details (60%) */}
                <View className="flex-1 p-3">
                  {/* Title and Location */}
                  <View className="mb-1">
                    <Text numberOfLines={1} className="text-base font-bold text-gray-800">
                      {room.title}
                    </Text>
                    <Text className="text-xs text-gray-500">{room.location}</Text>
                  </View>

                  {/* Category Tag */}
                  <View className="mb-1 self-start rounded-sm bg-blue-100 px-2 py-0.5">
                    <Text className="text-xs text-blue-600">{room.category}</Text>
                  </View>

                  {/* Price */}
                  <Text className="mb-1 text-base font-bold text-green-600">
                    ₱{room.price}/month
                  </Text>

                  {/* Rating */}
                  <View className="mb-2 flex-row items-center">
                    {[...Array(5)].map((_, index) => (
                      <Ionicons
                        key={index}
                        name={index < Math.floor(room.rating) ? 'star' : 'star-outline'}
                        size={12}
                        color="#FFD700"
                      />
                    ))}
                    <Text className="ml-1 text-xs text-gray-600">{room.rating}</Text>
                  </View>

                  {/* Amenities */}
                  <View className="flex-row flex-wrap">
                    {room.amenities.map((amenity, index) => (
                      <View key={index} className="mb-1 mr-1.5 rounded-sm bg-gray-100 px-2 py-1">
                        <Text className="text-xs text-gray-600">{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
