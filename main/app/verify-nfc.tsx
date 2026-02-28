import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    ScrollView,
    ActivityIndicator,
    Modal,
    Dimensions,
    StatusBar,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTagId(id: string): string {
    return (id.match(/.{1,2}/g) ?? [id]).join(":").toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VerifyNFCScreen() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        (async () => {
            const isSupported = await NfcManager.isSupported();
            setSupported(isSupported);
            if (isSupported) {
                await NfcManager.start();
                const isEnabled = await NfcManager.isEnabled();
                setEnabled(isEnabled);
            }
        })();

        return () => {
            NfcManager.cancelTechnologyRequest().catch(() => { });
        };
    }, []);

    useEffect(() => {
        if (!scanning) return;

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [scanning]);

    const verifyNFC = async (nfcId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/nfc/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nfcId }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setOrderData(result.data);
                setShowModal(true);
            } else {
                setError(result.message || "Failed to verify NFC");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startScan = useCallback(async () => {
        setError(null);
        setScanning(true);

        try {
            await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);
            const tag = await NfcManager.getTag();

            if (tag && tag.id) {
                // tag.id is usually the NFC UDID
                await verifyNFC(tag.id);
            } else {
                setError("Tag detected but no ID found.");
            }
        } catch (ex: any) {
            if (ex.message !== "cancelled" && ex.message !== "UserCancel") {
                setError("Scanning failed. Please try again.");
            }
        } finally {
            await NfcManager.cancelTechnologyRequest().catch(() => { });
            setScanning(false);
        }
    }, []);

    // ── Render Helpers ──────────────────────────────────────────────────────────

    if (supported === false) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle" size={60} color="#FFC000" />
                <Text style={styles.title}>Unsupported</Text>
                <Text style={styles.subText}>This device doesn't support NFC.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify NFC</Text>
                <View style={{ width: 40 }} />
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Blockchain Authentication</Text>
                    <Text style={styles.infoDesc}>Scan the physical tag on your product to verify its origin and journey on the Solana blockchain.</Text>
                </View>

                {/* Scan Animation Area */}
                <View style={styles.scanWrapper}>
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            { transform: [{ scale: pulseAnim }], opacity: scanning ? 0.3 : 0.1 }
                        ]}
                    />
                    <View style={[styles.scanCircle, scanning && styles.scanCircleActive]}>
                        {loading ? (
                            <ActivityIndicator color="#FFC000" size="large" />
                        ) : (
                            <Ionicons name="scan-outline" size={60} color={scanning ? "#FFC000" : "#444"} />
                        )}
                    </View>
                    <Text style={[styles.statusText, scanning && { color: "#FFC000" }]}>
                        {loading ? "Verifying..." : scanning ? "Hold near tag..." : "Ready to scan"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.scanButton, scanning && styles.disabledButton]}
                    onPress={startScan}
                    disabled={scanning || loading}
                >
                    <Text style={styles.scanButtonText}>
                        {scanning ? "Scanning..." : "Start Authentication"}
                    </Text>
                </TouchableOpacity>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </Animated.View>

            {/* Result Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <BlurView intensity={20} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark-circle" size={40} color="#000" />
                            </View>
                            <Text style={styles.modalTitle}>Verified Authentic</Text>
                            <Text style={styles.modalSub}>Order Details Found</Text>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Order ID</Text>
                                <Text style={styles.dataValue}>#{orderData?.id.slice(0, 8)}</Text>
                            </View>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Status</Text>
                                <Text style={[styles.dataValue, { color: "#FFC000" }]}>{orderData?.status}</Text>
                            </View>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Total Amount</Text>
                                <Text style={styles.dataValue}>Rs {orderData?.totalAmount}</Text>
                            </View>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Quantity</Text>
                                <Text style={styles.dataValue}>{orderData?.quantity} units</Text>
                            </View>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Created At</Text>
                                <Text style={styles.dataValue}>{new Date(orderData?.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                            <Text style={styles.closeButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 20 : 40,
        paddingBottom: 20,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    infoBox: {
        backgroundColor: "#111",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#222",
        marginBottom: 40,
    },
    infoTitle: {
        color: "#FFC000",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    infoDesc: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        lineHeight: 20,
    },
    scanWrapper: {
        height: 250,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    pulseRing: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "#FFC000",
    },
    scanCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#333",
    },
    scanCircleActive: {
        borderColor: "#FFC000",
        backgroundColor: "#1a1a1a",
    },
    statusText: {
        color: "#888",
        fontSize: 14,
        marginTop: 20,
        fontWeight: "500",
    },
    scanButton: {
        backgroundColor: "#FFC000",
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FFC000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: "#333",
        shadowOpacity: 0,
    },
    scanButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorContainer: {
        marginTop: 20,
        backgroundColor: "rgba(255,0,0,0.1)",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,0,0,0.2)",
    },
    errorText: {
        color: "#ff6b6b",
        fontSize: 13,
        textAlign: "center",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },
    subText: {
        color: "#888",
        fontSize: 14,
        marginTop: 10,
        textAlign: "center",
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    modalContent: {
        backgroundColor: "#111",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: height * 0.8,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    successIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#FFC000",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    modalSub: {
        color: "#888",
        fontSize: 14,
        marginTop: 4,
    },
    modalBody: {
        marginBottom: 20,
    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    dataLabel: {
        color: "#888",
        fontSize: 14,
    },
    dataValue: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    closeButton: {
        backgroundColor: "#fff",
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    closeButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
});