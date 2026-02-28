import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Dimensions, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const fetchProductDetails = async () => {
        if (!token || !id) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProduct(data.product);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch product details');
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            Alert.alert('Error', 'Network error while fetching product details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const handleDelete = async () => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            const response = await fetch(`${API_URL}/api/farmer/products/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                                Alert.alert("Success", "Product deleted successfully");
                                router.back();
                            } else {
                                const data = await response.json();
                                Alert.alert("Error", data.message || "Failed to delete product");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Network error");
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const response = await fetch(`${API_URL}/api/farmer/verify-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: id })
            });

            if (response.ok) {
                Alert.alert("Success", "Applying for verification triggered!");
                fetchProductDetails();
            } else {
                const data = await response.json();
                Alert.alert("Error", data.error || "Verification request failed");
            }
        } catch (error) {
            Alert.alert("Error", "Network error during verification");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#13EC13" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff' }}>Product not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" />

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: 12 }}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 16 }}>Product Details</Text>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ width: width, height: width, backgroundColor: '#111' }}>
                    {product.pinataImageUrl?.[0] ? (
                        <Image source={{ uri: product.pinataImageUrl[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="image-outline" size={80} color="#333" />
                        </View>
                    )}
                    {product.verified && (
                        <View style={{ position: 'absolute', top: 20, right: 20, backgroundColor: '#13EC13', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={14} color="black" />
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 12, marginLeft: 4 }}>VERIFIED</Text>
                        </View>
                    )}
                </View>

                <View style={{ padding: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#666', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{product.category || 'General'}</Text>
                            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>{product.name}</Text>
                        </View>
                        <Text style={{ color: '#13EC13', fontSize: 24, fontWeight: '900' }}>Rs {product.price}</Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#1a1a1a', marginVertical: 24 }} />

                    <Text style={{ color: '#444', fontSize: 11, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Description</Text>
                    <Text style={{ color: '#888', fontSize: 16, lineHeight: 24 }}>{product.description}</Text>

                    <View style={{ marginTop: 32 }}>
                        <Text style={{ color: '#444', fontSize: 11, fontWeight: 'bold', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Product Info</Text>

                        <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 20, padding: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={{ color: '#666' }}>Location</Text>
                                <Text style={{ color: 'white', fontWeight: '900' }}>{product.farmLocation || 'Not specified'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={{ color: '#666' }}>Added on</Text>
                                <Text style={{ color: 'white', fontWeight: '900' }}>{new Date(product.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#666' }}>ID</Text>
                                <Text style={{ color: '#444', fontSize: 10 }}>{product.id}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 40, gap: 16 }}>
                        {!product.verified && (
                            <TouchableOpacity
                                onPress={handleVerify}
                                disabled={verifying}
                                style={{ backgroundColor: '#13EC13', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                            >
                                <Ionicons name="shield-checkmark" size={20} color="black" style={{ marginRight: 8 }} />
                                {verifying ? <ActivityIndicator color="black" /> : <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Apply for verification</Text>}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={deleting}
                            style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ef4444' }}
                        >
                            {deleting ? <ActivityIndicator color="#ef4444" /> : <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>Delete Product</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
