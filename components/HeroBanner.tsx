import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "@/components/GlassCard";
import Animated, {
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const HEIGHT = 220;

/* ===== DATA ===== */
const HERO_BANNERS = [
  {
    id: "1",
    title: "Street",
    subtitle: "Starter Pack",
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200",
  },
  {
    id: "2",
    title: "Winter",
    subtitle: "Layered Fits",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200",
  },
  {
    id: "3",
    title: "Minimal",
    subtitle: "Daily Essentials",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200",
  },
];

export default function MenuHeroCarousel() {
  return (
    <Carousel
      width={width - 32}
      height={HEIGHT}
      data={HERO_BANNERS}
      loop
      autoPlay
      autoPlayInterval={3800}
      scrollAnimationDuration={500}
      panGestureHandlerProps={{
        activeOffsetX: [-10, 10],
      }}
      customAnimation={(value) => {
        "worklet";
        return {
          opacity: interpolate(
            value,
            [-1, 0, 1],
            [0, 1, 0],
            Extrapolate.CLAMP
          ),
        };
      }}
      renderItem={({ item }) => (
        <Pressable>
          <GlassCard style={styles.heroBanner}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <LinearGradient
              colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>FEATURED</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.subtitle}
              </Text>
            </View>
          </GlassCard>
        </Pressable>
      )}
    />
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  heroBanner: {
    borderRadius: 28,
    overflow: "hidden",
    padding: 0,
    
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  content: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: "#7CFF6B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 30,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
});
