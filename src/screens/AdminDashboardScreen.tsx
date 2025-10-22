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
import { BarChart, PieChart } from 'react-native-chart-kit';


export default function AdminDashboard() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-[rgb(249, 249, 249)]"
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
        <OverviewTab />
      </ScrollView>
    </View>
  );
}

/* Overview Tab shows metric cards and related data */
/* ------------------- Overview Tab ------------------- */
function OverviewTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const onRefresh = async () => {
    setRefreshing(true);
    const results: any = await fetchAllCounts();
    setMetrics(results);
    setRefreshing(false);
  };

  // [TEST NOTE] disable here when debugging
  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const results: any = await fetchAllCounts();

      // Artificial delay for smooth UI (1.5 seconds)
      setTimeout(() => {
        setMetrics(results);
        setLoading(false);
      }, 100);
    };

    fetchCounts();
  }, []);

  const [propertyCityData, setPropertyCityData] = useState<any[]>([]);

  useEffect(() => {
    const loadCityDistribution = async () => {
      const data = await fetchPropertyDistributionByCity();
      setPropertyCityData(data);
    };
    loadCityDistribution();
  }, []);


  const [userGrowthData, setUserGrowthData] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    const loadUserGrowth = async () => {
      const data = await fetchMonthlyUserGrowth();
      setUserGrowthData(data);
    };
    loadUserGrowth();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-32">
        <Ionicons name="sync-outline" size={48} color="#3B82F6" />
        <Text className="mt-4 text-base text-gray-600">Loading dashboard data...</Text>
      </View>
    );
  }

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

     <StatSection title="Monthly User Growth (2025)">
        {userGrowthData.length === 0 ? (
          <Text className="text-gray-500">No data available</Text>
        ) : (
          <View
            className="border border-gray-200 rounded-2xl bg-white pr-2"
            style={{
              alignItems: 'center', // 👈 centers children horizontally
              justifyContent: 'center', // 👈 centers vertically (optional)
            }}
          >
            <BarChart
              data={{
                labels: userGrowthData.map((d) => d.month),
                datasets: [{ data: userGrowthData.map((d) => d.users) }],
              }}
              width={Dimensions.get('window').width - 48} // 👈 smaller width fits neatly inside
              height={220}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              withHorizontalLabels={false}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#3B82F6',
                labelColor: () => '#6B7280',
                barPercentage: 0.7,
              }}
              style={{
                borderRadius: 16,
                paddingRight: 4,
                paddingLeft: 3,
              }}
            />
          </View>
        )}
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

      <StatSection title="Property Distribution by City">
        {propertyCityData.length === 0 ? (
          <Text className="text-gray-500">No property data available</Text>
        ) : (
          <>
            {/* PIE CHART */}
            <View className="flex-row justify-center items-center w-full border border-gray-200 rounded-2xl mb-4 bg-white">
                <PieChart
                  data={propertyCityData.map((d) => ({
                    name: d.key,
                    population: d.value,
                    color: d.svg.fill,
                  }))}
                  width={Dimensions.get('window').width} // 60% of screen width
                  height={220}
                  accessor="population"
                  center={[0, 0]}
                  backgroundColor="transparent"
                  paddingLeft="100"
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: () => '#000',
                  }}
                  hasLegend={false}  
                  absolute
                />
            </View>

            {/* PROPERTY COUNT PER CITY */}
            <View className="flex-row flex-wrap justify-start">
              {propertyCityData.map((city, index) => (
                <StatCard
                  key={index}
                  icon="location-outline"
                  label={city.key}
                  value={String(city.value)}
                  color={city.svg.fill}
                  fullWidth
                />
              ))}
            </View>
          </>
        )}
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

async function fetchMonthlyUserGrowth() {
  const { data, error } = await supabase
    .from('users')
    .select('account_created_date')
    .gte('account_created_date', '2025-01-01')
    .lt('account_created_date', '2026-01-01');

  if (error) {
    console.error(`Error fetching user growth: ` + error);
    return [];
  }

  // Count per month
  const monthlyCounts: { [month: string]: number } = {};

  data.forEach((user) => {
    const month = new Date(user.account_created_date).toLocaleString('default', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  // Convert to chart data format
  const chartData = Object.keys(monthlyCounts).map((month) => ({
    month,
    users: monthlyCounts[month],
  }));

  // Sort by calendar order (Jan → Dec)
  const monthsOrder = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return chartData.sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
}

async function fetchPropertyDistributionByCity() {
  const { data, error } = await supabase
    .from('properties')
    .select('city');

  if (error) {
    console.error('Error fetching property distribution:', error);
    return [];
  }

  // Count properties per city
  const cityCounts: Record<string, number> = {};
  data.forEach((property) => {
    const city = property.city || 'Unknown';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  // Convert to chart format
  return Object.entries(cityCounts).map(([city, count]) => ({
    key: city,
    value: count,
    svg: { fill: getRandomColor(city) },
  }));
}

// Utility: simple hash → color
function getRandomColor(key: string) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#F97316', '#84CC16'];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}


/* ------------------- Reusable Section Component ------------------- */
function StatSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-xl font-bold text-gray-900">{title}</Text>
      <View className="flex-row flex-wrap justify-start align-middle">{children}</View>
    </View>
  );
}

/* ------------------- Small Components ------------------- */
interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap; // ✅ restricts to valid Ionicons names
  label: string;
  value: string;
  color: string;
  fullWidth?: boolean;
}

function StatCard({ icon, label, value, color, fullWidth }: StatCardProps) {
  return (
    <View
      className={`mb-2 min-w-40 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm 
        ${fullWidth ? 'w-[98%] text-center' : 'flex-1 mr-2 '}`}>
      <View className={`mb-2 flex-row items-center`}>
        <Ionicons name={icon} size={18} color={color || '#6B7280'} />
        <Text className="ml-2 mr-3 text-sm font-medium text-gray-600">{label}</Text>
      </View>
      <Text
        className={`mt-0.5 ${fullWidth ? 'text-center text-4xl font-bold' : 'text-2xl font-bold'}`}
        style={color ? { color } : {}}>
        {value}
      </Text>
    </View>
  );
}
