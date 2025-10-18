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
  const [selectedVerification, setSelectedVerification] = useState<'all' | 'verified' | 'unverified'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [banConfirmVisible, setBanConfirmVisible] = useState(false);
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);

  const { verifyUser } = useAdminData(); // stop using store users; display comes from supabase

  // Pagination state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState<number>(0); // zero-based
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Reset pagination when filters or search change
useEffect(() => {
  setPage(0);
}, [selectedRole, selectedVerification, searchQuery]);

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('user_id', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return;
    }

    const normalized = (data ?? []).map((u: any, index: number) => ({
      id: index,
      user_id: u.user_id ?? '',
      auth_id: u.auth_id ?? '',
      first_name: u.first_name ?? '',
      last_name: u.last_name ?? '',
      email: u.email ?? '',
      phoneNumber: u.phone_number ?? '',
      profile_picture:
        u.profile_picture ??
        'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg',
      isWarned: !!u.is_warned,
      isBanned: !!u.is_banned,
      isVerified: !!(u.is_verified ?? u.isVerified),
      role: u.user_type || '',
      propertiesListed: u.properties_listed ?? u.propertiesListed ?? 0,
      applications: u.applications ?? 0,
      last_login_date: u.last_login_date ?? '',
    }));

    setUsers(normalized);
    setTotalCount(normalized.length);
  } catch (err) {
    console.error('Unexpected fetch error:', err);
  }
};

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate user statistics (based on current page's users)
  const userStats = useMemo(() => {
    const totalUsers = totalCount;
    const renters = users.filter((user) => user.role === 'renter').length;
    const propertyOwners = users.filter((user) => user.role === 'owner').length;
    const verificationPending = users.filter((user) => !user.isVerified).length;
    const verifiedUsers = users.filter((user) => user.isVerified).length;
    const unverifiedUsers = users.filter((user) => !user.isVerified).length;
    return { totalUsers, renters, propertyOwners, verificationPending, verifiedUsers, unverifiedUsers };
  }, [users, totalCount]);

  // Filter users based on search and role (applies to current page)
// Apply all filters first
const filteredUsers = useMemo(() => {
  return users
    .filter((user) => !user.isBanned) // hide banned users
    .filter((user) => user.role === 'renter' || user.role === 'owner') // show only renters/owners (hide admins)
    .filter((user) => {
    const first_name = user.first_name?.toLowerCase() ?? '';
    const last_name = user.last_name?.toLowerCase() ?? '';
    const name = `${first_name} ${last_name}`.trim();
    const email = user.email?.toLowerCase() ?? '';
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'all' || user.role === selectedRole;

    const matchesVerification =
      selectedVerification === 'all' ||
      (selectedVerification === 'verified' && user.isVerified) ||
      (selectedVerification === 'unverified' && !user.isVerified);

    return matchesSearch && matchesRole && matchesVerification;
  });
}, [users, searchQuery, selectedRole, selectedVerification]);

// Apply pagination *after filtering*
const paginatedUsers = useMemo(() => {
  const from = page * pageSize;
  const to = from + pageSize;
  return filteredUsers.slice(from, to);
}, [filteredUsers, page, pageSize]);

const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

const handleVerifyUser = async (userId: number) => {
  try {
    // Find the user record
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Update the Supabase record
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('auth_id', user.auth_id);

    if (error) {
      console.error('Verification update failed:', error);
      setToastMessage('Failed to verify user');
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    // Locally update state for instant UI feedback
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isVerified: true } : u
      )
    );

    setToastMessage('User verified successfully!');
    setTimeout(() => setToastMessage(null), 2000);
  } catch (err) {
    console.error('Unexpected error verifying user:', err);
    setToastMessage('Error verifying user');
    setTimeout(() => setToastMessage(null), 2000);
  }
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

// helper to build an encoded mailto URL
const buildMailTo = (to: string, subject = '', body = '') => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);

  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, '%20')}`;
};

const handleWarnUser = (userId: number) => {
  const user = users.find(u => u.id === userId);
  if (!user || !user.email) {
    setToastMessage('User has no email address');
    setTimeout(() => setToastMessage(null), 2000);
    return;
  }

  const subject = `[WARNING] From Roomsync`;
  const body = `Hi ${user.first_name ?? ''},

We have been made aware of activity on your account that violates our community guidelines.

Please consider this as a formal warning. We are continuing to monitor your account for suspicious behavior; should this persist, you may lose access to your account entirely.

At Roomsync, we are committed to keeping the community safe, and our clients happy. We take complaints like these seriously to ensure we meet that goal.

Should you find reason for us to consider an appeal from you, please send us an email at roomsync@gmail.com.
    
-Roomsync Team`;

      const mailto = buildMailTo(user.email, subject, body);

      Linking.canOpenURL(mailto).then((supported) => {
        if (!supported) {
          setToastMessage('No mail app available on this device.');
          setTimeout(() => setToastMessage(null), 2000);
        } else {
          Linking.openURL(mailto).catch((err) => {
            console.error('Failed to open mail app', err);
            setToastMessage('Unable to open mail app');
            setTimeout(() => setToastMessage(null), 2000);
          });
        }
      });
    };


    const handleBanUser = async (userId: number) => {
      try {
        const user = users.find((u) => u.id === userId);
        if (!user) return;
    
        const { error } = await supabase
          .from('users')
          .update({ is_banned: true })
          .eq('auth_id', user.auth_id);
    
        if (error) {
          console.error('Ban update failed:', error);
          setToastMessage('Failed to ban user');
          setTimeout(() => setToastMessage(null), 2000);
          return;
        }
    
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isBanned: true } : u
          )
        );
    
        setToastMessage('User has been banned');
        setTimeout(() => setToastMessage(null), 2000);
      } catch (err) {
        console.error('Unexpected error banning user:', err);
        setToastMessage('Error banning user');
        setTimeout(() => setToastMessage(null), 2000);
      }
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
            {/* filter btns */}
            <View className="flex-row flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'renter', label: 'Renters' },
                { key: 'owner', label: 'Owners' },
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

          <Text className="mb-3 mt-3 text-sm font-medium text-gray-700">Verification Status:</Text>
          <View className="flex-row flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'verified', label: 'Verified' },
              { key: 'unverified', label: 'Unverified' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`mb-2 mr-2 rounded-lg px-4 py-2 ${
                  selectedVerification === filter.key ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
                onPress={() => setSelectedVerification(filter.key as any)}>
                <Text
                  className={`text-sm font-medium ${
                    selectedVerification === filter.key ? 'text-white' : 'text-gray-700'
                  }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pagination Controls */}
        <View className="mb-4 flex-row items-center justify-between px-2">
        <Text className="text-sm text-gray-600">
            Page {page + 1} of {totalPages} — Showing{" "}
            {filteredUsers.length === 0
              ? 0
              : `${page * pageSize + 1} to ${Math.min(
                  (page + 1) * pageSize,
                  filteredUsers.length
                )}`}{" "}
            of {filteredUsers.length}
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
          {selectedVerification === 'all' ? 'All ' : selectedVerification === 'verified' ? 'Verified ' : 'Unverified '}
          {selectedRole === 'all' ? 'Users' : selectedRole === 'renter' ? 'Renters' : 'Owners'}

        </Text>
        {paginatedUsers.map((user) => (
          <UserCard
            key={user.auth_id}
            user={user}
            onVerify={() => handleVerifyUser(user.id)}
            onView={() => handleViewUser(user.id)}
            onMessage={() => handleMessageUser(user.id)}
            onWarn={() => handleWarnUser(user.id)}
            onBan={() => {
              setUserToBan(user);
              setBanConfirmVisible(true);
            }}
            />
          ))}
        </View>
      </ScrollView>

       {banConfirmVisible && userToBan && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="w-80 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">Confirm Ban</Text>
            <Text className="mb-6 text-sm text-gray-700">
              Are you sure you want to ban{" "}
              <Text className="font-bold">
                {userToBan.first_name} {userToBan.last_name}
              </Text>
              ? This will immediately disable their access.
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="rounded-lg bg-gray-200 px-4 py-2"
                onPress={() => {
                  setBanConfirmVisible(false);
                  setUserToBan(null);
                }}>
                <Text className="text-sm font-medium text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg bg-red-600 px-4 py-2"
                onPress={async () => {
                  setBanConfirmVisible(false);
                  if (userToBan) await handleBanUser(userToBan.id);
                  setUserToBan(null);
                }}>
                <Text className="text-sm font-medium text-white">Ban User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
  onVerify,
  onView,
  onMessage,
  onWarn,
  onBan,
}: {
  user: AdminUser;
  onVerify: () => void;
  onView: () => void;
  onMessage: () => void;
  onWarn: () => void;
  onBan: () => void;
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

  const lastActiveDate = new Date(user.last_login_date);
  const now = new Date();
  
  // If invalid date, fallback to "a long time ago"
  let isActive = false;
  let lastActiveLabel = 'a long time ago';
  
  if (!isNaN(lastActiveDate.getTime())) {
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) {
      // Same day
      isActive = true;
      lastActiveLabel = 'Today';
    } else if (diffDays < 7) {
      // Within the same week
      isActive = false;
      lastActiveLabel = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffDays < 30) {
      // Within the same month
      const weeks = Math.floor(diffDays / 7);
      isActive = false;
      lastActiveLabel = `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    } else if (diffDays < 365) {
      // Within the same year
      const months = Math.floor(diffDays / 30);
      isActive = false;
      lastActiveLabel = `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      // More than a year ago
      isActive = false;
      lastActiveLabel = 'a long time ago';
    }
  } else {
    // Invalid or missing date
    lastActiveLabel = 'a long time ago';
  }

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
        {user.role === 'owner' && (
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
          <Text className="text-lg font-bold text-gray-900">{lastActiveLabel}</Text>
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
        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-yellow-100 px-4 py-2"
          onPress={onWarn}>
          <Ionicons name="warning-outline" size={16} color="gray" />
          <Text className="ml-2 text-sm font-medium text-slate-800">Warn</Text>
        </TouchableOpacity>
        <TouchableOpacity
            className="flex-row items-center rounded-lg bg-red-100 px-4 py-2"
            onPress={onBan}
            disabled={user.isBanned}
            style={{ opacity: user.isBanned ? 0.4 : 1 }}
          >
            <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
            <Text className="ml-2 text-sm font-medium text-red-700">
              {user.isBanned ? 'Banned' : 'Ban'}
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}