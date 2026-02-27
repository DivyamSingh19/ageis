import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        if (!token || !id) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/delivery/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOrder(data.data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Network error while fetching order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 bg-black items-center justify-center p-6">
                <Text className="text-white text-lg">Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-zinc-900 px-6 py-2 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const date = new Date(order.createdAt).toLocaleDateString();
    const statusColor = order.status === 'DELIVERED' ? '#13EC13' :
        order.status === 'CANCELLED' ? '#ef4444' : '#EAB308';

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-zinc-900 rounded-xl mr-4">
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Order Details</Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Product Section */}
                <View className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 mb-6">
                    <View className="flex-row items-center mb-4">
                        <View className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800">
                            {order.product?.pinataImageUrl?.[0] ? (
                                <Image source={{ uri: order.product.pinataImageUrl[0] }} className="w-full h-full" />
                            ) : (
                                <View className="w-full h-full items-center justify-center">
                                    <Ionicons name="cube-outline" size={32} color="#444" />
                                </View>
                            )}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white text-xl font-bold">{order.product?.name || 'Product'}</Text>
                            <Text className="text-gray-400 text-sm">{order.product?.category}</Text>
                            <Text className="text-[#13EC13] text-lg font-black mt-1">${order.product?.price * order.quantity}</Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-zinc-800/50 my-4" />

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Quantity</Text>
                        <Text className="text-white font-bold">{order.quantity} units</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500">Order Date</Text>
                        <Text className="text-white font-bold">{date}</Text>
                    </View>
                </View>

                {/* Status Section */}
                <View className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 mb-6">
                    <Text className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest">Current Status</Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: statusColor }} />
                            <Text className="text-lg font-black uppercase tracking-widest" style={{ color: statusColor }}>
                                {order.status}
                            </Text>
                        </View>
                        <Text className="text-zinc-600 text-xs font-bold">ID: {order.id.slice(0, 12)}</Text>
                    </View>
                </View>

                {/* NFC Section */}
                <View className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 mb-10">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">NFC Tracking</Text>
                        {order.nfc ? (
                            <View className="bg-[#13EC13]/10 px-2 py-0.5 rounded-full">
                                <Text className="text-[#13EC13] text-[8px] font-black uppercase">Linked</Text>
                            </View>
                        ) : (
                            <View className="bg-red-500/10 px-2 py-0.5 rounded-full">
                                <Text className="text-red-500 text-[8px] font-black uppercase">Not Linked</Text>
                            </View>
                        )}
                    </View>

                    {order.nfc ? (
                        <View className="flex-row items-center">
                            <Ionicons name="radio-outline" size={24} color="#13EC13" />
                            <Text className="text-white font-mono ml-3 text-sm">TAG ID: {order.nfc.nfcId}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/verify-nfc', params: { orderId: order.id } } as any)}
                            className="bg-[#13EC13] py-4 rounded-2xl flex-row items-center justify-center"
                        >
                            <Ionicons name="add-circle" size={24} color="black" />
                            <Text className="text-black font-bold ml-2">Associate NFC Tag</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
