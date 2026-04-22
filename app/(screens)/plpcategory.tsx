
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  Text,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import api from "@/utils/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWishlist } from "@/context/WishlistContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

/* 🔥 META */
const getProductMeta = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);

  return {
    rating: (4 + (positiveHash % 10) / 10).toFixed(1),
    buyCount: 50 + (positiveHash % 51),
  };
};

/* 🔥 PRODUCT CARD (EXACT SAME) */
function ProductCard({ item }: { item: any }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const imageRef = useRef<View>(null);

  const { rating, buyCount } = getProductMeta(item._id);
  const isFav = isInWishlist(item._id);

  const onOpenPDP = () => {
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
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={onOpenPDP}>
        <View ref={imageRef} collapsable={false}>
          <Image source={{ uri: item.images?.[0] }} style={styles.image} />
        </View>
      </Pressable>

      <Pressable
        onPress={() =>
          isFav
            ? removeFromWishlist(item._id)
            : addToWishlist(item._id)
        }
        style={styles.heart}
      >
        <Ionicons
          name={isFav ? "heart" : "heart-outline"}
          size={18}
          color="#000"
        />
      </Pressable>

      <View style={{ paddingHorizontal: 7, paddingBottom: 12, paddingTop: 8 }}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#d37b09c5" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.buyText}> ({buyCount})</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>

          <View style={styles.oldPriceWrapper}>
            <Text style={styles.oldPriceText}>₹999</Text>
            <View style={styles.strikeLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

/* 🔥 MAIN PLP */
export default function PLP() {
  const { category } = useLocalSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const [index, setIndex] = useState(0);
const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    api.get("/api/products").then((res) => {
      const items = res.data.items || [];

      const filtered = items.filter((p: any) => {
        const catId =
          typeof p.category === "string"
            ? p.category
            : p.category?._id;

        return !category || catId === category;
      });

      setProducts(filtered);
    });
  }, [category]);
useEffect(() => {
  if (!products.length) return;

  const interval = setInterval(() => {
    // fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // change image
      setIndex((prev) => (prev + 1) % products.length);

      // fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, 2500);

  return () => clearInterval(interval);
}, [products]);
  return (
    <Screen style={styles.screen}>
        <View style={styles.heroContainer}>
  
<Animated.Image
  source={{ uri: products?.[index]?.images?.[0] }}
  style={[styles.heroImage, { opacity: fadeAnim }]}
/>

  {/* BACK BUTTON */}
  <Pressable style={styles.backBtn} onPress={() => router.back()}>
    <Ionicons name="chevron-back" size={20} color="#000000" />
  </Pressable>

  {/* FILTER ICON */}
  <Pressable style={styles.filterTopBtn}>
    <Ionicons name="options-outline" size={20} color="#000000" />
  </Pressable>

  {/* TITLE */}
  <View style={styles.heroOverlay}>
    <Text style={styles.heroTitle}>
      {products?.[0]?.category?.name || "COLLECTION"}
    </Text>
  </View>

</View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <View style={{ marginTop: index % 2 !== 0 ? 20 : 0 }}>
            <ProductCard item={item} />
          </View>
        )}
      />
    </Screen>
  );
}

/* 🎨 STYLES (SAME AS HOME) */

const styles = StyleSheet.create({
  screen: { backgroundColor: "#fafafa" },

  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    borderRadius: 20,
  },
heroContainer: {
  width: "100%",
  height: 260,
  marginBottom: 10,
},

heroImage: {
  width: "100%",
  height: "100%",
},

heroOverlay: {
  position: "absolute",
  bottom: 20,
  left: 20,
},

heroTitle: {
  color: "#fff",
  fontSize: 28,
  fontWeight: "800",
  letterSpacing: 2,
},

backBtn: {
  position: "absolute",
  top: width > 600 ? 30 : 20,
  left: 16,
  width: 56,
  height: 56,
  borderRadius: 99,
//   borderWidth: 1,
//   borderColor: "#000000",
  justifyContent: "center",
  alignItems: "center",
  elevation: 55,
  backgroundColor: "#fff",
},

filterTopBtn: {
  position: "absolute",
  top: width > 600 ? 30 : 20,
  right: 16,
  width: 56,
  height: 56,
  borderRadius: 99,
//   borderWidth: 1,
//   borderColor: "#000000",
  justifyContent: "center",
  alignItems: "center",
    elevation: 111,
  backgroundColor: "#fff",

},
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.3,
    borderRadius: 20,
  },

  heart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: "600",
  },

  buyText: {
    fontSize: 12,
    color: "#3f3e3eff",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },

  priceRow: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
  },

  oldPriceWrapper: {
    marginLeft: 8,
    position: "relative",
  },

  oldPriceText: {
    fontSize: 16,
    color: "#272727",
  },

  strikeLine: {
    position: "absolute",
    left: 0,
    right: -2,
    top: "55%",
    height: 2,
    backgroundColor: "red",
    transform: [{ rotate: "-12deg" }],
  },
});

