import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'Overview' | 'Amenities' | 'Reviews' | 'Location'>(
    'Overview'
  );

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

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      name: 'Maria Santos',
      comment: 'Very comfortable and close to the university. Highly recommended!',
      rating: 5,
    },
    {
      id: 2,
      name: 'John Dela Cruz',
      comment: 'Clean and safe environment. Owner is responsive.',
      rating: 4,
    },
  ];

  // Mock location data
  const mockLocation = {
    address: 'Dumaguete City Proper, Dumaguete City',
    landmarks: [
      { name: 'Silliman University', distance: '300m' },
      { name: 'Rizal Boulevard', distance: '800m' },
      { name: 'Lee Superplaza', distance: '500m' },
    ],
  };

  // Modal content for each tab
  const renderTabContent = () => {
    if (!selectedRoom) return null;
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            <Text className="mb-1 font-bold text-gray-800">Description</Text>
            <Text className="text-s mb-2 h-[75%] overflow-scroll text-gray-600">
              Cozy and convenient room perfect for students. Walking distance to Silliman
              University. Includes basic amenities and maintenance.
            </Text>
            <Text className="mb-1 font-bold text-gray-800">Property Details</Text>
            <View className="mb-1 flex-row justify-between">
              <Text className="text-xs text-gray-600">Type: {selectedRoom.category}</Text>
              <Text className="text-xs text-gray-600">Availability: Available</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-600">Area: Hibbard</Text>
              <Text className="text-xs text-gray-600">
                Monthly Rate: ₱{selectedRoom.price?.toLocaleString()}
              </Text>
            </View>
          </>
        );
      case 'Amenities':
        return (
          <>
            <Text className="mb-1 font-bold text-gray-800">Available Amenities</Text>
            <View className="mb-2 h-[72%] flex-row flex-wrap overflow-scroll">
              {selectedRoom.amenities.map((amenity, idx) => (
                <View key={idx} className="mb-1 mr-2 rounded bg-gray-100 px-3 py-1">
                  <Text className="text-xs text-gray-700">{amenity}</Text>
                </View>
              ))}
            </View>
            <Text className="mb-1 font-bold text-gray-800">Included in Monthly Rate</Text>
            <Text className="mb-2 text-xs text-gray-600">
              - Water and Electricity{'\n'}- Internet/WiFi Access{'\n'}- Basic Maintenance
            </Text>
          </>
        );
      case 'Reviews':
        return (
          <>
            <View className="mb-1 flex-row items-center">
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text className="ml-1 text-base font-semibold text-gray-700">4.8</Text>
              <Text className="ml-2 text-xs text-gray-500">({mockReviews.length} reviews)</Text>
            </View>
            {mockReviews.map((review) => (
              <View key={review.id} className="mb-2 border-b border-gray-100 pb-2">
                <Text className="font-semibold text-gray-800">{review.name}</Text>
                <Text className="mb-1 text-xs text-gray-600">{review.comment}</Text>
                <View className="mb-1 flex-row">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? 'star' : 'star-outline'}
                      size={12}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
            ))}
          </>
        );
      case 'Location':
        return (
          <>
            <Text className="mb-1 font-bold text-gray-800">Location and Nearby</Text>
            <Text className="mb-2 text-xs text-gray-600">{mockLocation.address}</Text>
            <View className="mb-1 h-[70%] justify-evenly overflow-scroll">
              <Text className="font-bold text-gray-800">Nearby Landmarks</Text>
              <View className="h-[80%] rounded-sm  bg-slate-200"> </View>
            </View>
            {mockLocation.landmarks.map((landmark, idx) => (
              <View key={idx} className="mb-1 flex-row justify-between">
                <Text className="text-xs text-gray-700">{landmark.name}</Text>
                <Text className="text-xs text-gray-500">{landmark.distance}</Text>
              </View>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Modal for Room Details */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="h-[80%] w-[95%] overflow-hidden rounded-xl bg-white">
            <View className="flex-1">
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
                {/* Image */}
                {selectedRoom && (
                  <View>
                    <Image source={selectedRoom.image} className="h-48 w-full" resizeMode="cover" />
                    {/* Close Button */}
                    <Pressable
                      onPress={() => {
                        setModalVisible(false);
                        setActiveTab('Overview');
                      }}
                      className="absolute left-2 top-2 rounded-full bg-white/80 p-1">
                      <Ionicons name="arrow-back" size={24} color="#222" />
                    </Pressable>
                  </View>
                )}
                <View className="flex-1 gap-2 px-4 pb-6 pt-3">
                  {/* Title, Price, Location */}
                  <View className="mb-1 flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-gray-900">{selectedRoom?.title}</Text>
                      <Text className="text-xs text-gray-600">
                        {selectedRoom?.location} City Proper
                      </Text>
                      <Text className="mt-0.5 text-[10px] text-gray-400">0.3 km to Silliman</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-bold text-gray-800">
                        ₱{selectedRoom?.price?.toLocaleString()}
                      </Text>
                      <Text className="text-xs text-gray-500">/month</Text>
                    </View>
                  </View>
                  {/* Rating, Roommates, Availability */}
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text className="ml-1 mr-3 text-base font-semibold text-gray-700">
                      {selectedRoom?.rating ?? '--'}
                    </Text>
                    <Ionicons name="people" size={18} color="#555" />
                    <Text className="ml-1 mr-3 text-base text-gray-700">2</Text>
                    <View className="ml-auto">
                      <View className="rounded-full border border-blue-500 px-3 py-1">
                        <Text className="text-xs text-blue-600">Available Now</Text>
                      </View>
                    </View>
                  </View>
                  {/* Message & Call Buttons */}
                  <View className="mb-2 flex-row justify-between">
                    <TouchableOpacity className="mr-2 flex-1 items-center rounded-lg border border-gray-400 py-2">
                      <Text className="font-semibold text-gray-800">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="ml-2 flex-1 items-center rounded-lg border border-gray-400 py-2">
                      <Text className="font-semibold text-gray-800">Call Owner</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Tabs (Overview, Amenities, Reviews, Location) */}
                  <View className="mb-2 flex-row border-b border-gray-200">
                    {['Overview', 'Amenities', 'Reviews', 'Location'].map((tab) => (
                      <TouchableOpacity
                        key={tab}
                        className={`flex-1 items-center pb-2 ${activeTab === tab ? 'border-b-2 border-blue-600 bg-transparent' : 'bg-transparent'}`}
                        onPress={() => setActiveTab(tab as typeof activeTab)}>
                        <Text
                          className={`text-xs font-semibold 
                            ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`}>
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {/* Contents Display */}
                  <View className="mb-2 h-[50%]">{renderTabContent()}</View>
                  {/* Action Buttons */}
                  <TouchableOpacity className="mb-2 w-full items-center rounded-lg bg-blue-500 py-3">
                    <Text className="font-bold text-white">File an Application to Rent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="w-full items-center rounded-lg border border-blue-500 py-3">
                    <Text className="font-bold text-blue-600">Schedule a Visit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Feed Content */}
      <ScrollView className="flex-1 bg-white">
        <View className="px-4 pt-12">
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
                className="ml-2 flex-1"
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

          {/* Categories */}
          <View className="mb-4 flex-row justify-between">
            {['All', 'Rooms', 'Apartments', 'Bedspace'].map((category) => (
              <TouchableOpacity
                key={category}
                className={`rounded-lg px-4 py-2 ${
                  selectedCategory === category ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  className={`${selectedCategory === category ? 'text-white' : 'text-gray-800'}`}>
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
