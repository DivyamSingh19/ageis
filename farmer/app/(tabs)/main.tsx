import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function AegisScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(buttonTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#000000", "#000000", "#000000"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute inset-0"
      />

      {/* Radial glow spot */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.18,
          left: width * 0.5 - 160,
          width: 320,
          height: 320,
          borderRadius: 160,
          opacity: glowOpacity,
        }}
      >
        <LinearGradient
          colors={["rgba(34,197,94,0.18)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-full"
        />
      </Animated.View>

      {/* Logo center */}
      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          }}
          className="items-center"
        >
          <View className="flex-row items-center">
            <Text className="font-serif text-7xl font-black text-white tracking-tighter">
              {"∧"}
            </Text>
            <Text className="font-serif text-7xl font-light text-white tracking-wide -ml-1">
              egis
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View
        style={{
          opacity: buttonOpacity,
          transform: [{ translateY: buttonTranslateY }],
        }}
        className="px-6 pb-14"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => { }}
          className="flex-row items-center bg-[#111411] rounded-full py-3.5 pl-3.5 pr-6 border border-white/[0.08]"
        >
          {/* Green circle arrow */}
          <View
            className="w-11 h-11 rounded-full bg-green-500 items-center justify-center mr-3.5"
            style={{
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 10,
            }}
          >
            <Text className="text-black text-lg font-bold">→</Text>
          </View>

          <Text className="text-white text-base font-medium flex-1 tracking-wide">
            Get Started
          </Text>

          <Text className="text-white/35 text-base -tracking-widest">»</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}