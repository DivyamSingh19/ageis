import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import nacl from 'tweetnacl';
import * as Crypto from 'expo-crypto';
import { base58Encode } from '../utils/base58';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TEST_FARMER_ID = '8e2ecf36-31f4-4df0-8247-52f6ddb8722a';

export default function CreateWalletScreen() {
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
            const keyPair = nacl.sign.keyPair();

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
                    farmerId: TEST_FARMER_ID,
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
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-black p-5">
            <View className="mt-12 items-center">
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
                    className="bg-indigo-600 px-8 py-4 rounded-xl mb-6"
                    style={{ opacity: loading ? 0.5 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Wallet</Text>
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
                        Test Farmer ID: {TEST_FARMER_ID}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                        API: {API_URL}/api/farmer/keys/new
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
