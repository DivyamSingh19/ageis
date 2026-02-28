import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCENT_YELLOW = '#FFC000';

export default function OrderTrackingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        if (!token || !id) return;
        try {
            const response = await fetch(`${API_URL}/api/user/order`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const found = data.data.find((o: any) => o.id === id);
                setOrder(found);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color={ACCENT_YELLOW} />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Order not found</Text>
            </View>
        );
    }

    const steps = [
        { title: 'Ordered', icon: 'receipt', completed: true },
        { title: 'Processed', icon: 'flask', completed: order.status === 'COMPLETED' || order.status === 'DELIVERED' },
        { title: 'Shipped', icon: 'airplane', completed: order.status === 'COMPLETED' || order.status === 'DELIVERED' },
        { title: 'Delivered', icon: 'home', completed: order.status === 'COMPLETED' || order.status === 'DELIVERED' }
    ];

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-6 py-6 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center mr-4">
                    <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-black">Track Order</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Product Summary */}
                <View className="mx-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex-row items-center mb-8">
                    <View className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800">
                        {order.product.pinataImageUrl?.[0] ? (
                            <Image source={{ uri: order.product.pinataImageUrl[0] }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <Text style={{ fontSize: 24 }}>🌾</Text>
                            </View>
                        )}
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-white font-bold text-lg" numberOfLines={1}>{order.product.name}</Text>
                        <Text className="text-zinc-500 text-xs">Order ID: #{order.id.slice(0, 8).toUpperCase()}</Text>
                    </View>
                </View>

                {/* Progress Steps */}
                <View className="mx-6 mb-10">
                    {steps.map((step, index) => (
                        <View key={index} className="flex-row items-start">
                            <View className="items-center mr-6">
                                <View style={{ backgroundColor: step.completed ? ACCENT_YELLOW : '#18181b', borderColor: step.completed ? ACCENT_YELLOW : '#3f3f46' }} className="w-10 h-10 rounded-full border-2 items-center justify-center z-10">
                                    <Ionicons name={step.icon as any} size={20} color={step.completed ? 'black' : '#52525b'} />
                                </View>
                                {index !== steps.length - 1 && (
                                    <View style={{ backgroundColor: step.completed ? ACCENT_YELLOW : '#27272a' }} className="w-0.5 h-16 -my-1" />
                                )}
                            </View>
                            <View className="pt-2">
                                <Text className={`font-black uppercase tracking-widest text-[10px] ${step.completed ? 'text-yellow-400' : 'text-zinc-600'}`}>
                                    {step.title}
                                </Text>
                                <Text className="text-zinc-500 text-xs mt-1">
                                    {step.completed ? 'Action completed successfully' : 'Pending verification'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Digital Twin / NFT Info */}
                {order.nft && (
                    <View className="mx-6 p-6 bg-yellow-400/5 border border-yellow-400/20 rounded-3xl">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="shield-checkmark" size={24} color={ACCENT_YELLOW} />
                            <Text className="text-yellow-400 font-black uppercase tracking-widest text-xs ml-3">Blockchain Verified Receipt</Text>
                        </View>
                        <Text className="text-zinc-400 text-sm leading-5 mb-4">
                            This order is recorded on the Solana blockchain. You hold a unique NFT verifyid identifying this batch's authenticity and origin.
                        </Text>
                        <TouchableOpacity className="bg-yellow-400 py-3 rounded-2xl items-center">
                            <Text className="text-black font-black uppercase tracking-widest text-[10px]">View on Solana Explorer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* NFC Info Placeholder */}
                {!order.nft && (
                    <View className="mx-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="hardware-chip" size={24} color={ACCENT_YELLOW} />
                            <Text className="text-white font-black uppercase tracking-widest text-xs ml-3">NFC Security Pending</Text>
                        </View>
                        <Text className="text-zinc-500 text-sm leading-5">
                            Once your batch is physically labeled with an Aegis NFC tag, you can scan it to verify the physical-to-digital bond.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
