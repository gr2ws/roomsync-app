import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLoggedIn } from '../store/useLoggedIn';

export default function AuthScreen() {
  const { setIsLoggedIn, setAuthView } = useLoggedIn();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSignUp = () => {
    setAuthView('register');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Text className="mb-4 text-4xl font-bold text-gray-900">Welcome to RoomSync</Text>
      <Text className="mb-8 text-center text-lg text-gray-600">
        Please log in to access your room management features
      </Text>

      <View className="w-full max-w-sm space-y-4">
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

        <TouchableOpacity
          onPress={handleLogin}
          className="rounded-lg bg-blue-500 px-6 py-3 shadow-lg"
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-white">Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Google Login', 'Google login functionality not yet implemented')}
          className="rounded-lg border border-gray-300 bg-white px-6 py-3"
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-gray-700">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="mt-6 items-center">
          <View className="flex-row">
            <Text className="text-gray-600">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text className="font-semibold text-blue-500">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
