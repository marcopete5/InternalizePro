import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <View className="mb-8">
        <Text className="text-center text-3xl font-bold text-gray-900">
          InternalizePro
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          Mobile app coming soon
        </Text>
      </View>

      <View className="w-full max-w-sm space-y-4">
        <Pressable className="rounded-lg bg-primary-600 px-6 py-3">
          <Text className="text-center font-medium text-white">
            Sign In
          </Text>
        </Pressable>

        <Pressable className="rounded-lg border border-gray-300 bg-white px-6 py-3">
          <Text className="text-center font-medium text-gray-900">
            Create Account
          </Text>
        </Pressable>
      </View>

      <Text className="mt-12 text-sm text-gray-500">
        The mobile experience is under development.
      </Text>
      <Text className="text-sm text-gray-500">
        Use the web app for full functionality.
      </Text>
    </View>
  );
}
