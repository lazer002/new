import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import api from "@/utils/config";
import { useRouter } from "expo-router";

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
const { width, height } = Dimensions.get("window");

/* helpers */
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const CIRCLE_SIZE = clamp(width * 0.62, 260, 360);
const ITEM_HEIGHT = CIRCLE_SIZE + clamp(height * 0.02, 80, 220);
const HEADER_COLLAPSE = height * 0.22;

/* ───────────────────────────────────────────── */
/* PRODUCT ROW (EXTRACTED TO FIX HOOK RULES) */
/* ───────────────────────────────────────────── */

function ProductRow({
  item,
  index,
  scrollY,
}: {
  item: any;
  index: number;
 scrollY: SharedValue<number>;
}) {
  const router = useRouter();
  const firstWord = item.title?.split(" ")[0] || "";
  const inputRange = [
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1) * ITEM_HEIGHT,
  ];

  const textStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          inputRange,
          [0.5, 1.2, 0.5],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    ),
  }));
    const imageRef = useRef<View>(null);
  return (
    <View style={styles.itemRow}>
      {/* LEFT TEXT */}
      <View style={styles.textColumn}>
        <Animated.View
          style={[
            {
              width: 60,
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            },
            textStyle,
          ]}
        >
          <View style={{ transform: [{ rotate: "-90deg" }] }}>
            <Text style={styles.verticalText}>
              {firstWord.toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* RIGHT IMAGE */}
      <View style={styles.imageColumn}>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>


<View style={styles.imageCircle}>
  <Pressable
    style={StyleSheet.absoluteFill}
    onPress={() => {
      imageRef.current?.measureInWindow((x, y, w, h) => {
        router.push({
          pathname: "/product/[id]",
          params: {
            id: item._id,
            image: item.images?.[0],
            x,
            y,
            w,
            h,
          },
        });
      });
    }}
  >
    <View
      ref={imageRef}
      collapsable={false}
      style={StyleSheet.absoluteFill}
    >
      <Image
        source={{ uri: item.images?.[0] }}
        style={styles.productImage}
      />
    </View>
  </Pressable>

  <Text style={styles.productName}>{item.title}</Text>
  <View style={styles.arrowBtn}>
    <Ionicons name="arrow-forward" size={18} color="#fff" />
  </View>
</View>




        <Pressable style={styles.wishlistBtn}>
          <Ionicons name="heart" size={26} color="#c00000" />
        </Pressable>
      </View>
    </View>
  );
}

/* ───────────────────────────────────────────── */
/* HOME SCREEN */
/* ───────────────────────────────────────────── */

export default function Home() {
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const headerHeight = useRef(0);

  const scrollY = useSharedValue(0);

  useEffect(() => {
    api.get("/api/categories").then((res) =>
      setCategories(res.data.categories || [])
    );
    api.get("/api/products").then((res) =>
      setProducts(res.data.items || [])
    );
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_COLLAPSE],
          [0, -HEADER_COLLAPSE],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [HEADER_COLLAPSE * 8, HEADER_COLLAPSE * 9],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  const categoryStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_COLLAPSE * 10],
          [0, -20],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <Screen style={styles.screen}>
      <Animated.FlatList
        data={products}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.View
            onLayout={(e) => {
              headerHeight.current = e.nativeEvent.layout.height;
            }}
            style={headerStyle}
          >
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <Pressable style={styles.iconBtn}>
                <Ionicons name="menu-outline" size={32} />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={32} />
              </Pressable>
            </View>

            {/* HERO TITLE */}
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroTitleMain}>Beauty</Text>
              <Text style={styles.heroTitleSub}>is the key</Text>
              <View style={styles.heroLine} />
            </View>

            {/* CATEGORY HALO */}
            <Animated.View
              style={[styles.categoryHaloWrap, categoryStyle]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {categories.map((cat) => (
                  <View key={cat._id} style={styles.haloItem}>
                    <View style={styles.haloCircle}>
                      <Image
                        source={{ uri: cat.photo }}
                        style={styles.haloImage}
                      />
                    </View>
                    <Text style={styles.haloLabel}>{cat.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <ProductRow
            item={item}
            index={index}
            scrollY={scrollY}
          />
        )}
      />
    </Screen>
  );
}

/* ───────────────────────────────────────────── */
/* STYLES (UNCHANGED) */
/* ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: { backgroundColor: "#fafafa" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: height * 0.02,
  },

  iconBtn: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },

  heroTitleWrap: {
    alignItems: "center",
    paddingVertical: height * 0.02,
  },

  heroTitleMain: {
    fontSize: width * 0.12,
    fontWeight: "800",
    // fontFamily: Platform.select({
    //   ios: "Georgia",
    //   android: "serif",
    // }),
  },

  heroTitleSub: {
    fontSize: width * 0.06,
    opacity: 0.6,
    marginTop: 4,
    fontWeight: "500",
  },

  heroLine: {
    marginTop: 12,
    height: 3,
    width: 40,
    borderRadius: 2,
    backgroundColor: "#000",
  },

  categoryHaloWrap: {
    marginBottom: height * 0.03,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingVertical: 18,
  },

  categoryRow: {
    paddingHorizontal: width * 0.04,
  },

  haloItem: {
    alignItems: "center",
    marginRight: 22,
  },

  haloCircle: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 1,
  },

  haloImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  haloLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  textColumn: {
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
  },

  verticalText: {
    fontSize: 52,
    letterSpacing: 14,
    fontWeight: "800",
    color: "#000",
    width: width,
    position: "relative",
    right: width * -0.2,
  },

  imageColumn: {
    width: "90%",
    alignItems: "center",
    paddingBottom: height * 0.02,
  },

  imageCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  productName: {
    position: "absolute",
    bottom: CIRCLE_SIZE * 0.28,
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  arrowBtn: {
    position: "absolute",
    bottom: CIRCLE_SIZE * 0.12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  pricePill: {
    position: "absolute",
    left: width * 0.03,
    top: width * 0.02,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },

  priceText: {
    color: "#c00000",
    fontSize: 48,
    fontWeight: "600",
  },

  wishlistBtn: {
    position: "absolute",
    right: 12,
    top: 18,
    height: width * 0.16,
    width: width * 0.16,
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },
});
