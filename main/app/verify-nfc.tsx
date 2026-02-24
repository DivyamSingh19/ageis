import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    ScrollView,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NFCRecord {
    id: string;
    timestamp: string;
    rawId: string;
    techTypes: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTagId(id: string): string {
    // tag.id is a hex string like "04a1b2c3" — insert colons every 2 chars
    return (id.match(/.{1,2}/g) ?? [id]).join(":").toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NFCScannerScreen() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scannedTags, setScannedTags] = useState<NFCRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Pulse animation for scan ring
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
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
                    toValue: 1.3,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [scanning]);

    const startScan = useCallback(async () => {
        setError(null);
        setScanning(true);

        try {
            await NfcManager.requestTechnology([NfcTech.NfcA, NfcTech.NfcB, NfcTech.NfcF, NfcTech.NfcV, NfcTech.Ndef]);
            const tag = await NfcManager.getTag();

            if (tag && tag.id) {
                const record = {
                    id: formatTagId(tag.id),
                    timestamp: new Date().toLocaleTimeString(),
                    rawId: tag.id,
                    techTypes: tag.techTypes || [],
                };
                setScannedTags((prev) => [record, ...prev]);
            } else {
                setError("Tag found but could not read ID. Try again.");
            }
        } catch (ex: any) {
            const msg = ex instanceof Error ? ex.message : String(ex);
            if (msg !== "cancelled" && msg !== "UserCancel") {
                setError(msg || "Unknown error scanning tag.");
            }
        } finally {
            await NfcManager.cancelTechnologyRequest().catch(() => { });
            setScanning(false);
        }
    }, []);

    const stopScan = useCallback(async () => {
        await NfcManager.cancelTechnologyRequest().catch(() => { });
        setScanning(false);
    }, []);

    // ── Render states ──────────────────────────────────────────────────────────

    if (supported === null) {
        return (
            <View style={styles.center}>
                <Text style={styles.subText}>Initialising NFC…</Text>
            </View>
        );
    }

    if (!supported) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>📵</Text>
                <Text style={styles.title}>NFC Not Supported</Text>
                <Text style={styles.subText}>This device does not have NFC hardware.</Text>
            </View>
        );
    }

    if (enabled === false) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.title}>NFC Disabled</Text>
                <Text style={styles.subText}>
                    Please enable NFC in your device settings and restart the app.
                </Text>
            </View>
        );
    }

    // ── Main UI ────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>NFC Scanner</Text>
                <Text style={styles.headerSub}>Tap a tag to read its ID</Text>
            </View>

            {/* Scanner ring */}
            <View style={styles.scanArea}>
                <Animated.View
                    style={[
                        styles.pulseRing,
                        scanning && { transform: [{ scale: pulseAnim }], opacity: 0.35 },
                    ]}
                />
                <View style={[styles.scanRing, scanning && styles.scanRingActive]}>
                    <Text style={styles.nfcIcon}>📡</Text>
                    <Text style={[styles.scanLabel, scanning && styles.scanLabelActive]}>
                        {scanning ? "Hold tag near phone…" : "Ready"}
                    </Text>
                </View>
            </View>

            {/* Button */}
            <TouchableOpacity
                style={[styles.button, scanning && styles.buttonStop]}
                onPress={scanning ? stopScan : startScan}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{scanning ? "Cancel Scan" : "Start Scanning"}</Text>
            </TouchableOpacity>

            {/* Error */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
            )}

            {/* Results */}
            {scannedTags.length > 0 && (
                <View style={styles.resultsWrapper}>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsTitle}>Scanned Tags</Text>
                        <TouchableOpacity onPress={() => setScannedTags([])}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
                        {scannedTags.map((tag, i) => (
                            <View key={i} style={styles.tagCard}>
                                <View style={styles.tagRow}>
                                    <Text style={styles.tagLabel}>Tag ID</Text>
                                    <Text style={styles.tagTime}>{tag.timestamp}</Text>
                                </View>
                                <Text style={styles.tagId} selectable>
                                    {tag.id}
                                </Text>
                                {tag.techTypes.length > 0 && (
                                    <Text style={styles.tagTech} numberOfLines={1}>
                                        {tag.techTypes.map((t) => t.split(".").pop()).join(" · ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BRAND = "#6C63FF";
const BRAND_LIGHT = "#EEF0FF";
const DANGER = "#FF6B6B";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FE",
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingHorizontal: 20,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: "#F8F9FE",
    },
    // Header
    header: { marginBottom: 28 },
    headerTitle: { fontSize: 28, fontWeight: "700", color: "#1A1A2E", letterSpacing: -0.5 },
    headerSub: { fontSize: 14, color: "#8B8FA8", marginTop: 4 },
    // Scan area
    scanArea: {
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        marginBottom: 24,
    },
    pulseRing: {
        position: "absolute",
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: BRAND,
    },
    scanRing: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#E0E3F0",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    scanRingActive: { borderColor: BRAND, backgroundColor: BRAND_LIGHT },
    nfcIcon: { fontSize: 44, marginBottom: 6 },
    scanLabel: { fontSize: 12, color: "#8B8FA8", fontWeight: "600" },
    scanLabelActive: { color: BRAND },
    // Button
    button: {
        backgroundColor: BRAND,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: BRAND,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    buttonStop: { backgroundColor: DANGER, shadowColor: DANGER },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
    // Error
    errorBanner: {
        backgroundColor: "#FFF0F0",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: DANGER,
    },
    errorText: { color: DANGER, fontSize: 13, fontWeight: "600" },
    // Results
    resultsWrapper: { flex: 1 },
    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    resultsTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
    clearText: { fontSize: 14, color: BRAND, fontWeight: "600" },
    resultsList: { flex: 1 },
    tagCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tagRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    tagLabel: { fontSize: 11, color: "#8B8FA8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
    tagTime: { fontSize: 11, color: "#8B8FA8" },
    tagId: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A2E",
        letterSpacing: 1,
        marginBottom: 4,
    },
    tagTech: { fontSize: 11, color: BRAND, fontWeight: "600" },
    // Fallback states
    errorIcon: { fontSize: 56, marginBottom: 12 },
    title: { fontSize: 22, fontWeight: "700", color: "#1A1A2E", marginBottom: 8 },
    subText: { fontSize: 14, color: "#8B8FA8", textAlign: "center", lineHeight: 20 },
});