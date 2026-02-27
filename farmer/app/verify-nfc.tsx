import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerifyNFCScreen() {
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [scanning, setScanning] = useState(false);
    const [manualTagId, setManualTagId] = useState('');
    const [associating, setAssociating] = useState(false);

    const handleScan = async () => {
        // Mock NFC scan for development
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            const mockTagId = 'NFC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
            Alert.alert(
                "NFC Tag Detected",
                `Found Tag ID: ${mockTagId}. Associate with this order?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Associate", onPress: () => associateTag(mockTagId) }
                ]
            );
        }, 2000);
    };

    const associateTag = async (tagId: string) => {
        if (!orderId || !token) return;
        setAssociating(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/delivery/nfc/associate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    nfcId: tagId
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "NFC Tag associated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Error", data.message || "Failed to associate tag");
            }
        } catch (error) {
            console.error('Error associating tag:', error);
            Alert.alert("Error", "Network error while associating tag");
        } finally {
            setAssociating(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-zinc-900 rounded-xl mr-4">
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">NFC Association</Text>
            </View>

            <View className="flex-1 px-6 items-center justify-center">
                <View className="w-48 h-48 rounded-full bg-zinc-900 items-center justify-center mb-10 relative">
                    {scanning ? (
                        <ActivityIndicator size="large" color="#13EC13" />
                    ) : (
                        <Ionicons name="radio-outline" size={80} color="#13EC13" />
                    )}
                    <View className="absolute -inset-4 border border-[#13EC13]/20 rounded-full" />
                    <View className="absolute -inset-8 border border-[#13EC13]/10 rounded-full" />
                </View>

                <Text className="text-white text-2xl font-black mb-2 text-center">Ready to Scan</Text>
                <Text className="text-gray-400 text-center mb-10">
                    {orderId ? `Associating tag with Order ID: ${orderId.toString().slice(0, 8)}` : 'Scan a tag to view order details'}
                </Text>

                <TouchableOpacity
                    onPress={handleScan}
                    disabled={scanning || associating}
                    className="w-full bg-[#13EC13] py-5 rounded-2xl items-center justify-center mb-6"
                >
                    <Text className="text-black font-black text-lg">Start Scanning</Text>
                </TouchableOpacity>

                <View className="w-full flex-row items-center mb-6">
                    <View className="flex-1 h-[1px] bg-zinc-800" />
                    <Text className="mx-4 text-zinc-600 text-xs font-bold uppercase">Or enter manually</Text>
                    <View className="flex-1 h-[1px] bg-zinc-800" />
                </View>

                <View className="w-full flex-row gap-3">
                    <TextInput
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white font-mono"
                        placeholder="TAG-ID-12345"
                        placeholderTextColor="#444"
                        value={manualTagId}
                        onChangeText={setManualTagId}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity
                        onPress={() => associateTag(manualTagId)}
                        disabled={!manualTagId || associating}
                        className="bg-zinc-800 px-6 rounded-2xl items-center justify-center"
                    >
                        {associating ? <ActivityIndicator size="small" color="#13EC13" /> : <Ionicons name="arrow-forward" size={24} color="#13EC13" />}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
