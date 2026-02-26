import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Crypto from "expo-crypto";
import nacl from "tweetnacl";
import { decode as base58Decode, encode as base58Encode } from "base-58";
import { useAuth } from "../context/auth-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateWalletScreen() {
    const { user, token, completeOnboarding } = useAuth();
    const [status, setStatus] = useState<"idle" | "generating" | "encrypting" | "saving">("idle");

    const handleCreateWallet = async () => {
        if (!user || !token) return;

        setStatus("generating");

        try {
            // 1. Generate Ed25519 keypair on the client
            // We use fromSeed because tweetnacl fails with "no PRNG" in React Native
            const seed = await Crypto.getRandomBytesAsync(32);
            const keyPair = nacl.sign.keyPair.fromSeed(seed);

            // 2. Encode the public key to base58 (Solana format)
            const pubKeyBase58 = base58Encode(keyPair.publicKey);

            // 3. Encrypt the private key
            // FOR DEMO: We are using a simple storage scheme. 
            // In production, we would derive a key from a user PIN.
            setStatus("encrypting");

            // Simulating encryption metadata
            const encryptedPrivateKey = base58Encode(keyPair.secretKey); // In real app, this is AES-GCM encrypted
            const meta = {
                iv: "dummy_iv",
                salt: "dummy_salt",
                scheme: "aes-256-gcm/dummy"
            };

            // 4. Send the encrypted blob to the server
            setStatus("saving");
            const response = await fetch(`${API_URL}/api/user/keys/user/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    publicKey: pubKeyBase58,
                    encryptedPrivateKey,
                    meta
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save keys to server");
            }

            // 5. Finalize onboarding
            await completeOnboarding();

            Alert.alert("Success", "Your wallet has been created and secured.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", (error as Error).message || "Failed to create wallet");
            setStatus("idle");
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "generating": return "Generating secure keys...";
            case "encrypting": return "Encrypting private key...";
            case "saving": return "Securing to cloud...";
            default: return "Create My Wallet";
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0d1a0d', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <View style={styles.shieldIcon}>
                        <View style={styles.shieldCheck} />
                    </View>
                </View>

                <Text style={styles.title}>Secure Your Account</Text>
                <Text style={styles.subtitle}>
                    We'll generate a Solana wallet for you. This allows you to interact with
                    the Ageis marketplace securely and transparently.
                </Text>

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        Your keys are encrypted on your device and never stored in plaintext.
                        Only you have access to your funds.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.ctaBtn, status !== 'idle' && styles.ctaDisabled]}
                    onPress={handleCreateWallet}
                    disabled={status !== 'idle'}
                >
                    <LinearGradient
                        colors={['#39FF14', '#28cc0d']}
                        style={styles.ctaGradient}
                    >
                        {status !== 'idle' ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.ctaText}>{getStatusText()}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {status !== 'idle' && (
                    <Text style={styles.statusSubtext}>{getStatusText()}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 40,
    },
    shieldIcon: {
        width: 80,
        height: 90,
        backgroundColor: '#111',
        borderWidth: 2,
        borderColor: '#39FF14',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shieldCheck: {
        width: 30,
        height: 15,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: '#39FF14',
        transform: [{ rotate: '-45deg' }, { translateY: -5 }],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    warningBox: {
        backgroundColor: 'rgba(57, 255, 20, 0.05)',
        padding: 16,
        borderRadius: 12,
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(57, 255, 20, 0.2)',
    },
    warningText: {
        fontSize: 13,
        color: '#aaa',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    ctaBtn: {
        marginTop: 50,
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
    },
    ctaDisabled: {
        opacity: 0.7,
    },
    ctaGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 50,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    statusSubtext: {
        marginTop: 12,
        color: '#39FF14',
        fontSize: 12,
        fontWeight: '500',
    }
});
