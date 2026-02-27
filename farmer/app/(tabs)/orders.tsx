import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OrdersScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/farmer/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (response.ok) {
                    setOrders(data.data || []);
                } else {
                    console.error('API Error:', data);
                }
            } catch (e) {
                console.error('JSON Parse Error. Response text:', text);
                throw e;
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 px-6">
                <View className="py-6 flex-row items-center justify-between">
                    <Text className="text-white text-3xl font-black">Orders</Text>
                    <View className="bg-[#13EC13]/10 px-3 py-1 rounded-full border border-[#13EC13]/20">
                        <Text className="text-[#13EC13] text-[10px] font-black uppercase tracking-widest">
                            {orders.length} Active
                        </Text>
                    </View>
                </View>

                {orders.length === 0 ? (
                    <View className="flex-1 items-center justify-center mb-20">
                        <View className="w-20 h-20 rounded-full bg-zinc-900 items-center justify-center mb-4">
                            <Ionicons name="cart-outline" size={40} color="#333" />
                        </View>
                        <Text className="text-gray-500 text-base font-bold">No orders found</Text>
                        <Text className="text-zinc-700 text-xs mt-1">New orders will appear here</Text>
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#13EC13" />
                        }
                    >
                        {orders.map((item) => (
                            <OrderCard key={item.id} order={item} />
                        ))}
                        <View className="h-24" />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

function OrderCard({ order }: { order: any }) {
    const date = new Date(order.createdAt).toLocaleDateString();
    const statusColor = order.status === 'DELIVERED' ? '#13EC13' :
        order.status === 'CANCELLED' ? '#ef4444' : '#EAB308';

    return (
        <TouchableOpacity
            className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 mb-4 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push(`/order/${order.id}`)}
        >
            <View className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800">
                {order.product?.pinataImageUrl?.[0] ? (
                    <Image source={{ uri: order.product.pinataImageUrl[0] }} className="w-full h-full" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Ionicons name="cube-outline" size={24} color="#444" />
                    </View>
                )}
            </View>

            <View className="ml-4 flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>{order.product?.name || 'Product'}</Text>
                    <Text className="text-[#13EC13] font-black text-sm">${order.product?.price * order.quantity}</Text>
                </View>

                <View className="flex-row items-center mb-2">
                    <Text className="text-gray-400 text-xs">Qty: {order.quantity}</Text>
                    <View className="w-1 h-1 rounded-full bg-zinc-700 mx-2" />
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">{date}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: statusColor }} />
                        <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusColor }}>
                            {order.status}
                        </Text>
                    </View>
                    <Text className="text-zinc-600 text-[8px] font-bold uppercase">ID: {order.id.slice(0, 8)}</Text>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#333" className="ml-2" />
        </TouchableOpacity>
    );
}
