import { View, Text } from 'react-native';

export default function HistoryScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-white text-2xl font-bold">History</Text>
            <Text className="text-gray-400 mt-2">Your harvest history will appear here.</Text>
        </View>
    );
}
