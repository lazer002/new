import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import RenderHTML from "react-native-render-html";

import Screen from "@/components/Screen";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import api from "@/utils/config";

const { width, height } = Dimensions.get("window");

const IMAGE_WIDTH = width * 0.92;
const IMAGE_HEIGHT = Math.min(height * 0.45, 420); // ✅ responsive cap

export default function ProductScreen() {
  const router = useRouter();
  const { id, image, x, y, w, h } = useLocalSearchParams<any>();

  const { add } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const imageRef = useRef<FlatList>(null);

  /* ================= HERO TRANSITION ================= */
  const animX = useSharedValue(Number(x));
  const animY = useSharedValue(Number(y));
  const animW = useSharedValue(Number(w));
  const animH = useSharedValue(Number(h));
  const animRadius = useSharedValue(12);

  const uiOpacity = useSharedValue(0);
  const uiTranslate = useSharedValue(16);

  const heroStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: animX.value,
    top: animY.value,
    width: animW.value,
    height: animH.value,
    borderRadius: animRadius.value,
    overflow: "hidden",
    zIndex:0,
    elevation: 2
  }));

  const uiStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
    transform: [{ translateY: uiTranslate.value }],
  }));

  useEffect(() => {
    const D = 1200;

    animX.value = withTiming((width - IMAGE_WIDTH) / 2, {
      duration: D,
      easing: Easing.out(Easing.cubic),
    });
    animY.value = withTiming(90, {
      duration: D,
      easing: Easing.out(Easing.cubic),
    });
    animW.value = withTiming(IMAGE_WIDTH, {
      duration: D,
      easing: Easing.out(Easing.cubic),
    });
    animH.value = withTiming(IMAGE_HEIGHT, {
      duration: D,
      easing: Easing.out(Easing.cubic),
    });
    animRadius.value = withTiming(22, { duration: D });

    uiOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    uiTranslate.value = withDelay(250, withTiming(0, { duration: 400 }));
  }, []);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
    })();
  }, [id]);

  if (!product) return null;

  const images = product.images?.length ? product.images : [image];
  const sizes = product.inventory ? Object.keys(product.inventory) : [];

  return (
    <Screen style={{ backgroundColor: "#f4f4f4" }}>
      {/* ================= HERO IMAGE ================= */}
      <Animated.View style={[styles.imageWrapper, heroStyle]}>
        <FlatList
          ref={imageRef}
          data={images}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / IMAGE_WIDTH
            );
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.bigImage} />
          )}
        />

        {/* DOTS */}
        <View style={styles.dots}>
          {images.map((_: any, i: number) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* ================= TOP BAR ================= */}
      <Animated.View style={[styles.topBar, uiStyle]}>
        <Pressable style={styles.circleBtn} onPress={router.back}>
          <Ionicons name="arrow-back" size={20} />
        </Pressable>

        <Text style={styles.headerTitle}>Details</Text>

        <Pressable
          style={styles.circleBtn}
          onPress={() =>
            isInWishlist(product._id)
              ? removeFromWishlist(product._id)
              : addToWishlist(product)
          }
        >
          <Ionicons
            name={isInWishlist(product._id) ? "heart" : "heart-outline"}
            size={20}
            color={isInWishlist(product._id) ? "#c00000" : "#000"}
          />
        </Pressable>
      </Animated.View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Spacer for hero */}
        <View style={{ height: IMAGE_HEIGHT + 60 }} />

        <Animated.View style={[styles.card, uiStyle]} pointerEvents="box-none">
          {/* THUMBNAILS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbRow}
          >
            {images.map((img: string, index: number) => (
              <Pressable
                key={index}
                onPress={() => {
                  setActiveIndex(index);
                  imageRef.current?.scrollToIndex({
                    index,
                    animated: true,
                  });
                }}
                style={[
                  styles.thumb,
                  activeIndex === index && styles.thumbActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </Pressable>
            ))}
          </ScrollView>

          {/* TITLE */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.category}>Outerwear Men</Text>
            </View>
            <Text style={styles.price}>₹{product.price}</Text>
          </View>

          {/* SIZES */}
          <View style={styles.sizeHeader}>
            <Text style={styles.sizeTitle}>Select Size</Text>
            <Text style={styles.sizeChart}>Size Chart</Text>
          </View>

          <View style={styles.sizes}>
            {sizes.map((size) => {
              const disabled = product.inventory[size] <= 0;
              return (
                <Pressable
                  key={size}
                  disabled={disabled}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizePill,
                    selectedSize === size && styles.sizeActive,
                    disabled && styles.sizeDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && { color: "#fff" },
                      disabled && styles.sizeTextDisabled,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* DESCRIPTION */}
          <RenderHTML
            contentWidth={width}
            source={{ html: product.description }}
          />
        </Animated.View>
      </ScrollView>

      {/* ================= BOTTOM BAR ================= */}
      <Animated.View style={[styles.bottomBar, uiStyle]}>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={20} />
        </Pressable>

        <Pressable
          style={styles.cartBtn}
          onPress={() => {
            if (!selectedSize) {
              alert("Please select a size");
              return;
            }
            add(product._id, selectedSize);
          }}
        >
          <Text style={styles.cartText}>Add To Cart</Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  imageWrapper: {
    backgroundColor: "#eee",
  },
  bigImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  dots: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    width: 14,
    backgroundColor: "#34C759",
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },


  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    zIndex: 2,
     elevation: 1
  },
  thumbRow: {
    marginBottom: 16,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eee",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbActive: {
    borderWidth: 2,
    borderColor: "#34C759",
  },
  thumbImg: {
    width: "80%",
    height: "80%",
    borderRadius: 28,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
  },
  category: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  sizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  sizeTitle: {
    fontWeight: "600",
  },
  sizeChart: {
    color: "#34C759",
    fontWeight: "600",
  },
  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  sizePill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeActive: {
    backgroundColor: "#000",
  },
  sizeDisabled: {
    opacity: 0.4,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sizeTextDisabled: {
    color: "#999",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: width,
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 12,
    zIndex: 4,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  cartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
