import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    return (
        <View className="flex-1 items-center justify-center bg-black p-5">
            <Text className="text-2xl font-bold mb-2 text-white">Farmer Order Details</Text>
            <Text className="text-gray-400">Order ID: {id}</Text>
        </View>
    );
}
