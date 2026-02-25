import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Props {
  navigation?: any;
}

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/farmer/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data.message || "Something went wrong");
        return;
      }

      // Store data.data.token in your auth store here before navigating
      Alert.alert("Success", data.message, [
        { text: "OK", onPress: () => navigation?.navigate("Login") },
      ]);
    } catch (error) {
        console.error(error);
      Alert.alert("Network Error", "Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo placeholder ── */}
        <View style={s.logoWrap}>
          <View style={s.logoBox}>
            {/* Replace with: <Image source={require('../assets/logo.png')} style={s.logoImg} resizeMode="contain" /> */}
            <Text style={s.logoText}>LOGO</Text>
          </View>
        </View>

        {/* ── Heading ── */}
        <Text style={s.heading}>Sign Up</Text>
        <Text style={s.subheading}>Create your farmer account</Text>

        {/* ── First Name ── */}
        <View style={s.fieldWrap}>
          <TextInput
            style={[s.input, errors.firstName ? s.inputError : s.inputNormal]}
            placeholder="eg. Jane"
            placeholderTextColor="#3d5c3d"
            value={firstName}
            onChangeText={(t) => {
              setFirstName(t);
              if (errors.firstName) setErrors((e) => ({ ...e, firstName: "" }));
            }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.firstName ? (
            <Text style={s.errorText}>{errors.firstName}</Text>
          ) : null}
        </View>

        {/* ── Last Name ── */}
        <View style={s.fieldWrap}>
          <TextInput
            style={[s.input, errors.lastName ? s.inputError : s.inputNormal]}
            placeholder="eg. Doe"
            placeholderTextColor="#3d5c3d"
            value={lastName}
            onChangeText={(t) => {
              setLastName(t);
              if (errors.lastName) setErrors((e) => ({ ...e, lastName: "" }));
            }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.lastName ? (
            <Text style={s.errorText}>{errors.lastName}</Text>
          ) : null}
        </View>

        {/* ── Email ── */}
        <View style={s.fieldWrap}>
          <TextInput
            style={[s.input, errors.email ? s.inputError : s.inputNormal]}
            placeholder="eg. janedoe@gmail.com"
            placeholderTextColor="#3d5c3d"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: "" }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {errors.email ? (
            <Text style={s.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* ── Password ── */}
        <View style={s.fieldWrap}>
          <TextInput
            style={[s.input, errors.password ? s.inputError : s.inputNormal]}
            placeholder="Min. 8 characters"
            placeholderTextColor="#3d5c3d"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: "" }));
            }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          {errors.password ? (
            <Text style={s.errorText}>{errors.password}</Text>
          ) : (
            <Text style={s.hintText}>Must be at least 8 characters</Text>
          )}
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[s.btn, loading && s.btnLoading]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0a0f0a" />
          ) : (
            <Text style={s.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* ── Login link ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate("Login")} activeOpacity={0.7}>
            <Text style={s.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0f0a",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#1a2a1a",
    borderWidth: 1,
    borderColor: "rgba(57,255,20,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: 40,
    height: 40,
  },
  logoText: {
    color: "#39ff14",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
  },
  heading: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subheading: {
    color: "#6b7f6b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#131a13",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#ffffff",
    fontSize: 14,
  },
  inputNormal: {
    borderColor: "#2a3a2a",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    color: "#3d5c3d",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  btn: {
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39ff14",
  },
  btnLoading: {
    backgroundColor: "#2aad0e",
  },
  btnText: {
    color: "#0a0f0a",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6b7f6b",
    fontSize: 14,
  },
  footerLink: {
    color: "#39ff14",
    fontSize: 14,
    fontWeight: "600",
  },
});