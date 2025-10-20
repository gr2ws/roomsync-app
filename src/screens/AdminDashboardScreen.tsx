import * as React from 'react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useAdminData } from '../store/useAdminData';
import { supabase } from '../utils/supabase';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TABS = [{ key: 'overview', label: 'Overview', icon: 'grid-outline' }];

type TabKey = (typeof TABS)[number]['key'];

const ADMIN_MENU_OPTIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'grid-outline',
    description: 'Overview and analytics',
  },
  {
    key: 'reports-and-safety',
    label: 'Reports',
    icon: 'shield-checkmark-outline',
    description: 'Manage Reports from users',
  },
  {
    key: 'admin-profile',
    label: 'Admin Profile',
    icon: 'person-outline',
    description: "The admin's profile settings",
  },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabKey>('overview');
  const [open, setOpen] = useState(false);

  return (
    <View
      className="flex-1 bg-white"
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top + 12 : insets.top, // use insets.top for both platforms to handle safe area via flexbox
      }}>
      {/* Content */}
      <ScrollView
        className="px-4 pb-4 pt-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View className="mb-6 pt-1">
          <Text className="mb-2 text-3xl font-bold text-gray-900">Admin Dashboard</Text>
        </View>
        {active === 'overview' && <OverviewTab />}
      </ScrollView>
    </View>
  );
}

/* Overview Tab shows metric cards and related data */
/* ------------------- Overview Tab ------------------- */
function OverviewTab() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const results = await fetchAllCounts();
    setMetrics(results);
    setRefreshing(false);
  };

  const [metrics, setMetrics] = useState({
    // Users
    totalUsers: 0,
    renters: 0,
    propertyOwners: 0,
    administrators: 0,

    // Properties
    totalListings: 0,
    activeListings: 0,
    pendingApprovals: 0,

    // Reports
    totalReports: 0,
    pendingReports: 0,
    underInvestigationReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
  });
  useEffect(() => {
    const fetchCounts = async () => {
      const results = await fetchAllCounts();
      setMetrics(results);
    };
    fetchCounts();
  }, []);

  return (
    <ScrollView className="px-1">
      {/* USERS SECTION */}
      <StatSection title="Users">
        <StatCard
          icon="people-outline"
          label="Total Users"
          value={String(metrics.totalUsers)}
          color="#3B82F6"
        />
        <StatCard
          icon="person-outline"
          label="Renters"
          value={String(metrics.renters)}
          color="#10B981"
        />
        <StatCard
          icon="home-outline"
          label="Property Owners"
          value={String(metrics.propertyOwners)}
          color="#6366F1"
        />
        <StatCard
          icon="shield-outline"
          label="Administrators"
          value={String(metrics.administrators)}
          color="#F97316"
        />
      </StatSection>

      {/* PROPERTIES SECTION */}
      <StatSection title="Properties">
        <StatCard
          icon="business-outline"
          label="Total Listings"
          value={String(metrics.totalListings)}
          color="#0EA5E9"
          fullWidth
        />
        <StatCard
          icon="checkmark-done-outline"
          label="Active Listings"
          value={String(metrics.activeListings)}
          color="#10B981"
        />
        <StatCard
          icon="time-outline"
          label="Pending Approvals"
          value={String(metrics.pendingApprovals)}
          color="#F59E0B"
        />
      </StatSection>

      {/* REPORTS SECTION */}
      <StatSection title="Reports">
        <StatCard
          icon="document-text-outline"
          label="Total Reports"
          value={String(metrics.totalReports)}
          color="#EF4444"
          fullWidth
        />
        <StatCard
          icon="alert-outline"
          label="Pending"
          value={String(metrics.pendingReports)}
          color="#F59E0B"
        />
        <StatCard
          icon="search-outline"
          label="Under Investigation"
          value={String(metrics.underInvestigationReports)}
          color="#3B82F6"
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Resolved"
          value={String(metrics.resolvedReports)}
          color="#10B981"
        />
        <StatCard
          icon="trash-outline"
          label="Dismissed"
          value={String(metrics.dismissedReports)}
          color="#898989"
        />
      </StatSection>

      {/* visualizations here */}
    </ScrollView>
  );
}

async function fetchAllCounts() {
  try {
    // USERS RECORDS
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw new Error(`Users count failed: ${JSON.stringify(usersError, null, 2)}`);

    const { count: renters } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'renter');

    const { count: propertyOwners } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'owner');

    const { count: administrators } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'admin');

    // PROPERTIES METRICS
    const { count: totalListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    const { count: activeListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    const { count: pendingApprovals } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false);

    // REPORTS METRICS
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: underInvestigationReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under investigation');

    const { count: resolvedReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');

    const { count: dismissedReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'dismissed');

    // SET STATE HELPER
    return {
      totalUsers: totalUsers || -1,
      renters: renters || -1,
      propertyOwners: propertyOwners || -1,
      administrators: administrators || -1,

      totalListings: totalListings || -1,
      activeListings: activeListings || -1,
      pendingApprovals: pendingApprovals || -1,

      totalReports: totalReports || -1,
      pendingReports: pendingReports || -1,
      underInvestigationReports: underInvestigationReports || -1,
      resolvedReports: resolvedReports || -1,
      dismissedReports: dismissedReports || -1,
    };
  } catch (err) {
    console.error('Error fetching metrics:', err);
    return '';
  }
}

/* ------------------- Reusable Section Component ------------------- */
function StatSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-gray-900">{title}</Text>
      <View className="flex-row flex-wrap justify-start align-middle">{children}</View>
    </View>
  );
}

/* ------------------- Small Components ------------------- */
interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  fullWidth?: boolean;
}

function StatCard({ icon, label, value, color, fullWidth }: StatCardProps) {
  return (
    <View
      className={`mb-2 mr-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
        fullWidth ? 'w-full' : 'flex-1'
      }`}>
      <View className="mb-2 flex-row items-center">
        <Ionicons name={icon} size={18} color={color || '#6B7280'} />
        <Text className="ml-2 mr-3 text-xs font-medium text-gray-600">{label}</Text>
      </View>
      <Text className="mt-0.5 text-2xl font-bold" style={color ? { color } : {}}>
        {value}
      </Text>
    </View>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={className || 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'}>
      <Text className="text-base font-bold">{title}</Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

function ActivityItem({ title, timeAgo, dim }: { title: string; timeAgo: string; dim?: boolean }) {
  return (
    <View className="flex-row items-center py-2.5">
      <View className="flex-1">
        <Text className={`text-sm ${dim ? 'text-gray-400' : 'text-gray-900'}`}>{title}</Text>
      </View>
      <Text className="ml-2 text-xs text-gray-600">{timeAgo}</Text>
    </View>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2.5">
      <Text className="text-sm text-gray-900">{label}</Text>
      <View className="rounded-full border border-gray-200 px-3 py-1.5">
        <Text className="text-xs text-gray-900">{value}</Text>
      </View>
    </View>
  );
}
