import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import { ApplicationWithRenter } from '../../types/property';
import Button from '../../components/Button';
import ApplicationActionModal from '../../components/ApplicationActionModal';
import { User, MapPin, Briefcase, DollarSign, Home } from 'lucide-react-native';

type ApplicationsListScreenRouteProp = RouteProp<RootTabParamList, 'ApplicationsList'>;
type ApplicationsListScreenNavigationProp = StackNavigationProp<
  RootTabParamList,
  'ApplicationsList'
>;

interface ApplicationsListScreenProps {
  route: ApplicationsListScreenRouteProp;
  navigation: ApplicationsListScreenNavigationProp;
}

export default function ApplicationsListScreen({ route }: ApplicationsListScreenProps) {
  const insets = useSafeAreaInsets();
  const { propertyId } = route.params;

  const [applications, setApplications] = useState<ApplicationWithRenter[]>([]);
  const [propertyTitle, setPropertyTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithRenter | null>(
    null
  );
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('[ApplicationsListScreen] Fetching applications for property_id:', propertyId);

      // Fetch property title
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('title')
        .eq('property_id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      if (propertyData) {
        setPropertyTitle(propertyData.title);
        console.log('[ApplicationsListScreen] Property:', propertyData.title);
      }

      // Fetch applications with renter details
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
          renter:users!applications_renter_id_fkey (
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            profile_picture,
            occupation,
            place_of_work_study,
            price_range,
            room_preference
          )
        `
        )
        .eq('property_id', propertyId)
        .order('date_applied', { ascending: false });

      if (error) throw error;

      console.log('[ApplicationsListScreen] Applications fetched:', data?.length || 0);

      // Transform the data to match ApplicationWithRenter type
      const transformedData: ApplicationWithRenter[] = (data || []).map((app: any) => ({
        application_id: app.application_id,
        property_id: app.property_id,
        renter_id: app.renter_id,
        owner_id: app.owner_id,
        status: app.status,
        message: app.message,
        date_applied: app.date_applied,
        date_updated: app.date_updated,
        renter: app.renter,
      }));

      console.log('[ApplicationsListScreen] Status breakdown:', {
        pending: transformedData.filter((a) => a.status === 'pending').length,
        approved: transformedData.filter((a) => a.status === 'approved').length,
        rejected: transformedData.filter((a) => a.status === 'rejected').length,
        cancelled: transformedData.filter((a) => a.status === 'cancelled').length,
        completed: transformedData.filter((a) => a.status === 'completed').length,
      });

      setApplications(transformedData);
    } catch (error) {
      console.error('[ApplicationsListScreen] Error fetching applications:', error);
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

  const handleApprovePress = (application: ApplicationWithRenter) => {
    setSelectedApplication(application);
    setModalAction('approve');
    setShowActionModal(true);
  };

  const handleRejectPress = (application: ApplicationWithRenter) => {
    setSelectedApplication(application);
    setModalAction('reject');
    setShowActionModal(true);
  };

  const handleConfirmAction = async (message: string) => {
    if (!selectedApplication) return;

    try {
      if (modalAction === 'approve') {
        console.log('[ApplicationsListScreen] Approving application_id:', selectedApplication.application_id);

        // Check if renter already has an approved application (race condition prevention)
        const { data: existingApproved, error: checkError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('renter_id', selectedApplication.renter_id)
          .eq('status', 'approved')
          .limit(1);

        if (checkError) throw checkError;

        if (existingApproved && existingApproved.length > 0) {
          console.log('[ApplicationsListScreen] Renter already has approved application:', existingApproved[0].application_id);
          Alert.alert(
            'Cannot Approve',
            'This renter already has an approved application for another property.'
          );
          setShowActionModal(false);
          setSelectedApplication(null);
          return;
        }

        // Update this application to approved
        const { error: appError } = await supabase
          .from('applications')
          .update({
            status: 'approved',
            message: message,
            date_updated: new Date().toISOString(),
          })
          .eq('application_id', selectedApplication.application_id);

        if (appError) throw appError;
        console.log('[ApplicationsListScreen] Application status updated to approved');

        // Update user's rented_property
        const { error: userError } = await supabase
          .from('users')
          .update({ rented_property: propertyId })
          .eq('user_id', selectedApplication.renter_id);

        if (userError) throw userError;
        console.log('[ApplicationsListScreen] User rented_property updated to:', propertyId);

        // Auto-cancel all other pending applications by this renter
        const { error: cancelError } = await supabase
          .from('applications')
          .update({
            status: 'cancelled',
            message:
              'Your other applications have been automatically cancelled because one of your applications was approved.',
            date_updated: new Date().toISOString(),
          })
          .eq('renter_id', selectedApplication.renter_id)
          .eq('status', 'pending')
          .neq('application_id', selectedApplication.application_id);

        if (cancelError) {
          console.error('[ApplicationsListScreen] Error auto-cancelling applications:', cancelError);
          // Don't throw - approval was successful
        } else {
          console.log('[ApplicationsListScreen] Other pending applications auto-cancelled');
        }

        console.log('[ApplicationsListScreen] Application approved successfully');
        Alert.alert('Success', 'Application approved successfully.');
      } else {
        console.log('[ApplicationsListScreen] Rejecting application_id:', selectedApplication.application_id);

        // Reject application
        const { error } = await supabase
          .from('applications')
          .update({
            status: 'rejected',
            message: message,
            date_updated: new Date().toISOString(),
          })
          .eq('application_id', selectedApplication.application_id);

        if (error) throw error;

        console.log('[ApplicationsListScreen] Application rejected successfully');
        Alert.alert('Success', 'Application rejected.');
      }

      // Refresh applications list
      await fetchApplications();
      setShowActionModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('[ApplicationsListScreen] Error updating application:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#644A40" />
        <Text className="mt-4 text-base text-muted-foreground">Loading applications...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerClassName="px-6 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#644A40']}
            tintColor="#644A40"
          />
        }>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Applications</Text>
          <Text className="text-base text-muted-foreground" numberOfLines={2}>
            {propertyTitle}
          </Text>
        </View>

        {applications.length === 0 ? (
          <View className="mt-20 items-center justify-center">
            <Text className="text-5xl">📝</Text>
            <Text className="mt-4 text-lg font-semibold text-foreground">No Applications Yet</Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">
              No one has applied to this property yet
            </Text>
          </View>
        ) : (
          applications.map((app) => (
            <View
              key={app.application_id}
              className="mb-4 overflow-hidden rounded-xl border border-input bg-card shadow-sm">
              {/* Status Badge and Date */}
              <View className="flex-row items-center justify-between border-b border-input px-4 py-3">
                <View className={`rounded-full px-3 py-1 ${getStatusColor(app.status)}`}>
                  <Text className="text-xs font-semibold text-white">
                    {getStatusText(app.status)}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  Applied: {formatDate(app.date_applied)}
                </Text>
              </View>

              {/* Renter Information */}
              <View className="p-4">
                {/* Profile Picture and Name */}
                <View className="mb-3 flex-row items-center">
                  {app.renter.profile_picture ? (
                    <Image
                      source={{ uri: app.renter.profile_picture }}
                      className="mr-3 h-12 w-12 rounded-full"
                    />
                  ) : (
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <User size={24} color="#644A40" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-card-foreground">
                      {app.renter.first_name} {app.renter.last_name}
                    </Text>
                    <Text className="text-sm text-muted-foreground">{app.renter.email}</Text>
                    {app.renter.phone_number && (
                      <Text className="text-sm text-muted-foreground">
                        {app.renter.phone_number}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Renter Details */}
                <View className="mb-3 gap-2">
                  {app.renter.occupation && (
                    <View className="flex-row items-center">
                      <Briefcase size={16} color="#888" />
                      <Text className="ml-2 text-sm text-foreground">
                        {app.renter.occupation}
                      </Text>
                    </View>
                  )}

                  {app.renter.place_of_work_study && (
                    <View className="flex-row items-center">
                      <MapPin size={16} color="#888" />
                      <Text className="ml-2 text-sm text-foreground">
                        Works/Studies at: {app.renter.place_of_work_study}
                      </Text>
                    </View>
                  )}

                  {app.renter.price_range && (
                    <View className="flex-row items-center">
                      <DollarSign size={16} color="#888" />
                      <Text className="ml-2 text-sm text-foreground">
                        Budget: ₱{app.renter.price_range}/month
                      </Text>
                    </View>
                  )}

                  {app.renter.room_preference && (
                    <View className="flex-row items-center">
                      <Home size={16} color="#888" />
                      <Text className="ml-2 text-sm text-foreground">
                        Prefers: {app.renter.room_preference}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Message */}
                {app.message && (
                  <View className="mb-3 rounded-lg bg-secondary p-3">
                    <Text className="text-xs font-semibold text-muted-foreground">Message:</Text>
                    <Text className="mt-1 text-sm leading-5 text-foreground">{app.message}</Text>
                  </View>
                )}

                {/* Action Buttons - Only for pending applications */}
                {app.status === 'pending' && (
                  <View className="flex-row gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onPress={() => handleRejectPress(app)}
                      className="flex-1">
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleApprovePress(app)}
                      className="flex-1">
                      Approve
                    </Button>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </KeyboardAwareScrollView>

      {/* Application Action Modal */}
      {selectedApplication && (
        <ApplicationActionModal
          visible={showActionModal}
          action={modalAction}
          renterName={`${selectedApplication.renter.first_name} ${selectedApplication.renter.last_name}`}
          propertyTitle={propertyTitle}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowActionModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </View>
  );
}
