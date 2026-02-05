import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

export default function Screen({ children, style }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
        },
        style,
      ]}
    >
      {children}

      {/* 🌫️ BOTTOM GRADIENT FADE */}
      {/* <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(86, 255, 8, 0)",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.85)",
        ]}
        locations={[0, 0.6, 1]}
        style={styles.bottomFade}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
     position: "relative",
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140, // 👈 perfect with tab bar
  },
});
