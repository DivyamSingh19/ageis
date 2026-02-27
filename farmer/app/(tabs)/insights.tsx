import { View, Text } from 'react-native';

export default function InsightsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-white text-2xl font-bold">Insights</Text>
            <Text className="text-gray-400 mt-2">Market data and analytics.</Text>
        </View>
    );
}
