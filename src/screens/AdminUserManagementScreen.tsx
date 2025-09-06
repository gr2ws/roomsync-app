// AdminUserManagementScreen.tsx
// User management dashboard for admin panel

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
        </View>

        {/* User Statistics Cards */}
        <View style={styles.statsGrid}>
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
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by role:</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'all', label: 'All' },
                { key: 'renter', label: 'Renters' },
                { key: 'property_owner', label: 'Owners' },
                { key: 'both', label: 'Both' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedRole === filter.key && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedRole(filter.key)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedRole === filter.key && styles.filterButtonTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Users List Section */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Users ({filteredUsers.length})</Text>
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
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatarContainer}>
          <Image 
            source={{ uri: user.avatarUrl }} 
            style={styles.userAvatar}
            resizeMode="cover"
          />
          {user.isVerified && (
            <View style={styles.verifiedBanner}>
              <Text style={styles.verifiedBannerText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {!user.isVerified && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>{getRoleDisplay(user.role)}</Text>
        </View>
      </View>
      
      <View style={styles.userStats}>
        <View style={styles.userStat}>
          <Text style={styles.userStatValue}>{user.propertiesListed}</Text>
          <Text style={styles.userStatLabel}>Properties</Text>
        </View>
        <View style={styles.userStat}>
          <Text style={styles.userStatValue}>{user.applications}</Text>
          <Text style={styles.userStatLabel}>Applications</Text>
        </View>
        <View style={styles.userStat}>
          <Text style={styles.userStatValue}>{user.lastActive}</Text>
          <Text style={styles.userStatLabel}>Last Active</Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onView}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onMessage}>
          <Ionicons name="chatbubble-outline" size={16} color="#10B981" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onSuspend}>
          <Ionicons name="ban-outline" size={16} color="#EF4444" />
          <Text style={styles.actionButtonText}>Suspend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Styles ------------------- */
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // 2 cards per row with padding

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 16, paddingVertical: 0 },
  
  header: {
    marginBottom: 16,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  // Statistics Cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 6,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.075,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginRight:8
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },

  // Search Section
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    // Filter container
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },

  // Users Section
  usersSection: {
    // Users container
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },

  // User Cards
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  verifiedBanner: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedBannerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    color: '#6B7280',
  },
});
