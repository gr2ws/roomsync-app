import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Platform } from 'react-native';
import { Image } from 'expo-image';
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
  }, [setUserRole]);

  const handleBackToAuth = async () => {
    // Set device flag to true when going back to Auth
    try {
      await AsyncStorage.setItem('DeviceOnboarded', 'true');
    } catch (error) {
      console.error('Error setting onboarding flag:', error);
    }
    navigation.replace('Auth');
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 45 : insets.top + 8 }}>
      <View className="flex-1 items-center justify-center px-6">
        {fromAuth && <BackButton className="z-10 mt-8" onPress={handleBackToAuth} />}
        <View className="h-full w-full max-w-sm items-center justify-center gap-6">
          <Image
            source={require('../../assets/Log In.png')}
            style={{
              width: 350,
              height: 350,
              alignSelf: 'center',
              marginBottom: -30,
              marginTop: -100,
            }}
            contentFit="contain"
            transition={200}
          />
          <Text className="mt-2 px-6 text-center text-lg leading-relaxed text-foreground">
            Find safe, affordable living spaces in Dumaguete City and surrounding areas with
            AI-powered recommendations. Discover your perfect place today.
          </Text>
          <Button
            variant="primary"
            onPress={() => navigation.navigate('RoleSelection')}
            className="w-100 mt-10">
            Get Started
          </Button>
        </View>
      </View>
    </View>
  );
};

export default IntroductionScreen;
