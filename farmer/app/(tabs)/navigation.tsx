import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FarmerNavigationHub() {
    const router = useRouter();

    const links = [
        { name: 'Login', href: '/(auth)/login' },
        { name: 'Register', href: '/(auth)/register' },
        
        { name: 'Profile', href: '/(tabs)/profile' },
        { name: 'New Product', href: '/(tabs)/new-product' },
        { name: 'Onboarding', href: '/onboarding' },
        { name: 'Verify NFC', href: '/verify-nfc' },
        { name: 'Transaction', href: '/transaction' },
        { name: 'Wallet', href: '/wallet' },
        { name: 'Create Wallet', href: '/create-wallet' },
        { name: 'Product 123', href: '/product/123' },
        { name: 'All Products', href: '/order/all-products' },
        { name: 'Order 456', href: '/order/456' },
        { name: 'Track Order', href: '/order/track' },
    ];

    return (
        <ScrollView className="flex-1 bg-black p-4">
            <View className="mb-6">
                <Text className="text-3xl font-bold text-white">Farmer Hub</Text>
                <Text className="text-gray-400 mt-1"> структурный доступ к страницам фермера</Text>
            </View>

            <View className="space-y-3">
                {links.map((link) => (
                    <TouchableOpacity
                        key={link.href}
                        onPress={() => router.push(link.href as any)}
                        className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 shadow-sm active:bg-[#2a2a2a]"
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-semibold text-white">{link.name}</Text>
                            <Text className="text-green-500 font-medium">{link.href}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="h-10" />
        </ScrollView>
    );
}
