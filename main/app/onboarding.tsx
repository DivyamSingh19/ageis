import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/create-wallet');
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0d1a0d', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to Ageis</Text>
                    <Text style={styles.subtitle}>Let's get your secure marketplace wallet set up.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Secure & Direct</Text>
                    <Text style={styles.cardText}>
                        Ageis uses Solana blockchain technology to ensure your transactions are fast,
                        secure, and direct between you and the farmers.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>You own your keys</Text>
                    <Text style={styles.cardText}>
                        We never see your private keys. They are generated and encrypted right on your
                        device, secured by your local device security.
                    </Text>
                </View>

                <TouchableOpacity style={styles.ctaBtn} onPress={handleNext}>
                    <LinearGradient
                        colors={['#39FF14', '#28cc0d']}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>Get Started</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 80,
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#39FF14',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#222',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#777',
        lineHeight: 20,
    },
    ctaBtn: {
        marginTop: 40,
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
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
});
