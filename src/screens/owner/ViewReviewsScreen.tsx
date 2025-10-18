import { View, Text, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react-native';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  unhelpful: number;
  propertyName: string;
}

export default function ViewReviewsScreen() {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      userName: 'Juan Dela Cruz',
      userAvatar: 'https://ui-avatars.com/api/?name=John+Doe',
      rating: 3,
      comment:
        'Great property! Very clean and well maintained. The location is perfect and the amenities are excellent.',
      date: '2025-09-01',
      helpful: 12,
      unhelpful: 2,
      propertyName: 'Silliman Residences',
    },
    {
      id: '2',
      userName: 'Viktor Magtatanggol',
      userAvatar: 'https://ui-avatars.com/api/?name=John+Doe',
      rating: 5,
      comment:
        'Nindot kaayo nga property! Limpyo gyud kaayo ug maayo pagkamentinar. Ang lokasyon perpekto, ug ang mga amenities nindot kaayo.',
      date: '2025-08-04',
      helpful: 652,
      unhelpful: 15,
      propertyName: 'Portal West Apartments',
    },
    {
      id: '3',
      userName: 'Ricardo  Milos',
      userAvatar: 'https://ui-avatars.com/api/?name=John+Doe',
      rating: 4,
      comment:
        'Ang ganda ng property! Talagang sobrang linis at inaalagaan. Hindi matatawaran ang lokasyon, at pang-best talaga ang mga kagamitan at pasilidad.',
      date: '2025-05-21',
      helpful: 18,
      unhelpful: 0,
      propertyName: 'Rizal Boulevard Suites',
    },
  ]);

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color="#FBC02D"
            fill={star <= rating ? '#FBC02D' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center">
        <Image source={{ uri: item.userAvatar }} className="h-10 w-10 rounded-full" />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{item.userName}</Text>
          <Text className="text-sm text-gray-500">{item.propertyName}</Text>
        </View>
        <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</Text>
      </View>

      {renderStars(item.rating)}

      <Text className="my-3 leading-6 text-gray-700">{item.comment}</Text>

      <View className="flex-row space-x-4">
        <View className="flex-row items-center">
          <ThumbsUp size={16} color="#6B7280" />
          <Text className="ml-1 text-gray-600">{item.helpful}</Text>
        </View>
        <View className="flex-row items-center">
          <ThumbsDown size={16} color="#6B7280" />
          <Text className="ml-1 text-gray-600">{item.unhelpful}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="border-b border-gray-200 bg-white p-4">
        <Text className="text-2xl font-bold text-gray-900">Property Reviews</Text>
        <View className="mt-2 flex-row items-center">
          <Star size={20} color="#FBC02D" fill="#FBC02D" />
          <Text className="ml-1 text-lg font-semibold">4</Text>
          <Text className="ml-1 text-gray-600">• {reviews.length} reviews</Text>
        </View>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
      />
    </View>
  );
}
