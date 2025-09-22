import { View, Text, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

export default function AuthScreen({ navigation }: Props) {
  const { setIsLoggedIn, setUserRole } = useLoggedIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'admin@gmail.com' && password === 'admin123') {
      setUserRole('admin');
    }
    setIsLoggedIn(true);
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="mb-4 text-4xl font-bold text-gray-900">Welcome to RoomSync</Text>
      <Text className="mb-8 text-center text-lg text-gray-600">
        Please log in to access your room management features
      </Text>

      <View className="flex w-full max-w-sm justify-center gap-4 space-y-4">
        <TextInput
          placeholder="Email"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
        />

        <Button onPress={handleLogin} variant="primary">
          Log In
        </Button>

        <Button
          onPress={() =>
            Alert.alert('Google Login', 'Google login functionality not yet implemented')
          }
          variant="secondary">
          Continue with Google
        </Button>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Don&apos;t have an account? </Text>
            <Button onPress={handleSignUp} variant="text">
              Sign up
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
