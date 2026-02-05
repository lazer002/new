import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";

export default function GlassProductCard({
  image,
  title,
  price,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardOuter}
    >
      <View style={styles.cardWrapper}>
        {/* 🧊 GLASS DIFFUSION */}
        <BlurView
          intensity={35}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />

        {/* 📦 CONTENT */}
        <View style={styles.content}>
          <Image source={image} style={styles.image} />

          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          <Text style={styles.price}>{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  cardOuter: {
    width: "48%",
    marginBottom: 16,
  },

  cardWrapper: {
    borderRadius: 22,
    overflow: "hidden", // 🔑 REQUIRED FOR ANDROID
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  content: {
    padding: 14,
  },

  image: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
    borderRadius: 14,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  price: {
    marginTop: 4,
    color: "#39FF14",
    fontSize: 13,
    fontWeight: "700",
  },
});
