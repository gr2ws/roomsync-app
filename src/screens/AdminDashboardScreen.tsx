// AdminDashboard.tsx
// Expo + React Native, no extra libs required. Optional: `npx expo install @expo/vector-icons react-native-safe-area-context` for icons & safe areas.

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'listings', label: 'Manage Listings', icon: 'home-outline' },
  { key: 'users', label: 'User Management', icon: 'people-outline' },
  { key: 'reports', label: 'Reports & Safety', icon: 'shield-checkmark-outline' },
];

type TabKey = typeof TABS[number]['key'];

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
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>      
      {/* Header */}
      <View style={styles.header}>        
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => toggle()} style={styles.iconBtn}>
          <Ionicons name="menu" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>        
        {active === 'overview' && <OverviewTab />}
        {active === 'listings' && <ManageListingsTab />}
        {active === 'users' && <UserManagementTab />}
        {active === 'reports' && <ReportsSafetyTab />}
      </ScrollView>

      {/* Overlay */}
      {/** Dark overlay for sidebar */}
      <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: overlayOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => toggle(false)} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { paddingTop: insets.top, transform: [{ translateX: sidebarTranslate }] }]}>        
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={() => toggle(false)} style={styles.iconBtn}>
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.sideItem, active === t.key && styles.sideItemActive]}
            onPress={() => {
              setActive(t.key as TabKey);
              toggle(false);
            }}
          >
            <Ionicons style={{ marginRight: 12 }} name={t.icon as any} size={18} />
            <Text style={[styles.sideItemText, active === t.key && styles.sideItemTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
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
    <View>
      <Text style={styles.sectionHeader}>Pending Property Approvals</Text>
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
    <View>
      <Text style={styles.sectionHeader}>User Management</Text>
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

  const pendingCount = reports.filter(report => report.status === "Pending Review").length;

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
    <View>
      <View style={styles.reportsHeader}>
        <Text style={styles.sectionHeader}>Safety Reports</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
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
      { icon: 'people-outline', label: 'Total Users', value: '1,234' },
      { icon: 'home-outline', label: 'Active Listings', value: '89' },
      { icon: 'time-outline', label: 'Pending Approvals', value: '12' },
      { icon: 'document-text-outline', label: 'Reported Content', value: '5' },
      { icon: 'trending-up-outline', label: 'Monthly Revenue', value: '₱125,000' },
      { icon: 'calendar-outline', label: 'New Users', value: '123' },
    ],
    []
  );

  return (
    <View>
      {/* KPI Cards - 3x2 Grid */}
      <View style={styles.grid3x2}>
        {cards.map((c, idx) => (
          <StatCard key={idx} icon={c.icon} label={c.label} value={c.value} />
        ))}
      </View>

      {/* Recent User Activity Panel */}
      <Panel title="Recent User Activity" style={styles.fullWidthPanel}>
        <ActivityItem title="New Registration: John Doe" timeAgo="2 Hours Ago" />
        <ActivityItem title="Property listing submitted: Maria Santos" timeAgo="4 Hours Ago" />
        <ActivityItem title="Report submitted against user: Spam Account" timeAgo="6 Hours Ago" dim />
        <ActivityItem title="User profile updated: Sarah Johnson" timeAgo="8 Hours Ago" />
        <ActivityItem title="New property review submitted" timeAgo="10 Hours Ago" />
      </Panel>

      {/* Platform Health Panel */}
      <Panel title="Platform Health" style={styles.fullWidthPanel}>
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
    <View style={styles.propertyCard}>
      {/* Property Image */}
      <View style={styles.propertyImageContainer}>
        <Image 
          source={{ uri: property.imageUrl }} 
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.viewMoreImagesButton}>
          <Ionicons name="images-outline" size={16} color="#fff" />
          <Text style={styles.viewMoreImagesText}>View More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.propertyHeader}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
      </View>
      
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyOwner}>Owner: {property.owner}</Text>
        <Text style={styles.propertyLocation}>{property.location}</Text>
        <View style={styles.priceDateRow}>
          <Text style={styles.propertyPrice}>{property.price}</Text>
          <Text style={styles.submittedDate}>{property.submittedDate}</Text>
        </View>
      </View>
      
      <View style={styles.propertyActions}>
        <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
          <Ionicons name="close-circle-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.approveButtonText}>Approve</Text>
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
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatarContainer}>
          <Image 
            source={{ uri: user.avatarUrl }} 
            style={styles.userAvatar}
            resizeMode="cover"
          />
          {user.isActive && (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerText}>Active</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[
            styles.warnButton, 
            warnPressed && styles.warnButtonPressed
          ]} 
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
          <Text style={[
            styles.warnButtonText,
            warnPressed && styles.warnButtonTextPressed
          ]}>Warn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.banButton, 
            banPressed && styles.banButtonPressed
          ]} 
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
          <Text style={[
            styles.banButtonText,
            banPressed && styles.banButtonTextPressed
          ]}>Ban</Text>
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
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportCategory}>{report.category}</Text>
        <View style={[
          styles.statusBadge,
          isUnderInvestigation ? styles.statusBadgeInvestigation : styles.statusBadgePending
        ]}>
          <Text style={[
            styles.statusBadgeText,
            isUnderInvestigation ? styles.statusBadgeTextInvestigation : styles.statusBadgeTextPending
          ]}>
            {report.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.reportDetails}>
        <Text style={styles.reportNames}>
          Reporter: {report.reporterName} • Against: {report.reportedUser}
        </Text>
        <Text style={styles.reportDescription}>{report.description}</Text>
      </View>
      
      <View style={styles.reportActions}>
        <TouchableOpacity 
          style={[
            styles.investigateButton,
            isUnderInvestigation && styles.disabledButton
          ]} 
          onPress={onInvestigate}
          disabled={isUnderInvestigation}
        >
          <Ionicons 
            name="search-outline" 
            size={16} 
            color={isUnderInvestigation ? "#9CA3AF" : "#3B82F6"} 
            style={{ marginRight: 6 }} 
          />
          <Text style={[
            styles.investigateButtonText,
            isUnderInvestigation && styles.disabledButtonText
          ]}>Investigate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resolveButton} onPress={onResolve}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.resolveButtonText}>Resolve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close-circle-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- Small Components ------------------- */
function StatCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name={icon} size={18} />
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Panel({ title, children, style }: { title: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.panel, style]}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function ActivityItem({ title, timeAgo, dim }: { title: string; timeAgo: string; dim?: boolean }) {
  return (
    <View style={styles.activityRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityTitle, dim && { color: '#9CA3AF' }]}>{title}</Text>
      </View>
      <Text style={styles.activityTime}>{timeAgo}</Text>
    </View>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.healthRow}>
      <Text style={styles.healthLabel}>{label}</Text>
      <View style={styles.pill}><Text style={styles.pillText}>{value}</Text></View>
    </View>
  );
}

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
    </View>
  );
}

/* ------------------- Styles ------------------- */
const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_COLS_2X3 = 2; // For 2x3 grid (50% width each)
const CARD_W_2X3 = Math.floor((width - 32 - (CARD_GAP * 3)) / CARD_COLS_2X3); // Account for content padding
const SIDEBAR_WIDTH = Math.min(280, Math.max(240, Math.round(width * 0.75))); // responsive

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8, flex: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: 8, paddingVertical: 16 },

  grid3x2: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_W_2X3 + 8,
    height: 120, // Fixed height for consistent grid
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: CARD_GAP,
    marginRight: CARD_GAP,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardLabel: { marginLeft: 8, marginRight: 12, color: '#374151' },
  cardValue: { fontSize: 24, fontWeight: '700', marginTop: 2 },

  row: { flexDirection: 'row', marginTop: 8 },
  panel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  fullWidthPanel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  panelTitle: { fontSize: 16, fontWeight: '700' },

  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  activityTitle: { fontSize: 14, color: '#111827' },
  activityTime: { marginLeft: 8, fontSize: 12, color: '#6B7280' },

  healthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  healthLabel: { fontSize: 14, color: '#111827' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: '#E5E7EB' },
  pillText: { fontSize: 12, color: '#111827' },

  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    bottom: 0,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  sidebarTitle: { fontSize: 16, fontWeight: '700' },
  sideItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
  sideItemActive: { backgroundColor: '#F3F4F6' },
  sideItemText: { fontSize: 15 },
  sideItemTextActive: { fontWeight: '700' },

  placeholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  placeholderTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#111827' },
  placeholderSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },

  // Property Management Styles
  sectionHeader: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16, 
    marginLeft: 8,
    color: '#111827' 
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  propertyImageContainer: {
    position: 'relative',
    height: 180,
    marginBottom: 12,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  viewMoreImagesButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewMoreImagesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  propertyHeader: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  propertyDetails: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  propertyOwner: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  submittedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#fff',
  },
  declineButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // User Management Styles
  userCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    height: 120,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 8,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activeBanner: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBannerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  warnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
  },
  warnButtonText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  },
  banButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: 'transparent',
  },
  banButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
  warnButtonPressed: {
    backgroundColor: '#F59E0B',
  },
  warnButtonTextPressed: {
    color: '#fff',
  },
  banButtonPressed: {
    backgroundColor: '#DC2626',
  },
  banButtonTextPressed: {
    color: '#fff',
  },

  // Reports & Safety Styles
  reportsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pendingBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeInvestigation: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeTextPending: {
    color: '#F59E0B',
  },
  statusBadgeTextInvestigation: {
    color: '#3B82F6',
  },
  reportDetails: {
    marginBottom: 16,
  },
  reportNames: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  investigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: 'transparent',
  },
  investigateButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
  },
  resolveButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B7280',
    backgroundColor: 'transparent',
  },
  dismissButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledButton: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});