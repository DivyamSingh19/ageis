import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView className="flex-1 px-6">
                <View className="items-center mt-10 mb-8">
                    <View className="w-24 h-24 rounded-full bg-zinc-900 items-center justify-center border-2 border-[#13EC13]">
                        <Ionicons name="person" size={50} color="#13EC13" />
                    </View>
                    <Text className="text-white text-2xl font-bold mt-4">{user?.name || 'Farmer name'}</Text>
                    <Text className="text-gray-500 text-sm">{user?.email || 'farmer@ageis.com'}</Text>

                    <View className="flex-row mt-4 gap-2">
                        <View className="bg-[#13EC13]/10 px-3 py-1 rounded-full border border-[#13EC13]/20">
                            <Text className="text-[#13EC13] text-xs font-bold uppercase tracking-widest">Verified Farmer</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-zinc-900/50 rounded-3xl p-2 border border-zinc-800/50 mb-8">
                    <SettingsItem
                        icon="person-outline"
                        label="Edit Profile"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="wallet-outline"
                        label="Wallet Settings"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="notifications-outline"
                        label="Notifications"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="shield-checkmark-outline"
                        label="Security"
                        onPress={() => { }}
                        isLast
                    />
                </View>

                <TouchableOpacity
                    onPress={logout}
                    className="flex-row items-center justify-center bg-red-500/10 py-5 rounded-2xl border border-red-500/20 mb-10"
                >
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                    <Text className="text-red-500 font-bold text-lg ml-2">Logout</Text>
                </TouchableOpacity>

                <View className="items-center mb-20">
                    <Text className="text-gray-600 text-xs">Ageis Farmer v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SettingsItem({ icon, label, onPress, isLast = false }: { icon: any, label: string, onPress: () => void, isLast?: boolean }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-zinc-800/50' : ''}`}
        >
            <View className="flex-row items-center">
                <Ionicons name={icon} size={22} color="#666" />
                <Text className="text-white ml-4 text-base">{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
    );
}
