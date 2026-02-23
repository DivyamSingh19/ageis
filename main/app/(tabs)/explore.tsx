import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

// If using NativeWind v4, make sure tailwind.config.js includes this file.
// Run: npx tailwindcss init  and set content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]

const { width } = Dimensions.get("window");

const SLIDER_TRACK_WIDTH = width - 48; // 24px padding each side
const THUMB_SIZE = 60;
const SLIDER_HEIGHT = 68;
const MAX_SLIDE = SLIDER_TRACK_WIDTH - THUMB_SIZE - 8; // 8px right padding

export default function LandingScreen() {
  const pan = useRef(new Animated.Value(0)).current;
  const [completed, setCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  
  const thumbOpacity = pan.interpolate({
    inputRange: [0, MAX_SLIDE],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  const arrowOpacity = pan.interpolate({
    inputRange: [0, MAX_SLIDE * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const textOpacity = pan.interpolate({
    inputRange: [0, MAX_SLIDE * 0.4, MAX_SLIDE],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  const trackFillWidth = pan.interpolate({
    inputRange: [0, MAX_SLIDE],
    outputRange: [THUMB_SIZE + 8, SLIDER_TRACK_WIDTH],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset((pan as any)._value);
        pan.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, MAX_SLIDE));
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        setIsDragging(false);
        const currentValue = (pan as any)._value;

        if (currentValue >= MAX_SLIDE * 0.85) {
          // Snap to end and navigate
          Animated.spring(pan, {
            toValue: MAX_SLIDE,
            useNativeDriver: false,
            tension: 60,
            friction: 8,
          }).start(() => {
            setCompleted(true);
            // Navigate to next screen — adjust route as needed
            // router.push("/home");
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            tension: 60,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Background gradient glow */}
      <LinearGradient
        colors={["#1a4a1a", "#0d2b0d", "#000000"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute inset-0"
      />

      {/* Radial-like green glow overlay (simulated with a circle) */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["rgba(34,120,34,0.55)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
          className="absolute top-0 left-0 right-0"
          style={{ height: "55%" }}
        />
      </View>

      {/* Logo area */}
      <View className="flex-1 items-center justify-center" style={{ paddingBottom: 120 }}>
        {/*
          Replace the placeholder below with your actual logo:
          <Image source={require("../assets/logo.png")} style={{ width: 220, height: 80 }} resizeMode="contain" />
        */}
        <View className="items-center justify-center">
          {/* Placeholder logo — swap with <Image> */}
          <Text
            style={{
              fontFamily: "Georgia", // swap for your branded font
              fontSize: 56,
              fontWeight: "300",
              color: "rgba(230,230,220,0.92)",
              letterSpacing: -1,
            }}
          >
            ∧egis
          </Text>
        </View>
      </View>

      {/* Slider bar */}
      <View className="px-6 pb-10">
        <View
          style={{
            height: SLIDER_HEIGHT,
            borderRadius: SLIDER_HEIGHT / 2,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            position: "relative",
            justifyContent: "center",
          }}
        >
          {/* Green fill track */}
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: trackFillWidth,
              borderRadius: SLIDER_HEIGHT / 2,
              backgroundColor: "#22c55e",
            }}
          />

          {/* "Get Started" text — centered in track */}
          <Animated.Text
            style={{
              position: "absolute",
              width: "100%",
              textAlign: "center",
              color: "rgba(255,255,255,0.85)",
              fontSize: 16,
              fontWeight: "600",
              letterSpacing: 0.3,
              opacity: textOpacity,
            }}
          >
            Get Started
          </Animated.Text>

          {/* Chevrons — right side hint */}
          <Animated.Text
            style={{
              position: "absolute",
              right: 20,
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
              fontWeight: "700",
              letterSpacing: 2,
              opacity: textOpacity,
            }}
          >
            ›››
          </Animated.Text>

          {/* Draggable thumb */}
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              position: "absolute",
              left: 4,
              transform: [{ translateX: pan }],
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: "#16a34a",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isDragging ? 0.9 : 0.5,
              shadowRadius: isDragging ? 16 : 8,
              elevation: 8,
              opacity: thumbOpacity,
            }}
          >
            <Animated.Text
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: "bold",
                opacity: arrowOpacity,
              }}
            >
              →
            </Animated.Text>
            {/* Checkmark when complete */}
            {completed && (
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>✓</Text>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}