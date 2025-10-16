import React, { useState, useEffect } from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Wifi, PawPrint, Armchair, Wind, ShieldCheck, Car, Sparkles } from 'lucide-react-native';

type PreferencesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Preferences'>;

type Props = {
  navigation: PreferencesScreenNavigationProp;
};

interface PreferenceItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
}

const DEFAULT_PREFERENCES: PreferenceItem[] = [
  { key: '1', label: 'Internet Availability', icon: Wifi },
  { key: '2', label: 'Pet Friendly', icon: PawPrint },
  { key: '3', label: 'Furnished', icon: Armchair },
  { key: '4', label: 'Air Conditioned', icon: Wind },
  { key: '5', label: 'Gated/With CCTV', icon: ShieldCheck },
  { key: '6', label: 'Parking', icon: Car },
];

export default function PreferencesScreen({ navigation }: Props) {
  const { setIsLoggedIn, userProfile } = useLoggedIn();
  const [preferences, setPreferences] = useState<PreferenceItem[]>(DEFAULT_PREFERENCES);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('room_preferences');
      if (saved) {
        const savedLabels: string[] = JSON.parse(saved);
        // Reorder preferences based on saved order
        const reordered = savedLabels
          .map((label) => DEFAULT_PREFERENCES.find((p) => p.label === label))
          .filter((p) => p !== undefined) as PreferenceItem[];

        // Add any missing preferences at the end
        const missing = DEFAULT_PREFERENCES.filter((p) => !savedLabels.includes(p.label));
        setPreferences([...reordered, ...missing]);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Save as simple JSON array of labels
      const labels = preferences.map((p) => p.label);
      await AsyncStorage.setItem('room_preferences', JSON.stringify(labels));

      // Mark onboarding as completed for this user
      if (userProfile?.auth_id) {
        await AsyncStorage.setItem(`hasCompletedOnboarding_${userProfile.auth_id}`, 'true');
      }

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as completed for this user even when skipping
    if (userProfile?.auth_id) {
      await AsyncStorage.setItem(`hasCompletedOnboarding_${userProfile.auth_id}`, 'true');
    }
    setIsLoggedIn(true);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PreferenceItem>) => {
    const Icon = item.icon;
    return (
      <ScaleDecorator>
        <Pressable onLongPress={drag}>
          <View
            className={`mb-3 flex-row items-center rounded-lg border border-border bg-card p-4 ${
              isActive ? 'opacity-70' : ''
            }`}>
            <Icon size={24} color="rgb(100, 74, 64)" />
            <Text className="ml-3 flex-1 text-base font-medium text-foreground">{item.label}</Text>
            <Text className="text-sm text-muted-foreground">Hold & Drag</Text>
          </View>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 40 : 20 }}>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <Text className="mb-2 text-center text-3xl font-bold text-primary">
          What Matters Most to You?
        </Text>
        <Text className="mb-6 text-center text-base text-muted-foreground">
          Drag to reorder your top priorities for your ideal room
        </Text>

        {/* Info Box */}
        <InfoBox
          icon={Sparkles}
          title="Refine Your Matches"
          description="Drag to prioritize what matters most to you. The first 3 are your must-haves, while the rest are amenities that you think are nice to have."
          className="mb-6"
        />

        {/* Draggable List */}
        <View className="mb-6 flex-1">
          <DraggableFlatList
            data={preferences}
            onDragEnd={({ data }) => setPreferences(data)}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Action Buttons */}
        <View className="gap-2">
          <Button onPress={handleSave} variant="primary">
            Save Preferences
          </Button>

          <Button onPress={handleSkip} variant="secondary">
            Skip for Now
          </Button>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
