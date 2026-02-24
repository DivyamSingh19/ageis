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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  hint?: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const InputField: React.FC<InputFieldProps> = ({
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
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

// ─── Logo Mark ───────────────────────────────────────────────────────────────

const LogoMark: React.FC = () => (
  <View style={styles.logoContainer}>
    {/* Stylised "A" lettermark */}
    <View style={styles.logoMark}>
      <View style={styles.logoLeftLeg} />
      <View style={styles.logoRightLeg} />
      <View style={styles.logoCrossbar} />
    </View>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleSignUp = () => {
    console.log({ firstName, lastName, email, password });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#0d1a0d", "#0a0a0a", "#001a00"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow blob */}
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
          {/* Logo */}
          <LogoMark />

          {/* Title */}
          <Text style={styles.title}>Sign Up</Text>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              {/* Google "G" */}
              <Text style={styles.socialBtnIcon}>G</Text>
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              {/* MetaMask fox emoji stand-in */}
              <Text style={styles.socialBtnIcon}>🦊</Text>
              <Text style={styles.socialBtnText}>Metamask</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form fields */}
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
            placeholder="eg. janedoe@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            placeholder="eg. janedoe@gmail.com"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            hint="Must be at least 8 characters"
          />

          {/* CTA button */}
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
            >
              <LinearGradient
                colors={["#39FF14", "#28cc0d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Login redirect */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  glowBlob: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#004d00",
    opacity: 0.35,
    // React Native doesn't support CSS blur, but the green tint
    // creates the ambient glow effect.
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },

  // ── Logo ────────────────────────────────────────────────────────────────

  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },

  logoMark: {
    width: 44,
    height: 44,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  logoLeftLeg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 4,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 2,
    transform: [{ rotate: "20deg" }, { translateX: 8 }],
  },

  logoRightLeg: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 4,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 2,
    transform: [{ rotate: "-20deg" }, { translateX: -8 }],
  },

  logoCrossbar: {
    position: "absolute",
    top: 18,
    width: 20,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  // ── Title ───────────────────────────────────────────────────────────────

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  // ── Social ──────────────────────────────────────────────────────────────

  socialRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },

  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    borderRadius: 10,
    paddingVertical: 12,
  },

  socialBtnIcon: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },

  socialBtnText: {
    fontSize: 14,
    color: "#e0e0e0",
    fontWeight: "500",
  },

  // ── Divider ─────────────────────────────────────────────────────────────

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2a2a2a",
  },

  dividerText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "400",
  },

  // ── Fields ──────────────────────────────────────────────────────────────

  fieldWrapper: {
    width: "100%",
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    color: "#c0c0c0",
    fontWeight: "500",
    marginBottom: 6,
  },

  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: "#131313",
    overflow: "hidden",
  },

  input: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#fff",
  },

  hint: {
    fontSize: 11,
    color: "#555",
    marginTop: 5,
  },

  // ── CTA ─────────────────────────────────────────────────────────────────

  ctaWrapper: {
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 50,
    overflow: "hidden",
  },

  ctaBtn: {
    borderRadius: 50,
    overflow: "hidden",
  },

  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.3,
  },

  // ── Login redirect ───────────────────────────────────────────────────────

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  loginText: {
    fontSize: 13,
    color: "#666",
  },

  loginLink: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
  },
});