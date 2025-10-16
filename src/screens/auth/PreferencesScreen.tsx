import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import InfoBox from '../../components/InfoBox';
import BackButton from '../../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
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
  const { setIsLoggedIn } = useLoggedIn();
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
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setIsLoggedIn(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Store as simple array of labels
      const labels = preferences.map((p) => p.label);
      await AsyncStorage.setItem('room_preferences', JSON.stringify(labels));

      if (isFromProfile) {
        // Just go back to profile
        navigation.goBack();
      } else {
        // Complete onboarding
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
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
    <View className="flex-1 bg-background" style={{ paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
      {isFromProfile && (
        <BackButton onPress={() => navigation.goBack()} />
      )}
      <View className="px-6 pt-12">
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-foreground">What Matters Most to You?</Text>
          <Text className="text-base text-muted-foreground">
            Drag items to prioritize your room preferences. This helps us find your perfect match!
          </Text>
        </View>

        {/* Info Box */}
        <InfoBox
          icon={Sparkles}
          title="How to Prioritize"
          description="Hold and drag each item to reorder. Your top 3 choices become must-haves, while the rest help us fine-tune your recommendations."
          className="mb-6"
        />
      </View>

      {/* Draggable List */}
      <DraggableFlatList
        data={preferences}
        onDragEnd={({ data }) => setPreferences(data)}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        containerStyle={{ flex: 1, paddingHorizontal: 24 }}
        activationDistance={10}
      />

      {/* Buttons */}
      <View className="mb-8 gap-3 px-6">
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
