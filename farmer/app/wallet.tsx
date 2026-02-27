import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Share, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

export default function WalletScreen() {
    const { user, token } = useAuth();
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSolanaBalance = async (address: string) => {
        try {
            const response = await fetch(SOLANA_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address],
                }),
            });
            const data = await response.json();
            if (data.result) {
                // Balance is in lamports (1 SOL = 10^9 lamports)
                setSolBalance(data.result.value / 1000000000);
            }
        } catch (error) {
            console.error('Error fetching Solana balance:', error);
        }
    };

    const fetchData = async () => {
        if (!user || !token) return;
        try {
            const [keysRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/farmer/keys/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/farmer/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const keysData = await keysRes.json();
            const ordersData = await ordersRes.json();

            if (keysRes.ok && keysData.key) {
                const pubKey = keysData.key.publicKey;
                setPublicKey(pubKey);
                // Fetch Solana balance once we have the public key
                await fetchSolanaBalance(pubKey);
            }

            if (ordersRes.ok && ordersData.success) {
                const sortedOrders = ordersData.data.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sortedOrders);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const copyToClipboard = async () => {
        if (publicKey) {
            await Clipboard.setStringAsync(publicKey);
        }
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: publicKey || '',
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    const shortPublicKey = publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : '0x...';

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 px-6">
                {/* Header */}
                <View className="py-6 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="bg-zinc-900 w-10 h-10 rounded-full items-center justify-center mr-3 border border-zinc-800">
                            <Ionicons name="wallet-outline" size={20} color="#13EC13" />
                        </View>
                        <Text className="text-white text-3xl font-black">Farmer Wallet</Text>
                    </View>
                    <View className="bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Devnet</Text>
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#13EC13" />
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Solana Card */}
                    <LinearGradient
                        colors={['#13EC13', '#0A7B0A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-[32px] p-6 mb-8 shadow-lg shadow-green-500/20"
                    >
                        <View className="flex-row justify-between items-start mb-10">
                            <View>
                                <Text className="text-black/60 text-xs font-bold uppercase tracking-widest mb-1">Solana Balance</Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-black text-4xl font-black">{solBalance !== null ? solBalance.toFixed(4) : '0.00'}</Text>
                                    <Text className="text-black text-xl font-bold ml-2">SOL</Text>
                                </View>
                            </View>
                            <View className="bg-black/10 p-2 rounded-xl">
                                <Image
                                    source={{ uri: 'https://cryptologos.cc/logos/solana-sol-logo.png' }}
                                    className="w-8 h-8"
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-black/60 text-[10px] font-bold uppercase tracking-widest mb-2">Solana Address</Text>
                            <View className="flex-row items-center justify-between bg-black/5 rounded-2xl p-3 border border-black/10">
                                <Text className="text-black font-mono text-xs font-bold">{shortPublicKey}</Text>
                                <View className="flex-row gap-3">
                                    <TouchableOpacity onPress={copyToClipboard}>
                                        <Ionicons name="copy-outline" size={18} color="black" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onShare}>
                                        <Ionicons name="share-outline" size={18} color="black" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Quick Stats */}
                    <View className="flex-row justify-between mb-10">
                        <View className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl items-center w-[48%]">
                            <Ionicons name="leaf-outline" size={24} color="#13EC13" />
                            <Text className="text-gray-500 text-[10px] font-bold uppercase mt-2">Active Batches</Text>
                            <Text className="text-white text-lg font-black mt-1">{orders.filter(o => o.status !== 'CANCELED').length}</Text>
                        </View>
                        <View className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl items-center w-[48%]">
                            <Ionicons name="cash-outline" size={24} color="#13EC13" />
                            <Text className="text-gray-500 text-[10px] font-bold uppercase mt-2">Total Sales</Text>
                            <Text className="text-white text-lg font-black mt-1">$ {orders.reduce((acc, o) => acc + (o.product?.price || 0), 0).toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Transaction History */}
                    <View>
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-black">Product Logic History</Text>
                            <View className="bg-[#13EC13]/10 px-3 py-1 rounded-full">
                                <Text className="text-[#13EC13] text-[10px] font-bold uppercase">Orders</Text>
                            </View>
                        </View>

                        {orders.length === 0 ? (
                            <View className="items-center justify-center py-10 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
                                <Ionicons name="receipt-outline" size={32} color="#333" />
                                <Text className="text-zinc-600 text-sm font-bold mt-2">No product transactions yet</Text>
                            </View>
                        ) : (
                            orders.map((order) => (
                                <TransactionItem key={order.id} order={order} />
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

function TransactionItem({ order }: { order: any }) {
    const isReceived = true;
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-[#13EC13]';
            case 'CANCELED': return 'text-red-500';
            default: return 'text-sky-400';
        }
    };

    return (
        <TouchableOpacity className="flex-row items-center mb-5 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/50">
            <View className={`w-12 h-12 rounded-2xl ${isReceived ? 'bg-green-500/10' : 'bg-red-500/10'} items-center justify-center mr-4`}>
                <Ionicons name={isReceived ? "arrow-down-outline" : "arrow-up-outline"} size={22} color={isReceived ? "#13EC13" : "#ef4444"} />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{order.product?.name || 'Batch Sale'}</Text>
                <Text className="text-gray-500 text-xs mt-0.5">{date} • {order.status}</Text>
            </View>
            <View className="items-end ml-2">
                <Text className="text-white font-black text-base">$ {order.product?.price || order.totalPrice || '0.00'}</Text>
                <Text className={`text-[10px] font-bold uppercase mt-1 ${getStatusColor(order.status)}`}>
                    {order.status}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

