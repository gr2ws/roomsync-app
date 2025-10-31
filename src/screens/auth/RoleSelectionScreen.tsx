import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useLoggedIn } from '../../store/useLoggedIn';
import { RootStackParamList } from '../../utils/navigation';

type RoleSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

type Props = {
  navigation: RoleSelectionScreenNavigationProp;
};

const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { setUserRole } = useLoggedIn();
  const insets = useSafeAreaInsets();

  const handleSelectRole = (role: 'renter' | 'owner') => {
    console.log('[RoleSelectionScreen] handleSelectRole called with role:', role);
    setUserRole(role);
    console.log('[RoleSelectionScreen] Navigating to Register screen');
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    console.log('[RoleSelectionScreen] handleLogin called');
    // Do not change role here, let AuthScreen handle it
    console.log('[RoleSelectionScreen] Navigating to Auth screen');
    navigation.navigate('Auth');
  };

  const handleGoBack = () => {
    console.log('[RoleSelectionScreen] handleGoBack called');
    // Go back to Introduction screen
    if (navigation.canGoBack()) {
      console.log('[RoleSelectionScreen] Going back');
      navigation.goBack();
    } else {
      console.log('[RoleSelectionScreen] Navigating to Introduction screen');
      navigation.navigate('Introduction');
    }
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'ios' ? 40 : insets.top + 8 }}>
      <View className="flex-1 bg-background">
        <View className="left-6 top-0 z-10">
          <BackButton onPress={handleGoBack} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm">
            <Image
              source={require('../../assets/What brings you here.png')}
              style={{
                width: 300,
                height: 300,
                alignSelf: 'center',
                marginBottom: 0,
                marginTop: -50,
              }}
              contentFit="contain"
              transition={200}
            />
            <Text className="mb-4 text-center text-4xl font-bold text-primary">
              What brings you here?
            </Text>
            <Text className="mb-10 text-center text-base text-muted-foreground">
              Tell us how we can help you.
            </Text>

            <View className="mb-8">
              <Button variant="primary" onPress={() => handleSelectRole('renter')}>
                I&apos;m looking for somewhere to stay
              </Button>
              <Text className="text-italic mt-3 text-center italic text-muted-foreground">
                For students or professionals looking for a place to stay near their school or
                workplace.
              </Text>
            </View>

            <View className="mb-6">
              <Button variant="primary" onPress={() => handleSelectRole('owner')}>
                I have property for rent
              </Button>
              <Text className="mt-3 text-center italic text-muted-foreground">
                For property owners or property managers who want to list and manage rentals.
              </Text>
            </View>

            <View className="mt-8 items-center">
              <View className="flex-row justify-center align-middle">
                <Text className="text-muted-foreground">Already have an account? </Text>
                <Button
                  onPress={handleLogin}
                  variant="text"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#000', // or any color
                  }}>
                  Log in
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RoleSelectionScreen;
