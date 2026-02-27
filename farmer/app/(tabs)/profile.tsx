import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, token } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalBatches: 0,
        verifiedRatio: 0,
        earning: 0
    });
    const [loading, setLoading] = useState(true);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!user || !token) return;
        setLoading(true);
        try {
            // Fetch profile, keys (for wallet), and products (for batches calculation) in parallel
            const [profileRes, keysRes, productsRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/farmer-profile/get?farmerId=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/farmer/keys/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/farmer/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/farmer/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const profileData = await profileRes.json();
            const keysData = await keysRes.json();
            const productsData = await productsRes.json();
            const ordersData = await ordersRes.json();

            if (profileRes.ok) setProfile(profileData.profile);
            if (keysRes.ok && keysData.key) setPublicKey(keysData.key.publicKey);

            let totalBatches = 0;
            let verifiedRatio = 0;
            let totalEarning = 0;

            if (productsRes.ok && productsData.products) {
                const products = productsData.products;
                totalBatches = products.length;
                const verifiedCount = products.filter((p: any) => p.verified).length;
                verifiedRatio = totalBatches > 0 ? Math.round((verifiedCount / totalBatches) * 100) : 0;
            }

            if (ordersRes.ok && ordersData.data) {
                totalEarning = ordersData.data
                    .filter((o: any) => o.status === 'DELIVERED')
                    .reduce((acc: number, o: any) => acc + (o.product?.price * o.quantity || 0), 0);
            }

            setStats({
                totalBatches,
                verifiedRatio,
                earning: totalEarning > 1000 ? (totalEarning / 1000).toFixed(1) + 'k' : totalEarning.toString()
            } as any);

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    const shortPublicKey = publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : '0x71C...4e21';

    return (
        <View className="flex-1 bg-black">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header Background */}
                <View className="relative h-80">
                    <Image
                        source={require('../../assets/images/profile_bg.png')}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)', 'black']}
                        className="absolute bottom-0 w-full h-40"
                    />

                    {/* Aegis Logo */}
                    <View className="absolute top-12 left-6">
                        <Image
                            source={require('../../assets/images/ageis_logo.png')}
                            className="w-10 h-10"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Profile Image with Glow */}
                    <View className="absolute bottom-0 left-0 right-0 items-center">
                        <View className="relative">
                            <View className="w-40 h-40 rounded-full border-2 border-[#13EC13] overflow-hidden items-center justify-center bg-zinc-900">
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=200&h=200' }}
                                    className="w-full h-full"
                                />
                            </View>
                            <View className="absolute -bottom-4 left-0 right-0 items-center">
                                <View className="bg-[#13EC13] px-4 py-1.5 rounded-full flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={14} color="black" />
                                    <Text className="text-black text-[10px] font-black ml-1 uppercase tracking-tighter">Verified Farmer</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Farmer Info */}
                <View className="items-center mt-10 px-6">
                    <Text className="text-[#13EC13] text-4xl font-black text-center">{user?.name || 'Mayur Shelke'}</Text>
                    <Text className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold">ID: AEGIS-7729-X</Text>
                </View>

                {/* Stats cards */}
                <View className="flex-row justify-center gap-4 px-6 mt-14">
                    <StatCard value={String(stats.totalBatches)} label="Total Batches" />
                    <StatCard value={`${stats.verifiedRatio}%`} label="Verified Ratio" />
                    <StatCard value={`${stats.earning}k`} label="Earning" />
                </View>

                {/* Account Settings */}
                <View className="mt-12 px-6 mb-10">
                    <View className="border border-sky-400/30 rounded-2xl overflow-hidden p-0.5">
                        <View className="border border-sky-400/30 border-dashed rounded-[14px] px-4 py-6">
                            <Text className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Account Settings</Text>

                            <SettingRow
                                icon="wallet"
                                title="Wallet Address"
                                subtitle={shortPublicKey}
                                iconBg="bg-green-500/10"
                                iconColor="#13EC13"
                                onPress={() => router.push('/wallet')}
                            />

                            <View className="h-[1px] bg-zinc-800/50 my-5" />

                            <SettingRow
                                icon="leaf"
                                title="Farm Details"
                                subtitle={profile?.location || 'Green Valley Estate, Kenya'}
                                iconBg="bg-green-500/10"
                                iconColor="#13EC13"
                            />

                            <View className="h-[1px] bg-zinc-800/50 my-5" />

                            <SettingRow
                                icon="help-circle"
                                title="Support"
                                subtitle="Help Center & 24/7 Agent"
                                iconBg="bg-green-500/10"
                                iconColor="#13EC13"
                            />

                            <View className="h-[1px] bg-zinc-800/50 my-5" />

                            <TouchableOpacity onPress={logout} className="flex-row items-center justify-center py-2 mt-4">
                                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 font-bold ml-2 text-base">Logout from AEGIS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="items-center mb-10">
                    <Text className="text-zinc-800 text-[10px] font-bold">POWERED BY AGEIS PROTOCOL</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function StatCard({ value, label }: { value: string, label: string }) {
    return (
        <View className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 items-center w-[30%]">
            <Text className="text-[#13EC13] text-2xl font-black mb-2">{value}</Text>
            <Text className="text-gray-500 text-[8px] font-bold uppercase text-center leading-3">{label}</Text>
        </View>
    );
}

function SettingRow({ icon, title, subtitle, iconBg, iconColor, onPress }: { icon: any, title: string, subtitle: string, iconBg: string, iconColor: string, onPress?: () => void }) {
    return (
        <TouchableOpacity className="flex-row items-center" onPress={onPress}>
            <View className={`w-12 h-12 rounded-xl ${iconBg} items-center justify-center`}>
                <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-base">{title}</Text>
                <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#333" />
        </TouchableOpacity>
    );
}
