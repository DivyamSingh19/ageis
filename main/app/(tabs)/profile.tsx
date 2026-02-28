import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCENT_YELLOW = '#EDC001';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    verifiedRatio: 0,
    rewards: 0
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
      // Fetch profile, keys (for wallet), and orders in parallel
      const [profileRes, keysRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/user/profile?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/user/keys/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/user/order`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const profileData = await profileRes.json();
      const keysData = await keysRes.json();
      const ordersData = await ordersRes.json();

      if (profileRes.ok && profileData.success) {
        setProfile(profileData.data);
      }
      if (keysRes.ok && keysData.data) {
        setPublicKey(keysData.data.publicKey);
      }

      if (ordersRes.ok && ordersData.data) {
        const orders = ordersData.data;
        const totalOrders = orders.length;
        const verifiedCount = orders.filter((o: any) => o.nft || o.status === 'COMPLETED').length;
        const verifiedRatio = totalOrders > 0 ? Math.round((verifiedCount / totalOrders) * 100) : 0;

        setStats({
          totalOrders,
          verifiedRatio,
          rewards: totalOrders * 12.5 // Mock rewards calculation
        });
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT_YELLOW} />
      </View>
    );
  }

  const shortPublicKey = publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : 'Not connected';

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
              <View style={{ borderColor: ACCENT_YELLOW }} className="w-40 h-40 rounded-full border-2 overflow-hidden items-center justify-center bg-zinc-900">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200' }}
                  className="w-full h-full"
                />
              </View>
              <View className="absolute -bottom-4 left-0 right-0 items-center">
                <View style={{ backgroundColor: ACCENT_YELLOW }} className="px-4 py-1.5 rounded-full flex-row items-center">
                  <Ionicons name="shield-checkmark" size={14} color="black" />
                  <Text className="text-black text-[10px] font-black ml-1 uppercase tracking-tighter">Verified Buyer</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View className="items-center mt-10 px-6">
          <Text style={{ color: ACCENT_YELLOW }} className="text-4xl font-black text-center">{user?.name || 'Aegis User'}</Text>
          <Text className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold">Member ID: AEGIS-USR-{user?.id?.slice(0, 4).toUpperCase()}</Text>
        </View>

        {/* Stats cards */}
        <View className="flex-row justify-center gap-4 px-6 mt-14">
          <StatCard value={String(stats.totalOrders)} label="Total Orders" accentColor={ACCENT_YELLOW} />
          <StatCard value={`${stats.verifiedRatio}%`} label="Authenticity" accentColor={ACCENT_YELLOW} />
          <StatCard value={`${stats.rewards.toFixed(0)}`} label="Rewards" accentColor={ACCENT_YELLOW} />
        </View>

        {/* Account Settings */}
        <View className="mt-12 px-6 mb-10">
          <View className="border border-yellow-400/30 rounded-2xl overflow-hidden p-0.5">
            <View className="border border-yellow-400/30 border-dashed rounded-[14px] px-4 py-6">
              <Text className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Account Settings</Text>

              <SettingRow
                icon="wallet"
                title="Solana Wallet"
                subtitle={shortPublicKey}
                iconBg="bg-yellow-500/10"
                iconColor={ACCENT_YELLOW}
                onPress={() => router.push('/wallet')}
              />

              <View className="h-[1px] bg-zinc-800/50 my-5" />

              <SettingRow
                icon="location"
                title="Delivery Address"
                subtitle={profile?.addressLine01 || 'Home Address'}
                iconBg="bg-yellow-500/10"
                iconColor={ACCENT_YELLOW}
              />

              <View className="h-[1px] bg-zinc-800/50 my-5" />

              <SettingRow
                icon="help-circle"
                title="Support"
                subtitle="Dispute Center & 24/7 Agent"
                iconBg="bg-yellow-500/10"
                iconColor={ACCENT_YELLOW}
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

function StatCard({ value, label, accentColor }: { value: string, label: string, accentColor: string }) {
  return (
    <View className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 items-center w-[30%]">
      <Text style={{ color: accentColor }} className="text-2xl font-black mb-2">{value}</Text>
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

