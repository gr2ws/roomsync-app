import React, { useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button';
import { useLoggedIn } from '../../store/useLoggedIn';
import { RootStackParamList } from '../../types/navigation';

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
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <View className="w-full max-w-sm gap-4">
        <Text style={{ fontSize: 32, textAlign: 'center', color: 'black' }}>
          Welcome to RoomSync
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 10, color: 'black' }}>
          Find your perfect rental with ease.
        </Text>
        <Button variant="primary" onPress={() => navigation.navigate('RoleSelection')}>
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default IntroductionScreen;
