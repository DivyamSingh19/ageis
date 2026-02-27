import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileSetupScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [certificate, setCertificate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setCertificate(result.assets[0].uri);
        }
    };

    const getCurrentLocation = async () => {
        setGpsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow access to location to get your GPS coordinates.');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get current location.');
        } finally {
            setGpsLoading(false);
        }
    };

    const handleNext = async () => {
        if (!location) {
            Alert.alert('Required Field', 'Please provide your farm location.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('farmerId', user?.id || '');
            formData.append('bio', bio);
            formData.append('location', location);

            if (certificate) {
                const filename = certificate.split('/').pop() || 'certificate.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                formData.append('certificate', { uri: certificate, name: filename, type } as any);
            }

            const response = await fetch(`${API_URL}/api/farmer-profile/create`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/create-wallet');
            } else {
                Alert.alert('Error', data.message || 'Failed to create profile.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong while saving your profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-black p-6">
            <View className="flex-row items-center justify-between mt-8 mb-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Profile Setup</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Progress Indicator */}
            <View className="flex-row justify-center gap-2 mb-8">
                <View className="h-1.5 w-12 bg-green-500 rounded-full" />
                <View className="h-1.5 w-12 bg-gray-800 rounded-full" />
                <View className="h-1.5 w-12 bg-gray-800 rounded-full" />
            </View>

            <View className="mb-6">
                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Bio / Description</Text>
                <TextInput
                    className="bg-zinc-900 text-white p-4 rounded-2xl border border-zinc-800 text-base"
                    placeholder="Tell us about your farm..."
                    placeholderTextColor="#555"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={bio}
                    onChangeText={setBio}
                />
            </View>

            <View className="mb-6">
                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Farm Location</Text>
                <View className="flex-row items-center bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-1">
                    <Ionicons name="location" size={20} color="#39ff14" />
                    <TextInput
                        className="flex-1 text-white p-3 text-base"
                        placeholder="Coordinates or Address"
                        placeholderTextColor="#555"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
                <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={gpsLoading}
                    className="flex-row items-center justify-center mt-3 bg-green-500/10 border border-green-500/30 py-4 rounded-2xl"
                >
                    {gpsLoading ? (
                        <ActivityIndicator color="#39ff14" />
                    ) : (
                        <>
                            <Ionicons name="locate" size={20} color="#39ff14" />
                            <Text className="text-green-500 font-bold ml-2">Get Current GPS</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View className="mb-10">
                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">Achievement/Certification</Text>
                <TouchableOpacity
                    onPress={pickImage}
                    className="bg-zinc-900 h-40 rounded-2xl border border-zinc-800 border-dashed items-center justify-center overflow-hidden"
                >
                    {certificate ? (
                        <Image source={{ uri: certificate }} className="w-full h-full" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload" size={40} color="#555" />
                            <Text className="text-gray-500 mt-2">Upload Certificate</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View className="bg-green-500/5 border border-green-500/20 p-4 rounded-2xl flex-row items-center mb-10">
                <Ionicons name="shield-checkmark" size={24} color="#39ff14" />
                <View className="ml-3 flex-1">
                    <Text className="text-white font-bold text-sm">Blockchain Verification</Text>
                    <Text className="text-gray-500 text-xs">This data will be encrypted and recorded on-chain for transparent supply chain tracking.</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleNext}
                disabled={loading}
                className="bg-green-500 w-full py-5 rounded-2xl flex-row items-center justify-center mb-10"
            >
                {loading ? (
                    <ActivityIndicator color="black" />
                ) : (
                    <>
                        <Text className="text-black font-bold text-lg mr-2">Next Step</Text>
                        <Ionicons name="arrow-forward" size={20} color="black" />
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
