// GlassSurface.js
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

export default function GlassSurface({ children, style }) {
  if (Platform.OS === "ios") {
    // REAL GLASS (iOS)
    return (
      <View style={[styles.wrapper, style]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // ANDROID FALLBACK (FAKE GLASS)
  return (
    <View style={[styles.fakeGlass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  content: {
    position: "relative",
  },
  fakeGlass: {
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
