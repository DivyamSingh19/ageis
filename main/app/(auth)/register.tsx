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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Sub-components ──────────────────────────────────────────────────────────

const InputField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  hint?: string;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  hint,
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
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  };

const Separator: React.FC = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <Text style={styles.separatorText}>Or</Text>
    <View style={styles.separatorLine} />
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const handleSignUp = async () => {
    if (!firstName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data.message || "Something went wrong.");
        return;
      }

      await register(data.token, data.data, data.data.onboardingComplete);
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/ageis_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Sign Up</Text>

          <Separator />

          <InputField
            label="First Name"
            placeholder="eg. Jane"
            value={firstName}
            onChangeText={setFirstName}
          />
          <InputField
            label="Last Name"
            placeholder="eg. Doe"
            value={lastName}
            onChangeText={setLastName}
          />
          <InputField
            label="Email"
            placeholder="eg. jane@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            placeholder="eg. jane@example.com"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            hint="Must be at least 8 characters"
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
              onPress={handleSignUp}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <LinearGradient
                colors={["#FFC000", "#FFD700"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.ctaText}>Sign up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  scroll: {
    flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingVertical: 64,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
    tintColor: "#fff",
  },
  title: { fontSize: 32, fontWeight: "800", color: "#FFC000", marginBottom: 30, letterSpacing: 0.5 },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2d2d2d",
  },
  separatorText: {
    marginHorizontal: 15,
    color: "#888",
    fontSize: 14,
  },
  fieldWrapper: { width: "100%", marginBottom: 16 },
  label: { fontSize: 13, color: "#fff", fontWeight: "600", marginBottom: 8 },
  inputContainer: { borderWidth: 1, borderRadius: 12, backgroundColor: "#1a1a1a", overflow: "hidden" },
  input: { paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: "#fff" },
  hint: { fontSize: 12, color: "#888", marginTop: 5, marginLeft: 2 },
  ctaWrapper: { width: "100%", marginTop: 10, marginBottom: 20, borderRadius: 25, overflow: "hidden" },
  ctaBtn: { borderRadius: 25, overflow: "hidden" },
  ctaGradient: { paddingVertical: 18, alignItems: "center", justifyContent: "center", borderRadius: 25 },
  ctaText: { fontSize: 18, fontWeight: "700", color: "#000", letterSpacing: 0.3 },
  loginRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  loginText: { fontSize: 14, color: "#888" },
  loginLink: { fontSize: 14, color: "#FFC000", fontWeight: "700" },
});
