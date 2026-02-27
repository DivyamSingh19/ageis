import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center bg-black p-6">
            <View className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-2xl items-center justify-center mb-6">
                <Text className="text-green-500 text-2xl font-bold">1</Text>
            </View>
            <Text className="text-3xl font-bold mb-4 text-white text-center">Farmer Onboarding</Text>
            <Text className="text-gray-400 text-center mb-12 text-lg">
                Welcome to Ageis! Let's get your farmer profile set up. First, we'll need to create your digital wallet.
            </Text>

            <TouchableOpacity
                onPress={() => router.push('/onboarding/profile' as any)}
                className="bg-green-500 w-full py-4 rounded-xl items-center"
            >
                <Text className="text-black font-bold text-lg">Continue to Wallet Creation</Text>
            </TouchableOpacity>
        </View>
    );
}
