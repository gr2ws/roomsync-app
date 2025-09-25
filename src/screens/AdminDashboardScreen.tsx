// AdminDashboard.tsx
// Expo + React Native, no extra libs required. Optional: `npx expo install @expo/vector-icons react-native-safe-area-context` for icons & safe areas.

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AdminAnalyticsScreen from './AdminAnalyticsScreen';
import AdminUserManagementScreen from './AdminUserManagementScreen';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'listings', label: 'Manage Listings', icon: 'home-outline' },
  { key: 'users', label: 'User Management', icon: 'people-outline' },
  { key: 'reports', label: 'Reports & Safety', icon: 'shield-checkmark-outline' },
];

type TabKey = typeof TABS[number]['key'];

const ADMIN_MENU_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline', description: 'Overview and analytics' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', description: 'Detailed metrics and insights' },
  { key: 'user-management', label: 'User Management', icon: 'people-outline', description: 'Manage users and permissions' },
  { key: 'admin-profile', label: 'Admin Profile', icon: 'person-outline', description: "The admin's profile settings" },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabKey>('overview');
  const [open, setOpen] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(true);
  const [activeAdminScreen, setActiveAdminScreen] = useState<string>('menu');

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
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">        
        {activeAdminScreen === 'menu' ? (
          <View className="w-10" />
        ) : (
          <TouchableOpacity 
            accessibilityRole="button" 
            accessibilityLabel="Back to admin menu" 
            onPress={() => {
              setActiveAdminScreen('menu');
              setShowAdminMenu(true);
            }} 
            className="w-10 h-10 rounded-xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
        )}
        <Text className={`text-lg font-semibold ml-2 flex-1 ${activeAdminScreen === 'menu' ? 'text-left' : ''}`}>
          {activeAdminScreen === 'menu' ? 'Administrator Options' : 
           activeAdminScreen === 'analytics' ? 'Analytics' : 
           activeAdminScreen === 'user-management' ? 'User Management' : 'Admin Dashboard'}
        </Text>
        {activeAdminScreen === 'menu' ? (
          <View className="w-10" />
        ) : activeAdminScreen === 'dashboard' ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => toggle()} className="w-10 h-10 rounded-xl items-center justify-center">
            <Ionicons name="menu" size={24} />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {/* Content */}
      <ScrollView className="px-2 py-4" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>        
        {activeAdminScreen === 'menu' ? (
          <AdminMenuScreen onSelectOption={(option) => {
            if (option === 'dashboard') {
              setActiveAdminScreen('dashboard');
              setShowAdminMenu(false);
            } else if (option === 'analytics') {
              setActiveAdminScreen('analytics');
              setShowAdminMenu(false);
            } else if (option === 'user-management') {
              setActiveAdminScreen('user-management');
              setShowAdminMenu(false);
            } else {
              // Handle other options (Reports, Admin Profile)
              console.log(`Selected: ${option}`);
            }
          }} />
        ) : activeAdminScreen === 'analytics' ? (
          <AdminAnalyticsScreen />
        ) : activeAdminScreen === 'user-management' ? (
          <AdminUserManagementScreen />
        ) : (
          <>
            {active === 'overview' && <OverviewTab />}
            {active === 'listings' && <ManageListingsTab />}
            {active === 'users' && <UserManagementTab />}
            {active === 'reports' && <ReportsSafetyTab />}
          </>
        )}
      </ScrollView>

      {/* Overlay */}
      {/** Dark overlay for sidebar */}
      <Animated.View 
        pointerEvents={open ? 'auto' : 'none'} 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      >
        <TouchableOpacity className="flex-1" onPress={() => toggle(false)} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View 
        className="absolute top-0 left-0 bottom-0 bg-white border-r border-gray-200 px-3"
        style={{ 
          width: SIDEBAR_WIDTH, 
          paddingTop: insets.top, 
          transform: [{ translateX: sidebarTranslate }] 
        }}
      >        
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-base font-bold">Admin Dashboard</Text>
          <TouchableOpacity onPress={() => toggle(false)} className="w-10 h-10 rounded-xl items-center justify-center">
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            className={`flex-row items-center py-3 px-2 rounded-xl ${active === t.key ? 'bg-gray-100' : ''}`}
            onPress={() => {
              setActive(t.key as TabKey);
              toggle(false);
            }}
          >
            <Ionicons className="mr-3" name={t.icon as any} size={18} />
            <Text className={`text-sm ${active === t.key ? 'font-bold' : ''}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
}

/* ------------------- Admin Menu Screen ------------------- */
function AdminMenuScreen({ onSelectOption }: { onSelectOption: (option: string) => void }) {
  return (
    <View>
      <Text className="text-3xl font-bold text-gray-900 text-center mb-2 mt-3">Admin Panel</Text>
      <Text className="text-base text-gray-600 text-center mb-8">Choose an admin section to access</Text>
      
      <View className="flex-row flex-wrap justify-between px-4">
        {ADMIN_MENU_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            className="w-[48%] bg-white border border-gray-200 rounded-2xl mb-4 shadow-sm"
            onPress={() => onSelectOption(option.key)}
          >
            <View className="p-5 items-center">
              <Ionicons name={option.icon as any} size={32} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 mt-3 mb-1 text-center">{option.label}</Text>
              <Text className="text-xs text-gray-600 text-center leading-4">{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ------------------- Manage Listings Tab ------------------- */
function ManageListingsTab() {
  const pendingProperties = [
    {
      id: 1,
      title: "Elegant Apartment at Vista Alegre",
      owner: "Roberto Garcia",
      location: "Vista Alegre, Valencia City",
      price: "₱12,000/month",
      submittedDate: "Jan 3, 2025",
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Cozy Studio near Coral Bay",
      owner: "Angela Reyes",
      location: "Reyes Residences, Sibulan",
      price: "₱5,500/month",
      submittedDate: "Jan 4, 2025",
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Family Home in San Marino Heights",
      owner: "Maria Santos",
      location: "San Marino Heights, Dumaguete City",
      price: "₱15,000/month",
      submittedDate: "Jan 5, 2025",
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Budget Room in Golden Fields",
      owner: "John Dela Cruz",
      location: "Brgy. Golden Fields, Valencia City",
      price: "₱3,200/month",
      submittedDate: "Jan 6, 2025",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Boarding House near Silliman University",
      owner: "Karen Lim",
      location: "Silliman Ave., Dumaguete City",
      price: "₱25,000/month",
      submittedDate: "Jan 7, 2025",
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"
    }
  ];

  const handleApprove = (propertyId: number) => {
    console.log(`Approving property ${propertyId}`);
    // Add approval logic here
  };

  const handleDecline = (propertyId: number) => {
    console.log(`Declining property ${propertyId}`);
    // Add decline logic here
  };

  return (
    <View className = "mx-4 mt-3">
      <View className="mb-6 ml-2">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Pending Property Approvals</Text>
        <Text className="text-sm text-gray-600">
          Review and approve property listings submitted by users
        </Text>
      </View>
      {pendingProperties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onApprove={() => handleApprove(property.id)}
          onDecline={() => handleDecline(property.id)}
        />
      ))}
    </View>
  );
}

/* ------------------- User Management Tab ------------------- */
function UserManagementTab() {
  const users = [
    {
      id: 1,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "John Dela Cruz",
      email: "john.delacruz@email.com",
      isActive: false,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Ana Rodriguez",
      email: "ana.rodriguez@email.com",
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      isActive: false,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const handleWarn = (userId: number) => {
    console.log(`Warning user ${userId}`);
    // Add warning logic here
  };

  const handleBan = (userId: number) => {
    console.log(`Banning user ${userId}`);
    // Add ban logic here
  };

  return (
    <View className = "mx-4 mt-3">
      <Text className="text-xl font-bold mb-4 ml-2 text-gray-900">User Management</Text>
      {users.map((user) => (
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
      category: "Harassment",
      status: "Pending Review",
      reporterName: "Maria Santos",
      reportedUser: "John Dela Cruz",
      description: "User has been sending inappropriate messages and making unwanted advances in private conversations."
    },
    {
      id: 2,
      category: "Spam",
      status: "Under Investigation",
      reporterName: "Ana Rodriguez",
      reportedUser: "SpamBot123",
      description: "User is posting multiple duplicate listings and sending promotional messages to other users."
    },
    {
      id: 3,
      category: "Fake Listing",
      status: "Pending Review",
      reporterName: "Carlos Mendoza",
      reportedUser: "PropertyScam",
      description: "This listing appears to be fake with stolen photos and misleading information about the property."
    },
    {
      id: 4,
      category: "Inappropriate Content",
      status: "Pending Review",
      reporterName: "Sarah Johnson",
      reportedUser: "InappropriateUser",
      description: "User posted offensive content in property descriptions and used inappropriate language in comments."
    }
  ];

  const pendingCount = reports.filter(report => report.status === "Pending Review").length + 1;

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
    <View className = "mx-4 mt-3">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold ml-2 text-gray-900">Safety Reports</Text>
        <View className="bg-red-600 px-2 py-1 rounded-xl min-w-6 items-center">
          <Text className="text-white text-xs font-semibold">{pendingCount}</Text>
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
  const cards = useMemo(
    () => [
      { icon: 'people-outline', label: 'Total Users', value: '6', color: '#3B82F6' },
      { icon: 'home-outline', label: 'Active Listings', value: '12', color: '#10B981' },
      { icon: 'time-outline', label: 'Pending Approvals', value: '12', color: '#F59E0B' },
      { icon: 'document-text-outline', label: 'Reported Content', value: '5', color: '#EF4444' },
      { icon: 'trending-up-outline', label: 'Monthly Revenue', value: '₱125,000', color: '#8B5CF6' },
      { icon: 'calendar-outline', label: 'New Users', value: '123', color: '#06B6D4' },
    ],
    []
  );

  return (
    <View>
      {/* KPI Cards - 3x2 Grid */}
      <View className="flex-row flex-wrap mb-4 px-1">
        {cards.map((c, idx) => (
          <StatCard key={idx} icon={c.icon} label={c.label} value={c.value} color={c.color} />
        ))}
      </View>

      {/* Recent User Activity Panel */}
      <Panel title="Recent User Activity" className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <ActivityItem title="New Registration: John Doe" timeAgo="2 Hours Ago" />
          <ActivityItem title="Property listing submitted: Maria Santos" timeAgo="4 Hours Ago" />
          <ActivityItem title="Report submitted against user: Spam Account" timeAgo="6 Hours Ago" dim />
        <ActivityItem title="User profile updated: Sarah Johnson" timeAgo="8 Hours Ago" />
        <ActivityItem title="New property review submitted" timeAgo="10 Hours Ago" />
        </Panel>

      {/* Platform Health Panel */}
      <Panel title="Platform Health" className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
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

/* ------------------- Property Card Component ------------------- */
function PropertyCard({ 
  property, 
  onApprove, 
  onDecline 
}: { 
  property: {
    id: number;
    title: string;
    owner: string;
    location: string;
    price: string;
    submittedDate: string;
    imageUrl: string;
  };
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* Property Image */}
      <View className="relative h-44 mb-3">
        <Image 
          source={{ uri: property.imageUrl }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        <TouchableOpacity className="absolute top-3 right-3 flex-row items-center bg-black bg-opacity-60 px-2 py-1 rounded-xl">
          <Ionicons name="images-outline" size={16} color="#fff" />
          <Text className="text-white text-xs font-medium ml-1">View More</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-3 px-4">
        <Text className="text-lg font-semibold text-gray-900">{property.title}</Text>
      </View>
      
      <View className="mb-4 px-4">
        <Text className="text-sm text-gray-700 mb-1">Owner: {property.owner}</Text>
        <Text className="text-sm text-gray-600 mb-2">{property.location}</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-green-600">{property.price}</Text>
          <Text className="text-xs text-gray-500">{property.submittedDate}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-end gap-3 px-4 pb-4">
        <TouchableOpacity className="flex-row items-center px-4 py-2 rounded-lg border border-red-600 bg-white" onPress={onDecline}>
          <Ionicons name="close-circle-outline" size={16} color="#DC2626" className="mr-1.5" />
          <Text className="text-red-600 text-sm font-medium">Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center px-4 py-2 rounded-lg bg-green-600" onPress={onApprove}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" className="mr-1.5" />
          <Text className="text-white text-sm font-medium">Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- User Card Component ------------------- */
function UserCard({ 
  user, 
  onWarn, 
  onBan 
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
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm h-30 flex-col justify-between">
      <View className="flex-row items-center flex-1 mb-2">
        <View className="relative mr-3">
          <Image 
            source={{ uri: user.avatarUrl }} 
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
          {user.isActive && (
            <View className="absolute -top-1 -right-1 bg-green-500 px-1.5 py-0.5 rounded-lg">
              <Text className="text-white text-xs font-semibold">Active</Text>
            </View>
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-0.5">{user.name}</Text>
          <Text className="text-sm text-gray-600">{user.email}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-end items-center gap-2">
        <TouchableOpacity 
          className={`flex-row items-center px-3 py-1.5 rounded-lg border ${warnPressed ? 'bg-amber-500 border-amber-500' : 'border-amber-500 bg-transparent'}`}
          onPress={onWarn}
          onPressIn={() => setWarnPressed(true)}
          onPressOut={() => setWarnPressed(false)}
        >
          <Ionicons 
            name="warning-outline" 
            size={16} 
            color={warnPressed ? "#fff" : "#F59E0B"} 
            style={{ marginRight: 6 }} 
          />
          <Text className={`text-xs font-medium ${warnPressed ? 'text-white' : 'text-amber-500'}`}>Warn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-row items-center px-3 py-1.5 rounded-lg border ${banPressed ? 'bg-red-600 border-red-600' : 'border-red-600 bg-transparent'}`}
          onPress={onBan}
          onPressIn={() => setBanPressed(true)}
          onPressOut={() => setBanPressed(false)}
        >
          <Ionicons 
            name="ban-outline" 
            size={16} 
            color={banPressed ? "#fff" : "#DC2626"} 
            style={{ marginRight: 6 }} 
          />
          <Text className={`text-xs font-medium ${banPressed ? 'text-white' : 'text-red-600'}`}>Ban</Text>
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
  onDismiss 
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
  const isUnderInvestigation = report.status === "Under Investigation";

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-gray-900">{report.category}</Text>
        <View className={`px-2 py-1 rounded-lg ${isUnderInvestigation ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <Text className={`text-xs font-medium ${isUnderInvestigation ? 'text-blue-600' : 'text-amber-600'}`}>
            {report.status}
          </Text>
        </View>
      </View>
      
      <View className="mb-4">
        <Text className="text-sm text-gray-700 mb-2">
          Reporter: {report.reporterName} • Against: {report.reportedUser}
        </Text>
        <Text className="text-sm text-gray-600 italic leading-5">{report.description}</Text>
      </View>
      
      <View className="flex-row gap-2">
        <TouchableOpacity 
          className={`flex-row items-center px-3 py-1.5 rounded-lg border ${isUnderInvestigation ? 'border-gray-400 bg-gray-50' : 'border-blue-500 bg-transparent'}`}
          onPress={onInvestigate}
          disabled={isUnderInvestigation}
        >
          <Ionicons 
            name="search-outline" 
            size={16} 
            color={isUnderInvestigation ? "#9CA3AF" : "#3B82F6"} 
            style={{ marginRight: 6 }} 
          />
          <Text className={`text-xs font-medium ${isUnderInvestigation ? 'text-gray-400' : 'text-blue-500'}`}>Investigate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center px-3 py-1.5 rounded-lg border border-green-500 bg-transparent" onPress={onResolve}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
          <Text className="text-green-500 text-xs font-medium">Resolve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-500 bg-transparent" onPress={onDismiss}>
          <Ionicons name="close-circle-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
          <Text className="text-gray-500 text-xs font-medium">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Small Components ------------------- */
function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-2 mr-2 shadow-sm" style={{ width: CARD_W_2X3 + 8 }}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={18} color={color || '#6B7280'} />
        <Text className="ml-2 mr-3 text-gray-600 text-xs font-medium">{label}</Text>
      </View>
      <Text className="text-2xl font-bold mt-0.5" style={color ? { color } : {}}>{value}</Text>
    </View>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <View className={className || "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"}>
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
      <View className="px-3 py-1.5 rounded-full border border-gray-200">
        <Text className="text-xs text-gray-900">{value}</Text>
      </View>
    </View>
  );
}

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="items-center justify-center py-15">
      <Text className="text-lg font-semibold mb-2 text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-600 text-center">{subtitle}</Text>
    </View>
  );
}

/* ------------------- Constants ------------------- */
const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_COLS_2X3 = 2; // For 2x3 grid (50% width each)
const CARD_W_2X3 = Math.floor((width - 32 - (CARD_GAP * 3)) / CARD_COLS_2X3); // Account for content padding
const SIDEBAR_WIDTH = Math.min(280, Math.max(240, Math.round(width * 0.75))); // responsive