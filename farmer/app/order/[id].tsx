import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Modal, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const { height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    // NFC Modal State
    const [showNfcModal, setShowNfcModal] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [mounting, setMounting] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const fetchOrderDetails = async () => {
        if (!token || !id) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setOrder(data.data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Network error while fetching order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    useEffect(() => {
        if (!scanning) return;
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [scanning]);

    const handleCancelOrder = async () => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            const response = await fetch(`${API_URL}/api/farmer/orders/cancel`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ orderId: id })
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert("Success", "Order cancelled successfully");
                                fetchOrderDetails();
                            } else {
                                Alert.alert("Error", data.message || "Failed to cancel order");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Network error");
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    const startNfcScan = async () => {
        setScanning(true);
        try {
            await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);
            const tag = await NfcManager.getTag();
            if (tag && tag.id) {
                await mountNfcTag(tag.id);
            } else {
                Alert.alert("Error", "No NFC Tag ID found");
            }
        } catch (ex: any) {
            if (ex.message !== "cancelled" && ex.message !== "UserCancel") {
                Alert.alert("Error", "NFC Scanning failed");
            }
        } finally {
            NfcManager.cancelTechnologyRequest().catch(() => { });
            setScanning(false);
        }
    };

    const mountNfcTag = async (nfcId: string) => {
        setMounting(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/nfc/mount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: id, nfcId })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "NFC Tag mounted successfully!");
                setShowNfcModal(false);
                fetchOrderDetails();
            } else {
                Alert.alert("Error", data.message || "Failed to mount tag");
            }
        } catch (error) {
            Alert.alert("Error", "Network error while mounting tag");
        } finally {
            setMounting(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: '#111', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const date = new Date(order.createdAt).toLocaleDateString();
    const statusColor = order.status === 'COMPLETED' ? '#13EC13' :
        order.status === 'CANCELED' ? '#ef4444' : '#EAB308';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: 12, marginRight: 16 }}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Order Details</Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
                {/* Product Section */}
                <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 24, padding: 20, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111' }}>
                            {order.product?.pinataImageUrl?.[0] ? (
                                <Image source={{ uri: order.product.pinataImageUrl[0] }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="cube-outline" size={32} color="#333" />
                                </View>
                            )}
                        </View>
                        <View style={{ marginLeft: 16, flex: 1, paddingLeft: 16 }}>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{order.product?.name || 'Product'}</Text>
                            <Text style={{ color: '#666', fontSize: 13 }}>{order.product?.category}</Text>
                            <Text style={{ color: '#13EC13', fontSize: 18, fontWeight: '900', marginTop: 4 }}>Rs {order.product?.price * order.quantity}</Text>
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#1a1a1a', marginVertical: 16 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: '#666' }}>Quantity</Text>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{order.quantity} units</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#666' }}>Order Date</Text>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{date}</Text>
                    </View>
                </View>

                {/* Status Section */}
                <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 24, padding: 20, marginBottom: 24 }}>
                    <Text style={{ color: '#444', fontSize: 11, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Current Status</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 8, backgroundColor: statusColor }} />
                            <Text style={{ fontSize: 16, fontWeight: '900', color: statusColor, letterSpacing: 1 }}>
                                {order.status}
                            </Text>
                        </View>
                        <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold' }}>ID: {order.id.slice(0, 12)}</Text>
                    </View>
                </View>

                {/* User Section */}
                <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 24, padding: 20, marginBottom: 24 }}>
                    <Text style={{ color: '#444', fontSize: 11, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Customer info</Text>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{order.user?.name || 'Anonymous User'}</Text>
                    <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{order.user?.email}</Text>
                    {order.user?.profile && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1a1a1a' }}>
                            <Text style={{ color: '#888', fontSize: 12 }}>{order.user.profile.addressLine01}</Text>
                            <Text style={{ color: '#888', fontSize: 12 }}>{order.user.profile.phoneNumber}</Text>
                        </View>
                    )}
                </View>

                {/* Actions Section */}
                <View style={{ paddingBottom: 40 }}>
                    {order.status !== 'CANCELED' && (
                        <>
                            <TouchableOpacity
                                onPress={() => setShowNfcModal(true)}
                                style={{ backgroundColor: '#13EC13', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
                            >
                                <Ionicons name="radio-outline" size={24} color="black" />
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
                                    {order.nfc ? 'Remount NFC Tag' : 'Mount NFC Tag'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancelOrder}
                                disabled={cancelling}
                                style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ef4444' }}
                            >
                                {cancelling ? <ActivityIndicator color="#ef4444" /> : <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>Cancel Order</Text>}
                            </TouchableOpacity>
                        </>
                    )}

                    {order.nfc && (
                        <View style={{ marginTop: 24, alignItems: 'center' }}>
                            <Text style={{ color: '#444', fontSize: 12 }}>Linked NFC: <Text style={{ color: '#13EC13', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>{order.nfc.nfcId}</Text></Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* NFC Scan Modal */}
            <Modal
                visible={showNfcModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNfcModal(false)}
            >
                <BlurView intensity={30} tint="dark" style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => !scanning && setShowNfcModal(false)}
                        style={{ flex: 1 }}
                    />
                    <View style={{ backgroundColor: '#111', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, borderTopWidth: 1, borderTopColor: '#222' }}>
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 24 }} />

                            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: scanning ? '#13EC13' : '#222' }}>
                                <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: scanning ? 1 : 0.5 }}>
                                    <Ionicons name="radio-outline" size={60} color={scanning ? "#13EC13" : "#444"} />
                                </Animated.View>
                            </View>

                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                                {scanning ? 'Scanning...' : 'Ready to Mount'}
                            </Text>
                            <Text style={{ color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
                                {scanning
                                    ? 'Hold your phone near the NFC tag'
                                    : 'Tap the button below to start scanning and link this order to a physical tag.'}
                            </Text>

                            <TouchableOpacity
                                onPress={startNfcScan}
                                disabled={scanning || mounting}
                                style={{ backgroundColor: '#13EC13', width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                            >
                                {mounting ? <ActivityIndicator color="black" /> : <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>{scanning ? 'Searching...' : 'Start Scan'}</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowNfcModal(false)}
                                disabled={scanning || mounting}
                                style={{ width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </SafeAreaView>
    );
}
