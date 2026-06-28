import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,

} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import RenderHTML from "react-native-render-html";
import Toast from "react-native-toast-message";

import Screen from "@/components/Screen";
import CartIcon from "@/components/CartIcon";
import api from "@/utils/config";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const { width, height } = Dimensions.get("window");

export default function ProductScreen() {

  const router = useRouter();

   const { id, image, x, y, w, h } = useLocalSearchParams<any>();

  const { add } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [product, setProduct] = useState<any>(null);

  const [related, setRelated] = useState<any[]>([]);

  const [selectedSize, setSelectedSize] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);

  const imageRef = useRef<FlatList>(null);




  

const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});

const footerStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 150],
          [120, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  };
});

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {

    try {

      const res = await api.get(
        `/api/products/${id}`
      );

      setProduct(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    if (!product) return;

    fetchRelated();

  }, [product]);

  const fetchRelated = async () => {

    try {

      const res = await api.get(
        "/api/products"
      );

      const items = res.data.items || [];

      const currentCategory =
        typeof product.category === "string"
          ? product.category
          : product.category?._id;

      setRelated(

        items.filter((p: any) => {

          const cat =
            typeof p.category === "string"
              ? p.category
              : p.category?._id;

          return (
            p._id !== product._id &&
            cat === currentCategory
          );

        })

      );

    } catch (err) {

      console.log(err);

    }

  };

if (!product) {

  return (

    <Screen style={{ flex: 1, backgroundColor: "#111" }}>

      <Image
        source={{ uri: image }}
        style={{
          width: "100%",
          height: height * 0.62,
        }}
        resizeMode="cover"
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          color="#B6FF2E"
          size="large"
        />
      </View>

    </Screen>

  );

}

const images =
  product?.images?.length
    ? product.images
    : [image];

  const sizes = Object.keys(
    product.inventory || {}
  );

  return (

    <Screen style={styles.container}>

 

      <Animated.ScrollView

        showsVerticalScrollIndicator={false}

        onScroll={scrollHandler}

        scrollEventThrottle={16}

        contentContainerStyle={{
          paddingBottom: 170,
        }}

      >

        <View style={styles.hero}>

     <FlatList
  ref={imageRef}
  data={images}
  horizontal
  pagingEnabled
  decelerationRate="fast"
  snapToInterval={width}
  snapToAlignment="start"
  disableIntervalMomentum
  bounces={false}
  overScrollMode="never"
  showsHorizontalScrollIndicator={false}
  keyExtractor={(_, i) => i.toString()}
  style={styles.heroSlider}
  renderItem={({ item }) => (
    <View style={styles.heroSlide}>
      <Image
        source={{ uri: item }}
        style={styles.heroImage}
      />
    </View>
  )}
  onMomentumScrollEnd={(e) => {
    const page = Math.round(
      e.nativeEvent.contentOffset.x / width
    );
    setActiveIndex(page);
  }}
/>

<LinearGradient
  colors={[
    "transparent",
    "rgba(0,0,0,0)",
    "rgba(0,0,0,0.10)",
    "rgba(0,0,0,0.55)",
  ]}
  locations={[0, 0.65, 0.82, 1]}
  style={styles.heroGradient}
/>

          <View style={styles.topBar}>

            <Pressable
              onPress={() => router.back()}
            >

              <BlurView
                intensity={80}
                tint="light"
                style={styles.glassButton}
              >

                <Ionicons
                  name="chevron-back"
                  size={22}
                  color="#111"
                />

              </BlurView>

            </Pressable>

            <View
              style={styles.rightButtons}
            >

              <Pressable

                onPress={() =>
                  isInWishlist(product._id)
                    ? removeFromWishlist(product._id)
                    : addToWishlist(product._id)
                }

              >

                <BlurView
                  intensity={80}
                  tint="light"
                  style={styles.glassButton}
                >

                  <Ionicons

                    name={
                      isInWishlist(product._id)
                        ? "heart"
                        : "heart-outline"
                    }

                    size={20}

                    color={
                      isInWishlist(product._id)
                        ? "#D90429"
                        : "#111"
                    }

                  />

                </BlurView>

              </Pressable>

              <View
                style={{
                  marginLeft: 12,
                }}
              >

                <CartIcon />

              </View>

            </View>

          </View>

          <View
            style={styles.counter}
          >

            <Text
              style={styles.counterText}
            >

              {activeIndex + 1}/{images.length}

            </Text>

          </View>

   <ScrollView
  horizontal
  style={styles.thumbnailContainer}
  contentContainerStyle={{
    paddingHorizontal: 20,
  }}
  showsHorizontalScrollIndicator={false}
>

            {images.map(
              (
                img: string,
                index: number
              ) => (

                <Pressable

                  key={index}

                  onPress={() => {

                    imageRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });

                    setActiveIndex(index);

                  }}

                >

                  <Image

                    source={{
                      uri: img,
                    }}

                    style={[
                      styles.thumbnail,

                      activeIndex === index &&
                        styles.thumbnailActive,

                    ]}

                  />

                </Pressable>

              )
            )}

          </ScrollView>

        </View>

        <View style={styles.infoCard}>

                    <View style={styles.labelRow}>

            <View style={styles.labelBadge}>

              <Text style={styles.labelText}>
                PREMIUM COLLECTION
              </Text>

            </View>

            <View style={styles.ratingBox}>

              <Ionicons
                name="star"
                size={15}
                color="#B6FF2E"
              />

              <Text style={styles.rating}>
                4.9
              </Text>

            </View>

          </View>

          <Text
            style={styles.productTitle}
          >
            {product?.title}
          </Text>

          <Text
            style={styles.productSubtitle}
          >
            {product?.category?.name ||
              "Luxury Streetwear"}
          </Text>

          <View style={styles.priceRow}>

            <View>

              <Text style={styles.price}>
                ₹{product?.price}
              </Text>

              <Text style={styles.oldPrice}>
                ₹{Math.round(
                  product?.price * 1.35
                )}
              </Text>

            </View>

            <View
              style={styles.savePill}
            >

              <Text
                style={styles.saveText}
              >
                SAVE 35%
              </Text>

            </View>

          </View>

          <View style={styles.infoRow}>

            <View
              style={styles.infoItem}
            >

              <Ionicons
                name="diamond-outline"
                size={20}
                color="#B6FF2E"
              />

              <Text
                style={styles.infoTitle}
              >
                Premium
              </Text>

              <Text
                style={styles.infoSub}
              >
                Fabric
              </Text>

            </View>

            <View
              style={styles.divider}
            />

            <View
              style={styles.infoItem}
            >

              <Ionicons
                name="car-outline"
                size={20}
                color="#B6FF2E"
              />

              <Text
                style={styles.infoTitle}
              >
                Free
              </Text>

              <Text
                style={styles.infoSub}
              >
                Shipping
              </Text>

            </View>

            <View
              style={styles.divider}
            />

            <View
              style={styles.infoItem}
            >

              <Ionicons
                name="refresh-outline"
                size={20}
                color="#B6FF2E"
              />

              <Text
                style={styles.infoTitle}
              >
                Easy
              </Text>

              <Text
                style={styles.infoSub}
              >
                Return
              </Text>

            </View>

          </View>

          <View
            style={styles.section}
          >

            <View
              style={styles.sectionHeader}
            >

              <Text
                style={styles.sectionTitle}
              >
                Select Size
              </Text>

              <Pressable>

                <Text
                  style={styles.sizeGuide}
                >
                  Size Guide
                </Text>

              </Pressable>

            </View>

            <View
              style={styles.sizeGrid}
            >

              {sizes.map((size) => {

                const stock =
                  product.inventory?.[
                    size
                  ] || 0;

                const active =
                  selectedSize ===
                  size;

                return (

                  <Pressable

                    key={size}

                    disabled={
                      stock <= 0
                    }

                    onPress={() =>
                      setSelectedSize(
                        size
                      )
                    }

                    style={[
                      styles.sizeCard,

                      active &&
                        styles.sizeCardActive,

                      stock <= 0 &&
                        styles.sizeDisabled,

                    ]}

                  >

                    <Text
                      style={[
                        styles.sizeValue,

                        active &&
                          styles.sizeValueActive,

                      ]}
                    >

                      {size}

                    </Text>

                    <Text
                      style={[
                        styles.stockLabel,

                        active &&
                          styles.stockLabelActive,

                        stock <= 0 &&
                          styles.stockOut,

                      ]}
                    >

                      {stock > 0
                        ? `${stock} Left`
                        : "Sold Out"}

                    </Text>

                  </Pressable>

                );

              })}

            </View>

          </View>

          <View
            style={styles.section}
          >

            <Text
              style={styles.sectionTitle}
            >
              Description
            </Text>

            <View
              style={
                styles.descriptionCard
              }
            >

              <RenderHTML
                contentWidth={
                  width - 44
                }
                source={{
                  html: product.description,
                }}
              />

            </View>

          </View>

          <View
            style={styles.section}
          >

            <Text
              style={styles.sectionTitle}
            >
              Highlights
            </Text>

            <View
              style={
                styles.featureGrid
              }
            >
                          <View style={styles.featureCard}>

              <Ionicons
                name="diamond-outline"
                size={24}
                color="#111"
              />

              <Text style={styles.featureTitle}>
                Premium Quality
              </Text>

              <Text style={styles.featureSub}>
                Luxury finish crafted for everyday wear.
              </Text>

            </View>

            <View style={styles.featureCard}>

              <Ionicons
                name="leaf-outline"
                size={24}
                color="#111"
              />

              <Text style={styles.featureTitle}>
                Soft Fabric
              </Text>

              <Text style={styles.featureSub}>
                Lightweight & breathable comfort.
              </Text>

            </View>

            <View style={styles.featureCard}>

              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#111"
              />

              <Text style={styles.featureTitle}>
                Authentic
              </Text>

              <Text style={styles.featureSub}>
                Genuine premium collection.
              </Text>

            </View>

            <View style={styles.featureCard}>

              <Ionicons
                name="refresh-outline"
                size={24}
                color="#111"
              />

              <Text style={styles.featureTitle}>
                Easy Returns
              </Text>

              <Text style={styles.featureSub}>
                7 day hassle-free exchange.
              </Text>

            </View>

          </View>

        </View>

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              You May Also Like
            </Text>

            <Pressable
              onPress={() =>
                router.push("/shop")
              }
            >

              <Text style={styles.viewAll}>
                View All
              </Text>

            </Pressable>

          </View>

          <FlatList
            horizontal
            data={related}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 18,
              paddingBottom: 20,
              paddingRight: 20,
            }}
            renderItem={({ item }) => (

              <Pressable
                style={styles.relatedCard}
                onPress={() =>
                  router.replace({
                    pathname: "/product/[id]",
                    params: {
                      id: item._id,
                    },
                  })
                }
              >

                <Image
                  source={{
                    uri: item.images?.[0],
                  }}
                  style={styles.relatedImage}
                />

                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(0,0,0,.75)",
                  ]}
                  style={styles.relatedGradient}
                />

                <View
                  style={styles.relatedContent}
                >

                  <Text
                    numberOfLines={2}
                    style={styles.relatedTitle}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={styles.relatedBottom}
                  >

                    <Text
                      style={styles.relatedPrice}
                    >
                      ₹{item.price}
                    </Text>

                    <View
                      style={styles.relatedArrow}
                    >

                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#111"
                      />

                    </View>

                  </View>

                </View>

              </Pressable>

            )}
          />

        </View>

      </View>

    </Animated.ScrollView>

<Animated.View
  style={[styles.bottomBar, footerStyle]}
>

      <View>

        <Text
          style={styles.bottomLabel}
        >
          Total
        </Text>

        <Text
          style={styles.bottomPrice}
        >
          ₹{product.price}
        </Text>

      </View>

      <Pressable
        style={styles.cartButton}
        onPress={() => {

          if (!selectedSize) {

            Toast.show({
              type: "error",
              text1:
                "Please select a size",
            });

            return;

          }

          add(
            product._id,
            selectedSize,
            1
          );

        }}
      >

        <Text
          style={styles.cartButtonText}
        >
          ADD TO BAG
        </Text>

        <View
          style={styles.arrowCircle}
        >

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#111"
          />

        </View>

      </Pressable>

    </Animated.View>

  </Screen>

);

}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#F7F7F7",
},

loader: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#111",
},

hero: {
  width: "100%",
  height: height * 0.62,
  overflow: "hidden",
  borderBottomLeftRadius: 34,
  borderBottomRightRadius: 34,
},

heroSlider: {
  width: "100%",
  height: "100%",
},

heroSlide: {
  width: width,
  height: "100%",
},

heroImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},



topBar: {
  position: "absolute",
  top: 20,
  left: 20,
  right: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

rightButtons: {
  flexDirection: "row",
  alignItems: "center",
},

glassButton: {
  width: 54,
  height: 54,
  borderRadius: 27,
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,.25)",
},

counter: {
  position: "absolute",
  right: 20,
  bottom: 122,
  backgroundColor: "rgba(0,0,0,.55)",
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 7,
},

counterText: {
  color: "#FFF",
  fontSize: 13,
  fontWeight: "800",
},


thumbnail: {
  width: 62,
  height: 80,
  borderRadius: 18,
  marginRight: 12,
  borderWidth: 2,
  borderColor: "transparent",
},

thumbnailActive: {
  borderColor: "#B6FF2E",
},



infoCard: {
  marginTop: -28,
  backgroundColor: "#FFF",
  borderTopLeftRadius: 36,
  borderTopRightRadius: 36,
  paddingHorizontal: 12,
  paddingTop: 28,
  paddingBottom: 36,
},

labelRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

labelBadge: {
  backgroundColor: "#111",
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 8,
},

labelText: {
  color: "#FFF",
  fontSize: 11,
  fontWeight: "900",
  letterSpacing: 1.4,
},

ratingBox: {
  flexDirection: "row",
  alignItems: "center",
},

rating: {
  marginLeft: 5,
  fontSize: 15,
  fontWeight: "800",
},

productTitle: {
  marginTop: 18,
  fontSize: 38,
  lineHeight: 44,
  fontWeight: "900",
  color: "#111",
},

productSubtitle: {
  marginTop: 10,
  color: "#777",
  fontSize: 16,
},

priceRow: {
  marginTop: 26,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

price: {
  fontSize: 40,
  fontWeight: "900",
  color: "#111",
},

oldPrice: {
  marginTop: 4,
  color: "#999",
  fontSize: 16,
  textDecorationLine: "line-through",
},

savePill: {
  backgroundColor: "#B6FF2E",
  borderRadius: 22,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

saveText: {
  color: "#111",
  fontWeight: "900",
  fontSize: 12,
},

infoRow: {
  marginTop: 28,
  backgroundColor: "#111",
  borderRadius: 26,
  height: 92,
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
},

infoItem: {
  alignItems: "center",
},

infoTitle: {
  marginTop: 8,
  color: "#FFF",
  fontWeight: "900",
  fontSize: 16,
},

infoSub: {
  marginTop: 3,
  color: "#888",
  fontSize: 11,
},

divider: {
  width: 1,
  height: 40,
  backgroundColor: "#2A2A2A",
},

section: {
  marginTop: 34,
},

sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
},

sectionTitle: {
  fontSize: 26,
  fontWeight: "900",
  color: "#111",
},

sizeGuide: {
  color: "#67C61C",
  fontWeight: "800",
},
sizeGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

sizeCard: {
  width: "31.5%",
  height: 86,
  borderRadius: 22,
  backgroundColor: "#F7F7F7",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#ECECEC",
},

sizeCardActive: {
  backgroundColor: "#111",
  borderColor: "#111",
},

sizeDisabled: {
  opacity: 0.35,
},

sizeValue: {
  fontSize: 18,
  fontWeight: "900",
  color: "#111",
},

sizeValueActive: {
  color: "#FFF",
},

stockLabel: {
  marginTop: 6,
  fontSize: 11,
  color: "#777",
},

stockLabelActive: {
  color: "#B6FF2E",
},

stockOut: {
  color: "#D90429",
},

descriptionCard: {
  marginTop: 16,
  padding: 18,
  backgroundColor: "#FAFAFA",
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "#ECECEC",
},

featureGrid: {
  marginTop: 18,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

featureCard: {
  width: "48%",
  backgroundColor: "#F8F8F8",
  borderRadius: 24,
  padding: 18,
  marginBottom: 16,
},

featureTitle: {
  marginTop: 16,
  fontSize: 18,
  fontWeight: "900",
  color: "#111",
},

featureSub: {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 21,
  color: "#777",
},

viewAll: {
  color: "#67C61C",
  fontWeight: "800",
  fontSize: 14,
},

relatedCard: {
  width: 180,
  height: 270,
  borderRadius: 30,
  overflow: "hidden",
  backgroundColor: "#111",
  marginRight: 18,
},

relatedImage: {
  width: "100%",
  height: "100%",
},

relatedGradient: {
  ...StyleSheet.absoluteFillObject,
},

relatedContent: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 16,
},

relatedTitle: {
  color: "#FFF",
  fontSize: 20,
  fontWeight: "900",
},

relatedBottom: {
  marginTop: 14,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

relatedPrice: {
  color: "#FFF",
  fontSize: 24,
  fontWeight: "900",
},

relatedArrow: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#B6FF2E",
  justifyContent: "center",
  alignItems: "center",
},

bottomBar: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 16,
  height: 84,
  borderRadius: 30,
  backgroundColor: "#111",
  paddingHorizontal: 22,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10,
  },

  elevation: 16,
},

bottomLabel: {
  color: "#8F8F8F",
  fontSize: 11,
  letterSpacing: 2,
  fontWeight: "700",
},

bottomPrice: {
  marginTop: 4,
  color: "#FFF",
  fontSize: 30,
  fontWeight: "900",
},

cartButton: {
  width: 210,
  height: 58,
  borderRadius: 30,
  backgroundColor: "#B6FF2E",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 18,
},

cartButtonText: {
  color: "#111",
  fontSize: 15,
  fontWeight: "900",
  letterSpacing: 1,
},

arrowCircle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#FFF",
  justifyContent: "center",
  alignItems: "center",
},
heroGradient: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: "35%",
},
thumbnailContainer: {
  position: "absolute",
  bottom: 22,
  left: 0,
  right: 0,
},
});