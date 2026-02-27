import { View, Text } from 'react-native';

export default function ScanScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-white text-2xl font-bold">Scan QR Code</Text>
            <Text className="text-gray-400 mt-2">QR scanner for supply chain tracking.</Text>
        </View>
    );
}
