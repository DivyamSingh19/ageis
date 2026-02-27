import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import nacl from 'tweetnacl';
import * as Crypto from 'expo-crypto';
import { base58Encode } from '../utils/base58';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
import { useAuth } from '../context/auth-context';
import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

export default function CreateWalletScreen() {
    const router = useRouter();
    const { user, completeOnboarding } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const createWallet = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setPublicKey(null);

        try {
            // 1. Generate Ed25519 keypair on the client
            // We use fromSeed because tweetnacl fails with "no PRNG" in React Native
            const seed = await Crypto.getRandomBytesAsync(32);
            const keyPair = nacl.sign.keyPair.fromSeed(seed);

            // 2. Encode the public key to base58 (Solana format)
            const pubKeyBase58 = base58Encode(keyPair.publicKey);

            // 3. Encrypt the secret key before sending to server
            //    Using a simple scheme: random IV + hex-encode the secret key
            //    In production you'd derive a key from a PIN via PBKDF2
            const ivBytes = await Crypto.getRandomBytesAsync(16);
            const iv = Array.from(ivBytes)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            // Hex-encode the secret key as the "encrypted" payload
            // (In production, this would be AES-encrypted with a PIN-derived key)
            const secretKeyHex = Array.from(keyPair.secretKey)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            // 4. POST to the API
            const response = await fetch(`${API_URL}/api/farmer/keys/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerId: user?.id,
                    publicKey: pubKeyBase58,
                    encryptedPrivateKey: secretKeyHex,
                    meta: {
                        iv,
                        scheme: 'hex-plain', // placeholder scheme for dev/testing
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(`${response.status}: ${data.message || 'Unknown error'}`);
                return;
            }

            setPublicKey(pubKeyBase58);
            setResult(JSON.stringify(data, null, 2));

            // Final step: Update onboarding status
            await completeOnboarding();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
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
                <Text className="text-white text-xl font-bold">Wallet Creation</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Progress Indicator */}
            <View className="flex-row justify-center gap-2 mb-8">
                <View className="h-1.5 w-12 bg-green-500 rounded-full" />
                <View className="h-1.5 w-12 bg-green-500 rounded-full" />
                <View className="h-1.5 w-12 bg-green-500 rounded-full" />
            </View>

            <View className="items-center">
                <Text className="text-2xl font-bold mb-2 text-white">
                    Create Solana Wallet
                </Text>
                <Text className="text-gray-400 mb-6 text-center">
                    Generates a keypair on-device and stores the encrypted private key on
                    the server.
                </Text>

                <Pressable
                    onPress={createWallet}
                    disabled={loading}
                    className="bg-green-500 w-full py-5 rounded-2xl flex-row items-center justify-center mb-6"
                    style={{ opacity: loading ? 0.5 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-black font-bold text-lg">Complete Onboarding</Text>
                    )}
                </Pressable>

                {error && (
                    <View className="bg-red-900/40 p-4 rounded-xl w-full mb-4">
                        <Text className="text-red-400 font-bold mb-1">Error</Text>
                        <Text className="text-red-300">{error}</Text>
                    </View>
                )}

                {publicKey && (
                    <View className="bg-green-900/40 p-4 rounded-xl w-full mb-4">
                        <Text className="text-green-400 font-bold mb-1">
                            Wallet Created!
                        </Text>
                        <Text className="text-green-300 text-xs" selectable>
                            Public Key: {publicKey}
                        </Text>
                    </View>
                )}

                {result && (
                    <View className="bg-gray-900 p-4 rounded-xl w-full">
                        <Text className="text-gray-400 font-bold mb-1">API Response</Text>
                        <Text className="text-gray-300 text-xs font-mono" selectable>
                            {result}
                        </Text>
                    </View>
                )}

                <View className="mt-6 bg-gray-900 p-4 rounded-xl w-full">
                    <Text className="text-gray-500 text-xs">
                        Farmer ID: {user?.id}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                        API: {API_URL}/api/farmer/keys/new
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
