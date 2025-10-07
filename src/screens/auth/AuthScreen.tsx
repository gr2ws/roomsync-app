import { View, Text, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../utils/navigation';
import { supabase } from '../../utils/supabase';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

export default function AuthScreen({ navigation }: Props) {
  const { setIsLoggedIn, setUserRole, setUserProfile } = useLoggedIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error || !data.user) {
      Alert.alert('Login Error', error?.message || 'Could not log in.');
      return;
    }
    // Fetch full user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();
    if (userError || !userData) {
      Alert.alert('Login Error', 'Could not fetch user profile.');
      return;
    }
    setUserRole(userData.user_type);
    setUserProfile(userData);
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
          className="text-md overflow-visible rounded-lg border border-gray-300 bg-white px-4 py-3"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />

        <TextInput
          placeholder="Password"
          className="text-md overflow-visible rounded-lg border border-gray-300 bg-white px-4 py-3"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
        />

        <Button onPress={handleLogin} variant="primary" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
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
