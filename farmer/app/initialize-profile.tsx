import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center bg-black p-6">
            <View style={{ backgroundColor: '#13EC1320', borderColor: '#13EC13' }} className="w-16 h-16 border rounded-2xl items-center justify-center mb-6">
                <Text style={{ color: '#13EC13' }} className="text-2xl font-bold">1</Text>
            </View>
            <Text className="text-3xl font-bold mb-4 text-white text-center">Farmer Onboarding</Text>
            <Text className="text-gray-400 text-center mb-12 text-lg">
                Welcome to Ageis! Let's get your farmer profile set up. First, we'll need to create your digital wallet.
            </Text>

            <TouchableOpacity
                onPress={() => router.push('/onboarding/profile' as any)}
                style={{ backgroundColor: '#13EC13' }}
                className="w-full py-4 rounded-xl items-center"
            >
                <Text className="text-black font-bold text-lg">Continue to Wallet Creation</Text>
            </TouchableOpacity>
        </View>
    );
}
