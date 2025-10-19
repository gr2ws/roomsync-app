import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAdminData } from '../store/useAdminData';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top + 8 : insets.top, // use insets.top for both platforms to handle safe area via flexbox
      }}>
      <ScrollView
        className="px-4 pb-4 pt-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View className="mb-6 pt-1">
          <Text className="mb-2 text-3xl font-bold text-gray-900">Reports and Safety</Text>
        </View>
        <ReportsSafetyTab/>
      </ScrollView>
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
    <View className="mx-1 mt-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="ml-2 text-xl font-bold text-gray-900">Manage Reports</Text>
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