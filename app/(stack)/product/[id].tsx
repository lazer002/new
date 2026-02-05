import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import Screen from "@/components/Screen";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Fonts } from "@/theme/fonts";
import api from "@/utils/config";

const { width, height } = Dimensions.get("window");

export default function ProductScreen() {
  const router = useRouter();
  const { id, image, x, y, w, h } = useLocalSearchParams<any>();

  const { add } = useCart();
  const {wishlist, isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  /* ================= STABLE RATING ================= */
  const getStableRating = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (4 + (Math.abs(hash) % 10) / 10).toFixed(1);
  };

  /* ================= HERO SHARED VALUES ================= */
  const animX = useSharedValue(Number(x));
  const animY = useSharedValue(Number(y));
  const animW = useSharedValue(Number(w));
  const animH = useSharedValue(Number(h));
  const animRadius = useSharedValue(Number(w) / 2);

  /* ================= UI SHARED VALUES ================= */
  const uiOpacity = useSharedValue(0);
  const uiTranslate = useSharedValue(24);

  /* ================= STYLES ================= */
  const heroStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: animX.value,
    top: animY.value,
    width: animW.value,
    height: animH.value,
    borderRadius: animRadius.value,
    zIndex: 10,
  }));

  const uiStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
    transform: [{ translateY: uiTranslate.value }],
  }));

  /* ================= RUN ANIMATION ================= */
  useEffect(() => {
    const DURATION = 1600;

    animX.value = withTiming(0, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    animY.value = withTiming(0, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    animW.value = withTiming(width, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    animH.value = withTiming(height * 0.7, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    animRadius.value = withTiming(0, { duration: DURATION });

    uiOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    uiTranslate.value = withDelay(300, withTiming(0, { duration: 500 }));
  }, []);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
    })();
  }, [id]);

  if (!product) return null;
  const rating = getStableRating(product._id);

  return (
    <Screen>
      {/* HERO IMAGE */}
      <Animated.Image source={{ uri: image }} style={[styles.heroImage, heroStyle]} />

      <LinearGradient
        colors={["transparent", "transparent"]}
        style={[StyleSheet.absoluteFill, { height: height * 0.7 }]}
      />

      {/* TOP BAR */}
      <Animated.View style={[styles.topBar, uiStyle]}>
        <Pressable style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} />
        </Pressable>

        <Pressable style={styles.circleBtn}>
          <Ionicons name="heart-outline" size={20} />
        </Pressable>
      </Animated.View>

      {/* PRICE */}
      <Animated.View style={[styles.pricePill, uiStyle]}>
        <Text style={styles.priceText}>₹{product.price}</Text>
      </Animated.View>

      {/* CARD */}
      <Animated.View style={[styles.card, uiStyle]}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.reviewRow}>
          <Ionicons name="star" size={width * 0.08} color="#FFC107" />
          <Text style={styles.rating}>{rating}</Text>
        </View>

        <View style={styles.sizes}>
          {["XS", "S", "M", "L", "XL"].map((s) => (
            <Pressable
              key={s}
              onPress={() => setSelectedSize(s)}
              style={[
                styles.sizePill,
                selectedSize === s && styles.sizeActive,
              ]}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === s && { color: "#fff" },
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaRow}>
       <Pressable
  onPress={() => {
    if (!selectedSize) return;
    add(product._id, selectedSize);
  }}
  style={styles.cta}
>
  <Ionicons name="bag-outline" size={22} color="#fff" />
  <Text style={styles.ctaText}>Add to Cart</Text>
</Pressable>


          <Pressable
            onPress={() =>
              isInWishlist(product._id)
                ? removeFromWishlist(product._id)
                : addToWishlist(product)
            }
            style={styles.wishlistBtn}
          >
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={22}
              color={isInWishlist(product._id) ? "#c00000" : "#000"}
            />
          </Pressable>
        </View>
      </Animated.View>
    </Screen>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  heroImage: { resizeMode: "cover" },

  topBar: {
    position: "absolute",
    top: height * 0.06,
    left: width * 0.05,
    right: width * 0.05,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },

  circleBtn: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },

  pricePill: {
    position: "absolute",
    top: height * 0.52,
    left: width * 0.05,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.008,
    borderRadius: 999,
    zIndex: 20,
  },

  priceText: {
    fontSize: width * 0.1,
    color: "#c00000",
    fontFamily: Fonts.black,
  },

  card: {
    position: "absolute",
    bottom: 0,
    width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    padding: width * 0.06,
    zIndex: 15,
  },

  title: {
    fontSize: width * 0.1,
    fontFamily: Fonts.semiBold,
  },

  description: {
    marginTop: 6,
    opacity: 0.65,
    fontSize: width * 0.038,
    lineHeight: width * 0.055,
    fontFamily: Fonts.regular,
  },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },

  rating: {
    fontSize: width * 0.09,
    fontFamily: Fonts.bold,
  },

  sizes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  sizePill: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: 999,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  sizeActive: {
    backgroundColor: "#000",
  },

  sizeText: {
    fontSize: width * 0.038,
    fontFamily: Fonts.medium,
  },

  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },

  cta: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 999,
    paddingVertical: height * 0.02,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  ctaText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontFamily: Fonts.bold,
  },

  wishlistBtn: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 999,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  sizeError: {
    color: "#c00000",
    marginTop: 6,
    fontSize: width * 0.035,
    fontFamily: Fonts.medium,
  },
});












// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   Pressable,
//   Dimensions,
//   StyleSheet,
//   FlatList,
// } from "react-native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withDelay,
//   Easing,
//   runOnJS,
// } from "react-native-reanimated";

// import { LinearGradient } from "expo-linear-gradient";
// import { useLocalSearchParams } from "expo-router";

// import Screen from "@/components/Screen";
// import GlassCard from "@/components/GlassCard";
// import api from "@/utils/config";
// import { useWishlist } from "@/context/WishlistContext";
// import { useCart } from "@/context/CartContext";

// const { width, height } = Dimensions.get("window");

// export default function ProductScreen() {
//   const { id, image, x, y, w, h } = useLocalSearchParams<{
//     id: string;
//     image: string;
//     x: string;
//     y: string;
//     w: string;
//     h: string;
//   }>();

//   const { add } = useCart();
//   const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

//   const [product, setProduct] = useState<any>(null);
//   const [related, setRelated] = useState<any[]>([]);
//   const [selectedSize, setSelectedSize] = useState<string | null>(null);
//   const [showContent, setShowContent] = useState(false);

//   /* ---------- SHARED VALUES ---------- */
//   const animX = useSharedValue(Number(x));
//   const animY = useSharedValue(Number(y));
//   const animW = useSharedValue(Number(w));
//   const animH = useSharedValue(Number(h));
//   const animRadius = useSharedValue(Number(w) / 2);
//   const overlayOpacity = useSharedValue(0);

//   /* ---------- HERO ANIMATION ---------- */
//   const heroStyle = useAnimatedStyle(() => ({
//     position: "absolute",
//     left: animX.value,
//     top: animY.value,
//     width: animW.value,
//     height: animH.value,
//     borderRadius: animRadius.value,
//     zIndex: 20,
//   }));

// useEffect(() => {
//   const DURATION = 1800;

//   animX.value = withDelay(
//     50,
//     withTiming(0, {
//       duration: DURATION,
//       easing: Easing.out(Easing.cubic),
//     })
//   );

//   animY.value = withDelay(
//     50,
//     withTiming(0, {
//       duration: DURATION,
//       easing: Easing.out(Easing.cubic),
//     })
//   );

//   animW.value = withDelay(
//     50,
//     withTiming(width, {
//       duration: DURATION,
//       easing: Easing.out(Easing.cubic),
//     })
//   );

//   animH.value = withDelay(
//     50,
//     withTiming(height * 0.6, {
//       duration: DURATION,
//       easing: Easing.out(Easing.cubic),
//     })
//   );

//   animRadius.value = withDelay(
//     50,
//     withTiming(0, {
//       duration: DURATION,
//       easing: Easing.out(Easing.cubic),
//     })
//   );

//   overlayOpacity.value = withTiming(
//     1,
//     { duration: 800 },
//     () => runOnJS(setShowContent)(true)
//   );
// }, []);


//   /* ---------- LOAD PRODUCT ---------- */
//   useEffect(() => {
//     (async () => {
//       const res = await api.get(`/api/products/${id}`);
//       setProduct(res.data);

//       if (res.data?.category) {
//         const r = await api.get("/api/products", {
//           params: { category: res.data.category },
//         });
//         setRelated(r.data.items.filter((p: any) => p._id !== id));
//       }
//     })();
//   }, [id]);

//   /* ---------- OVERLAY ---------- */
//   const overlayStyle = useAnimatedStyle(() => ({
//     opacity: overlayOpacity.value,
//   }));

//   return (
//     <View style={{ flex: 1 }}>
//       {/* ================= HERO IMAGE ================= */}
//       <Animated.Image
//         source={{ uri: image }}
//         style={[styles.heroImage, heroStyle]}
//       />

//       <Animated.View style={[styles.fadeOverlay, overlayStyle]}>
//         <LinearGradient
//           colors={["transparent", "#080808"]}
//           style={StyleSheet.absoluteFill}
//         />
//       </Animated.View>

//       {/* ================= CONTENT ================= */}
//       {showContent && product && (
//         <Screen>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View style={styles.content}>
//               <Text style={styles.title}>{product.title}</Text>
//               <Text style={styles.price}>₹{product.price}</Text>

//               {/* SIZES */}
//               {product.inventory && (
//                 <>
//                   <Text style={styles.sectionLabel}>Select Size</Text>
//                   <View style={styles.sizes}>
//                     {Object.entries(product.inventory).map(
//                       ([size, qty]: any) => (
//                         <Pressable
//                           key={size}
//                           disabled={qty === 0}
//                           onPress={() => setSelectedSize(size)}
//                           style={[
//                             styles.sizePill,
//                             selectedSize === size &&
//                               styles.sizeActive,
//                             qty === 0 && styles.sizeDisabled,
//                           ]}
//                         >
//                           <Text
//                             style={[
//                               styles.sizeText,
//                               selectedSize === size && {
//                                 color: "#000",
//                               },
//                             ]}
//                           >
//                             {size}
//                           </Text>
//                         </Pressable>
//                       )
//                     )}
//                   </View>
//                 </>
//               )}

//               {/* CTA */}
//               <Pressable
//                 disabled={!selectedSize}
//                 onPress={() =>
//                   add(product._id, selectedSize)
//                 }
//                 style={[
//                   styles.cta,
//                   !selectedSize && { opacity: 0.5 },
//                 ]}
//               >
//                 <Ionicons
//                   name="bag-outline"
//                   size={18}
//                   color="#000"
//                 />
//                 <Text style={styles.ctaText}>
//                   Add to Cart
//                 </Text>
//               </Pressable>
//             </View>
//           </ScrollView>
//         </Screen>
//       )}
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   heroImage: {
//     resizeMode: "cover",
//   },
//   fadeOverlay: {
//     position: "absolute",
//     width,
//     height: height * 0.6,
//     zIndex: 21,
//   },
//   content: {
//     paddingTop: height * 0.62,
//     paddingHorizontal: 20,
//   },
//   title: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "800",
//   },
//   price: {
//     color: "#7CFF6B",
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 6,
//   },
//   sectionLabel: {
//     color: "#fff",
//     fontWeight: "700",
//     marginTop: 22,
//     marginBottom: 12,
//   },
//   sizes: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   sizePill: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.25)",
//   },
//   sizeActive: {
//     backgroundColor: "#7CFF6B",
//   },
//   sizeDisabled: {
//     opacity: 0.4,
//   },
//   sizeText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   cta: {
//     marginTop: 20,
//     backgroundColor: "#7CFF6B",
//     paddingVertical: 16,
//     borderRadius: 26,
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 8,
//   },
//   ctaText: {
//     color: "#000",
//     fontWeight: "800",
//   },
// });