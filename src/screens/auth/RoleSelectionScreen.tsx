import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button';
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

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <View className="w-full max-w-sm gap-4">
        <Text style={{ fontSize: 24, textAlign: 'center', color: 'black' }}>Are you a...</Text>
        <Button variant="primary" onPress={() => handleSelectRole('renter')}>
          Renter
        </Button>
        <Button variant="primary" onPress={() => handleSelectRole('owner')}>
          Owner
        </Button>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Already have an account? </Text>
            <Button onPress={handleLogin} variant="text">
              Log in
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;
