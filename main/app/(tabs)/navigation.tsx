import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NavigationHub() {
    const router = useRouter();

    const links = [
        { name: 'Login', href: '/(auth)/login' },
        { name: 'Register', href: '/(auth)/register' },
        { name: 'Marketplace (Home)', href: '/(tabs)' },
        { name: 'All Orders', href: '/(tabs)/all-orders' },
        { name: 'Profile', href: '/(tabs)/profile' },
        { name: 'Onboarding', href: '/onboarding' },
        { name: 'Verify NFC', href: '/verify-nfc' },
        { name: 'Transaction', href: '/transaction' },
        { name: 'Wallet', href: '/wallet' },
        { name: 'Create Wallet', href: '/create-wallet' },
        { name: 'Product 123', href: '/product/123' },
        { name: 'Order 456', href: '/order/456' },
        { name: 'Track Order', href: '/order/track' },
        { name: 'Modal', href: '/modal' },
    ];

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            <View className="mb-6">
                <Text className="text-3xl font-bold text-gray-900">Navigation Hub</Text>
                <Text className="text-gray-500 mt-1">Quick access to all structural pages</Text>
            </View>

            <View className="space-y-3">
                {links.map((link) => (
                    <TouchableOpacity
                        key={link.href}
                        onPress={() => router.push(link.href as any)}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:bg-gray-100"
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-semibold text-gray-800">{link.name}</Text>
                            <Text className="text-blue-500 font-medium">{link.href}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="h-10" />
        </ScrollView>
    );
}
