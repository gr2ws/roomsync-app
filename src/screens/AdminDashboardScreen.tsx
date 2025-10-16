// AdminDashboard.tsx
// Expo + React Native, no extra libs required. Optional: `npx expo install @expo/vector-icons react-native-safe-area-context` for icons & safe areas.

import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { useAdminData } from '../store/useAdminData';
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
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'users', label: 'Moderation Panel', icon: 'people-outline' },
  { key: 'reports', label: 'Reports & Safety', icon: 'shield-checkmark-outline' },
];

type TabKey = (typeof TABS)[number]['key'];

const ADMIN_MENU_OPTIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'grid-outline',
    description: 'Overview and analytics',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'bar-chart-outline',
    description: 'Detailed metrics and insights',
  },
  {
    key: 'user-management',
    label: 'Moderation Panel',
    icon: 'people-outline',
    description: 'Manage users and permissions',
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

  // Sidebar animation
  const slide = useRef(new Animated.Value(0)).current; // 0 closed, 1 open
  const toggle = (next?: boolean) => {
    const to = typeof next === 'boolean' ? Number(next) : open ? 0 : 1;
    setOpen(Boolean(to));
    Animated.timing(slide, {
      toValue: to,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const sidebarTranslate = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const overlayOpacity = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => toggle()}
          className="h-10 w-10 items-center justify-center rounded-xl">
          <Ionicons name="menu" size={24} />
        </TouchableOpacity>
        <Text className="ml-2 flex-1 text-lg font-semibold">Admin Dashboard</Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <ScrollView
        className="px-2 py-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {active === 'overview' && <OverviewTab />}
        {active === 'users' && <UserManagementTab />}
        {active === 'reports' && <ReportsSafetyTab />}
      </ScrollView>

      {/* Overlay */}
      {/** Dark overlay for sidebar */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}>
        <TouchableOpacity className="flex-1" onPress={() => toggle(false)} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        className="absolute bottom-0 left-0 top-0 border-r border-gray-200 bg-white px-3"
        style={{
          width: SIDEBAR_WIDTH,
          paddingTop: insets.top,
          transform: [{ translateX: sidebarTranslate }],
        }}>
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-base font-bold">Admin Dashboard</Text>
          <TouchableOpacity
            onPress={() => toggle(false)}
            className="h-10 w-10 items-center justify-center rounded-xl">
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            className={`flex-row items-center rounded-xl px-2 py-3 ${active === t.key ? 'bg-gray-100' : ''}`}
            onPress={() => {
              setActive(t.key as TabKey);
              toggle(false);
            }}>
            <Ionicons className="mr-3" name={t.icon as any} size={18} />
            <Text className={`text-sm ${active === t.key ? 'font-bold' : ''}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
}

/* ------------------- User Management Tab ------------------- */
function UserManagementTab() {
  const users = [
    {
      id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'John Dela Cruz',
      email: 'john.delacruz@email.com',
      isActive: false,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 3,
      name: 'Ana Rodriguez',
      email: 'ana.rodriguez@email.com',
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 4,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@email.com',
      isActive: false,
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 5,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
  ];

  const handleWarn = (userId: number) => {
    console.log(`Warning user ${userId}`);
    // Add warning logic here
  };

  const handleBan = (userId: number) => {
    console.log(`Banning user ${userId}`);
    // Add ban logic here
  };

  const [query, setQuery] = useState('');
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View className="mx-4 mt-3">
      <Text className="mb-3 ml-2 text-xl font-bold text-gray-900">Moderation Panel</Text>
      <View className="mx-2 mb-4">
        <TextInput
          placeholder="Search users by name or email"
          className="overflow-visible rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
          autoCapitalize="none"
          onChangeText={setQuery}
          value={query}
        />
      </View>
      {filteredUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onWarn={() => handleWarn(user.id)}
          onBan={() => handleBan(user.id)}
        />
      ))}
    </View>
  );
}

/* ------------------- Reports & Safety Tab ------------------- */
function ReportsSafetyTab() {
  const reports = [
    {
      id: 1,
      category: 'Harassment',
      status: 'Pending Review',
      reporterName: 'Maria Santos',
      reportedUser: 'John Dela Cruz',
      description:
        'User has been sending inappropriate messages and making unwanted advances in private conversations.',
    },
    {
      id: 2,
      category: 'Spam',
      status: 'Under Investigation',
      reporterName: 'Ana Rodriguez',
      reportedUser: 'SpamBot123',
      description:
        'User is posting multiple duplicate listings and sending promotional messages to other users.',
    },
    {
      id: 3,
      category: 'Fake Listing',
      status: 'Pending Review',
      reporterName: 'Carlos Mendoza',
      reportedUser: 'PropertyScam',
      description:
        'This listing appears to be fake with stolen photos and misleading information about the property.',
    },
    {
      id: 4,
      category: 'Inappropriate Content',
      status: 'Pending Review',
      reporterName: 'Sarah Johnson',
      reportedUser: 'InappropriateUser',
      description:
        'User posted offensive content in property descriptions and used inappropriate language in comments.',
    },
  ];

  const pendingCount = reports.filter((report) => report.status === 'Pending Review').length + 1;

  const handleInvestigate = (reportId: number) => {
    console.log(`Investigating report ${reportId}`);
    // Add investigation logic here
  };

  const handleResolve = (reportId: number) => {
    console.log(`Resolving report ${reportId}`);
    // Add resolve logic here
  };

  const handleDismiss = (reportId: number) => {
    console.log(`Dismissing report ${reportId}`);
    // Add dismiss logic here
  };

  return (
    <View className="mx-4 mt-3">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="ml-2 text-xl font-bold text-gray-900">Safety Reports</Text>
        <View className="min-w-6 items-center rounded-xl bg-red-600 px-2 py-1">
          <Text className="text-xs font-semibold text-white">{pendingCount}</Text>
        </View>
      </View>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onInvestigate={() => handleInvestigate(report.id)}
          onResolve={() => handleResolve(report.id)}
          onDismiss={() => handleDismiss(report.id)}
        />
      ))}
    </View>
  );
}

/* ------------------- Overview Tab ------------------- */
function OverviewTab() {
  const { metrics } = useAdminData();
  const cards = useMemo(
    () => [
      {
        icon: 'people-outline',
        label: 'Total Users',
        value: String(metrics.userActivity.totalUsers),
        color: '#3B82F6',
      },
      {
        icon: 'home-outline',
        label: 'Active Listings',
        value: String(metrics.listingMetrics.activeListings),
        color: '#10B981',
      },
      {
        icon: 'time-outline',
        label: 'Pending Approvals',
        value: String(metrics.listingMetrics.pendingApprovals),
        color: '#F59E0B',
      },
      { icon: 'document-text-outline', label: 'Reported Content', value: '5', color: '#EF4444' },
      {
        icon: 'trending-up-outline',
        label: 'Monthly Revenue',
        value: `₱${metrics.revenueMetrics.monthlyRevenue.toLocaleString()}`,
        color: '#8B5CF6',
      },
      {
        icon: 'calendar-outline',
        label: 'New Users',
        value: String(metrics.userActivity.newUsersThisMonth),
        color: '#06B6D4',
      },
    ],
    [metrics]
  );

  return (
    <View>
      {/* KPI Cards - 3x2 Grid */}
      <View className="mb-4 flex-row flex-wrap px-1">
        {cards.map((c, idx) => (
          <StatCard key={idx} icon={c.icon} label={c.label} value={c.value} color={c.color} />
        ))}
      </View>

      {/* Recent User Activity Panel */}
      <Panel
        title="Recent User Activity"
        className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <ActivityItem title="New Registration: John Doe" timeAgo="2 Hours Ago" />
        <ActivityItem title="Property listing submitted: Maria Santos" timeAgo="4 Hours Ago" />
        <ActivityItem
          title="Report submitted against user: Spam Account"
          timeAgo="6 Hours Ago"
          dim
        />
        <ActivityItem title="User profile updated: Sarah Johnson" timeAgo="8 Hours Ago" />
        <ActivityItem title="New property review submitted" timeAgo="10 Hours Ago" />
      </Panel>

      {/* Platform Health Panel */}
      <Panel
        title="Platform Health"
        className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <HealthItem label="System Status" value="Operational" />
        <HealthItem label="Database" value="Healthy" />
        <HealthItem label="API Response Time" value="245 ms" />
        <HealthItem label="Error Rate" value="0.02%" />
        <HealthItem label="Active Sessions" value="1,234" />
        <HealthItem label="Server Load" value="45%" />
      </Panel>
    </View>
  );
}

/* ------------------- User Card Component ------------------- */
function UserCard({
  user,
  onWarn,
  onBan,
}: {
  user: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    avatarUrl: string;
  };
  onWarn: () => void;
  onBan: () => void;
}) {
  const [warnPressed, setWarnPressed] = useState(false);
  const [banPressed, setBanPressed] = useState(false);

  return (
    <View className="h-30 mb-3 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="mb-2 flex-1 flex-row items-center">
        <View className="relative mr-3">
          <Image
            source={{ uri: user.avatarUrl }}
            className="h-12 w-12 rounded-full"
            resizeMode="cover"
          />
          <View
            className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
          />
        </View>

        <View className="flex-1">
          <Text className="mb-0.5 text-base font-semibold text-gray-900">{user.name}</Text>
          <Text className="text-sm text-gray-600">{user.email}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-end gap-2">
        <TouchableOpacity
          className={`flex-row items-center rounded-lg border px-3 py-1.5 ${warnPressed ? 'border-amber-500 bg-amber-500' : 'border-amber-500 bg-transparent'}`}
          onPress={onWarn}
          onPressIn={() => setWarnPressed(true)}
          onPressOut={() => setWarnPressed(false)}>
          <Ionicons
            name="warning-outline"
            size={16}
            color={warnPressed ? '#fff' : '#F59E0B'}
            style={{ marginRight: 6 }}
          />
          <Text className={`text-xs font-medium ${warnPressed ? 'text-white' : 'text-amber-500'}`}>
            Warn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-row items-center rounded-lg border px-3 py-1.5 ${banPressed ? 'border-red-600 bg-red-600' : 'border-red-600 bg-transparent'}`}
          onPress={onBan}
          onPressIn={() => setBanPressed(true)}
          onPressOut={() => setBanPressed(false)}>
          <Ionicons
            name="ban-outline"
            size={16}
            color={banPressed ? '#fff' : '#DC2626'}
            style={{ marginRight: 6 }}
          />
          <Text className={`text-xs font-medium ${banPressed ? 'text-white' : 'text-red-600'}`}>
            Ban
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Report Card Component ------------------- */
function ReportCard({
  report,
  onInvestigate,
  onResolve,
  onDismiss,
}: {
  report: {
    id: number;
    category: string;
    status: string;
    reporterName: string;
    reportedUser: string;
    description: string;
  };
  onInvestigate: () => void;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  const isUnderInvestigation = report.status === 'Under Investigation';

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900">{report.category}</Text>
        <View
          className={`rounded-lg px-2 py-1 ${isUnderInvestigation ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <Text
            className={`text-xs font-medium ${isUnderInvestigation ? 'text-blue-600' : 'text-amber-600'}`}>
            {report.status}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-700">
          Reporter: {report.reporterName} • Against: {report.reportedUser}
        </Text>
        <Text className="text-sm italic leading-5 text-gray-600">{report.description}</Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`flex-row items-center rounded-lg border px-3 py-1.5 ${isUnderInvestigation ? 'border-gray-400 bg-gray-50' : 'border-blue-500 bg-transparent'}`}
          onPress={onInvestigate}
          disabled={isUnderInvestigation}>
          <Ionicons
            name="search-outline"
            size={16}
            color={isUnderInvestigation ? '#9CA3AF' : '#3B82F6'}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`text-xs font-medium ${isUnderInvestigation ? 'text-gray-400' : 'text-blue-500'}`}>
            Investigate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-lg border border-green-500 bg-transparent px-3 py-1.5"
          onPress={onResolve}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color="#10B981"
            style={{ marginRight: 6 }}
          />
          <Text className="text-xs font-medium text-green-500">Resolve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-lg border border-gray-500 bg-transparent px-3 py-1.5"
          onPress={onDismiss}>
          <Ionicons
            name="close-circle-outline"
            size={16}
            color="#6B7280"
            style={{ marginRight: 6 }}
          />
          <Text className="text-xs font-medium text-gray-500">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Small Components ------------------- */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View
      className="mb-2 mr-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      style={{ width: CARD_W_2X3 + 8 }}>
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

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="py-15 items-center justify-center">
      <Text className="mb-2 text-lg font-semibold text-gray-900">{title}</Text>
      <Text className="text-center text-sm text-gray-600">{subtitle}</Text>
    </View>
  );
}

/* ------------------- Constants ------------------- */
const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_COLS_2X3 = 2; // For 2x3 grid (50% width each)
const CARD_W_2X3 = Math.floor((width - 32 - CARD_GAP * 3) / CARD_COLS_2X3); // Account for content padding
const SIDEBAR_WIDTH = Math.min(280, Math.max(240, Math.round(width * 0.75))); // responsive
