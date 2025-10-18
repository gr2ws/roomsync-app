// AdminAnalyticsScreen.tsx
// Analytics dashboard for admin panel
import { View, Text, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { /* useSafeAreaInsets, SafeAreaView */ } from 'react-native-safe-area-context';
import { useAdminData } from '../store/useAdminData';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAnalyticsScreen() {
  // const insets = useSafeAreaInsets();
  const { metrics } = useAdminData();
  const analyticsData = metrics;

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0 }}>
      <ScrollView className="px-4 pb-4 pt-0" contentContainerStyle={{ paddingBottom: 0 }}>
        {/* Header */}
        <View className="mb-6 pt-0">
          <Text className="mb-2 text-3xl font-bold text-gray-900">Platform Analytics</Text>
          <Text className="mb-3 text-base leading-6 text-gray-600">
            Comprehensive analytics including user activity trends, most viewed listings, revenue
            metrics, and platform performance indicators.
          </Text>
        </View>

        {/* User Activity Metrics */}
        <AnalyticsSection title="User Activity" icon="people-outline">
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Total Users"
              value={analyticsData.userActivity.totalUsers.toLocaleString()}
              icon="people"
              color="#3B82F6"
            />
            <MetricCard
              title="Active Users"
              value={analyticsData.userActivity.activeUsers.toLocaleString()}
              icon="checkmark-circle"
              color="#10B981"
            />
            <MetricCard
              title="New Users (This Month)"
              value={analyticsData.userActivity.newUsersThisMonth.toLocaleString()}
              icon="person-add-outline"
              color="#F59E0B"
            />
            <MetricCard
              title="Growth Rate"
              value={`${analyticsData.userActivity.userGrowthRate}%`}
              icon="trending-up-outline"
              color="#8B5CF6"
            />
          </View>
        </AnalyticsSection>

        {/* Listing Metrics */}
        <AnalyticsSection title="Listing Performance" icon="home-outline">
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Total Listings"
              value={analyticsData.listingMetrics.totalListings.toLocaleString()}
              icon="home"
              color="#3B82F6"
            />
            <MetricCard
              title="Active Listings"
              value={analyticsData.listingMetrics.activeListings.toLocaleString()}
              icon="checkmark-circle"
              color="#10B981"
            />
            <MetricCard
              title="Pending Approvals"
              value={analyticsData.listingMetrics.pendingApprovals.toLocaleString()}
              icon="time"
              color="#F59E0B"
            />
            <MetricCard
              title="Views (This Month)"
              value={analyticsData.listingMetrics.viewsThisMonth.toLocaleString()}
              icon="eye"
              color="#8B5CF6"
            />
          </View>
        </AnalyticsSection>

        {/* Revenue Metrics */}
        <AnalyticsSection title="Revenue Analytics" icon="cash-outline">
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Monthly Revenue"
              value={`₱${analyticsData.revenueMetrics.monthlyRevenue.toLocaleString()}`}
              icon="cash"
              color="#10B981"
            />
            <MetricCard
              title="Total Revenue"
              value={`₱${analyticsData.revenueMetrics.totalRevenue.toLocaleString()}`}
              icon="wallet"
              color="#3B82F6"
            />
            <MetricCard
              title="Avg. Listing Price"
              value={`₱${analyticsData.revenueMetrics.averageListingPrice.toLocaleString()}`}
              icon="pricetag-outline"
              color="#F59E0B"
            />
            <MetricCard
              title="Revenue Growth"
              value={`${analyticsData.revenueMetrics.revenueGrowthRate}%`}
              icon="trending-up-outline"
              color="#8B5CF6"
            />
          </View>
        </AnalyticsSection>

        {/* Platform Performance */}
        <AnalyticsSection title="Platform Performance" icon="speedometer">
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Response Time"
              value={`${analyticsData.platformPerformance.averageResponseTime}ms`}
              icon="flash"
              color="#10B981"
            />
            <MetricCard
              title="Uptime"
              value={`${analyticsData.platformPerformance.uptime}%`}
              icon="checkmark-circle"
              color="#10B981"
            />
            <MetricCard
              title="Error Rate"
              value={`${analyticsData.platformPerformance.errorRate}%`}
              icon="warning"
              color="#EF4444"
            />
            <MetricCard
              title="Active Sessions"
              value={analyticsData.platformPerformance.activeSessions.toLocaleString()}
              icon="people"
              color="#3B82F6"
            />
          </View>
        </AnalyticsSection>
      </ScrollView>
    </View>
  );
}

/* ------------------- Component Definitions ------------------- */

function AnalyticsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
      <View className="mb-4 flex-row items-center">
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
        <Text className="ml-2 text-lg font-semibold text-gray-900">{title}</Text>
      </View>
      <View>{children}</View>
    </View>
  );
}

function MetricCard({
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
      className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
      style={{ width: CARD_WIDTH - 25 }}>
      <View className="mb-2 flex-row items-center">
        <Ionicons name={icon as any} size={16} color={color} />
        <Text className="ml-1.5 mr-1.5 text-xs font-medium text-gray-600">{title}</Text>
      </View>
      <Text className="text-lg font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with padding