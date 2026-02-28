import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCENT_YELLOW = '#FFC000';

export default function AllOrdersScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/user/order`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color={ACCENT_YELLOW} />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <View className="flex-1 px-6">
                <View className="py-6 flex-row items-center justify-between">
                    <Text className="text-white text-3xl font-black">My Orders</Text>
                    <View className="bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                        <Text className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                            {orders.length} Total
                        </Text>
                    </View>
                </View>

                {orders.length === 0 ? (
                    <View className="flex-1 items-center justify-center -mt-20">
                        <View className="w-20 h-20 rounded-full bg-zinc-900 items-center justify-center mb-6">
                            <Ionicons name="receipt-outline" size={32} color={ACCENT_YELLOW} />
                        </View>
                        <Text className="text-white text-xl font-bold mb-2">No orders yet</Text>
                        <Text className="text-zinc-500 text-center px-10">Your purchase history will appear here once you place an order.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="mt-8 px-8 py-3 bg-yellow-400 rounded-full"
                        >
                            <Text className="text-black font-black uppercase tracking-widest text-xs">Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT_YELLOW} />
                        }
                    >
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} onPress={() => router.push(`/order/track?id=${order.id}`)} />
                        ))}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

function OrderCard({ order, onPress }: { order: any, onPress: () => void }) {
    const product = order.product;
    const statusColor = order.status === 'COMPLETED' ? '#13EC13' : order.status === 'CANCELED' ? '#ef4444' : '#FFC000';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 mb-4"
        >
            <View className="flex-row">
                <View className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800">
                    {product.pinataImageUrl?.[0] ? (
                        <Image source={{ uri: product.pinataImageUrl[0] }} className="w-full h-full" />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Text style={{ fontSize: 30 }}>🌾</Text>
                        </View>
                    )}
                </View>
                <View className="flex-1 ml-4 justify-between py-1">
                    <View>
                        <View className="flex-row justify-between items-start">
                            <Text className="text-white font-bold text-lg flex-1 mr-2" numberOfLines={1}>{product.name}</Text>
                            <Text className="text-white font-black">Rs {product.price}</Text>
                        </View>
                        <Text className="text-zinc-500 text-xs mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString()}</Text>
                    </View>

                    <View className="flex-row justify-between items-center mt-2">
                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: `${statusColor}20` }} className="px-2 py-1 rounded-md">
                                <Text style={{ color: statusColor }} className="text-[10px] font-black uppercase tracking-tighter">
                                    {order.status}
                                </Text>
                            </View>
                            {order.nft && (
                                <View className="ml-2 bg-yellow-400/10 p-1 rounded-md border border-yellow-400/20">
                                    <Ionicons name="shield-checkmark" size={10} color={ACCENT_YELLOW} />
                                </View>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#333" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
