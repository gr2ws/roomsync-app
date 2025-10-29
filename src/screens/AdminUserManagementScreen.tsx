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
import { supabase } from '../utils/supabase';

export default function AdminUserManagementScreen() {
  const insets = useSafeAreaInsets();

  // Entity type filter - primary filter for Users or Properties
  const [entityType, setEntityType] = useState<'users' | 'properties'>('users');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<
    'all' | 'verified' | 'unverified'
  >('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User-related modals
  const [verifyConfirmVisible, setVerifyConfirmVisible] = useState(false);
  const [userToVerify, setUserToVerify] = useState<AdminUser | null>(null);

  const [viewUserVisible, setViewUserVisible] = useState(false);
  const [userToView, setUserToView] = useState<AdminUser | null>(null);

  const [banConfirmVisible, setBanConfirmVisible] = useState(false);
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);

  // Property-related modals
  const [verifyPropertyConfirmVisible, setVerifyPropertyConfirmVisible] = useState(false);
  const [propertyToVerify, setPropertyToVerify] = useState<any | null>(null);

  const [viewPropertyVisible, setViewPropertyVisible] = useState(false);
  const [propertyToView, setPropertyToView] = useState<any | null>(null);

  const { verifyUser } = useAdminData(); // stop using store users; display comes from supabase

  // Users Pagination state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState<number>(0); // zero-based
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Properties state
  const [properties, setProperties] = useState<any[]>([]);
  const [propertiesPage, setPropertiesPage] = useState<number>(0);
  const [propertiesTotalCount, setPropertiesTotalCount] = useState<number>(0);

  // Reset pagination when filters or search change
  useEffect(() => {
    setPage(0);
    setPropertiesPage(0);
  }, [selectedRole, selectedVerification, searchQuery, entityType]);

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
    fetchProperties();
  }, []);

  // Log when entity type changes
  useEffect(() => {
    console.log('[AdminUserManagement] Entity type changed to:', entityType);
    console.log('[AdminUserManagement] Properties available:', properties.length);
    console.log('[AdminUserManagement] Users available:', users.length);
  }, [entityType, properties.length, users.length]);

  const fetchProperties = async () => {
    try {
      console.log('[AdminUserManagement] Starting to fetch properties...');

      const { data, error } = await supabase
        .from('properties')
        .select(
          `
          *,
          owner:users!fk_properties_owner(
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            profile_picture
          )
        `
        )
        .order('property_id', { ascending: true });

      if (error) {
        console.error('[AdminUserManagement] Supabase fetch properties error:', error);
        return;
      }

      console.log('[AdminUserManagement] Properties fetched from DB:', data?.length || 0);
      console.log('[AdminUserManagement] Sample property data:', data?.[0]);

      // Fetch current occupants count for each property
      const propertiesWithOccupants = await Promise.all(
        (data ?? []).map(async (p: any, index: number) => {
          // Count current renters (users with rented_property = property_id)
          const { count: rentersCount, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('rented_property', p.property_id);

          if (countError) {
            console.error(
              '[AdminUserManagement] Error counting renters for property_id',
              p.property_id,
              ':',
              countError
            );
          }

          return {
            id: index,
            property_id: p.property_id ?? '',
            title: p.title ?? 'Untitled Property',
            city: p.city ?? '',
            barangay: p.barangay ?? '',
            street_address: p.street ?? '', // DB uses 'street' not 'street_address'
            monthly_rent: p.rent ?? 0, // DB uses 'rent' not 'monthly_rent'
            property_type: p.category ?? '', // DB uses 'category' not 'property_type'
            max_occupants: p.max_renters ?? 0, // DB uses 'max_renters'
            current_occupants: rentersCount || 0, // Count users with rented_property = property_id
            is_verified: p.is_verified ?? false,
            is_available: p.is_available ?? false,
            images: p.image_url ?? [], // DB uses 'image_url' not 'images'
            owner_id: p.owner_id ?? '',
            owner: p.owner
              ? {
                  user_id: p.owner.user_id,
                  first_name: p.owner.first_name ?? '',
                  last_name: p.owner.last_name ?? '',
                  email: p.owner.email ?? '',
                  phone_number: p.owner.phone_number ?? '',
                  profile_picture:
                    p.owner.profile_picture ??
                    'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg',
                }
              : null,
            description: p.description ?? '',
            amenities: p.amenities ?? [],
            created_at: p.created_at ?? '',
          };
        })
      );

      console.log(
        '[AdminUserManagement] Normalized properties count:',
        propertiesWithOccupants.length
      );
      console.log('[AdminUserManagement] Sample normalized property:', propertiesWithOccupants[0]);

      setProperties(propertiesWithOccupants);
      setPropertiesTotalCount(propertiesWithOccupants.length);

      console.log('[AdminUserManagement] Properties state updated successfully');
    } catch (err) {
      console.error('[AdminUserManagement] Unexpected fetch properties error:', err);
    }
  };

  // Calculate user statistics (based on current page's users)
  const userStats = useMemo(() => {
    const totalUsers = totalCount;
    const renters = users.filter((user) => user.role === 'renter').length;
    const propertyOwners = users.filter((user) => user.role === 'owner').length;
    const verificationPending = users.filter((user) => !user.isVerified).length;
    const verifiedUsers = users.filter((user) => user.isVerified).length;
    const unverifiedUsers = users.filter((user) => !user.isVerified).length;
    return {
      totalUsers,
      renters,
      propertyOwners,
      verificationPending,
      verifiedUsers,
      unverifiedUsers,
    };
  }, [users, totalCount]);

  // Calculate property statistics
  const propertyStats = useMemo(() => {
    const totalListings = propertiesTotalCount;
    const activeListings = properties.filter((p) => p.is_verified && p.is_available).length;
    const verifiedListings = properties.filter((p) => p.is_verified).length;
    const pendingVerification = properties.filter((p) => !p.is_verified).length;
    const unavailableListings = properties.filter((p) => !p.is_available).length;

    // Group by city
    const cityCounts: Record<string, number> = {};
    properties.forEach((p) => {
      const city = p.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalListings,
      activeListings,
      verifiedListings,
      pendingVerification,
      unavailableListings,
      topCities,
    };
  }, [properties, propertiesTotalCount]);

  // For filtering users
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
          name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;

        const matchesVerification =
          selectedVerification === 'all' ||
          (selectedVerification === 'verified' && user.isVerified) ||
          (selectedVerification === 'unverified' && !user.isVerified);

        return matchesSearch && matchesRole && matchesVerification;
      });
  }, [users, searchQuery, selectedRole, selectedVerification]);

  // For filtering properties
  const filteredProperties = useMemo(() => {
    console.log('[AdminUserManagement] Filtering properties...');
    console.log('[AdminUserManagement] Total properties:', properties.length);
    console.log('[AdminUserManagement] Search query:', searchQuery);
    console.log('[AdminUserManagement] Selected role/type:', selectedRole);
    console.log('[AdminUserManagement] Selected verification:', selectedVerification);

    const filtered = properties.filter((property) => {
      const title = property.title?.toLowerCase() ?? '';
      const city = property.city?.toLowerCase() ?? '';
      const barangay = property.barangay?.toLowerCase() ?? '';
      const location = `${city} ${barangay}`.trim();
      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) || location.includes(searchQuery.toLowerCase());

      const matchesType =
        selectedRole === 'all' || property.property_type?.toLowerCase() === selectedRole;

      const matchesVerification =
        selectedVerification === 'all' ||
        (selectedVerification === 'verified' && property.is_verified) ||
        (selectedVerification === 'unverified' && !property.is_verified);

      return matchesSearch && matchesType && matchesVerification;
    });

    console.log('[AdminUserManagement] Filtered properties count:', filtered.length);
    return filtered;
  }, [properties, searchQuery, selectedRole, selectedVerification]);

  // Apply pagination *after filtering* - for users
  const paginatedUsers = useMemo(() => {
    const from = page * pageSize;
    const to = from + pageSize;
    return filteredUsers.slice(from, to);
  }, [filteredUsers, page, pageSize]);

  // Apply pagination for properties
  const paginatedProperties = useMemo(() => {
    const from = propertiesPage * pageSize;
    const to = from + pageSize;
    const paginated = filteredProperties.slice(from, to);
    console.log(
      '[AdminUserManagement] Paginated properties:',
      paginated.length,
      'from',
      from,
      'to',
      to
    );
    return paginated;
  }, [filteredProperties, propertiesPage, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      (entityType === 'users' ? filteredUsers.length : filteredProperties.length) / pageSize
    )
  );
  const currentPage = entityType === 'users' ? page : propertiesPage;
  const setCurrentPage = entityType === 'users' ? setPage : setPropertiesPage;
  const currentFilteredData = entityType === 'users' ? filteredUsers : filteredProperties;

  const handleVerifyUser = async (userId: number) => {
    try {
      // Find the user record
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      // Update the user verification status at the users table
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

      // Update notification table
      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_auth_id: user.auth_id,
          notif_type: 'user_account_verified',
        },
      ]);

      if (notifError) {
        console.error('Failed to insert verification notification:', notifError);
        setToastMessage('Failed to notify user @ verification');
        setTimeout(() => setToastMessage(null), 2000);
        return;
      }

      // Locally update state for instant UI feedback
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isVerified: true } : u)));

      setToastMessage('User verified successfully!');
      setTimeout(() => setToastMessage(null), 2000);

      await fetchUsers();
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

  const handleWarnUser = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
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

    try {
      const supported = await Linking.canOpenURL(mailto);
      if (!supported) {
        setToastMessage('No mail app available on this device.');
        setTimeout(() => setToastMessage(null), 2000);
        return;
      }

      await Linking.openURL(mailto);

      // Update user’s isWarned to true in Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_warned: true })
        .eq('auth_id', user.auth_id);

      if (error) {
        console.error('Failed to update warning status:', error);
        setToastMessage('Failed to update warning status');
        setTimeout(() => setToastMessage(null), 2000);
        return;
      }

      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_auth_id: user.auth_id,
          notif_type: 'user_account_warned',
        },
      ]);

      if (notifError) {
        console.error('Failed to insert warning notification:', notifError);
        setToastMessage('Failed to notify user @ verification');
        setTimeout(() => setToastMessage(null), 2000);
      }

      // Update local UI state instantly
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isWarned: true } : u)));

      setToastMessage('Warning issued and status updated');
      setTimeout(() => setToastMessage(null), 2000);

      await fetchUsers();
    } catch (err) {
      console.error('Error sending warning:', err);
      setToastMessage('Unable to open mail app');
      setTimeout(() => setToastMessage(null), 2000);
    }
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
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: true } : u)));
      setToastMessage('User has been banned');
      setTimeout(() => setToastMessage(null), 2000);
    } catch (err) {
      console.error('Unexpected error banning user:', err);
      setToastMessage('Error banning user');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleVerifyProperty = async (propertyId: string) => {
    try {
      const property = properties.find((p) => p.property_id === propertyId);
      if (!property) return;

      // Update the property verification status
      const { error } = await supabase
        .from('properties')
        .update({ is_verified: true })
        .eq('property_id', propertyId);

      if (error) {
        console.error('Property verification update failed:', error);
        setToastMessage('Failed to verify property');
        setTimeout(() => setToastMessage(null), 2000);
        return;
      }

      // Send notification to property owner
      if (property.owner_id) {
        const { error: notifError } = await supabase.from('notifications').insert([
          {
            user_auth_id: property.owner_id,
            notif_type: 'property_verified',
            property_id: propertyId,
          },
        ]);

        if (notifError) {
          console.error('Failed to insert property verification notification:', notifError);
          setToastMessage('Property verified but notification failed');
          setTimeout(() => setToastMessage(null), 2000);
        }
      }

      // Update local state
      setProperties((prev) =>
        prev.map((p) => (p.property_id === propertyId ? { ...p, is_verified: true } : p))
      );

      setToastMessage('Property verified successfully!');
      setTimeout(() => setToastMessage(null), 2000);

      await fetchProperties();
    } catch (err) {
      console.error('Unexpected error verifying property:', err);
      setToastMessage('Error verifying property');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleContactOwner = (propertyId: string) => {
    const property = properties.find((p) => p.property_id === propertyId);
    if (!property || !property.owner) return;
    const smsUrl = `sms:${property.owner.phone_number}`;
    Linking.openURL(smsUrl).catch(() => {
      setToastMessage('Unable to open SMS app');
      setTimeout(() => setToastMessage(null), 2000);
    });
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top + 12 : insets.top, // use insets.top for both platforms to handle safe area via flexbox
      }}>
      <ScrollView
        className="px-4 pb-4 pt-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View className="mb-6 pt-1">
          <Text className="mb-2 text-3xl font-bold text-gray-900">User Management</Text>
        </View>

        {/* User Statistics Cards */}
        {entityType === 'users' ? (
          <View className="mb-1 flex-row flex-wrap justify-evenly gap-2 ">
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
        ) : (
          <View className="mb-1 flex-row flex-wrap justify-evenly gap-2 ">
            <StatCard
              title="Total Listings"
              value={propertyStats.totalListings.toString()}
              icon="business"
              color="#3B82F6"
            />
            <StatCard
              title="Active Listings"
              value={propertyStats.activeListings.toString()}
              icon="checkmark-done"
              color="#10B981"
            />
            <StatCard
              title="Verified"
              value={propertyStats.verifiedListings.toString()}
              icon="shield-checkmark"
              color="#6366F1"
            />
            <StatCard
              title="Pending Verification"
              value={propertyStats.pendingVerification.toString()}
              icon="time"
              color="#EF4444"
            />
          </View>
        )}

        {/* Search and Filter Section */}
        <View className="mb-4 rounded-2xl p-5 shadow-sm">
          <View className="mb-4 flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-2">
            <Ionicons name="search" size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder={
                entityType === 'users'
                  ? 'Search by name or email...'
                  : 'Search by property title or location...'
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="mb-3 text-sm font-medium text-gray-700">Filter:</Text>
            {/* Entity Type & Role filters in first row */}
            <View className="flex-row flex-wrap">
              {/* Entity Type Filter */}
              <TouchableOpacity
                className={`mb-2 mr-2 rounded-lg px-4 py-2 ${
                  entityType === 'users' ? 'bg-purple-500' : 'bg-gray-200'
                }`}
                onPress={() => setEntityType('users')}>
                <Text
                  className={`text-sm font-medium ${
                    entityType === 'users' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Users
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mb-2 mr-2 rounded-lg px-4 py-2 ${
                  entityType === 'properties' ? 'bg-purple-500' : 'bg-gray-200'
                }`}
                onPress={() => setEntityType('properties')}>
                <Text
                  className={`text-sm font-medium ${
                    entityType === 'properties' ? 'text-white' : 'text-gray-700'
                  }`}>
                  Properties
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="mb-2 mr-2 w-px self-stretch bg-gray-300" />

              {/* Role/Type filters - conditional based on entity type */}
              {entityType === 'users' ? (
                <>
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
                </>
              ) : (
                <>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'apartment', label: 'Apartments' },
                    { key: 'room', label: 'Rooms' },
                    { key: 'bedspace', label: 'Bedspaces' },
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
                </>
              )}
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
            Page {currentPage + 1} of {totalPages} — Showing{' '}
            {currentFilteredData.length === 0
              ? 0
              : `${currentPage * pageSize + 1} to ${Math.min(
                  (currentPage + 1) * pageSize,
                  currentFilteredData.length
                )}`}{' '}
            of {currentFilteredData.length}
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`mr-2 rounded-lg px-3 py-2 ${currentPage === 0 ? 'bg-gray-200' : 'bg-blue-50'}`}
              onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}>
              <Text className={`text-sm ${currentPage === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                Prev
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg px-3 py-2 ${
                currentPage + 1 >= totalPages ? 'bg-gray-200' : 'bg-blue-50'
              }`}
              onPress={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage + 1 >= totalPages}>
              <Text
                className={`text-sm ${currentPage + 1 >= totalPages ? 'text-gray-400' : 'text-blue-600'}`}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Users/Properties List Section */}
        <View className="px-4 pt-4">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            {selectedVerification === 'all'
              ? 'All '
              : selectedVerification === 'verified'
                ? 'Verified '
                : 'Unverified '}
            {entityType === 'users'
              ? selectedRole === 'all'
                ? 'Users'
                : selectedRole === 'renter'
                  ? 'Renters'
                  : 'Owners'
              : selectedRole === 'all'
                ? 'Properties'
                : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + 's'}
          </Text>

          {entityType === 'users' ? (
            paginatedUsers.map((user) => (
              <UserCard
                key={user.user_id}
                user={user}
                onVerify={() => {
                  setUserToVerify(user);
                  setVerifyConfirmVisible(true);
                }}
                onView={() => {
                  setUserToView(user);
                  setViewUserVisible(true);
                }}
                onMessage={() => handleMessageUser(user.id)}
                onWarn={() => handleWarnUser(user.id)}
                onBan={() => {
                  setUserToBan(user);
                  setBanConfirmVisible(true);
                }}
              />
            ))
          ) : (
            <>
              {console.log(
                '[AdminUserManagement] Rendering properties. Count:',
                paginatedProperties.length
              )}
              {paginatedProperties.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-center text-gray-500">No properties found</Text>
                  <Text className="mt-2 text-center text-sm text-gray-400">
                    Total properties: {properties.length}, Filtered: {filteredProperties.length}
                  </Text>
                </View>
              )}
              {paginatedProperties.map((property) => {
                console.log(
                  '[AdminUserManagement] Rendering property:',
                  property.property_id,
                  property.title
                );
                return (
                  <PropertyCard
                    key={property.property_id}
                    property={property}
                    onVerify={() => {
                      setPropertyToVerify(property);
                      setVerifyPropertyConfirmVisible(true);
                    }}
                    onView={() => {
                      setPropertyToView(property);
                      setViewPropertyVisible(true);
                    }}
                    onContactOwner={() => handleContactOwner(property.property_id)}
                  />
                );
              })}
            </>
          )}
        </View>
      </ScrollView>

      {verifyConfirmVisible && userToVerify && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="w-80 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">Confirm Verification</Text>
            <View className="mb-4 items-center">
              <Image
                source={{ uri: userToVerify.profile_picture }}
                className="mb-3 h-20 w-20 rounded-full"
                resizeMode="cover"
              />
              <Text className="text-lg font-semibold text-gray-900">
                {userToVerify.first_name} {userToVerify.last_name}
              </Text>
              <Text className="text-sm text-gray-600">{userToVerify.email}</Text>
              <Text className="text-sm text-gray-600">Role: {userToVerify.role}</Text>
            </View>
            <Text className="mb-6 text-center text-sm text-gray-700">
              Verify this user’s identity and mark their account as verified?
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="rounded-lg bg-gray-200 px-4 py-2"
                onPress={() => {
                  setVerifyConfirmVisible(false);
                  setUserToVerify(null);
                }}>
                <Text className="text-sm font-medium text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg bg-emerald-600 px-4 py-2"
                onPress={async () => {
                  setVerifyConfirmVisible(false);
                  if (userToVerify) await handleVerifyUser(userToVerify.id);
                  setUserToVerify(null);
                }}>
                <Text className="text-sm font-medium text-white">Verify User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ----- NEW: View User Modal ----- */}
      {viewUserVisible && userToView && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="max-h-[80%] w-96 rounded-2xl bg-white p-6 shadow-lg">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4 items-center">
                <Image
                  source={{ uri: userToView.profile_picture }}
                  className="mb-3 h-24 w-24 rounded-full"
                  resizeMode="cover"
                />
                <Text className="text-xl font-semibold text-gray-900">
                  {userToView.first_name} {userToView.last_name}
                </Text>
                <Text className="mb-2 text-sm text-gray-600">{userToView.email}</Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-sm text-gray-700">
                  Phone: {userToView.phoneNumber || 'N/A'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Role: {userToView.role === 'renter' ? 'Renter' : 'Owner'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Verified: {userToView.isVerified ? 'Yes' : 'No'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Received Warning/s? {userToView.isWarned ? 'Yes' : 'No'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Is Banned: {userToView.isBanned ? 'Yes' : 'No'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Last Active:{' '}
                  {userToView.last_login_date
                    ? new Date(userToView.last_login_date).toLocaleDateString()
                    : 'Unknown'}
                </Text>
                {userToView.role === 'owner' && (
                  <Text className="mb-1 text-sm text-gray-700">
                    Properties Listed: {userToView.propertiesListed}
                  </Text>
                )}
                {userToView.role === 'renter' && (
                  <Text className="mb-1 text-sm text-gray-700">
                    Applications: {userToView.applications}
                  </Text>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              className="mt-4 self-end rounded-lg bg-gray-200 px-4 py-2"
              onPress={() => {
                setViewUserVisible(false);
                setUserToView(null);
              }}>
              <Text className="text-sm font-medium text-gray-700">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {banConfirmVisible && userToBan && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="w-80 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">Confirm Ban</Text>
            <Text className="mb-6 text-sm text-gray-700">
              Are you sure you want to ban{' '}
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

      {/* Property Verification Confirmation Modal */}
      {verifyPropertyConfirmVisible && propertyToVerify && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="w-80 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Confirm Property Verification
            </Text>
            <View className="mb-4 items-center">
              <Image
                source={{
                  uri:
                    propertyToVerify.images?.[0] ||
                    'https://via.placeholder.com/400x300?text=No+Image',
                }}
                className="mb-3 h-32 w-full rounded-lg"
                resizeMode="cover"
              />
              <Text className="text-lg font-semibold text-gray-900">{propertyToVerify.title}</Text>
              <Text className="text-sm text-gray-600">
                {propertyToVerify.barangay}, {propertyToVerify.city}
              </Text>
              <Text className="text-sm text-gray-600">
                Owner: {propertyToVerify.owner?.first_name} {propertyToVerify.owner?.last_name}
              </Text>
            </View>
            <Text className="mb-6 text-center text-sm text-gray-700">
              Verify this property and mark it as approved for listing?
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="rounded-lg bg-gray-200 px-4 py-2"
                onPress={() => {
                  setVerifyPropertyConfirmVisible(false);
                  setPropertyToVerify(null);
                }}>
                <Text className="text-sm font-medium text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg bg-emerald-600 px-4 py-2"
                onPress={async () => {
                  setVerifyPropertyConfirmVisible(false);
                  if (propertyToVerify) await handleVerifyProperty(propertyToVerify.property_id);
                  setPropertyToVerify(null);
                }}>
                <Text className="text-sm font-medium text-white">Verify Property</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Property View Details Modal */}
      {viewPropertyVisible && propertyToView && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <View className="max-h-[80%] w-96 rounded-2xl bg-white p-6 shadow-lg">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Image
                  source={{
                    uri:
                      propertyToView.images?.[0] ||
                      'https://via.placeholder.com/400x300?text=No+Image',
                  }}
                  className="mb-3 h-48 w-full rounded-xl"
                  resizeMode="cover"
                />
                <Text className="text-xl font-semibold text-gray-900">{propertyToView.title}</Text>
                <Text className="mb-2 text-sm text-gray-600">
                  {propertyToView.barangay}, {propertyToView.city}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-sm font-semibold text-gray-700">Property Details:</Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Type:{' '}
                  {propertyToView.property_type?.charAt(0).toUpperCase() +
                    propertyToView.property_type?.slice(1)}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Monthly Rent: ₱{propertyToView.monthly_rent?.toLocaleString()}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Address: {propertyToView.street_address}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Occupancy: {propertyToView.current_occupants}/{propertyToView.max_occupants}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Verified: {propertyToView.is_verified ? 'Yes' : 'No'}
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  Available: {propertyToView.is_available ? 'Yes' : 'No'}
                </Text>
              </View>

              {propertyToView.description && (
                <View className="mb-3">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">Description:</Text>
                  <Text className="text-sm text-gray-700">{propertyToView.description}</Text>
                </View>
              )}

              {propertyToView.amenities && propertyToView.amenities.length > 0 && (
                <View className="mb-3">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">Amenities:</Text>
                  <Text className="text-sm text-gray-700">
                    {propertyToView.amenities.join(', ')}
                  </Text>
                </View>
              )}

              {propertyToView.owner && (
                <View className="mb-3">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">
                    Owner Information:
                  </Text>
                  <View className="flex-row items-center rounded-lg bg-gray-50 p-3">
                    <Image
                      source={{ uri: propertyToView.owner.profile_picture }}
                      className="h-12 w-12 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="ml-3">
                      <Text className="text-sm font-medium text-gray-900">
                        {propertyToView.owner.first_name} {propertyToView.owner.last_name}
                      </Text>
                      <Text className="text-xs text-gray-600">{propertyToView.owner.email}</Text>
                      <Text className="text-xs text-gray-600">
                        {propertyToView.owner.phone_number}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {propertyToView.images && propertyToView.images.length > 1 && (
                <View className="mb-3">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">
                    Additional Images ({propertyToView.images.length - 1}):
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {propertyToView.images.slice(1).map((img: string, idx: number) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        className="mr-2 h-24 w-24 rounded-lg"
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              className="mt-4 self-end rounded-lg bg-gray-200 px-4 py-2"
              onPress={() => {
                setViewPropertyVisible(false);
                setPropertyToView(null);
              }}>
              <Text className="text-sm font-medium text-gray-700">Close</Text>
            </TouchableOpacity>
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
    <View className="mb-3 w-44 rounded-2xl border border-gray-200 bg-white p-4">
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
            {user.isVerified ? (
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
          style={{ opacity: user.isBanned ? 0.4 : 1 }}>
          <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PropertyCard({
  property,
  onVerify,
  onView,
  onContactOwner,
}: {
  property: any;
  onVerify: () => void;
  onView: () => void;
  onContactOwner: () => void;
}) {
  const firstImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <View className="mb-4 flex-row items-start">
        {/* Property Image */}
        <View className="relative mr-4">
          <Image source={{ uri: firstImage }} className="h-24 w-24 rounded-xl" resizeMode="cover" />
          {!property.is_available && (
            <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/50">
              <Text className="text-xs font-bold text-white">Unavailable</Text>
            </View>
          )}
        </View>

        {/* Property Info */}
        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            {/* Title */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="mr-2 text-lg font-semibold text-gray-900"
              style={{ flexShrink: 1 }}>
              {property.title}
            </Text>
            {/* Verification Badge */}
            {property.is_verified ? (
              <View className="rounded-full bg-green-100 px-2 py-1">
                <Text className="text-xs font-medium text-green-700">Verified</Text>
              </View>
            ) : (
              <View className="rounded-full bg-yellow-100 px-2 py-1">
                <Text className="text-xs font-medium text-yellow-800">Pending</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View className="mb-1 flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">
              {property.barangay}, {property.city}
            </Text>
          </View>

          {/* Property Type */}
          <Text className="mb-1 text-sm font-medium text-blue-600">
            {property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) ||
              'N/A'}
          </Text>

          {/* Monthly Rent */}
          <Text className="text-sm font-semibold text-gray-900">
            ₱{property.monthly_rent?.toLocaleString() || '0'}/month
          </Text>
        </View>
      </View>

      {/* Owner Info */}
      {property.owner && (
        <View className="mb-4 flex-row items-center rounded-lg bg-gray-50 p-3">
          <Image
            source={{ uri: property.owner.profile_picture }}
            className="h-10 w-10 rounded-full"
            resizeMode="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-gray-900">
              {property.owner.first_name} {property.owner.last_name}
            </Text>
            <Text className="text-xs text-gray-600">Property Owner</Text>
          </View>
        </View>
      )}

      {/* Occupancy Status */}
      <View className="mb-4">
        <Text className="text-xs text-gray-600">
          Occupancy: {property.current_occupants}/{property.max_occupants}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-col justify-between gap-3">
        <TouchableOpacity
          className={`flex-row items-center rounded-lg px-4 py-2 ${
            property.is_verified ? 'bg-emerald-100' : 'bg-emerald-50'
          }`}
          onPress={() => {
            if (!property.is_verified) onVerify();
          }}
          disabled={property.is_verified}
          style={{ opacity: property.is_verified ? 0.4 : 1 }}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
          <Text className="ml-2 text-sm font-medium text-emerald-700">
            {property.is_verified ? 'Verified' : 'Verify Property'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-blue-50 px-4 py-2"
          onPress={onView}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text className="ml-2 text-sm font-medium text-blue-600">View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-slate-100 px-4 py-2"
          onPress={onContactOwner}>
          <Ionicons name="call-outline" size={16} color="gray" />
          <Text className="ml-2 text-sm font-medium text-slate-800">Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
