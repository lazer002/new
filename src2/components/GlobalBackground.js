// src/components/GlobalBackground.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function GlobalBackground() {
  const drift = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: { x: -30, y: -20 },
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: { x: 20, y: 10 },
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: { x: 0, y: 0 },
          duration: 20000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* DARK BASE */}
      <View style={styles.darkBase} />

      {/* DRIFTING GLOW GROUP */}
      <Animated.View style={{ transform: drift.getTranslateTransform() }}>
        <View style={styles.glowFar} />
        <View style={styles.glowMid} />
        <View style={styles.glowNear} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  darkBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B0B0B",
  },

  glowFar: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: "#39FF14",
    opacity: 0.06,
    top: "5%",
    left: "-55%",
  },

  glowMid: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: "#39FF14",
    opacity: 0.12,
    top: "12%",
    left: "-40%",
  },

  glowNear: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#39FF14",
    opacity: 0.22,
    top: "22%",
    left: "-22%",
  },
});
