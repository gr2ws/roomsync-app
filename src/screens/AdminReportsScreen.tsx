import * as React from 'react';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'under investigation' | 'resolved' | 'dismissed'
  >('all');

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        report_id,
        report_title,
        description,
        status,
        proof,
        date_created,
        reported_by,
        reported_user,
        users_reported_by:reported_by(first_name, last_name),
        users_reported_user:reported_user(first_name, last_name)
      `
      )
      .order('date_created', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const filteredReports = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  return (
    <View
      className="flex-1 bg-white"
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top,
      }}>
      <ScrollView
        className="px-4 pb-4 pt-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }>
        {/* Header */}
        <View className="mb-6 pt-1">
          <Text className="mb-2 text-3xl font-bold text-gray-900">Reports and Safety</Text>
        </View>

        {/* Filter Tabs */}
        <View className="mb-4 flex-row flex-wrap gap-2">
          {['all', 'pending', 'under investigation', 'resolved', 'dismissed'].map((s) => {
            const isActive = filter === s;
            const label = s === 'all' ? 'All' : s.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
            return (
              <TouchableOpacity
                key={s}
                className={`rounded-full border px-3 py-1.5 ${
                  isActive ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}
                onPress={() => setFilter(s as any)}>
                <Text
                  className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-3 text-gray-600">Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10">
            <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
            <Text className="mt-3 text-gray-600">No reports found.</Text>
          </View>
        ) : (
          <ReportsSafetyTab reports={filteredReports} refresh={fetchReports} />
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------- Report Card ------------------- */
function ReportCard({
  report,
  onViewProof,
  onResolve,
  onDismiss,
}: {
  report: any;
  onViewProof: () => void;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  const [proofVisible, setProofVisible] = useState(false);

  const isUnderInvestigation = report.status === 'under investigation';
  const isResolved = report.status === 'resolved';
  const isDismissed = report.status === 'dismissed';
  const isInactive = isResolved || isDismissed;

  const badgeColor = isResolved
    ? 'bg-green-100 text-green-600'
    : isDismissed
      ? 'bg-gray-100 text-gray-600'
      : isUnderInvestigation
        ? 'bg-blue-100 text-blue-600'
        : 'bg-amber-100 text-amber-600';

  // Normalize proof: single URL or empty
  const proofUrl =
    typeof report.proof === 'string' && report.proof.trim() !== '' ? report.proof.trim() : null;

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900">{report.report_title}</Text>
        <View className={`rounded-lg px-2 py-1 ${badgeColor.split(' ')[0]}`}>
          <Text className={`text-xs font-medium ${badgeColor.split(' ')[1]}`}>
            {report.status.replace(/(^|\s)\S/g, (t: string) => t.toUpperCase())}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-700">
          Reporter: {report.users_reported_by?.first_name} {report.users_reported_by?.last_name} •
          Against: {report.users_reported_user?.first_name} {report.users_reported_user?.last_name}
        </Text>
        <Text className="text-sm italic leading-5 text-gray-600">
          {report.description || 'No additional details provided.'}
        </Text>
      </View>

      {/* Buttons */}
      <View className="flex-row flex-wrap gap-2">
        {/* View Proof Button */}
        <TouchableOpacity
          className={`flex-row items-center rounded-lg border px-3 py-1.5 ${
            isUnderInvestigation ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-transparent'
          }`}
          onPress={() => {
            setProofVisible(true);
            onViewProof(); // mark as "under investigation"
          }}
          disabled={isInactive}>
          <Ionicons
            name="images-outline"
            size={16}
            color={isInactive ? '#9CA3AF' : '#3B82F6'}
            style={{ marginRight: 6 }}
          />
          <Text className={`text-xs font-medium ${isInactive ? 'text-gray-400' : 'text-blue-500'}`}>
            {isUnderInvestigation ? 'Under Investigation' : 'View Proof'}
          </Text>
        </TouchableOpacity>

        {/* Resolve */}
        <TouchableOpacity
          className="flex-row items-center rounded-lg border border-green-500 bg-transparent px-3 py-1.5"
          onPress={onResolve}
          disabled={isInactive}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={isInactive ? '#9CA3AF' : '#10B981'}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`text-xs font-medium ${isInactive ? 'text-gray-400' : 'text-green-500'}`}>
            Resolve
          </Text>
        </TouchableOpacity>

        {/* Dismiss */}
        <TouchableOpacity
          className="flex-row items-center rounded-lg border border-gray-500 bg-transparent px-3 py-1.5"
          onPress={onDismiss}
          disabled={isInactive}>
          <Ionicons
            name="close-circle-outline"
            size={16}
            color={isInactive ? '#9CA3AF' : '#6B7280'}
            style={{ marginRight: 6 }}
          />
          <Text className={`text-xs font-medium ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>

      {/* Proof Modal */}
      <Modal
        visible={proofVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProofVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/90 px-4">
          {proofUrl ? (
            <Image
              source={{ uri: proofUrl }}
              style={{
                width: width * 0.9,
                height: width * 1.1,
                resizeMode: 'contain',
                borderRadius: 12,
              }}
            />
          ) : (
            <Text className="text-lg font-medium text-white">No proof uploaded.</Text>
          )}

          <TouchableOpacity
            className="absolute right-6 top-12 rounded-full bg-black/50 p-2"
            onPress={() => setProofVisible(false)}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------- Reports Tab ------------------- */
function ReportsSafetyTab({ reports, refresh }: { reports: any[]; refresh: () => void }) {
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const handleViewProof = async (reportId: number) => {
    await updateStatus(reportId, 'under investigation');
    await refresh();
  };

  const handleResolve = async (reportId: number) => {
    await updateStatus(reportId, 'resolved');
    await refresh();
  };

  const handleDismiss = async (reportId: number) => {
    await updateStatus(reportId, 'dismissed');
    await refresh();
  };

  return (
    <View className="mx-1 mt-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="ml-2 text-xl font-bold text-gray-900">Manage Reports</Text>
        <View className="min-w-6 items-center rounded-xl bg-red-600 px-2 py-1">
          <Text className="text-xs font-semibold text-white">{pendingCount}</Text>
        </View>
      </View>

      {reports.map((report) => (
        <ReportCard
          key={report.report_id}
          report={report}
          onViewProof={() => handleViewProof(report.report_id)}
          onResolve={() => handleResolve(report.report_id)}
          onDismiss={() => handleDismiss(report.report_id)}
        />
      ))}
    </View>
  );
}

/* ------------------- Helpers ------------------- */
async function updateStatus(reportId: number, newStatus: string) {
  const { error } = await supabase
    .from('reports')
    .update({ status: newStatus, date_resolved: new Date().toISOString() })
    .eq('report_id', reportId);

  if (error) console.error('Error updating report status:', error);
}
// checkpoint
