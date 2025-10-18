// ...existing code...
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js'; 
import {supabase} from '../utils/supabase';
import { is } from 'zod/v4/locales';

export default function AdminUserManagementScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { verifyUser } = useAdminData(); // stop using store users; display comes from supabase

  // Pagination state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState<number>(0); // zero-based
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Fetch users from supabase with pagination
  const fetchUsers = async (pageNum = 0) => {
    try {
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('user_id', { ascending: true })
        .range(from, to);

      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }

      // Normalize each row into the shape your UI expects
      const normalized = (data ?? []).map((u: any, index: number) => ({
        // primary identifiers
        id: index,
        user_id: u.user_id ?? '',
        auth_id: u.auth_id ?? '',
        // name fields
        first_name: u.first_name ?? '',
        last_name: u.last_name ?? '',
        // contact / profile
        email: u.email ?? '',
        phoneNumber: u.phone_number ?? '',
        // avatar/profile URL 
        profile_picture: u.profile_picture ?? 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg',
        // flags / role
        isWarned: !!u.is_warned,
        isBanned: !!u.is_banned,
        isVerified: !!(u.is_verified ?? u.isVerified),
        role: u.user_type || '',
        // counts / meta
        propertiesListed: u.properties_listed ?? u.propertiesListed ?? 0,
        applications: u.applications ?? 0,
        last_login_date: u.last_login_date ?? '',
      }));

      setUsers(normalized);
      setTotalCount(count ?? normalized.length);
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Calculate user statistics (based on current page's users)
  const userStats = useMemo(() => {
    const totalUsers = totalCount;
    const renters = users.filter((user) => user.role === 'renter').length;
    const propertyOwners = users.filter((user) => user.role === 'property_owner').length;
    const verificationPending = users.filter((user) => !user.isVerified).length;

    return { totalUsers, renters, propertyOwners, verificationPending };
  }, [users, totalCount]);

  // Filter users based on search and role (applies to current page)
const filteredUsers = useMemo(() => {
  return users.filter((user) => {
    const first_name = user.first_name?.toLowerCase() ?? '';
    const last_name =  user.last_name?.toLowerCase() ?? '';
    const name = `${first_name} ${last_name}`.trim();
    const email = user.email?.toLowerCase() ?? '';
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());

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
    const user = users.find((u) => u.id === userId);
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
    <View
      className="flex-1 bg-white"
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top, // use insets.top for both platforms to handle safe area via flexbox
      }}>
      <ScrollView
        className="px-4 pb-4 pt-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View className="mb-6 pt-1">
          <Text className="mb-2 text-3xl font-bold text-gray-900">User Management</Text>
        </View>

        {/* User Statistics Cards */}
        <View className="mb-1 flex-row flex-wrap justify-evenly gap-2">
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
        <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-4 flex-row items-center rounded-xl bg-gray-50 px-4 py-3">
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
            <Text className="mb-3 text-sm font-medium text-gray-700">Filter by role:</Text>
            <View className="flex-row flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'renter', label: 'Renters' },
                { key: 'property_owner', label: 'Owners' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  className={`mb-2 mr-2 rounded-lg px-4 py-2 ${
                    selectedRole === filter.key ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  onPress={() => setSelectedRole(filter.key)}>
                  <Text
                    className={`text-sm font-medium ${
                      selectedRole === filter.key ? 'text-white' : 'text-gray-700'
                    }`}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Pagination Controls */}
        <View className="mb-4 flex-row items-center justify-between px-2">
          <Text className="text-sm text-gray-600">
            Page {page + 1} of {totalPages} — Showing {users.length} of {totalCount}
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`mr-2 rounded-lg px-3 py-2 ${page === 0 ? 'bg-gray-200' : 'bg-blue-50'}`}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}>
              <Text className={`text-sm ${page === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                Prev
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg px-3 py-2 ${
                page + 1 >= totalPages ? 'bg-gray-200' : 'bg-blue-50'
              }`}
              onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page + 1 >= totalPages}>
              <Text className={`text-sm ${page + 1 >= totalPages ? 'text-gray-400' : 'text-blue-600'}`}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Users List Section */}
        <View className="px-4 pt-4">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </Text>
          {filteredUsers.map((user) => (
            <UserCard
              key={user.auth_id}
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
          <View className="rounded-full bg-emerald-600 px-4 py-2 shadow">
            <Text className="text-sm font-medium text-white">{toastMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------- Component Definitions ------------------- */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View
      className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-4 w-44">
      <View className="mb-2 flex-row items-center">
        <Ionicons name={icon as any} size={20} color={color} />
        <Text className="ml-1.5 mr-1.5 text-xs font-medium text-gray-600">{title}</Text>
      </View>
      <Text className="text-lg font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

function UserCard({
  user,
  onView,
  onMessage,
  onSuspend,
  onVerify,
}: {
  user: AdminUser;
  onView: () => void;
  onMessage: () => void;
  onSuspend: () => void;
  onVerify: () => void;
}) {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'renter':
        return 'Renter';
      case 'owner':
        return 'Property Owner';
      case 'both':
        return 'Both';
      default:
        return '<role_err>';
    }
  };

const lastActiveDate: any = new Date(user.last_login_date);
const now: any = new Date();
const diffMs = now - lastActiveDate;
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
const isActive = true;

// let isActive;
// let wasActiveWhen;

// if (diffDays <= 0) {
//   isActive = true;
// } else if (diffDays < 7) {
//   isActive = false;
//   wasActiveWhen = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
// } else if (diffDays < 28) {
//   isActive = false;
//   const weeks = Math.floor(diffDays / 7);
//   wasActiveWhen = `${weeks} week${weeks === 1 ? '' : 's'} ago`;
// } else if (diffDays < 365) {
//   isActive = false;
//   const months = Math.floor(diffDays / 30);
//   wasActiveWhen = `${months} month${months === 1 ? '' : 's'} ago`;
// } else {
//   isActive = false;
//   wasActiveWhen = 'a long time ago';
// }
  return (
    <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <View className="mb-4 flex-row items-start">
        <View className="relative mr-4">
          <Image
            source={{ uri: user.profile_picture }}
            className="h-16 w-16 rounded-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <View
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: isActive ? '#22c55e' : '#9CA3AF' }}
            />
            {/* truncated name so the Verified/Pending pill remains visible */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="mr-2 text-lg font-semibold text-gray-900"
              style={{ flexShrink: 1 }}>
              {`${user.first_name ?? ''} ${user.last_name ?? ''}`}
            </Text>
            {user.isVerified ? 
            (
              <View className="rounded-full bg-green-100 px-2 py-1">
                <Text className="text-xs font-medium text-green-700">Verified</Text>
              </View>
            ) : (
              <View className="rounded-full bg-yellow-100 px-2 py-1">
                <Text className="text-xs font-medium text-yellow-800">Pending</Text>
              </View>
            )}
          </View>
          <Text className="mb-1 text-sm text-gray-600">{user.email}</Text>
          <Text className="text-sm font-medium text-blue-600">{getRoleDisplay(user.role)}</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center justify-center">
        {user.role === 'property_owner' && (
          <View className="mx-6 items-center">
            <Text className="text-center text-lg font-bold text-gray-900">
              {user.propertiesListed}
            </Text>
            <Text className="text-center text-xs text-gray-600">Properties</Text>
          </View>
        )}
        {user.role === 'renter' && (
          <View className="mx-6 items-center">
            <Text className="text-center text-lg font-bold text-gray-900">{user.applications}</Text>
            <Text className="text-center text-xs text-gray-600">Applications</Text>
          </View>
        )}
        <View className="mx-6 items-center">
          <View className="flex-row items-center">
            <View
              className={`mr-1.5 h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <Text className="text-lg font-bold text-gray-900">{user.last_login_date}</Text>
          </View>
          <Text className="text-center text-xs text-gray-600">Last Active</Text>
        </View>
      </View>

      <View className="flex-col justify-between gap-3">
        <TouchableOpacity
          className={`flex-row items-center rounded-lg px-4 py-2 ${user.isVerified ? 'bg-emerald-100' : 'bg-emerald-50'}`}
          onPress={() => {
            if (!user.isVerified) onVerify();
          }}
          disabled={user.isVerified}
          style={{ opacity: user.isVerified ? 0.1 : 1 }} // 👈 dims everything
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
          <Text className="ml-2 text-sm font-medium text-emerald-700">Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-blue-50 px-4 py-2"
          onPress={onView}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text className="ml-2 text-sm font-medium text-blue-600">View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-slate-100 px-4 py-2"
          onPress={onMessage}>
          <Ionicons name="chatbubble-outline" size={16} color="gray" />
          <Text className="ml-2 text-sm font-medium text-slate-800">Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}