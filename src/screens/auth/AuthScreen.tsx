import { View, Text, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../../store/useLoggedIn';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
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
    // Go back to previous screen (likely Role Selection)
    navigation.goBack();
  };

  return (
    <View className="bg-background flex-1">
      <View className="absolute left-0 top-0 z-10">
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm">
          <Text className="text-primary mb-4 text-center text-4xl font-bold">Welcome back!</Text>
          <Text className="text-muted-foreground mb-8 text-center text-base">
            Sign in to continue your journey
          </Text>

          <View className="flex w-full justify-center gap-4">
            <View className="mb-4">
              <TextInput
                placeholder="Email"
                className="text-md overflow-visible rounded-lg border border-input bg-card px-4 py-3 text-card-foreground"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
              />
            </View>

            <View className="mb-4">
              <TextInput
                placeholder="Password"
                className="text-md overflow-visible rounded-lg border border-input bg-card px-4 py-3 text-card-foreground"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={setPassword}
                value={password}
              />
            </View>

            <Button onPress={handleLogin} variant="primary" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </Button>

            <View className="mt-6 items-center">
              <View className="flex-row">
                <Text className="text-muted-foreground text-sm">Don&apos;t have an account? </Text>
                <Button onPress={handleSignUp} variant="text">
                  Sign up
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
