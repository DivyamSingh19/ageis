import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
    Animated,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from "../context/auth-context";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const InputField: React.FC<{
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "phone-pad";
}> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
}) => {
        const [focused, setFocused] = useState(false);
        const borderAnim = useRef(new Animated.Value(0)).current;

        const handleFocus = () => {
            setFocused(true);
            Animated.timing(borderAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        };

        const handleBlur = () => {
            setFocused(false);
            Animated.timing(borderAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        };

        const borderColor = borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["#2d2d2d", "#FFC000"],
        });

        return (
            <View style={styles.fieldWrapper}>
                <Text style={styles.label}>{label}</Text>
                <Animated.View style={[styles.inputContainer, { borderColor }]}>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoCapitalize="none"
                    />
                </Animated.View>
            </View>
        );
    };

export default function OnboardingScreen() {
    const router = useRouter();
    const { token, user } = useAuth();

    const [addressLine01, setAddressLine01] = useState("");
    const [addressLine02, setAddressLine02] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!addressLine01 || !addressLine02 || !phoneNumber || !postalCode) {
            Alert.alert("Error", "Please fill in all the profile details.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    addressLine01,
                    addressLine02,
                    phoneNumber,
                    postalCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    router.push('/create-wallet');
                    return;
                }
                Alert.alert("Error", data.message || "Failed to create profile.");
                return;
            }

            router.push('/create-wallet');
        } catch (error) {
            Alert.alert("Network Error", "Unable to reach the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Image
                        source={require("../assets/images/ageis_logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>Enter your details to finish setting up your account.</Text>
                    </View>

                    <InputField
                        label="Address Line 1"
                        placeholder="Street name, building"
                        value={addressLine01}
                        onChangeText={setAddressLine01}
                    />
                    <InputField
                        label="Address Line 2"
                        placeholder="Apartment, suite, unit"
                        value={addressLine02}
                        onChangeText={setAddressLine02}
                    />
                    <InputField
                        label="Phone Number"
                        placeholder="+1 (555) 000-0000"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                    <InputField
                        label="Postal Code"
                        placeholder="12345"
                        value={postalCode}
                        onChangeText={setPostalCode}
                    />

                    <TouchableOpacity style={styles.ctaBtn} onPress={handleNext} disabled={loading}>
                        <LinearGradient
                            colors={['#FFC000', '#FFD700']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.ctaText}>Continue</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    scroll: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 20,
        tintColor: "#fff",
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFC000',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    fieldWrapper: { width: "100%", marginBottom: 16 },
    label: { fontSize: 13, color: "#fff", fontWeight: "600", marginBottom: 8 },
    inputContainer: { borderWidth: 1, borderRadius: 12, backgroundColor: "#1a1a1a", overflow: "hidden" },
    input: { paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: "#fff" },
    ctaBtn: {
        marginTop: 30,
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 40,
    },
    ctaGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 25,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
});
