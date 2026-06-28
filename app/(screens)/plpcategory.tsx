
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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

    <Pressable
      style={styles.card}
      onPress={onOpenPDP}
    >

      <View
        ref={imageRef}
        collapsable={false}
      >

        <Image
          source={{
            uri: item.images?.[0],
          }}
          style={styles.image}
        />

      </View>

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,.15)",
          "rgba(0,0,0,.55)",
          "rgba(0,0,0,.82)",
        ]}
        style={styles.cardGradient}
      />

      {/* Wishlist */}

      <BlurView
        intensity={80}
        tint="light"
        style={styles.favoriteGlass}
      >

        <Pressable
          onPress={() =>
            isFav
              ? removeFromWishlist(item._id)
              : addToWishlist(item._id)
          }
        >

          <Ionicons
            name={
              isFav
                ? "heart"
                : "heart-outline"
            }
            size={19}
            color={
              isFav
                ? "#d00000"
                : "#111"
            }
          />

        </Pressable>

      </BlurView>

      {/* NEW */}

      <View style={styles.newBadge}>

        <Text style={styles.newBadgeText}>
          NEW
        </Text>

      </View>

      {/* Bottom */}

      <View style={styles.cardContent}>

        <View style={styles.ratingRow}>

          <Ionicons
            name="star"
            size={14}
            color="#B6FF2E"
          />

          <Text style={styles.rating}>
            {rating}
          </Text>

          <Text style={styles.buyCount}>
            ({buyCount})
          </Text>

        </View>

        <Text
          numberOfLines={2}
          style={styles.productTitle}
        >
          {item.title}
        </Text>

        <View style={styles.bottomRow}>

          <View>

            <Text style={styles.price}>
              ₹{item.price}
            </Text>

            <Text style={styles.oldPrice}>
              ₹999
            </Text>

          </View>

          <View style={styles.arrowCircle}>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#111"
            />

          </View>

        </View>

      </View>

    </Pressable>

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
    source={{
      uri: products?.[index]?.images?.[0],
    }}
    style={[
      styles.heroImage,
      {
        opacity: fadeAnim,
      },
    ]}
  />

  <View style={styles.heroOverlay} />

  {/* TOP BAR */}

  <View style={styles.heroTop}>

    <BlurView
      intensity={70}
      tint="light"
      style={styles.glassBtn}
    >

      <Pressable
        style={styles.glassInner}
        onPress={() => router.back()}
      >

        <Ionicons
          name="chevron-back"
          size={22}
          color="#111"
        />

      </Pressable>

    </BlurView>

    <BlurView
      intensity={70}
      tint="light"
      style={styles.glassBtn}
    >

      <Pressable style={styles.glassInner}>

        <Ionicons
          name="options-outline"
          size={21}
          color="#111"
        />

      </Pressable>

    </BlurView>

  </View>

  {/* HERO CONTENT */}

  <View style={styles.heroContent}>

    <View style={styles.heroPill}>

      <Text style={styles.heroPillText}>
        CURATED COLLECTION
      </Text>

    </View>

    <Text style={styles.heroTitle}>

      {products?.[0]?.category?.name || "COLLECTION"}

    </Text>

    <Text style={styles.heroSubtitle}>

      {products.length} Premium Pieces

    </Text>

    <View style={styles.heroBottom}>

      <View style={styles.heroStat}>

        <Text style={styles.heroStatNumber}>
          {products.length}
        </Text>

        <Text style={styles.heroStatLabel}>
          PRODUCTS
        </Text>

      </View>

      <View style={styles.heroArrow}>

        <Ionicons
          name="arrow-down"
          size={20}
          color="#111"
        />

      </View>

    </View>

  </View>

</View>
<FlatList
  data={products}
  keyExtractor={(item) => item._id}
  numColumns={2}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.listContent}
  columnWrapperStyle={styles.columnWrapper}
  renderItem={({ item, index }) => (

    <Animated.View
      style={[
        styles.cardWrapper,
        {
          marginTop: index % 2 ? 40 : 0,
           marginRight: index % 2 === 0 ? 12 : 0,
          
        },
      ]}
    >

      <ProductCard item={item} />

    </Animated.View>

  )}

  ListFooterComponent={<View style={{ height: 120 }} />}
/>
    </Screen>
  );
}

/* 🎨 STYLES (SAME AS HOME) */

const styles = StyleSheet.create({
screen:{
  flex:1,

  backgroundColor:"#F8F8F8",
},
heroContainer:{
  width:"100%",

  height:340,

  borderBottomLeftRadius:34,

  borderBottomRightRadius:34,

  overflow:"hidden",

  marginBottom:16,

  backgroundColor:"#111",
},
card: {
  width: CARD_WIDTH,

  height: CARD_WIDTH * 1.58,

  borderRadius: 28,

  overflow: "hidden",

  marginBottom: 24,

  backgroundColor: "#111",

  shadowColor: "#000",

  shadowOpacity: .18,

  shadowRadius: 18,

  shadowOffset: {
    width: 0,
    height: 10,
  },

  elevation: 10,
},

image: {
  width: "100%",

  height: "100%",
},

cardGradient: {
  ...StyleSheet.absoluteFillObject,
},

favoriteGlass: {
  position: "absolute",

  top: 14,
  right: 14,

  width: 42,
  height: 42,

  borderRadius: 21,

  overflow: "hidden",

  justifyContent: "center",

  alignItems: "center",

  borderWidth: 1,

  borderColor: "rgba(255,255,255,.35)",
},

newBadge: {
  position: "absolute",

  top: 14,
  left: 14,

  backgroundColor: "#B6FF2E",

  borderRadius: 16,

  paddingHorizontal: 12,

  paddingVertical: 6,
},

newBadgeText: {
  color: "#111",

  fontWeight: "900",

  fontSize: 11,

  letterSpacing: 1,
},

cardContent: {
  position: "absolute",

  left: 18,
  right: 18,
  bottom: 18,
},

ratingRow: {
  flexDirection: "row",

  alignItems: "center",
},

rating: {
  color: "#FFF",

  fontWeight: "700",

  marginLeft: 5,

  fontSize: 14,
},

buyCount: {
  color: "#CFCFCF",

  marginLeft: 4,

  fontSize: 12,
},

productTitle: {
  color: "#FFF",

  fontSize: 22,

  fontWeight: "900",

  marginTop: 10,

  lineHeight: 28,
},

bottomRow: {
  marginTop: 18,

  flexDirection: "row",

  justifyContent: "space-between",

  alignItems: "center",
},

price: {
  color: "#FFF",

  fontSize: 28,

  fontWeight: "900",
},

oldPrice: {
  color: "#AFAFAF",

  marginTop: 3,

  textDecorationLine: "line-through",

  fontSize: 15,
},

arrowCircle: {
  width: 52,
  height: 52,

  borderRadius: 26,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",

  alignItems: "center",

  shadowColor: "#B6FF2E",

  shadowOpacity: .45,

  shadowRadius: 12,

  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 10,
},
heroImage:{
  width:"100%",

  height:"100%",

  position:"absolute",
},
heroOverlay:{
  ...StyleSheet.absoluteFillObject,

  backgroundColor:"rgba(0,0,0,.30)",
},
heroTop:{
  position:"absolute",

  top:28,

  left:20,

  right:20,

  flexDirection:"row",

  justifyContent:"space-between",
},

glassBtn:{
  width:54,

  height:54,

  borderRadius:27,

  overflow:"hidden",

  borderWidth:1,

  borderColor:"rgba(255,255,255,.35)",
},

glassInner:{
  flex:1,

  justifyContent:"center",

  alignItems:"center",
},

heroPill:{
  alignSelf:"flex-start",

  backgroundColor:"#B6FF2E",

  borderRadius:18,

  paddingHorizontal:14,

  paddingVertical:7,
},

heroPillText:{
  color:"#111",

  fontWeight:"900",

  fontSize:11,

  letterSpacing:1.5,
},

heroSubtitle:{
  marginTop:12,

  color:"#DDD",

  fontSize:17,
},

heroBottom:{
  marginTop:30,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",
},

heroStat:{
  alignItems:"flex-start",
},

heroStatNumber:{
  color:"#FFF",

  fontSize:36,

  fontWeight:"900",
},

heroStatLabel:{
  color:"#AAA",

  letterSpacing:2,

  fontWeight:"700",
},

heroArrow:{
  width:58,

  height:58,

  borderRadius:29,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",
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
heroContent:{
  position:"absolute",

  left:22,
  right:22,
  bottom:28,

  zIndex:10,
},
heroTitle:{
  marginTop:14,

  color:"#FFF",

  fontSize:48,

  lineHeight:50,

  fontWeight:"900",

  letterSpacing:-1,
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


listContent:{
  paddingHorizontal:2,

  paddingTop:24,

  paddingBottom:120,
},

columnWrapper:{
  justifyContent:"space-between",
},

cardWrapper:{
  marginBottom:8,
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



  





});

