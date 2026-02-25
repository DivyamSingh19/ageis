import { View, Text } from 'react-native';

export default function AllProductsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-black p-5">
            <Text className="text-2xl font-bold mb-2 text-white">Farmer All Products</Text>
            <Text className="text-gray-400">List of all farmer products/orders.</Text>
        </View>
    );
}
