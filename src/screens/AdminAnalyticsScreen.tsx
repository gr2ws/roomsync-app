// AdminAnalyticsScreen.tsx
// Analytics dashboard for admin panel

import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();

  // Dummy analytics data
  const analyticsData = useMemo(() => ({
    userActivity: {
      totalUsers: 1234,
      activeUsers: 856,
      newUsersThisMonth: 123,
      userGrowthRate: 12.5,
    },
    listingMetrics: {
      totalListings: 89,
      activeListings: 76,
      pendingApprovals: 12,
      viewsThisMonth: 2456,
    },
    revenueMetrics: {
      monthlyRevenue: 125000,
      totalRevenue: 1450000,
      averageListingPrice: 8500,
      revenueGrowthRate: 8.3,
    },
    platformPerformance: {
      averageResponseTime: 245,
      uptime: 99.8,
      errorRate: 0.02,
      activeSessions: 1234,
    },
  }), []);

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View>
          <Text style={styles.title}>Platform Analytics</Text>
          <Text style={styles.caption}>
            Comprehensive analytics including user activity trends, most viewed listings, revenue metrics, and platform performance indicators.
          </Text>
        </View>

        {/* User Activity Metrics */}
        <AnalyticsSection title="User Activity" icon="people-outline">
          <View style={styles.metricsGrid}>
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
          <View style={styles.metricsGrid}>
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
          <View style={styles.metricsGrid}>
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
          <View style={styles.metricsGrid}>
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
    </SafeAreaView>
  );
}

/* ------------------- Component Definitions ------------------- */

function AnalyticsSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={16} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

/* ------------------- Styles ------------------- */
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with padding

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 16, paddingVertical: 16 },
  
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 8
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  sectionContent: {
    // Content styles defined in child components
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: CARD_WIDTH - 25,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    marginRight:6,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
