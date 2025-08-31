import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../store/useLoggedIn';

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

      <View className="w-full max-w-sm space-y-4">
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

        <TouchableOpacity
          onPress={handleSignUp}
          className="rounded-lg bg-blue-500 px-6 py-3 shadow-lg"
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-white">Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleSignUp}
          className="rounded-lg border border-gray-300 bg-white px-6 py-3"
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-gray-700">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text className="font-semibold text-blue-500">Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 items-center">
          <View className="flex-row flex-wrap justify-center">
            <Text className="text-center text-sm text-gray-600">
              By creating an account, you agree with our{' '}
            </Text>
            <TouchableOpacity onPress={handleTermsOfService} activeOpacity={0.7}>
              <Text className="text-sm text-blue-500">Terms of Service</Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-600"> and </Text>
            <TouchableOpacity onPress={handlePrivacyPolicy} activeOpacity={0.7}>
              <Text className="text-sm text-blue-500">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
