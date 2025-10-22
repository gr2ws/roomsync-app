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
        paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top, // use insets.top for both platforms to handle safe area via flexbox
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

  const [query, setQuery] = useState('');
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
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

/* ------------------- Constants ------------------- */
const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_COLS_2X3 = 2; // For 2x3 grid (50% width each)
const CARD_W_2X3 = Math.floor((width - 32 - CARD_GAP * 3) / CARD_COLS_2X3); // Account for content padding
const SIDEBAR_WIDTH = Math.min(280, Math.max(240, Math.round(width * 0.75))); // responsive
