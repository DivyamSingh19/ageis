import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Sub-components ──────────────────────────────────────────────────────────

const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
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
      outputRange: ["#2a2a2a", "#39FF14"],
    });

    return (
      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Animated.View style={[styles.inputContainer, { borderColor }]}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#555"
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

const LogoMark: React.FC = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoMark}>
      <View style={styles.logoLeftLeg} />
      <View style={styles.logoRightLeg} />
      <View style={styles.logoCrossbar} />
    </View>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
        return;
      }

      await login(data.token, data.data, data.data.onboardingComplete);
    } catch (error) {
      Alert.alert("Network Error", "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0d1a0d", "#0a0a0a", "#001a00"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowBlob} pointerEvents="none" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoMark />
          <Text style={styles.title}>Welcome Back</Text>

          <InputField
            label="Email"
            placeholder="eg. jane@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Animated.View
            style={[
              styles.ctaWrapper,
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.9}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <LinearGradient
                colors={["#39FF14", "#28cc0d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.ctaText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.loginLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
  glowBlob: {
    position: "absolute", top: -80, alignSelf: "center", width: 340, height: 340,
    borderRadius: 170, backgroundColor: "#004d00", opacity: 0.35,
  },
  scroll: {
    flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingVertical: 120,
  },
  logoContainer: { marginBottom: 16, alignItems: "center" },
  logoMark: { width: 44, height: 44, position: "relative", alignItems: "center", justifyContent: "flex-end" },
  logoLeftLeg: {
    position: "absolute", bottom: 0, left: 0, width: 4, height: 36, backgroundColor: "#fff",
    borderRadius: 2, transform: [{ rotate: "20deg" }, { translateX: 8 }],
  },
  logoRightLeg: {
    position: "absolute", bottom: 0, right: 0, width: 4, height: 36, backgroundColor: "#fff",
    borderRadius: 2, transform: [{ rotate: "-20deg" }, { translateX: -8 }],
  },
  logoCrossbar: { position: "absolute", top: 18, width: 20, height: 3, backgroundColor: "#fff", borderRadius: 2 },
  title: { fontSize: 30, fontWeight: "700", color: "#39FF14", marginBottom: 24, letterSpacing: 0.5 },
  fieldWrapper: { width: "100%", marginBottom: 14 },
  label: { fontSize: 13, color: "#c0c0c0", fontWeight: "500", marginBottom: 6 },
  inputContainer: { borderWidth: 1.5, borderRadius: 10, backgroundColor: "#131313", overflow: "hidden" },
  input: { paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#fff" },
  ctaWrapper: { width: "100%", marginTop: 8, marginBottom: 16, borderRadius: 50, overflow: "hidden" },
  ctaBtn: { borderRadius: 50, overflow: "hidden" },
  ctaGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center", borderRadius: 50 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#000", letterSpacing: 0.3 },
  loginRow: { flexDirection: "row", alignItems: "center" },
  loginText: { fontSize: 13, color: "#666" },
  loginLink: { fontSize: 13, color: "#fff", fontWeight: "700" },
});