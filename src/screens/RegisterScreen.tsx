import { View, Text, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../store/useLoggedIn';
import Button from '../components/Button';

export default function RegisterScreen() {
  const { setAuthView } = useLoggedIn();
  const handleSignUp = () => {
    Alert.alert('Registration functionality coming soon');
  };

  const handleLogin = () => {
    setAuthView('login');
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google Registration', 'Google registration functionality not yet implemented');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service not yet available');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy not yet available');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="mb-4 text-4xl font-bold text-gray-900">Create Account</Text>
      <Text className="mb-8 text-center text-lg text-gray-600">Join RoomSync today</Text>

      <View className="flex w-full max-w-sm gap-4 space-y-4">
        <TextInput
          placeholder="Full Name"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          autoCapitalize="words"
        />

        <TextInput
          placeholder="Email"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Confirm Password"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg"
          secureTextEntry
          autoCapitalize="none"
        />

        <Button onPress={handleSignUp} variant="primary">
          Sign Up
        </Button>

        <Button onPress={handleGoogleSignUp} variant="secondary">
          Continue with Google
        </Button>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Already have an account? </Text>
            <Button onPress={handleLogin} variant="text">
              Log in
            </Button>
          </View>
        </View>

        <View className="mt-4 items-center">
          <View className="flex-row flex-wrap justify-center">
            <Text className="text-center text-sm text-gray-600">
              By creating an account, you agree with our{' '}
            </Text>
            <Button onPress={handleTermsOfService} variant="text" size="sm">
              Terms of Service
            </Button>
            <Text className="text-sm text-gray-600"> and </Text>
            <Button onPress={handlePrivacyPolicy} variant="text" size="sm">
              Privacy Policy
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
