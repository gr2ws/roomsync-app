import {
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/navigation';
import { supabase } from '../utils/supabase';
import { useLoggedIn } from '../store/useLoggedIn';
import Input from '../components/Input';
import Button from '../components/Button';
import MultiImagePicker from '../components/MultiImagePicker';
import InfoBox from '../components/InfoBox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'ReportScreen'>;
type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReportScreen'>;

interface ReportScreenProps {
  route: ReportScreenRouteProp;
  navigation: ReportScreenNavigationProp;
}

export default function ReportScreen({ route, navigation }: ReportScreenProps) {
  const insets = useSafeAreaInsets();
  const { reportedUserId, reportedUserName, propertyId, reporterRole } = route.params;
  const { userProfile } = useLoggedIn();

  console.log('[ReportScreen] Component mounted with params:', {
    reportedUserId,
    reportedUserName,
    propertyId,
    reporterRole,
    currentUserId: userProfile?.user_id,
  });

  const [reportTitle, setReportTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    reportTitle?: string;
    description?: string;
    proofImages?: string;
  }>({});

  const validateForm = (): boolean => {
    console.log('[ReportScreen] Validating form...');
    const newErrors: typeof errors = {};

    if (!reportTitle.trim()) {
      console.log('[ReportScreen] Validation failed: No report title');
      newErrors.reportTitle = 'Report title is required';
    }

    if (!description.trim()) {
      console.log('[ReportScreen] Validation failed: No description');
      newErrors.description = 'Description is required';
    }

    if (proofImages.length === 0) {
      console.log('[ReportScreen] Validation failed: No proof images');
      newErrors.proofImages = 'At least 1 proof image is required';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[ReportScreen] Validation result:', isValid);
    return isValid;
  };

  const uploadImageToSupabase = async (uri: string, index: number): Promise<string> => {
    console.log('[ReportScreen] Uploading image', index + 1, 'of', proofImages.length);
    try {
      // Get file extension from URI
      const fileExtension = uri.split('.').pop() || 'jpg';
      console.log('[ReportScreen] File extension:', fileExtension);

      // Fetch the image as ArrayBuffer (React Native compatible)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      console.log('[ReportScreen] Image data fetched, size:', fileData.length, 'bytes');

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${userProfile?.user_id}_${timestamp}_${index}.${fileExtension}`;
      const filePath = `${fileName}`;
      console.log('[ReportScreen] Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('report-proof')
        .upload(filePath, fileData, {
          contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          upsert: false,
        });

      if (error) throw error;
      console.log('[ReportScreen] Image uploaded successfully to Supabase');

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('report-proof').getPublicUrl(filePath);

      console.log('[ReportScreen] Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('[ReportScreen] Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    console.log('[ReportScreen] Submit button pressed');

    if (!validateForm()) {
      console.log('[ReportScreen] Form validation failed, aborting submit');
      return;
    }

    if (!userProfile?.user_id) {
      console.error('[ReportScreen] No user profile found');
      Alert.alert('Error', 'User profile not found. Please log in again.');
      return;
    }

    console.log('[ReportScreen] Starting report submission process');
    setIsSubmitting(true);

    try {
      console.log('[ReportScreen] Uploading', proofImages.length, 'proof images...');
      // Upload all proof images to Supabase Storage
      const uploadPromises = proofImages.map((uri, index) => uploadImageToSupabase(uri, index));
      const uploadedUrls = await Promise.all(uploadPromises);

      console.log('[ReportScreen] All images uploaded successfully. URLs:', uploadedUrls);

      // Insert report into database
      const reportData = {
        reported_by: userProfile.user_id,
        reported_user: reportedUserId,
        property_id: propertyId,
        report_title: reportTitle.trim(),
        description: description.trim(),
        proof: uploadedUrls,
        status: 'pending',
        date_created: new Date().toISOString(),
      };

      console.log('[ReportScreen] Inserting report into database:', {
        ...reportData,
        proof: `[${uploadedUrls.length} URLs]`,
      });

      const { error: insertError } = await supabase.from('reports').insert(reportData);

      if (insertError) throw insertError;

      console.log('[ReportScreen] Report submitted successfully to database');
      Alert.alert('Success', 'Your report has been submitted successfully.', [
        {
          text: 'OK',
          onPress: () => {
            console.log('[ReportScreen] Navigating back after successful submission');
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('[ReportScreen] Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      console.log('[ReportScreen] Submission process complete, setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerClassName="px-6 pb-8">
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
            activeOpacity={0.7}>
            <ArrowLeft size={32} color="rgb(100, 74, 64)" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-primary">Submit Report</Text>
            <Text className="mt-1 text-base text-muted-foreground">
              Reporting: {reportedUserName}
            </Text>
          </View>
        </View>

        {/* Report Form */}
        <View className="gap-4">
          {/* Report Title */}
          <View>
            <Input
              label="Report Title *"
              placeholder="Enter a brief title for your report"
              value={reportTitle}
              onChangeText={(text) => {
                setReportTitle(text);
                if (errors.reportTitle) {
                  setErrors({ ...errors, reportTitle: undefined });
                }
              }}
              error={errors.reportTitle}
              autoCapitalize="sentences"
            />
          </View>

          {/* Description */}
          <View>
            <Input
              label="Description *"
              placeholder="Describe the issue in detail..."
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors({ ...errors, description: undefined });
                }
              }}
              error={errors.description}
              multiline
              numberOfLines={6}
              autoCapitalize="sentences"
            />
          </View>

          {/* Proof Images */}
          <View>
            <MultiImagePicker
              label="Proof Images * (Minimum 1 required)"
              images={proofImages}
              onImagesChange={(images) => {
                setProofImages(images);
                if (errors.proofImages && images.length > 0) {
                  setErrors({ ...errors, proofImages: undefined });
                }
              }}
              maxImages={10}
              error={errors.proofImages}
            />
            <Text className="mt-1 text-xs text-muted-foreground">
              Upload evidence supporting your report (screenshots, photos, etc.)
            </Text>
          </View>

          {/* Info Box */}
          <InfoBox
            icon={AlertTriangle}
            title="Important Information"
            description="Your report will be reviewed by administrators. Please ensure all information is accurate and provide clear evidence. False reports may result in penalties."
            className="mt-2"
          />

          {/* Submit Button */}
          <View className="mt-4">
            <Button
              onPress={handleSubmit}
              variant="destructive"
              disabled={isSubmitting}
              className="w-full">
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
