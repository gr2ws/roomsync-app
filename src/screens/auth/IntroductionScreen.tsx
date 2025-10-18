import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useLoggedIn } from '../../store/useLoggedIn';
import { RootStackParamList } from '../../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IntroductionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Introduction'>;
type IntroductionScreenRouteProp = RouteProp<RootStackParamList, 'Introduction'>;

type Props = {
  navigation: IntroductionScreenNavigationProp;
  route: IntroductionScreenRouteProp;
};

const IntroductionScreen: React.FC<Props> = ({ navigation, route }) => {
  // Set default role to 'renter' on introduction
  const { setUserRole } = useLoggedIn();
  const fromAuth = route.params?.fromAuth || false;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setUserRole('renter');
    // Mark that intro has been seen when component mounts
    const markIntroSeen = async () => {
      try {
        await AsyncStorage.setItem('hasSeenIntroduction', 'true');
      } catch (error) {
        console.error('Error setting introduction flag:', error);
      }
    };
    markIntroSeen();
  }, [setUserRole]);

  const handleBackToAuth = async () => {
    // Set device flag to true when going back to Auth
    try {
      await AsyncStorage.setItem('DeviceOnboarded', 'true');
    } catch (error) {
      console.error('Error setting introduction flag:', error);
    }
    navigation.replace('Auth');
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 45 : insets.top + 8 }}>
      <View className="flex-1 items-center justify-center px-6">
        {fromAuth && <BackButton className="z-10 mt-8" onPress={handleBackToAuth} />}
        <View className="h-full w-full max-w-sm justify-center gap-6">
          <Text className="text-center text-5xl font-bold text-primary">Welcome to RoomSync</Text>
          <Text className="mt-2 text-center text-lg text-foreground">
            Find safe, affordable living spaces in Dumaguete City with AI-powered recommendations.
            Discover your perfect place today.
          </Text>
          <Button variant="primary" onPress={() => navigation.navigate('RoleSelection')}>
            Get Started
          </Button>
        </View>
      </View>
    </View>
  );
};

export default IntroductionScreen;
