// AdminUserManagementScreen.tsx
// User management dashboard for admin panel

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAdminData } from '../store/useAdminData';
import type { AdminUser } from '../store/useAdminData';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type User = AdminUser;

export default function AdminUserManagementScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { users, verifyUser } = useAdminData();

  // Calculate user statistics
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const renters = users.filter(user => user.role === 'renter').length;
    const propertyOwners = users.filter(user => user.role === 'property_owner').length;
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

  const handleVerifyUser = (userId: number) => {
    verifyUser(userId);
    setToastMessage('User verified successfully!');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleViewUser = (userId: number) => {
    console.log(`Viewing user ${userId}`);
    // Add view user logic here
  };

  const handleMessageUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const smsUrl = `sms:${user.phoneNumber}`;
    Linking.openURL(smsUrl).catch(() => {
      setToastMessage('Unable to open SMS app');
      setTimeout(() => setToastMessage(null), 2000);
    });
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
              onVerify={() => handleVerifyUser(user.id)}
            />
          ))}
        </View>
      </ScrollView>
      {toastMessage && (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <View className="px-4 py-2 rounded-full bg-emerald-600 shadow">
            <Text className="text-white text-sm font-medium">{toastMessage}</Text>
          </View>
        </View>
      )}
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

function UserCard({ user, onView, onMessage, onSuspend, onVerify }: { 
  user: User; 
  onView: () => void; 
  onMessage: () => void; 
  onSuspend: () => void; 
  onVerify: () => void;
}) {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'renter': return 'Renter';
      case 'property_owner': return 'Property Owner';
      case 'both': return 'Both';
      default: return role;
    }
  };

  const isActive = (user.lastActive || '').toLowerCase().includes('ago');

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">
      <View className="flex-row items-start mb-4">
        <View className="relative mr-4">
          <Image 
            source={{ uri: user.avatarUrl }} 
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: isActive ? '#22c55e' : '#9CA3AF' }} />
            <Text className="text-lg font-semibold text-gray-900 mr-2">{user.name}</Text>
            {user.isVerified ? (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-green-700 font-medium">Verified</Text>
              </View>
            ) : (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-yellow-800 font-medium">Pending</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600 mb-1">{user.email}</Text>
          <Text className="text-sm text-blue-600 font-medium">{getRoleDisplay(user.role)}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-center items-center mb-4">
        {user.role === 'property_owner' && (
          <View className="items-center mx-6">
            <Text className="text-lg font-bold text-gray-900 text-center">{user.propertiesListed}</Text>
            <Text className="text-xs text-gray-600 text-center">Properties</Text>
        </View>
        )}
        {user.role === 'renter' && (
          <View className="items-center mx-6">
            <Text className="text-lg font-bold text-gray-900 text-center">{user.applications}</Text>
            <Text className="text-xs text-gray-600 text-center">Applications</Text>
        </View>
        )}
        <View className="items-center mx-6">
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text className="text-lg font-bold text-gray-900">{user.lastActive}</Text>
          </View>
          <Text className="text-xs text-gray-600 text-center">Last Active</Text>
        </View>
      </View>
      
      <View className="flex-col justify-between gap-3">
      <TouchableOpacity
        className={`flex-row items-center px-4 py-2 rounded-lg ${user.isVerified ? 'bg-emerald-100' : 'bg-emerald-50'}`}
        onPress={() => { if (!user.isVerified) onVerify(); }}
        disabled={user.isVerified}
        style={{ opacity: user.isVerified ? 0.1 : 1 }}   // 👈 dims everything
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color="#059669"
        />
        <Text className="text-sm font-medium ml-2 text-emerald-700">
          Verify
        </Text>
      </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg" onPress={onView}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text className="text-sm font-medium text-blue-600 ml-2">View</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-slate-100 px-4 py-2 rounded-lg" onPress={onMessage}>
          <Ionicons name="chatbubble-outline" size={16} color="gray" />
          <Text className="text-sm font-medium text-slate-800 ml-2">Message</Text>
        </TouchableOpacity>
        {/* Removed Suspend button per requirements */}
      </View>
    </View>
  );
}

/* ------------------- Constants ------------------- */
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // 2 cards per row with padding

