import React, { useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button';
import { useLoggedIn } from '../../store/useLoggedIn';
import { RootStackParamList } from '../../utils/navigation';

type IntroductionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Introduction'>;

type Props = {
  navigation: IntroductionScreenNavigationProp;
};

const IntroductionScreen: React.FC<Props> = ({ navigation }) => {
  // Set default role to 'renter' on introduction
  const { setUserRole } = useLoggedIn();
  useEffect(() => {
    setUserRole('renter');
  }, [setUserRole]);
  return (
    <View className="bg-background flex-1">
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm gap-6">
          <Text className="text-primary text-center text-5xl font-bold">Welcome to RoomSync</Text>
          <Text className="text-foreground mt-2 text-center text-lg">
            Find safe, affordable living spaces in Dumaguete City with AI-powered recommendations.
            Discover your perfect place today.
          </Text>
          <Button variant="primary" onPress={() => navigation.navigate('RoleSelection')}>
            Get Started
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default IntroductionScreen;
