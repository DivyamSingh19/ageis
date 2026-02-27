import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HistoryScreen() {
    const { token } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProducts = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/farmer/products?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
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
                    <Text className="text-white text-3xl font-black">History</Text>
                    <View className="bg-[#13EC13]/10 px-3 py-1 rounded-full border border-[#13EC13]/20">
                        <Text className="text-[#13EC13] text-[10px] font-black uppercase tracking-widest">
                            {products.length} Batches
                        </Text>
                    </View>
                </View>

                {products.length === 0 ? (
                    <View className="flex-1 items-center justify-center mb-20">
                        <View className="w-20 h-20 rounded-full bg-zinc-900 items-center justify-center mb-4">
                            <Ionicons name="leaf-outline" size={40} color="#333" />
                        </View>
                        <Text className="text-gray-500 text-base font-bold">No harvest history yet</Text>
                        <Text className="text-zinc-700 text-xs mt-1">Products you add will appear here</Text>
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#13EC13" />
                        }
                    >
                        {products.map((item, index) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                        <View className="h-24" />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

function ProductCard({ product }: { product: any }) {
    const date = new Date(product.createdAt).toLocaleDateString();

    return (
        <TouchableOpacity
            className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 mb-4 flex-row items-center"
            activeOpacity={0.7}
        >
            <View className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800">
                {product.pinataImageUrl?.[0] ? (
                    <Image source={{ uri: product.pinataImageUrl[0] }} className="w-full h-full" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Ionicons name="image-outline" size={24} color="#444" />
                    </View>
                )}
            </View>

            <View className="ml-4 flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{product.name}</Text>
                    {product.verified && (
                        <Ionicons name="checkmark-circle" size={16} color="#13EC13" />
                    )}
                </View>

                <View className="flex-row items-center mb-2">
                    <Text className="text-[#13EC13] font-black text-sm">${product.price}</Text>
                    <View className="w-1 h-1 rounded-full bg-zinc-700 mx-2" />
                    <Text className="text-gray-500 text-xs">{product.category || 'General'}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <Text className="text-zinc-600 text-[10px] font-bold uppercase">{date}</Text>
                    <View className={`px-2 py-0.5 rounded-md ${product.verified ? 'bg-[#13EC13]/10' : 'bg-orange-500/10'}`}>
                        <Text className={`text-[8px] font-black uppercase ${product.verified ? 'text-[#13EC13]' : 'text-orange-500'}`}>
                            {product.verified ? 'Verified' : 'Pending'}
                        </Text>
                    </View>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#333" className="ml-2" />
        </TouchableOpacity>
    );
}
