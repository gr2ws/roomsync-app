import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { View, Text, Platform, Pressable } from 'react-native';
=======
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
>>>>>>> main
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
<<<<<<< HEAD
=======
import BackButton from '../../components/BackButton';
>>>>>>> main
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
<<<<<<< HEAD
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Wifi, PawPrint, Armchair, Wind, ShieldCheck, Car, Sparkles } from 'lucide-react-native';

type PreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preferences'>;

type Props = {
  navigation: PreferencesScreenNavigationProp;
};
=======
import {
  Wifi,
  Dog,
  Armchair,
  Wind,
  ShieldCheck,
  Car,
  Sparkles,
  GripVertical,
  LucideIcon,
} from 'lucide-react-native';

type PreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preferences'>;

interface PreferencesScreenProps {
  navigation: PreferencesScreenNavigationProp;
  route?: {
    params?: {
      fromProfile?: boolean;
    };
  };
}
>>>>>>> main

interface PreferenceItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const DEFAULT_PREFERENCES: PreferenceItem[] = [
  { key: 'internet', label: 'Internet Availability', icon: Wifi },
  { key: 'pet', label: 'Pet Friendly', icon: Dog },
  { key: 'furnished', label: 'Furnished', icon: Armchair },
  { key: 'aircon', label: 'Air Conditioned', icon: Wind },
  { key: 'security', label: 'Gated/With CCTV', icon: ShieldCheck },
  { key: 'parking', label: 'Parking', icon: Car },
];

export default function PreferencesScreen({ navigation, route }: PreferencesScreenProps) {
  const { setIsLoggedIn, userProfile } = useLoggedIn();
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<PreferenceItem[]>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  // Check if coming from Profile screen vs onboarding (Details screen)
  // During onboarding, the route params can include a flag
  const isFromProfile = route?.params?.fromProfile || false;

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('room_preferences');
      if (stored) {
        const storedLabels = JSON.parse(stored);
        // Reorder based on stored preferences
        const reordered = storedLabels
          .map((label: string) => DEFAULT_PREFERENCES.find((p) => p.label === label))
          .filter(Boolean) as PreferenceItem[];
        setPreferences(reordered);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSkip = async () => {
    try {
      // Set user-specific onboarding flag
      if (userProfile?.user_id) {
        await AsyncStorage.setItem(`user_${userProfile.user_id}_hasCompletedOnboarding`, 'true');
      }
      setIsLoggedIn(true);
      // Force navigation to Home after state update
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 30);
    } catch (error) {
      console.error('Error in handleSkip:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Store as simple array of labels
      const labels = preferences.map((p) => p.label);
      await AsyncStorage.setItem('room_preferences', JSON.stringify(labels));

      if (isFromProfile) {
        // Just go back to profile
        setLoading(false);
        navigation.goBack();
      } else {
        // Complete onboarding - set user-specific flag
        if (userProfile?.user_id) {
          await AsyncStorage.setItem(`user_${userProfile.user_id}_hasCompletedOnboarding`, 'true');
        }
        setIsLoggedIn(true);
        // Force navigation to Home after state update
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
          setLoading(false);
        }, 100);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PreferenceItem>) => {
    const Icon = item.icon;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          activeOpacity={0.7}
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgb(228, 228, 231)',
            backgroundColor: 'rgb(255, 255, 255)',
            padding: 16,
            opacity: isActive ? 0.7 : 1,
          }}>
          <Icon size={24} color="rgb(100, 74, 64)" />
          <Text className="ml-3 flex-1 text-base font-medium text-foreground">{item.label}</Text>
          <GripVertical size={20} color="rgb(161, 161, 170)" />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View
      className="flex-1 overflow-visible bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <View
        className="overflow-visible px-6 pt-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 45 : 0 }}>
        {isFromProfile && (
          <View>
            <BackButton className="px-0 pb-4" onPress={() => navigation.goBack()} />
            <View className="mb-6">
              <Text className="mb-2 text-3xl font-bold text-primary">Edit your Preferences</Text>
              <Text className="text-base text-muted-foreground">
                Drag items to prioritize your room preferences.The top 3 items are your must-haves,
                while the bottom 3 will help is fine-tune our recommendations.
              </Text>
            </View>
          </View>
        )}

        {!isFromProfile && (
          <View>
            <View className="mb-8">
              <Text className="mb-2 text-3xl font-bold text-primary">Prioritize your Needs</Text>
              <Text className="text-base text-muted-foreground">
                Drag items to prioritize your room preferences. This helps us find your perfect
                match!
              </Text>
            </View>
            <InfoBox
              icon={Sparkles}
              title="How to Prioritize"
              description="Hold and drag each item to reorder. Your top 3 choices become must-haves, while the rest help us fine-tune your recommendations. You can always edit these later."
              className="mb-6"
            />
          </View>
        )}
      </View>

      {/* Draggable List */}
      <View className="relative flex-1 overflow-visible px-6">
        {/* Fixed Divider - positioned after 3rd item */}
        <View
          className="absolute left-6 right-6 z-0 border-b border-dashed border-border/60"
          style={{
            top: 3 * (56 + 12), // 3 items * (item height + margin bottom) - half margin
          }}
        />
        <DraggableFlatList
          data={preferences}
          style={{ overflow: 'visible' }}
          onDragEnd={({ data }) => setPreferences(data)}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          containerStyle={{ flex: 1 }}
          activationDistance={10}
        />
      </View>

      {/* Buttons */}
      <View className="z-20 mb-8 gap-3 px-6">
        <Button onPress={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
        {!isFromProfile && (
          <Button onPress={handleSkip} variant="secondary" disabled={loading}>
            Skip for Now
          </Button>
        )}
      </View>
    </View>
  );
}
