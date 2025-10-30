import React from 'react';
import { View, Text, ScrollView, Platform, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

type Props = {
  navigation: WelcomeScreenNavigationProp;
};

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { userRole, userProfile, setIsLoggedIn } = useLoggedIn();

  const getRoleFeatures = () => {
    switch (userRole) {
      case 'renter':
        return [
          'Browse property listings in Dumaguete and nearby areas',
          'Apply for rentals and track your applications',
          'Ask for rental recommendations from our AI chatbot',
          'Get in contact with property owners',
          'Leave reviews and ratings for properties',
        ];
      case 'owner':
        return [
          'Add and manage property listings',
          'Receive and review rental applications',
          'View reviews and ratings from renters',
          'Communicate with potential renters',
          'Track your property performance',
        ];
      case 'admin':
        return [
          'Approve and verify property listings',
          'Verify and manage property owner accounts',
          'Manage user accounts and handle reports',
          'View platform analytics and trends',
          'Moderate content and ensure platform quality',
        ];
      default:
        return [];
    }
  };

  const handleContinue = async () => {
    if (userRole === 'admin') {
      // Admins skip Details screen and go directly to Home
      // Set user-specific onboarding flag
      if (userProfile?.user_id) {
        await AsyncStorage.setItem(`user_${userProfile.user_id}_hasCompletedOnboarding`, 'true');
      }
      setIsLoggedIn(true);
    } else {
      // Renters and owners go to Details screen
      navigation.navigate('Details');
    }
  };

  const insets = useSafeAreaInsets();

  const features = getRoleFeatures();
  const firstName = userProfile?.first_name || 'there';

  const getRoleImage = () => {
    switch (userRole) {
      case 'renter':
        return require('../../assets/Renter.png');
      case 'owner':
        return require('../../assets/Owner.png');
      case 'admin':
        return require('../../assets/Admin.png');
      default:
        return require('../../assets/Renter.png');
    }
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 0 : insets.top + 8 }}>
      <ScrollView
        className="flex-grow-1"
        style={{ paddingTop: Platform.OS === 'ios' ? 40 : 0 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-8 py-8">
          {/* Role-based Graphic */}
          <View className="mb-6 items-center">
            <Image
              source={getRoleImage()}
              style={{
                width: 300,
                height: 300,
                alignSelf: 'center',
                marginTop: 30,
                marginBottom: 30,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Header Section */}
          <View className="mb-6">
            <Text className="mb-1 text-center text-3xl font-bold text-primary">
              Welcome to RoomSync!
            </Text>
            <Text className="text-center text-lg font-medium text-card-foreground">
              Hi, {firstName}!
            </Text>
          </View>

          {/* Features Section */}
          <View className="mb-6">
            <Text className="mb-4 text-center text-base font-semibold text-card-foreground">
              Here&apos;s what you can do:
            </Text>

            <View className="gap-3">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-start">
                  <View className="mr-3 mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <Text className="flex-1 text-base leading-6 text-foreground">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Button Section */}
          <View className="mt-auto">
            <Button onPress={handleContinue} variant="primary">
              Continue
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WelcomeScreen;
