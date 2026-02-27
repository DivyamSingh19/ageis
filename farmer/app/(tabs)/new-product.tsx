import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/auth-context";

// ─── Mock icons (replace with lucide-react-native or @expo/vector-icons) ──────
const Icon = ({ name, size = 16, color = "#13EC13" }: { name: string; size?: number; color?: string }) => (
  <Text style={{ fontSize: size, color }}>{
    name === "leaf" ? "🌿" :
      name === "calendar" ? "📅" :
        name === "pin" ? "📍" :
          name === "gps" ? "🎯" :
            name === "shield" ? "🛡️" :
              name === "image" ? "🖼️" :
                name === "tag" ? "🏷️" :
                  name === "back" ? "‹" :
                    name === "plus" ? "＋" :
                      name === "x" ? "✕" : "•"
  }</Text>
);

// ─── Category options ─────────────────────────────────────────────────────────
const CATEGORIES = ["Grains", "Vegetables", "Fruits", "Legumes", "Spices", "Dairy", "Other"];

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ active, done }: { active?: boolean; done?: boolean }) => (
  <View
    style={{
      width: active ? 28 : 10,
      height: 4,
      borderRadius: 2,
      backgroundColor: done || active ? "#13EC13" : "#2d2d2d",
      marginHorizontal: 3,
    }}
  />
);

// ─── Input wrapper ────────────────────────────────────────────────────────────
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
        color: "#6b7280",
        marginBottom: 8,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
    {children}
  </View>
);

const inputStyle = {
  backgroundColor: "#111827",
  borderWidth: 1,
  borderColor: "#1f2937",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: "#f9fafb",
  fontSize: 15,
  flexDirection: "row" as const,
  alignItems: "center" as const,
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NewProduceScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    productionDate: "",
    category: "",
    farmLocation: "",
    farmerId: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const mockPickImage = () => {
    // Replace with: ImagePicker.launchImageLibraryAsync(...)
    const mockUri = `https://picsum.photos/seed/${Date.now()}/200/200`;
    if (images.length < 5) setImages((p) => [...p, mockUri]);
  };

  const removeImage = (idx: number) => setImages((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Not signed in", "Please log in again before creating a product.");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !form.price || !form.productionDate) {
      Alert.alert("Missing fields", "Please fill in name, description, price and production date.");
      return;
    }

    if (!form.category) {
      Alert.alert("Category required", "Please select a category for your produce.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Images required", "Please add at least one product image.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(form.price));
      formData.append("productionDate", form.productionDate);
      formData.append("category", form.category);
      formData.append("farmLocation", form.farmLocation);
      formData.append("farmerId", user.id);

      images.forEach((uri, index) => {
        formData.append(
          "files",
          {
            uri,
            name: `product-image-${index}.jpg`,
            type: "image/jpeg",
          } as any
        );
      });

      const response = await fetch(`${API_URL}/api/farmer/products`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        Alert.alert(
          "Failed to create product",
          (data && (data.message as string)) || "Something went wrong while saving your produce."
        );
        return;
      }

      Alert.alert("Success", "Your product has been created.", [
        {
          text: "OK",
          onPress: () => {
            navigation?.goBack?.();
          },
        },
      ]);
    } catch (error) {
      console.error("[NewProduceScreen.handleSubmit]", error);
      Alert.alert("Network error", "Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "#111827",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#1f2937",
            }}
          >
            <Text style={{ color: "#f9fafb", fontSize: 22, lineHeight: 26 }}>‹</Text>
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              color: "#f9fafb",
              fontSize: 17,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            New Produce
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Step Dots ── */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
          <StepDot active />
          <StepDot />
          <StepDot />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Crop Name ── */}
          <Field label="Crop Name">
            <View style={inputStyle}>
              <Icon name="leaf" size={16} />
              <TextInput
                placeholder="e.g., Organic Arabica Coffee"
                placeholderTextColor="#374151"
                value={form.name}
                onChangeText={(v) => set("name", v)}
                style={{ flex: 1, color: "#f9fafb", fontSize: 15, marginLeft: 10 }}
              />
            </View>
          </Field>

          {/* ── Description ── */}
          <Field label="Description">
            <TextInput
              placeholder="Describe your produce..."
              placeholderTextColor="#374151"
              value={form.description}
              onChangeText={(v) => set("description", v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                ...inputStyle,
                height: 88,
                paddingTop: 14,
              }}
            />
          </Field>

          {/* ── Price + Category (side by side) ── */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  color: "#6b7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Price ($)
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor="#374151"
                value={form.price}
                onChangeText={(v) => set("price", v)}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: "#1f2937",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: "#f9fafb",
                  fontSize: 15,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  color: "#6b7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker((p) => !p)}
                style={{
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: showCategoryPicker ? "#13EC13" : "#1f2937",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: selectedCategory ? "#f9fafb" : "#374151",
                    fontSize: 15,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {selectedCategory || "Select"}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  {showCategoryPicker ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Category Picker Dropdown ── */}
          {showCategoryPicker && (
            <View
              style={{
                backgroundColor: "#111827",
                borderWidth: 1,
                borderColor: "#13EC13",
                borderRadius: 14,
                marginTop: -12,
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              {CATEGORIES.map((cat, i) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    set("category", cat);
                    setShowCategoryPicker(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderBottomWidth: i < CATEGORIES.length - 1 ? 1 : 0,
                    borderBottomColor: "#1f2937",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#f9fafb", fontSize: 15 }}>{cat}</Text>
                  {selectedCategory === cat && (
                    <Text style={{ color: "#13EC13", fontSize: 14 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Production Date ── */}
          <Field label="Production Date">
            <View style={inputStyle}>
              <Icon name="calendar" size={16} />
              <TextInput
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#374151"
                value={form.productionDate}
                onChangeText={(v) => set("productionDate", v)}
                style={{ flex: 1, color: "#f9fafb", fontSize: 15, marginLeft: 10 }}
              />
            </View>
          </Field>

          {/* ── Farm Location ── */}
          <Field label="Farm Location">
            <View style={{ ...inputStyle, marginBottom: 10 }}>
              <Icon name="pin" size={16} />
              <TextInput
                placeholder="location"
                placeholderTextColor="#374151"
                value={form.farmLocation}
                onChangeText={(v) => set("farmLocation", v)}
                style={{ flex: 1, color: "#f9fafb", fontSize: 15, marginLeft: 10 }}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                // Replace with: Location.getCurrentPositionAsync(...)
                set("farmLocation", "6.5244° N, 3.3792° E");
              }}
              style={{
                backgroundColor: "#052e16",
                borderWidth: 1,
                borderColor: "#166534",
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Icon name="gps" size={16} />
              <Text style={{ color: "#13EC13", fontWeight: "700", fontSize: 15 }}>
                Get Current GPS
              </Text>
            </TouchableOpacity>
          </Field>

          {/* ── Product Images ── */}
          <Field label="Product Images">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
            >
              {images.map((uri, idx) => (
                <View key={uri + idx} style={{ position: "relative" }}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#13EC13",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#ef4444",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity
                  onPress={mockPickImage}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: "#1f2937",
                    borderStyle: "dashed",
                    backgroundColor: "#111827",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Text style={{ color: "#13EC13", fontSize: 22 }}>＋</Text>
                  <Text style={{ color: "#4b5563", fontSize: 11 }}>Add photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <Text style={{ color: "#374151", fontSize: 12, marginTop: 8 }}>
              Upload up to 5 product images
            </Text>
          </Field>

          {/* ── Blockchain Notice ── */}
          <View
            style={{
              backgroundColor: "#052e16",
              borderWidth: 1,
              borderColor: "#166534",
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <Icon name="shield" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#13EC13", fontWeight: "700", fontSize: 14, marginBottom: 4 }}>
                Blockchain Verification
              </Text>
              <Text style={{ color: "#4b7a5e", fontSize: 13, lineHeight: 19 }}>
                This data will be encrypted and recorded on-chain for transparent supply chain tracking.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Next Button (floating) ── */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#0a0a0a",
            paddingBottom: 40,
            marginBottom: 100,
            borderTopWidth: 1,
            borderTopColor: "#111827",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#0a5d2c" : "#13EC13",
              borderRadius: 16,
              paddingVertical: 17,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#13EC13",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 }}>
                Publish Produce
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}