import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

// Copied from FeedScreen.tsx - consider moving to a central types file
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

interface FeedScreenModalProps {
  visible: boolean;
  onClose: () => void;
  room: Room | null;
}

export default function FeedScreenModal({ visible, onClose, room }: FeedScreenModalProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Amenities' | 'Reviews' | 'Location'>(
    'Overview'
  );

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

  const handleClose = () => {
    setActiveTab('Overview');
    onClose();
  };

  // Modal content for each tab
  const renderTabContent = () => {
    if (!room) return null;
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
              <Text className="text-xs text-gray-600">Type: {room.category}</Text>
              <Text className="text-xs text-gray-600">Availability: Available</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-600">Area: Hibbard</Text>
              <Text className="text-xs text-gray-600">
                Monthly Rate: ₱{room.price?.toLocaleString()}
              </Text>
            </View>
          </>
        );
      case 'Amenities':
        return (
          <>
            <Text className="mb-1 font-bold text-gray-800">Available Amenities</Text>
            <View className="mb-2 h-[72%] flex-row flex-wrap overflow-scroll">
              {room.amenities.map((amenity, idx) => (
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
              <View className="h-[80%] rounded-sm  bg-slate-200" />
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
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="h-[80%] w-[95%] overflow-hidden rounded-xl bg-white">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
            {/* Image */}
            {room && (
              <View>
                <Image source={room.image} className="h-48 w-full" resizeMode="cover" />
                {/* Close Button */}
                <Pressable
                  onPress={handleClose}
                  className="absolute left-2 top-2 rounded-full bg-white/80 p-1">
                  <Ionicons name="arrow-back" size={24} color="#222" />
                </Pressable>
              </View>
            )}
            <View className="flex-1 gap-2 px-4 pb-6 pt-3">
              {/* Title, Price, Location */}
              <View className="mb-1 flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-bold text-gray-900">{room?.title}</Text>
                  <Text className="text-xs text-gray-600">{room?.location} City Proper</Text>
                  <Text className="mt-0.5 text-[10px] text-gray-400">0.3 km to Silliman</Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-bold text-gray-800">
                    ₱{room?.price?.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-gray-500">/month</Text>
                </View>
              </View>
              {/* Rating, Roommates, Availability */}
              <View className="mb-2 flex-row items-center">
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text className="ml-1 mr-3 text-base font-semibold text-gray-700">
                  {room?.rating ?? '--'}
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
                    onPress={() => setActiveTab(tab as any)}>
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
    </Modal>
  );
}
