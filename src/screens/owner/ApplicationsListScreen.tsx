import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Image,
  FlatList,
  Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';
import { useLoggedIn } from '../../store/useLoggedIn';
import { ApplicationWithRenter } from '../../types/property';
import {
  calculateDistanceFromStrings,
  formatDistance,
  parseCoordinates,
} from '../../utils/distance';
import * as Location from 'expo-location';
import SmallButton from '../../components/SmallButton';
import BackButton from '../../components/BackButton';
import ApplicationActionModal from '../../components/ApplicationActionModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  User,
  MapPin,
  Banknote,
  Home,
  MessageCircle,
  X,
  Check,
  Ban,
  Flag,
} from 'lucide-react-native';

type ApplicationsListScreenRouteProp = RouteProp<RootStackParamList, 'ApplicationsList'>;
type ApplicationsListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ApplicationsList'
>;

interface ApplicationsListScreenProps {
  route: ApplicationsListScreenRouteProp;
  navigation: ApplicationsListScreenNavigationProp;
}

export default function ApplicationsListScreen({ route, navigation }: ApplicationsListScreenProps) {
  const insets = useSafeAreaInsets();
  const { propertyId } = route.params;
  const { userProfile } = useLoggedIn();

  const [applications, setApplications] = useState<ApplicationWithRenter[]>([]);
  const [propertyTitle, setPropertyTitle] = useState<string>('');
  const [propertyCoordinates, setPropertyCoordinates] = useState<string | null>(null);
  const [maxRenters, setMaxRenters] = useState<number>(0);
  const [currentRenters, setCurrentRenters] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithRenter | null>(
    null
  );
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [locationNames, setLocationNames] = useState<Record<string, string>>({});
  const [isGeocodingLocations, setIsGeocodingLocations] = useState(false);
  const [showEndRentalModal, setShowEndRentalModal] = useState(false);
  const [selectedRenterForEndRental, setSelectedRenterForEndRental] =
    useState<ApplicationWithRenter | null>(null);
  const [isEndingRental, setIsEndingRental] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const reverseGeocode = async (coordinates: string): Promise<string> => {
    try {
      const coords = parseCoordinates(coordinates);
      if (!coords) return coordinates;

      const results = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lon,
      });

      if (results && results.length > 0) {
        const address = results[0];
        const name = [address.street, address.city, address.region].filter(Boolean).join(', ');
        return name || coordinates;
      }
      return coordinates;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return coordinates;
    }
  };

  const fetchApplications = async () => {
    try {
      console.log('[ApplicationsListScreen] Fetching applications for property_id:', propertyId);

      // Fetch property title, coordinates, and max_renters
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('title, coordinates, max_renters')
        .eq('property_id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      if (propertyData) {
        setPropertyTitle(propertyData.title);
        setPropertyCoordinates(propertyData.coordinates);
        setMaxRenters(propertyData.max_renters);
        console.log('[ApplicationsListScreen] Property:', propertyData.title);
        console.log('[ApplicationsListScreen] Property coordinates:', propertyData.coordinates);
        console.log('[ApplicationsListScreen] Max renters:', propertyData.max_renters);
      }

      // Count current renters for this property
      const { count: rentersCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rented_property', propertyId);

      if (countError) {
        console.error('[ApplicationsListScreen] Error counting renters:', countError);
      } else {
        setCurrentRenters(rentersCount || 0);
        console.log('[ApplicationsListScreen] Current renters:', rentersCount || 0);
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
          renter:users!fk_applications_renter (
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

      // Reverse geocode all locations
      setIsGeocodingLocations(true);
      const geocodePromises = transformedData
        .filter((app) => app.renter.place_of_work_study)
        .map(async (app) => {
          const locationName = await reverseGeocode(app.renter.place_of_work_study!);
          return { key: app.renter.place_of_work_study!, value: locationName };
        });

      const geocodedResults = await Promise.all(geocodePromises);
      const newLocationNames: Record<string, string> = {};
      geocodedResults.forEach((result) => {
        newLocationNames[result.key] = result.value;
      });
      setLocationNames(newLocationNames);
      setIsGeocodingLocations(false);
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
    // Check if property is at full capacity
    if (currentRenters >= maxRenters) {
      Alert.alert(
        'Cannot Approve Application',
        `This property is at full capacity (${currentRenters}/${maxRenters} renters). No additional applications can be approved at this time.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedApplication(application);
    setModalAction('approve');
    setShowActionModal(true);
  };

  const handleRejectPress = (application: ApplicationWithRenter) => {
    setSelectedApplication(application);
    setModalAction('reject');
    setShowActionModal(true);
  };

  const handleContactApplicant = async (phoneNumber: string | null) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Applicant phone number not available');
      return;
    }

    try {
      const url = `sms:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open messaging app');
      }
    } catch (error) {
      console.error('Error opening SMS:', error);
      Alert.alert('Error', 'Failed to open messaging app');
    }
  };

  const handleEndRentalPress = (application: ApplicationWithRenter) => {
    setSelectedRenterForEndRental(application);
    setShowEndRentalModal(true);
  };

  const handleReportPress = (application: ApplicationWithRenter) => {
    console.log('[ApplicationsListScreen] Report button pressed for application:', {
      application_id: application.application_id,
      renter_id: application.renter_id,
      renter_name: `${application.renter.first_name} ${application.renter.last_name}`,
      status: application.status,
    });

    if (!userProfile?.user_id) {
      console.error('[ApplicationsListScreen] No user profile found');
      Alert.alert('Error', 'User profile not found. Please log in again.');
      return;
    }

    const reportParams = {
      reportedUserId: application.renter_id,
      reportedUserName: `${application.renter.first_name} ${application.renter.last_name}`,
      propertyId: application.property_id,
      reporterRole: 'owner' as const,
    };

    console.log('[ApplicationsListScreen] Navigating to ReportScreen with params:', reportParams);

    // Navigate to ReportScreen
    navigation.navigate('ReportScreen', reportParams);
    console.log('[ApplicationsListScreen] Navigation to ReportScreen initiated');
  };

  const handleEndRental = async (optionalMessage?: string) => {
    if (!selectedRenterForEndRental) {
      Alert.alert('Error', 'Unable to end rental. Please try again.');
      return;
    }

    setIsEndingRental(true);
    setShowEndRentalModal(false);

    try {
      const endDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const message = `Rental ended by owner on ${endDate}.${optionalMessage ? ' ' + optionalMessage : ''}`;

      console.log('[ApplicationsListScreen] Ending rental:', {
        application_id: selectedRenterForEndRental.application_id,
        property_id: selectedRenterForEndRental.property_id,
        renter_id: selectedRenterForEndRental.renter_id,
        message: message,
      });

      // Update application status to completed
      const { error: appError } = await supabase
        .from('applications')
        .update({
          status: 'completed',
          message: message,
          date_updated: new Date().toISOString(),
        })
        .eq('application_id', selectedRenterForEndRental.application_id);

      if (appError) throw appError;
      console.log('[ApplicationsListScreen] Application status updated to completed');

      // Remove rented_property FK from users table
      const { error: userError } = await supabase
        .from('users')
        .update({ rented_property: null })
        .eq('user_id', selectedRenterForEndRental.renter_id);

      if (userError) throw userError;
      console.log('[ApplicationsListScreen] User rented_property FK removed');

      // Query current renters count for the property (after removal)
      const { count: currentRentersCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rented_property', propertyId);

      if (countError) throw countError;

      console.log(
        '[ApplicationsListScreen] Current renters count after removal:',
        currentRentersCount
      );

      // Update current renters count in state
      setCurrentRenters(currentRentersCount || 0);

      // If current renters < max_renters, set property to available
      if (currentRentersCount !== null && maxRenters && currentRentersCount < maxRenters) {
        const { error: propError } = await supabase
          .from('properties')
          .update({ is_available: true })
          .eq('property_id', propertyId);

        if (propError) {
          console.error(
            '[ApplicationsListScreen] Error updating property availability:',
            propError
          );
          // Don't throw - rental ending was successful even if this fails
        } else {
          console.log('[ApplicationsListScreen] Property set to available');
        }
      }

      console.log('[ApplicationsListScreen] Rental ended successfully');
      Alert.alert('Success', 'Rental has been ended successfully.');

      // Refresh applications list
      await fetchApplications();
      setSelectedRenterForEndRental(null);
    } catch (error) {
      console.error('[ApplicationsListScreen] Error ending rental:', error);
      Alert.alert('Error', 'Failed to end rental. Please try again.');
    } finally {
      setIsEndingRental(false);
    }
  };

  const handleConfirmAction = async (message: string) => {
    if (!selectedApplication) return;

    try {
      if (modalAction === 'approve') {
        console.log(
          '[ApplicationsListScreen] Approving application_id:',
          selectedApplication.application_id
        );

        // Check if renter already has an approved application (race condition prevention)
        const { data: existingApproved, error: checkError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('renter_id', selectedApplication.renter_id)
          .eq('status', 'approved')
          .limit(1);

        if (checkError) throw checkError;

        if (existingApproved && existingApproved.length > 0) {
          console.log(
            '[ApplicationsListScreen] Renter already has approved application:',
            existingApproved[0].application_id
          );
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
              'Other applications have been automatically cancelled as one application was approved.',
            date_updated: new Date().toISOString(),
          })
          .eq('renter_id', selectedApplication.renter_id)
          .eq('status', 'pending')
          .neq('application_id', selectedApplication.application_id);

        if (cancelError) {
          console.error(
            '[ApplicationsListScreen] Error auto-cancelling applications:',
            cancelError
          );
          // Don't throw - approval was successful
        } else {
          console.log('[ApplicationsListScreen] Other pending applications auto-cancelled');
        }

        console.log('[ApplicationsListScreen] Application approved successfully');
        Alert.alert('Success', 'Application approved successfully.');

        // Update current renters count
        setCurrentRenters((prev) => prev + 1);
      } else {
        console.log(
          '[ApplicationsListScreen] Rejecting application_id:',
          selectedApplication.application_id
        );

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

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          textColor: 'rgb(90, 70, 0)',
        };
      case 'approved':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          textColor: 'rgb(76, 175, 80)',
        };
      case 'rejected':
        return {
          backgroundColor: 'rgba(229, 77, 46, 0.1)',
          textColor: 'rgb(229, 77, 46)',
        };
      case 'cancelled':
        return {
          backgroundColor: 'rgb(239, 239, 239)',
          textColor: 'rgb(100, 100, 100)',
        };
      case 'completed':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          textColor: 'rgb(59, 130, 246)',
        };
      default:
        return {
          backgroundColor: 'rgb(239, 239, 239)',
          textColor: 'rgb(100, 100, 100)',
        };
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getRoomPreferenceLabel = (preference: string | null) => {
    if (!preference) return null;
    if (preference === 'bedspace') return 'Bed Spaces';
    if (preference === 'room') return 'Rooms';
    if (preference === 'apartment') return 'Apartments';
    return preference.charAt(0).toUpperCase() + preference.slice(1);
  };

  const renderApplicationItem = ({ item }: { item: ApplicationWithRenter }) => (
    <View className="mb-4 overflow-hidden rounded-lg border border-input bg-card shadow-sm">
      {/* Status Badge and Date */}
      <View className="flex-row items-center justify-between border-b border-input px-4 py-3">
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: getStatusColors(item.status).backgroundColor }}>
          <Text
            className="text-xs font-semibold"
            style={{ color: getStatusColors(item.status).textColor }}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          Applied: {formatDate(item.date_applied)}
        </Text>
      </View>

      {/* Renter Information */}
      <View className="p-4">
        {/* Profile Picture and Name */}
        <View className="mb-3 flex-row items-center">
          {item.renter.profile_picture ? (
            <Image
              source={{ uri: item.renter.profile_picture }}
              className="mr-3 h-12 w-12 rounded-full"
            />
          ) : (
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <User size={24} color="#644A40" />
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-lg font-bold text-card-foreground">
                {item.renter.first_name} {item.renter.last_name}
              </Text>
              {item.renter.occupation && (
                <>
                  <Text className="text-sm capitalize text-muted-foreground">
                    {', ' + item.renter.occupation}
                  </Text>
                </>
              )}
            </View>
            <Text className="text-sm text-muted-foreground">{'<' + item.renter.email + '>'}</Text>
            {item.renter.phone_number && (
              <Text className="text-sm text-muted-foreground">{item.renter.phone_number}</Text>
            )}
          </View>
        </View>

        {/* Renter Details */}
        <View className="mb-3 gap-2">
          {item.renter.place_of_work_study && (
            <View className="flex-row items-center">
              <MapPin size={16} color="#000" />
              <View className="ml-2 flex-1 flex-row items-center gap-2">
                {isGeocodingLocations && !locationNames[item.renter.place_of_work_study] ? (
                  <>
                    <ActivityIndicator size="small" color="#888" />
                    <Text className="text-sm text-muted-foreground">Loading location...</Text>
                  </>
                ) : (
                  <Text className="flex-1 text-sm text-foreground">
                    {locationNames[item.renter.place_of_work_study] ||
                      item.renter.place_of_work_study}
                    {(() => {
                      if (!propertyCoordinates || !item.renter.place_of_work_study) return '';

                      const distance = calculateDistanceFromStrings(
                        propertyCoordinates,
                        item.renter.place_of_work_study
                      );
                      return distance !== null ? ` (${formatDistance(distance)})` : '';
                    })()}
                  </Text>
                )}
              </View>
            </View>
          )}

          {item.renter.price_range && (
            <View className="flex-row items-center">
              <Banknote size={16} color="#000" />
              <Text className="ml-2 text-sm text-foreground">₱{item.renter.price_range}/month</Text>
            </View>
          )}

          {item.renter.room_preference && (
            <View className="flex-row items-center">
              <Home size={16} color="#000" />
              <Text className="ml-2 text-sm text-foreground">
                Prefers {getRoomPreferenceLabel(item.renter.room_preference)}
              </Text>
            </View>
          )}
        </View>

        {/* Message */}
        {item.message && (
          <View className="mb-3 rounded-lg bg-secondary p-3">
            <Text className="text-xs font-semibold text-muted-foreground">Message:</Text>
            <Text className="mt-1 text-sm leading-5 text-foreground">{item.message}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          {/* Contact Button - Always visible */}
          <SmallButton
            text="Contact"
            Icon={MessageCircle}
            variant="secondary"
            onPress={() => handleContactApplicant(item.renter.phone_number)}
            className="flex-1"
          />

          {/* Approve/Reject - Only for pending applications */}
          {item.status === 'pending' && (
            <>
              <SmallButton
                text="Reject"
                Icon={X}
                variant="destructive"
                onPress={() => handleRejectPress(item)}
                className="flex-1"
              />
              <SmallButton
                text="Approve"
                Icon={Check}
                variant="primary"
                onPress={() => handleApprovePress(item)}
                disabled={currentRenters >= maxRenters}
                className="flex-1"
              />
            </>
          )}

          {/* Cancel Rent - Only for approved applications */}
          {item.status === 'approved' && (
            <SmallButton
              text="Cancel Rent"
              Icon={Ban}
              variant="destructive"
              onPress={() => handleEndRentalPress(item)}
              disabled={isEndingRental}
              className="flex-1"
            />
          )}

          {/* Report Button - For all applications except pending */}
          {item.status !== 'pending' && (
            <SmallButton
              text="Report"
              Icon={Flag}
              variant="destructive"
              onPress={() => handleReportPress(item)}
              className="flex-1"
            />
          )}
        </View>
      </View>
    </View>
  );

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
        <Text className="text-center text-base text-muted-foreground">
          No one has applied to this property yet
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
        className="flex-row items-center justify-between border-b border-border bg-background px-4 pb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
        <BackButton onPress={() => navigation.goBack()} label="" />
        <View className="flex-1">
          <Text className="text-3xl font-bold text-primary">Applications</Text>
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
            {propertyTitle}
          </Text>
        </View>

        {/* Capacity Indicator */}
        {maxRenters > 0 && (
          <View className="items-end">
            <Text
              className={`text-2xl font-bold ${
                currentRenters >= maxRenters
                  ? 'text-destructive'
                  : currentRenters >= maxRenters * 0.8
                    ? 'text-amber-600'
                    : 'text-green-600'
              }`}>
              {currentRenters}/{maxRenters}
            </Text>
            <Text
              className={`text-sm font-semibold ${
                currentRenters >= maxRenters
                  ? 'text-destructive'
                  : currentRenters >= maxRenters * 0.8
                    ? 'text-amber-600'
                    : 'text-green-600'
              }`}>
              {currentRenters >= maxRenters ? 'Full' : 'Available'}
            </Text>
          </View>
        )}
      </View>

      {/* Applications List */}
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.application_id.toString()}
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

      {/* End Rental Confirmation Modal */}
      {selectedRenterForEndRental && (
        <ConfirmationModal
          visible={showEndRentalModal}
          title="Cancel Rent"
          message={`Are you sure you want to end the rental for ${selectedRenterForEndRental.renter.first_name} ${selectedRenterForEndRental.renter.last_name}? This will cancel their approved application and free up a spot in the property.`}
          confirmText="End Rental"
          cancelText="Cancel"
          showMessageInput
          messageInputPlaceholder="Add an optional message (e.g., reason for ending rental)"
          messageInputLabel="Optional Message"
          confirmVariant="destructive"
          onConfirm={handleEndRental}
          onCancel={() => {
            setShowEndRentalModal(false);
            setSelectedRenterForEndRental(null);
          }}
        />
      )}
    </View>
  );
}
