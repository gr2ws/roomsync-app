import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  FlatList,
  Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoggedIn } from '../../store/useLoggedIn';
import { supabase } from '../../utils/supabase';
import { ApplicationWithProperty } from '../../types/property';
import ApplicationCard from '../../components/ApplicationCard';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useLoggedIn();

  const [applications, setApplications] = useState<ApplicationWithProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    if (!userProfile?.user_id) return;

    try {
      console.log('[ApplicationsScreen] Fetching applications for renter_id:', userProfile.user_id);

      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          application_id,
          property_id,
          renter_id,
          owner_id,
          status,
          message,
          date_applied,
          date_updated,
          property:properties (
            property_id,
            owner_id,
            title,
            description,
            category,
            street,
            barangay,
            city,
            coordinates,
            image_url,
            rent,
            amenities,
            rating,
            max_renters,
            is_available,
            is_verified,
            has_internet,
            allows_pets,
            is_furnished,
            has_ac,
            is_secure,
            has_parking,
            number_reviews
          )
        `
        )
        .eq('renter_id', userProfile.user_id)
        .order('date_applied', { ascending: false });

      if (error) throw error;

      console.log('[ApplicationsScreen] Applications fetched:', data?.length || 0);

      // Transform the data to match ApplicationWithProperty type
      const transformedData: ApplicationWithProperty[] = (data || []).map((app: any) => ({
        application_id: app.application_id,
        property_id: app.property_id,
        renter_id: app.renter_id,
        owner_id: app.owner_id,
        status: app.status,
        message: app.message,
        date_applied: app.date_applied,
        date_updated: app.date_updated,
        property: app.property,
      }));

      console.log('[ApplicationsScreen] Status breakdown:', {
        approved: transformedData.filter((a) => a.status === 'approved').length,
        pending: transformedData.filter((a) => a.status === 'pending').length,
        rejected: transformedData.filter((a) => a.status === 'rejected').length,
        cancelled: transformedData.filter((a) => a.status === 'cancelled').length,
        completed: transformedData.filter((a) => a.status === 'completed').length,
      });

      setApplications(transformedData);
    } catch (error) {
      console.error('[ApplicationsScreen] Error fetching applications:', error);
      Alert.alert('Error', 'Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchApplications();
  };

  const handleCancelApplication = async (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setShowCancelModal(true);
  };

  const confirmCancelApplication = async () => {
    if (!selectedApplicationId) return;

    setShowCancelModal(false);

    try {
      console.log('[ApplicationsScreen] Cancelling application_id:', selectedApplicationId);

      const { error } = await supabase
        .from('applications')
        .update({
          status: 'cancelled',
          message: 'Cancelled by applicant',
          date_updated: new Date().toISOString(),
        })
        .eq('application_id', selectedApplicationId);

      if (error) throw error;

      console.log('[ApplicationsScreen] Application cancelled successfully');
      Alert.alert('Success', 'Application cancelled successfully.');
      await fetchApplications();
    } catch (error) {
      console.error('[ApplicationsScreen] Error cancelling application:', error);
      throw error;
    } finally {
      setSelectedApplicationId(null);
    }
  };

  const handleContactOwner = async (ownerId: number) => {
    try {
      console.log('[ApplicationsScreen] Fetching owner phone for owner_id:', ownerId);

      // Fetch owner's phone number
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('phone_number')
        .eq('user_id', ownerId)
        .single();

      if (ownerError) throw ownerError;

      if (!ownerData?.phone_number) {
        Alert.alert('Error', 'Owner phone number not available');
        return;
      }

      console.log('[ApplicationsScreen] Opening SMS to owner');
      const url = `sms:${ownerData.phone_number}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open messaging app');
      }
    } catch (error) {
      console.error('[ApplicationsScreen] Error contacting owner:', error);
      Alert.alert('Error', 'Failed to open messaging app');
    }
  };

  const handleReapplyToProperty = async (propertyId: number) => {
    if (!userProfile?.user_id) {
      Alert.alert('Error', 'Unable to reapply. Please try again.');
      return;
    }

    // Check if user has an approved application
    const hasApproved = applications.some((app) => app.status === 'approved');
    if (hasApproved) {
      Alert.alert(
        'Cannot Reapply',
        'You already have an approved application. Please end your current rental before applying to another property.'
      );
      return;
    }

    // Check if user has 5 or more pending applications
    const pendingCount = applications.filter((app) => app.status === 'pending').length;
    if (pendingCount >= 5) {
      Alert.alert(
        'Cannot Reapply',
        'You have reached the maximum of 5 pending applications. Please wait for a response or cancel an existing application before applying to another property.'
      );
      return;
    }

    try {
      console.log('[ApplicationsScreen] Reapplying to property_id:', propertyId);

      // Find the cancelled application for this property
      const cancelledApp = applications.find(
        (app) => app.property_id === propertyId && app.status === 'cancelled'
      );

      if (cancelledApp) {
        console.log('[ApplicationsScreen] Deleting cancelled application_id:', cancelledApp.application_id);

        const { error: deleteError } = await supabase
          .from('applications')
          .delete()
          .eq('application_id', cancelledApp.application_id);

        if (deleteError) throw deleteError;

        console.log('[ApplicationsScreen] Cancelled application deleted successfully');
      }

      // Fetch property to check availability and verification
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('is_available, is_verified, owner_id')
        .eq('property_id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      console.log('[ApplicationsScreen] Property status:', {
        property_id: propertyId,
        is_available: property.is_available,
        is_verified: property.is_verified,
      });

      if (!property.is_available) {
        Alert.alert('Property Unavailable', 'This property is no longer available for rent.');
        return;
      }

      if (!property.is_verified) {
        Alert.alert(
          'Property Not Verified',
          'This property has not been verified yet. Please wait for admin approval.'
        );
        return;
      }

      // Insert new application
      console.log('[ApplicationsScreen] Inserting new application for property_id:', propertyId);

      const { error: insertError } = await supabase.from('applications').insert({
        property_id: propertyId,
        renter_id: userProfile.user_id,
        owner_id: property.owner_id,
        status: 'pending',
        message: null,
        date_applied: new Date().toISOString(),
        date_updated: null,
      });

      if (insertError) throw insertError;

      console.log('[ApplicationsScreen] Reapplication submitted successfully');
      Alert.alert('Success', 'Your application has been submitted successfully!');
      await fetchApplications();
    } catch (error) {
      console.error('[ApplicationsScreen] Error reapplying:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      throw error;
    }
  };

  // Organize applications into sections
  const approvedApplications = applications.filter((app) => app.status === 'approved');
  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const cancelledApplications = applications.filter((app) => app.status === 'cancelled');
  const rejectedApplications = applications.filter((app) => app.status === 'rejected');
  const completedApplications = applications.filter((app) => app.status === 'completed');

  // Flatten all applications in order for FlatList
  const flattenedApplications: {
    type: 'header' | 'item';
    title?: string;
    application?: ApplicationWithProperty;
  }[] = [];

  // Determine which section goes first
  const topApplications =
    approvedApplications.length > 0 ? approvedApplications : pendingApplications;
  const showPendingBelow = approvedApplications.length > 0;

  // Top Section: Approved OR Pending
  if (topApplications.length > 0) {
    flattenedApplications.push({
      type: 'header',
      title: approvedApplications.length > 0 ? 'Approved' : 'Pending',
    });
    topApplications.forEach((app) => {
      flattenedApplications.push({ type: 'item', application: app });
    });
  }

  // Pending Section (if approved exists)
  if (showPendingBelow && pendingApplications.length > 0) {
    flattenedApplications.push({ type: 'header', title: 'Pending' });
    pendingApplications.forEach((app) => {
      flattenedApplications.push({ type: 'item', application: app });
    });
  }

  // Bottom Section: Completed, Cancelled & Rejected
  if (
    completedApplications.length > 0 ||
    cancelledApplications.length > 0 ||
    rejectedApplications.length > 0
  ) {
    flattenedApplications.push({ type: 'header', title: 'Past Applications' });

    completedApplications.forEach((app) => {
      flattenedApplications.push({ type: 'item', application: app });
    });

    cancelledApplications.forEach((app) => {
      flattenedApplications.push({ type: 'item', application: app });
    });

    rejectedApplications.forEach((app) => {
      flattenedApplications.push({ type: 'item', application: app });
    });
  }

  const renderItem = ({ item }: { item: (typeof flattenedApplications)[number] }) => {
    if (item.type === 'header') {
      return (
        <View className="mb-3 mt-6 first:mt-0">
          <Text className="text-xl font-bold text-foreground">{item.title}</Text>
        </View>
      );
    }

    if (item.type === 'item' && item.application) {
      const app = item.application;
      const pendingCount = applications.filter((a) => a.status === 'pending').length;
      return (
        <ApplicationCard
          application={app}
          onCancel={app.status === 'pending' ? handleCancelApplication : undefined}
          onReapply={app.status === 'cancelled' ? handleReapplyToProperty : undefined}
          onContactOwner={app.status === 'pending' ? handleContactOwner : undefined}
          canReapply={
            app.status === 'cancelled' &&
            !applications.some((a) => a.status === 'approved') &&
            pendingCount < 5
          }
        />
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading || isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center" style={{ minHeight: 300 }}>
          <ActivityIndicator size="large" color="#644A40" />
          <Text className="mt-4 text-muted-foreground">Loading applications...</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-lg font-semibold text-foreground">No Applications Yet</Text>
        <Text className="mt-2 text-center text-base text-muted-foreground">
          Start browsing properties and apply to the ones you like!
        </Text>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      {/* Fixed Header Section */}
      <View
        className="border-b border-border bg-background px-4 pb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        <Text className="text-3xl font-bold text-primary">My Applications</Text>
        <Text className="mt-2.5 text-muted-foreground">
          Track your property applications and their status
        </Text>
      </View>

      {/* Applications List */}
      <FlatList
        data={flattenedApplications}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header'
            ? `header-${item.title}`
            : `app-${item.application?.application_id}-${index}`
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#644A40']}
            tintColor="#644A40"
          />
        }
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Application"
        message="Are you sure you want to cancel this application? This action cannot be undone."
        confirmText="Cancel"
        cancelText="Keep"
        confirmVariant="destructive"
        onConfirm={confirmCancelApplication}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedApplicationId(null);
        }}
      />
    </View>
  );
}
