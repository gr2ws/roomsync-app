// AdminUserManagementScreen.tsx
// User management dashboard for admin panel

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'renter' | 'property_owner' | 'both';
  isVerified: boolean;
  propertiesListed: number;
  applications: number;
  lastActive: string;
  avatarUrl: string;
}

export default function AdminUserManagementScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Dummy user data
  const users: User[] = useMemo(() => [
    {
      id: 1,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      role: "property_owner",
      isVerified: true,
      propertiesListed: 3,
      applications: 0,
      lastActive: "2 hours ago",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "John Dela Cruz",
      email: "john.delacruz@email.com",
      role: "renter",
      isVerified: false,
      propertiesListed: 0,
      applications: 5,
      lastActive: "1 day ago",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Ana Rodriguez",
      email: "ana.rodriguez@email.com",
      role: "both",
      isVerified: true,
      propertiesListed: 2,
      applications: 3,
      lastActive: "30 minutes ago",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      role: "property_owner",
      isVerified: false,
      propertiesListed: 1,
      applications: 0,
      lastActive: "3 days ago",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      role: "renter",
      isVerified: true,
      propertiesListed: 0,
      applications: 8,
      lastActive: "1 hour ago",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      role: "property_owner",
      isVerified: true,
      propertiesListed: 4,
      applications: 0,
      lastActive: "4 hours ago",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
  ], []);

  // Calculate user statistics
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const renters = users.filter(user => user.role === 'renter' || user.role === 'both').length;
    const propertyOwners = users.filter(user => user.role === 'property_owner' || user.role === 'both').length;
    const verificationPending = users.filter(user => !user.isVerified).length;

    return { totalUsers, renters, propertyOwners, verificationPending };
  }, [users]);

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const handleViewUser = (userId: number) => {
    console.log(`Viewing user ${userId}`);
    // Add view user logic here
  };

  const handleMessageUser = (userId: number) => {
    console.log(`Messaging user ${userId}`);
    // Add message user logic here
  };

  const handleSuspendUser = (userId: number) => {
    console.log(`Suspending user ${userId}`);
    // Add suspend user logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
      <ScrollView className="px-4 pb-4 pt-0" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View className="mb-6 pt-0">
          <Text className="text-3xl font-bold text-gray-900 mb-2">User Management</Text>
        </View>

        {/* User Statistics Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers.toString()}
            icon="people"
            color="#3B82F6"
          />
          <StatCard
            title="Renters"
            value={userStats.renters.toString()}
            icon="person"
            color="#10B981"
          />
          <StatCard
            title="Property Owners"
            value={userStats.propertyOwners.toString()}
            icon="home"
            color="#F59E0B"
          />
          <StatCard
            title="Verification Pending"
            value={userStats.verificationPending.toString()}
            icon="time"
            color="#EF4444"
          />
        </View>

        {/* Search and Filter Section */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <Ionicons name="search" size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3">Filter by role:</Text>
            <View className="flex-row flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'renter', label: 'Renters' },
                { key: 'property_owner', label: 'Owners' },
                { key: 'both', label: 'Both' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                    selectedRole === filter.key 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => setSelectedRole(filter.key)}
                >
                  <Text className={`text-sm font-medium ${
                    selectedRole === filter.key 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Users List Section */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Users ({filteredUsers.length})</Text>
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={() => handleViewUser(user.id)}
              onMessage={() => handleMessageUser(user.id)}
              onSuspend={() => handleSuspendUser(user.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------- Component Definitions ------------------- */

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200" style={{ width: CARD_WIDTH - 0 }}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon as any} size={20} color={color} />
        <Text className="text-xs text-gray-600 ml-1.5 mr-1.5 font-medium">{title}</Text>
      </View>
      <Text className="text-lg font-bold" style={{ color }}>{value}</Text>
    </View>
  );
}

function UserCard({ user, onView, onMessage, onSuspend }: { 
  user: User; 
  onView: () => void; 
  onMessage: () => void; 
  onSuspend: () => void; 
}) {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'renter': return 'Renter';
      case 'property_owner': return 'Property Owner';
      case 'both': return 'Both';
      default: return role;
    }
  };

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">
      <View className="flex-row items-start mb-4">
        <View className="relative mr-4">
          <Image 
            source={{ uri: user.avatarUrl }} 
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
          {user.isVerified && (
            <View className="absolute -top-1 -right-1 bg-green-500 px-2 py-1 rounded-full">
              <Text className="text-xs text-white font-medium">Verified</Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-gray-900 mr-2">{user.name}</Text>
            {!user.isVerified && (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-yellow-800 font-medium">Pending</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600 mb-1">{user.email}</Text>
          <Text className="text-sm text-blue-600 font-medium">{getRoleDisplay(user.role)}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">{user.propertiesListed}</Text>
          <Text className="text-xs text-gray-600">Properties</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">{user.applications}</Text>
          <Text className="text-xs text-gray-600">Applications</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">{user.lastActive}</Text>
          <Text className="text-xs text-gray-600">Last Active</Text>
        </View>
      </View>
      
      <View className="flex-col justify-between gap-3">
        <TouchableOpacity className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg" onPress={onView}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text className="text-sm font-medium text-blue-600 ml-2">View</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-green-50 px-4 py-2 rounded-lg" onPress={onMessage}>
          <Ionicons name="chatbubble-outline" size={16} color="#10B981" />
          <Text className="text-sm font-medium text-green-600 ml-2">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-red-50 px-4 py-2 rounded-lg" onPress={onSuspend}>
          <Ionicons name="ban-outline" size={16} color="#EF4444" />
          <Text className="text-sm font-medium text-red-600 ml-2">Suspend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Constants ------------------- */
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // 2 cards per row with padding

