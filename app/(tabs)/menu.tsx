import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import api from "@/utils/config";

const { width } = Dimensions.get("window");

/* ---------- STATIC HERO BANNERS ---------- */
const HERO_BANNERS = [
  {
    id: "h1",
    title: "Street Starter Pack",
    subtitle: "Complete your fit in one go",
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1400",
  },
  {
    id: "h2",
    title: "Winter Essentials",
    subtitle: "Layered. Warm. Effortless.",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1400",
  },
];

const FALLBACK_CATEGORY =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200";

export default function MenuScreen() {
  /* ---------- STATE ---------- */
  const [categories, setCategories] = useState<any[]>([]);

  /* ---------- ANIMATION ---------- */
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    api.get("/api/categories").then((res) => {
      setCategories(res.data.categories || []);
    });

    Animated.sequence([
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Discover collections & categories
          </Text>
        </View>

        {/* ===== HERO BANNERS ===== */}
        <Animated.View
          style={{
            opacity: bannerAnim,
            transform: [
              {
                translateY: bannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}
        >
          {HERO_BANNERS.map((banner) => (
            <Pressable
              key={banner.id}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => {}}
            >
  <GlassCard style={styles.heroBanner}>
  <View style={styles.heroImageWrapper}>
    <Image
      source={{ uri: banner.image }}
      style={styles.heroImage}
    />

    <LinearGradient
      colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.8)"]}
      style={StyleSheet.absoluteFill}
    />

    <View style={styles.heroContent}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>FEATURED</Text>
      </View>

      <Text style={styles.heroTitle}>{banner.title}</Text>
      <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
    </View>
  </View>
</GlassCard>

            </Pressable>
          ))}
        </Animated.View>

        {/* ===== CATEGORIES GRID ===== */}
        <Animated.View
          style={{
            opacity: categoryAnim,
            transform: [
              {
                translateY: categoryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
              },
            ],
          }}
        >
          <Text style={styles.sectionTitle}>All Categories</Text>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat._id}
                style={({ pressed }) => [
                  styles.categoryCard,
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <Image
                  source={{
                    uri: cat.photo || FALLBACK_CATEGORY,
                  }}
                  style={styles.categoryImage}
                />

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.55)"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName}>
                    {cat.name}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color="#7CFF6B"
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: { marginBottom: 28 },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    fontSize: 13,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  /* ===== HERO BANNER ===== */
  heroBanner: {
    width: "100%",
    height: 210,
    borderRadius: 28,
    overflow: "hidden",
    padding: 0,
    marginBottom: 24,
  },

  heroContent: {
    position: "absolute",
    bottom: 22,
    left: 22,
    right: 22,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },

  heroBadgeText: {
    color: "#7CFF6B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
heroImageWrapper: {
  height: 210,               // 👈 THIS fixes everything
  borderRadius: 28,
  overflow: "hidden",
},

heroImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
  /* ===== CATEGORY GRID ===== */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryCard: {
    width: "48%",
    height: 140,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  categoryOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
