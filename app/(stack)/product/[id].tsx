import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";

import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import api from "@/utils/config";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const { width, height } = Dimensions.get("window");

export default function ProductScreen() {
  const { id, image, x, y, w, h } = useLocalSearchParams<{
    id: string;
    image: string;
    x: string;
    y: string;
    w: string;
    h: string;
  }>();

  const { add } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  /* ---------- SHARED VALUES ---------- */
  const animX = useSharedValue(Number(x));
  const animY = useSharedValue(Number(y));
  const animW = useSharedValue(Number(w));
  const animH = useSharedValue(Number(h));
  const animRadius = useSharedValue(Number(w) / 2);
  const overlayOpacity = useSharedValue(0);

  /* ---------- HERO ANIMATION ---------- */
  const heroStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: animX.value,
    top: animY.value,
    width: animW.value,
    height: animH.value,
    borderRadius: animRadius.value,
    zIndex: 20,
  }));

  useEffect(() => {
    /* animate hero */
    animX.value = withTiming(0, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });
    animY.value = withTiming(0, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });
    animW.value = withTiming(width, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });
    animH.value = withTiming(height * 0.6, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });
    animRadius.value = withTiming(0, { duration: 2500 });

    overlayOpacity.value = withTiming(
      1,
      { duration: 1200 },
      () => runOnJS(setShowContent)(true)
    );
  }, []);

  /* ---------- LOAD PRODUCT ---------- */
  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);

      if (res.data?.category) {
        const r = await api.get("/api/products", {
          params: { category: res.data.category },
        });
        setRelated(r.data.items.filter((p: any) => p._id !== id));
      }
    })();
  }, [id]);

  /* ---------- OVERLAY ---------- */
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* ================= HERO IMAGE ================= */}
      <Animated.Image
        source={{ uri: image }}
        style={[styles.heroImage, heroStyle]}
      />

      <Animated.View style={[styles.fadeOverlay, overlayStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ================= CONTENT ================= */}
      {showContent && product && (
        <Screen>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.price}>₹{product.price}</Text>

              {/* SIZES */}
              {product.inventory && (
                <>
                  <Text style={styles.sectionLabel}>Select Size</Text>
                  <View style={styles.sizes}>
                    {Object.entries(product.inventory).map(
                      ([size, qty]: any) => (
                        <Pressable
                          key={size}
                          disabled={qty === 0}
                          onPress={() => setSelectedSize(size)}
                          style={[
                            styles.sizePill,
                            selectedSize === size &&
                              styles.sizeActive,
                            qty === 0 && styles.sizeDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sizeText,
                              selectedSize === size && {
                                color: "#000",
                              },
                            ]}
                          >
                            {size}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </>
              )}

              {/* CTA */}
              <Pressable
                disabled={!selectedSize}
                onPress={() =>
                  add(product._id, selectedSize)
                }
                style={[
                  styles.cta,
                  !selectedSize && { opacity: 0.5 },
                ]}
              >
                <Ionicons
                  name="bag-outline"
                  size={18}
                  color="#000"
                />
                <Text style={styles.ctaText}>
                  Add to Cart
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Screen>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  heroImage: {
    resizeMode: "cover",
  },
  fadeOverlay: {
    position: "absolute",
    width,
    height: height * 0.6,
    zIndex: 21,
  },
  content: {
    paddingTop: height * 0.62,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  price: {
    color: "#7CFF6B",
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 6,
  },
  sectionLabel: {
    color: "#fff",
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 12,
  },
  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizePill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  sizeActive: {
    backgroundColor: "#7CFF6B",
  },
  sizeDisabled: {
    opacity: 0.4,
  },
  sizeText: {
    color: "#fff",
    fontWeight: "600",
  },
  cta: {
    marginTop: 20,
    backgroundColor: "#7CFF6B",
    paddingVertical: 16,
    borderRadius: 26,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#000",
    fontWeight: "800",
  },
});
