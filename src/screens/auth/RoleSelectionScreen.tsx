import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
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

  const handleSelectRole = (role: 'renter' | 'owner') => {
    setUserRole(role);
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    // Do not change role here, let AuthScreen handle it
    navigation.navigate('Auth');
  };

  const handleGoBack = () => {
    // Go back to Introduction screen
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Introduction');
    }
  };

  return (
    <View className="bg-background flex-1">
      <SafeAreaView className="bg-background flex-1">
        <View className="absolute left-0 top-0 z-10">
          <BackButton onPress={handleGoBack} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm">
            <Text className="text-primary mb-4 text-center text-4xl font-bold">
              What brings you here?
            </Text>
            <Text className="text-muted-foreground mb-10 text-center text-base">
              Tell us how we can help you...
            </Text>

            <View className="mb-6">
              <Button variant="primary" onPress={() => handleSelectRole('renter')}>
                I&apos;m looking for somewhere to stay
              </Button>
              <Text className="text-muted-foreground mt-3 text-center text-sm">
                For individuals searching for a place to rent, such as students or professionals.
              </Text>
            </View>

            <View className="mb-6">
              <Button variant="primary" onPress={() => handleSelectRole('owner')}>
                I have property for rent
              </Button>
              <Text className="text-muted-foreground mt-3 text-center text-sm">
                For property owners or managers who want to list and manage rentals.
              </Text>
            </View>

            <View className="mt-8 items-center">
              <View className="flex-row">
                <Text className="text-muted-foreground">Already have an account? </Text>
                <Button onPress={handleLogin} variant="text">
                  Log in
                </Button>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RoleSelectionScreen;
