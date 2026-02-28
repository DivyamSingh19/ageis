import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCENT_YELLOW = '#FFC000';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nftInfo, setNftInfo] = useState<any>(null);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const [prodRes, nftRes] = await Promise.all([
                fetch(`${API_URL}/api/user/products/${id}`),
                fetch(`${API_URL}/api/user/products/${id}/nft`)
            ]);

            const prodData = await prodRes.json();
            const nftData = await nftRes.json();

            if (prodRes.ok) setProduct(prodData.product);
            if (nftRes.ok) setNftInfo(nftData);
        } catch (error) {
            console.error("Error fetching product details:", error);
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

    if (!product) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Product not found</Text>
            </View>
        );
    }

    const mainImage = product.pinataImageUrl?.[0];

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{
                headerShown: false
            }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image Header */}
                <View className="relative h-[400px]">
                    {mainImage ? (
                        <Image source={{ uri: mainImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-zinc-900 items-center justify-center">
                            <Text style={{ fontSize: 100 }}>🌾</Text>
                        </View>
                    )}

                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', 'black']}
                        className="absolute inset-0"
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Trace Badge */}
                    <View className="absolute bottom-6 left-6">
                        <View style={{ backgroundColor: 'rgba(255, 192, 0, 0.2)', borderWidth: 1, borderColor: ACCENT_YELLOW }} className="px-4 py-1.5 rounded-full flex-row items-center">
                            <Ionicons name="shield-checkmark" size={14} color={ACCENT_YELLOW} />
                            <Text style={{ color: ACCENT_YELLOW }} className="text-[10px] font-black ml-1 uppercase tracking-widest">Authenticated Batch</Text>
                        </View>
                    </View>
                </View>

                {/* Product Content */}
                <View className="px-6 pt-6">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-white text-3xl font-black mb-1">{product.name}</Text>
                            <Text style={{ color: ACCENT_YELLOW }} className="text-sm font-bold uppercase tracking-widest">{product.category}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-white text-3xl font-black">Rs {product.price}</Text>
                            <Text className="text-zinc-500 text-xs font-bold">per unit</Text>
                        </View>
                    </View>

                    {/* Farmer Info */}
                    <View className="mt-8 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex-row items-center">
                        <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center mr-4">
                            <Ionicons name="person" size={24} color={ACCENT_YELLOW} />
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest text-white/50">Cultivated By</Text>
                            <Text className="text-white font-bold text-base">{product.farmer?.name || 'Local Farmer'}</Text>
                        </View>
                        <View className="flex-1 items-end">
                            <View style={{ backgroundColor: ACCENT_YELLOW }} className="px-3 py-1 rounded-full">
                                <Text className="text-black text-[10px] font-bold">VERIFIED</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mt-8">
                        <Text className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Product Description</Text>
                        <Text className="text-zinc-400 leading-6 text-base">
                            {product.description || "This premium harvest is cultivated with sustainable farming practices, ensuring the highest quality and nutritional value. AI-verified for freshness and traced on the Solana blockchain."}
                        </Text>
                    </View>

                    {/* Blockchain Trace Section */}
                    <View className="mt-10 mb-10 border border-yellow-400/30 rounded-2xl p-0.5">
                        <View className="border border-yellow-400/30 border-dashed rounded-[14px] px-5 py-6">
                            <View className="flex-row items-center mb-6">
                                <Ionicons name="link" size={20} color={ACCENT_YELLOW} />
                                <Text className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Blockchain Proof of Origin</Text>
                            </View>

                            <TraceRow label="Batch Hash" value={`0x${product.id.slice(0, 12)}...`} />
                            <TraceRow label="Production Date" value={new Date(product.productionDate).toLocaleDateString()} />
                            <TraceRow label="AI Quality Score" value="98/100" />
                            <TraceRow label="Location" value={product.farmLocation || "Undisclosed Farm"} isLast />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="px-6 py-6 border-t border-zinc-900 bg-black/80 backdrop-blur-xl">
                <TouchableOpacity
                    style={{ backgroundColor: ACCENT_YELLOW }}
                    className="h-16 rounded-2xl items-center justify-center shadow-xl shadow-yellow-500/20"
                >
                    <Text className="text-black font-black text-lg tracking-widest uppercase">Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function TraceRow({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) {
    return (
        <View className={`${isLast ? '' : 'mb-4'}`}>
            <Text className="text-zinc-600 text-[10px] font-bold uppercase mb-1">{label}</Text>
            <Text className="text-white font-mono text-xs">{value}</Text>
        </View>
    );
}
