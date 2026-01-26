import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function GlassCard({ children, style }: any) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={40} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    overflow: "hidden", // 🔥 THIS IS THE KEY FIX
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  blur: {
    // padding: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
