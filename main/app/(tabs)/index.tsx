import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Data Helpers ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Vegetables", label: "🥦 Veggie" },
  { id: "Fruits", label: "🍎 Fruits" },
  { id: "Grains", label: "🌾 Grains" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
      <Image
        source={require("../../assets/images/ageis_logo.png")}
        style={{ width: 40, height: 40, tintColor: "#fff" }}
        resizeMode="contain"
      />
      <Text style={{ color: "#FFC000", fontSize: 22, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" }}>
        Aegis
      </Text>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFC000", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

function SearchBar({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 16, gap: 8 }}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#1a1a1a", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: "rgba(255,255,255,0.4)", marginHorizontal: 12, fontSize: 16 }}>🔍</Text>
        <TextInput
          placeholder="Search farm products..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={{ flex: 1, color: "#fff", fontSize: 14 }}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

function HeroBanner() {
  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: "hidden" }}>
      <View style={{ height: 144, justifyContent: "flex-end", padding: 16, backgroundColor: "#000" }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 192, 0, 0.2)", borderWidth: 1, borderColor: "rgba(255, 192, 0, 0.4)", borderRadius: 100, paddingHorizontal: 12, paddingVertical: 2 }}>
            <Text style={{ color: "#FFC000", fontSize: 10, marginRight: 4 }}>🛡️</Text>
            <Text style={{ color: "#FFC000", fontSize: 10, fontWeight: "600", letterSpacing: 1.5 }}>
              BLOCKCHAIN TRACED
            </Text>
          </View>
        </View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", lineHeight: 28 }}>
          AI-Verified Freshness{"\n"}In Every Harvest
        </Text>
      </View>
    </View>
  );
}

function ProductCard({ item }: { item: any }) {
  const router = useRouter();
  const imageUri = item.pinataImageUrl?.[0];

  return (
    <TouchableOpacity
      className="mr-4 rounded-2xl overflow-hidden"
      style={{ width: 160 }}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-40 items-center justify-center" style={{ backgroundColor: "#111" }}>
        {item.verified && (
          <View className="absolute top-3 left-3 flex-row items-center rounded-full px-2 py-1 bg-black/70">
            <Text style={{ color: "#FFC000", fontSize: 8, marginRight: 4 }}>⚡</Text>
            <Text style={{ color: "#fff", fontSize: 8, fontWeight: "bold" }}>AI SCORE 98</Text>
          </View>
        )}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Text style={{ fontSize: 48 }}>🌾</Text>
        )}
      </View>
      <View className="p-3" style={{ backgroundColor: "#000" }}>
        <Text numberOfLines={1} className="text-white text-sm font-semibold leading-5 mb-1">
          {item.name}
        </Text>
        <Text style={{ color: "#888", fontSize: 10, marginBottom: 4 }}>{item.farmer?.name}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-sm font-bold">
            Rs {item.price}
            <Text className="text-white/50 text-[10px]"> /kg</Text>
          </Text>
          <TouchableOpacity
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: "#FFC000" }}
          >
            <Text className="text-black text-base font-bold leading-none">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ArrivalCard({ item }: { item: any }) {
  const router = useRouter();
  const imageUri = item.pinataImageUrl?.[0];

  return (
    <TouchableOpacity
      className="flex-row items-center mx-5 mb-3 rounded-2xl p-4"
      style={{ backgroundColor: "#111" }}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="w-16 h-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: "#1a1a1a" }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%", borderRadius: 12 }} />
        ) : (
          <Text style={{ fontSize: 32 }}>🥬</Text>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text style={{ color: "#FFC000", fontSize: 10, opacity: 0.7, marginRight: 4 }}>⛓</Text>
          <Text style={{ color: "#FFC000", fontSize: 10, opacity: 0.7, fontWeight: "500", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}>
            HASH: 0x{item.id.slice(0, 6)}...
          </Text>
        </View>
        <Text numberOfLines={1} className="text-white text-base font-bold mb-0.5">{item.name}</Text>
        <Text className="text-white/50 text-[10px] mb-2">{item.category}</Text>
        <Text className="text-white text-sm font-bold">Rs {item.price}</Text>
      </View>
      <TouchableOpacity
        className="px-4 py-2 rounded-xl"
        style={{ backgroundColor: "#FFC000" }}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Text style={{ color: "#000", fontSize: 10, fontWeight: "bold" }}>Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function AegisHomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Debounce search input by 400ms to avoid hammering the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchDebounced]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query params — backend `discover` controller handles category="all" gracefully
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(activeCategory !== "all" && { category: activeCategory }),
        ...(searchDebounced.trim() && { search: searchDebounced.trim() }),
      });

      const endpoint = `${API_URL}/api/farmer/products/discover?${params.toString()}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.error("[fetchProducts] Failed:", response.status, await response.text());
        return;
      }

      const data = await response.json();
      setProducts(data.products ?? []);
    } catch (error) {
      console.error("[fetchProducts] Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifiedProducts = products.filter((p) => p.verified);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Header />

        {/* Search is now controlled — triggers a re-fetch via debounce */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={{
                borderWidth: 1,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 100,
                marginRight: 8,
                backgroundColor: activeCategory === cat.id ? "#FFC000" : "#111",
                borderColor: activeCategory === cat.id ? "#FFC000" : "#333",
              }}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeCategory === cat.id ? "text-black" : "text-white"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <HeroBanner />

        {/* Recommended — only verified products */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text className="text-white text-lg font-bold">Recommended for You</Text>
            <TouchableOpacity>
              <Text style={{ color: "#FFC000", fontSize: 14, fontWeight: "600" }}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#FFC000" style={{ marginVertical: 40 }} />
          ) : verifiedProducts.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginVertical: 24 }}>
              No verified products found
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {verifiedProducts.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* New Arrivals — all products */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold px-5 mb-4">New Arrivals</Text>
          {loading ? (
            <ActivityIndicator color="#FFC000" style={{ marginVertical: 40 }} />
          ) : products.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginVertical: 24 }}>
              No products found
            </Text>
          ) : (
            products.map((item) => <ArrivalCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}