import { View, Text } from 'react-native';

export default function NewProductScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-black p-5">
            <Text className="text-2xl font-bold mb-2 text-white">New Product</Text>
            <Text className="text-gray-400">Placeholder for the new product form.</Text>
        </View>
    );
}
