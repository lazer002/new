import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withTiming,
  runOnJS,
  withDelay,
} from "react-native-reanimated";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import RenderHTML from "react-native-render-html";
import Toast from "react-native-toast-message";

import Screen from "@/components/Screen";
import CartIcon from "@/components/CartIcon";

import api from "@/utils/config";

import { useCart } from "@/context/CartContext";
import {
  useWishlist,
} from "@/context/WishlistContext";

const { width, height } =
  Dimensions.get("window");

const HERO_HEIGHT = height * 0.62;

export default function ProductScreen() {

  const router = useRouter();

  const {
    id,
    image,
    x,
    y,
    w,
    h,
  } = useLocalSearchParams<any>();

  const { add } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const sliderRef =
    useRef<FlatList>(null);

  const [product, setProduct] =
    useState<any>(null);

  const [related, setRelated] =
    useState<any[]>([]);

  const [selectedSize,
    setSelectedSize] =
    useState("");

  const [activeIndex,
    setActiveIndex] =
    useState(0);

  const [showRealHero,
    setShowRealHero] =
    useState(false);

  /* ----------------------------- */
  /* Shared Element Animation      */
  /* ----------------------------- */

  const heroLeft =
    useSharedValue(Number(x ?? 0));

  const heroTop =
    useSharedValue(Number(y ?? 0));

  const heroWidth =
    useSharedValue(Number(w ?? 140));

  const heroHeight =
    useSharedValue(Number(h ?? 180));

  const heroRadius =
    useSharedValue(22);

  const heroOpacity =
    useSharedValue(1);

  const heroStyle =
    useAnimatedStyle(() => ({
      position: "absolute",
      left: heroLeft.value,
      top: heroTop.value,
      width: heroWidth.value,
      height: heroHeight.value,
      borderRadius:
        heroRadius.value,
      overflow: "hidden",
      zIndex: 9999,
      opacity:
        heroOpacity.value,
    }));

  /* ----------------------------- */
  /* Bottom Bar Animation          */
  /* ----------------------------- */

  const scrollY =
    useSharedValue(0);

  const scrollHandler =
    useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value =
          event.contentOffset.y;
      },
    });

  const bottomBarStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateY:
            interpolate(
              scrollY.value,
              [0, 180],
              [120, 0],
              Extrapolation.CLAMP
            ),
        },
      ],
    }));


    const floatingHeaderStyle =
  useAnimatedStyle(() => ({

    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 120, HERO_HEIGHT - 60],
      [0, 1],
      Extrapolation.CLAMP,
    ),

    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [HERO_HEIGHT - 120, HERO_HEIGHT - 60],
          [-18, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],

  }));
    /* ----------------------------- */
/* Fetch Product                 */
/* ----------------------------- */

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

const fetchRelated = async (
  currentProduct: any
) => {

  try {

    const res = await api.get(
      "/api/products"
    );

    const items =
      res.data.items || [];

    const currentCategory =
      typeof currentProduct.category === "string"
        ? currentProduct.category
        : currentProduct.category?._id;

    setRelated(

      items.filter((item: any) => {

        const category =
          typeof item.category === "string"
            ? item.category
            : item.category?._id;

        return (
          item._id !== currentProduct._id &&
          category === currentCategory
        );

      })

    );

  } catch (err) {

    console.log(err);

  }

};

/* ----------------------------- */
/* Hero Transition               */
/* ----------------------------- */

const startHeroAnimation = () => {

  heroLeft.value = Number(x ?? 0);
  heroTop.value = Number(y ?? 0);
  heroWidth.value = Number(w ?? 140);
  heroHeight.value = Number(h ?? 180);
  heroRadius.value = 22;
  heroOpacity.value = 1;

  requestAnimationFrame(() => {

    heroLeft.value = withTiming(
      0,
      {
        duration: 480,
      }
    );

    heroTop.value = withTiming(
      0,
      {
        duration: 480,
      }
    );

    heroWidth.value = withTiming(
      width,
      {
        duration: 480,
      }
    );

    heroHeight.value = withTiming(
      HERO_HEIGHT,
      {
        duration: 480,
      }
    );

    heroRadius.value = withTiming(
      0,
      {
        duration: 480,
      }
    );

heroLeft.value = withTiming(0, { duration: 500 });
heroTop.value = withTiming(0, { duration: 500 });
heroWidth.value = withTiming(width, { duration: 500 });
heroHeight.value = withTiming(HERO_HEIGHT, { duration: 500 });
heroRadius.value = withTiming(0, { duration: 500 }, (finished) => {
  if (finished) {
    runOnJS(setShowRealHero)(true);
  }
});

  });

};

/* ----------------------------- */
/* Initial Load                  */
/* ----------------------------- */

useEffect(() => {

  startHeroAnimation();

  fetchProduct();

}, []);

useEffect(() => {

  if (!product) return;

  fetchRelated(product);

}, [product]);

const images =
  product?.images?.length
    ? product.images
    : image
    ? [image]
    : [];

const sizes =
  Object.keys(
    product?.inventory || {}
  );

if (!product) {

  return (

    <Screen
      style={{
        flex: 1,
        backgroundColor: "#F7F7F7",
      }}
    >

      <Animated.View
        pointerEvents="none"
        style={heroStyle}
      >

        <Image
          source={{
            uri: image,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        />

      </Animated.View>

    </Screen>

  );

}

return (

  <Screen style={styles.container}>

    <Animated.ScrollView

      onScroll={scrollHandler}

      scrollEventThrottle={16}

      showsVerticalScrollIndicator={false}

      contentContainerStyle={{
        paddingBottom: 170,
      }}

    >

  <View style={styles.hero}>

  {/* ---------------- REAL HERO ---------------- */}

  <View
    style={[
      StyleSheet.absoluteFillObject,
      {
        opacity: showRealHero ? 1 : 0,
      },
    ]}
  >

    <FlatList
      ref={sliderRef}
      horizontal
      pagingEnabled
      bounces={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      data={images}
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

  </View>

  {/* ---------------- FLYING IMAGE ---------------- */}

  {!showRealHero && (

    <Animated.View
      pointerEvents="none"
      style={heroStyle}
    >

      <Image
        source={{ uri: image }}
        style={{
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />

    </Animated.View>

  )}

  <LinearGradient
    colors={[
      "transparent",
      "rgba(0,0,0,0)",
      "rgba(0,0,0,.12)",
      "rgba(0,0,0,.65)",
    ]}
    locations={[
      0,
      .62,
      .82,
      1,
    ]}
    style={styles.heroGradient}
  />

  {/* ---------- TOP BAR ---------- */}

  <View style={styles.topBar}>

    <Pressable
      onPress={() => router.back()}
    >

      <BlurView
        intensity={90}
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

    <View style={styles.rightButtons}>

      <Pressable
        onPress={() =>
          isInWishlist(product._id)
            ? removeFromWishlist(product._id)
            : addToWishlist(product._id)
        }
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
                ? "#000000"
                : "#111"
            }
          />

      
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

  {/* ---------- IMAGE COUNT ---------- */}

  {showRealHero && (

    <View style={styles.counter}>

      <Text style={styles.counterText}>
        {activeIndex + 1}/{images.length}
      </Text>

    </View>

  )}

  {/* ---------- THUMBNAILS ---------- */}

  {showRealHero && (

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.thumbnailContainer}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
    >

      {images.map((img: string, index: number) => (

        <Pressable
          key={index}
          onPress={() => {

            sliderRef.current?.scrollToIndex({
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

      ))}

    </ScrollView>

  )}

</View>

      {/* ---------- PRODUCT INFO STARTS ---------- */}

      <View style={styles.infoCard}>
                {/* ---------- LABEL ---------- */}

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

        {/* ---------- TITLE ---------- */}

        <Text style={styles.productTitle}>
          {product.title}
        </Text>

        <Text style={styles.productSubtitle}>
          {product.category?.name ||
            "Luxury Streetwear"}
        </Text>

        {/* ---------- PRICE ---------- */}

        <View style={styles.priceRow}>
<View>
  <Text style={styles.price}>
    ₹{product.price}
  </Text>

  <View style={styles.oldPriceContainer}>
    <Text style={styles.oldPrice}>
      ₹{Math.round(product.price * 1.35)}
    </Text>

    <View style={styles.oldPriceStrike} />
  </View>
</View>

          <View style={styles.savePill}>

            <Text style={styles.saveText}>
              SAVE 35%
            </Text>

          </View>

        </View>

        {/* ---------- FEATURES ---------- */}

        <View style={styles.infoRow}>

          <View style={styles.infoItem}>

            <Ionicons
              name="diamond-outline"
              size={20}
              color="#B6FF2E"
            />

            <Text style={styles.infoTitle}>
              Premium
            </Text>

            <Text style={styles.infoSub}>
              Fabric
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>

            <Ionicons
              name="car-outline"
              size={20}
              color="#B6FF2E"
            />

            <Text style={styles.infoTitle}>
              Free
            </Text>

            <Text style={styles.infoSub}>
              Shipping
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>

            <Ionicons
              name="refresh-outline"
              size={20}
              color="#B6FF2E"
            />

            <Text style={styles.infoTitle}>
              Easy
            </Text>

            <Text style={styles.infoSub}>
              Return
            </Text>

          </View>

        </View>

        {/* ---------- SIZE ---------- */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Select Size
            </Text>

            <Pressable>

              <Text style={styles.sizeGuide}>
                Size Guide
              </Text>

            </Pressable>

          </View>

          <View style={styles.sizeGrid}>

            {sizes.map((size) => {

              const stock =
                product.inventory?.[size] || 0;

              const active =
                selectedSize === size;

              return (

                <Pressable

                  key={size}

                  disabled={stock <= 0}

                  onPress={() =>
                    setSelectedSize(size)
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
                {/* ---------- DESCRIPTION ---------- */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <View style={styles.descriptionCard}>

            <RenderHTML
              contentWidth={width - 40}
              source={{
                html:
                  product.description ||
                  "<p>No description available.</p>",
              }}
            />

          </View>

        </View>

        {/* ---------- HIGHLIGHTS ---------- */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Highlights
          </Text>

          <View style={styles.featureGrid}>

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
                Luxury finish crafted for
                everyday wear.
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
                Lightweight, breathable
                and comfortable.
              </Text>

            </View>

            <View style={styles.featureCard}>

              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#111"
              />

              <Text style={styles.featureTitle}>
                Authentic Product
              </Text>

              <Text style={styles.featureSub}>
                100% original premium
                collection.
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
                Hassle-free 7 day
                exchange policy.
              </Text>

            </View>

          </View>

        </View>

        {/* ---------- RELATED PRODUCTS ---------- */}

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

            keyExtractor={(item) =>
              item._id
            }

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
                    pathname:
                      "/product/[id]",
                    params: {
                      id: item._id,
                      image:
                        item.images?.[0],
                    },
                  })
                }

              >

                <Image
                  source={{
                    uri:
                      item.images?.[0],
                  }}
                  style={
                    styles.relatedImage
                  }
                />

                <LinearGradient

                  colors={[
                    "transparent",
                    "rgba(0,0,0,.78)",
                  ]}

                  style={
                    styles.relatedGradient
                  }

                />

                <View
                  style={
                    styles.relatedContent
                  }
                >

                  <Text
                    numberOfLines={2}
                    style={
                      styles.relatedTitle
                    }
                  >
                    {item.title}
                  </Text>

                  <View
                    style={
                      styles.relatedBottom
                    }
                  >

                    <Text
                      style={
                        styles.relatedPrice
                      }
                    >
                      ₹{item.price}
                    </Text>

                    <View
                      style={
                        styles.relatedArrow
                      }
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
  style={[
    styles.floatingHeader,
    floatingHeaderStyle,
  ]}
>

  <Pressable
    onPress={() => router.back()}
    style={styles.iconButton}
  >

    <Ionicons
      name="chevron-back"
      size={24}
      color="#FFF"
    />

  </Pressable>

  <Text
    numberOfLines={1}
    style={styles.headerTitle}
  >
    {product.title}
  </Text>

  <View style={styles.headerActions}>

    <Pressable
      style={styles.iconButton}
      onPress={() =>
        isInWishlist(product._id)
          ? removeFromWishlist(product._id)
          : addToWishlist(product._id)
      }
    >

      <Ionicons
        name={
          isInWishlist(product._id)
            ? "heart"
            : "heart-outline"
        }
        size={22}
        color={
          isInWishlist(product._id)
            ? "#B6FF2E"
            : "#FFF"
        }
      />

    </Pressable>

    <View style={{ marginLeft: 14 }}>
      <CartIcon />
    </View>

  </View>
<View style={styles.greenLine} />
</Animated.View>

    <Animated.View
      style={[
        styles.bottomBar,
        bottomBarStyle,
      ]}
    >

      <View>

        <Text style={styles.bottomLabel}>
          Total
        </Text>

        <Text style={styles.bottomPrice}>
          ₹{product.price}
        </Text>

      </View>

      <Pressable

        style={styles.cartButton}

        onPress={() => {

          if (!selectedSize) {

            Toast.show({

              type: "error",

              text1: "Please select a size",

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

        <Text style={styles.cartButtonText}>
          ADD TO BAG
        </Text>

        <View style={styles.arrowCircle}>

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

  hero: {
    width: "100%",
    height: HERO_HEIGHT,
    overflow: "hidden",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: "#FFF",
  },

heroSlider: {
  width,
  height: HERO_HEIGHT,
},
heroSlide: {
  width,
  height: HERO_HEIGHT,
},

  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * .35,
  },

  topBar: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
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
    bottom: 118,
    backgroundColor: "rgba(0,0,0,.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  counterText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },

  thumbnailContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },

  thumbnail: {
    width: 62,
    height: 82,
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
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 40,
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
    elevation: 20,
  },

  bottomLabel: {
    color: "#999",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
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
    fontWeight: "900",
    fontSize: 15,
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
    letterSpacing: 1.5,
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  productTitle: {
    marginTop: 18,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    color: "#111",
  },

  productSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#777",
    letterSpacing: .2,
  },

  priceRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 38,
    fontWeight: "900",
    color: "#111",
  },

 oldPriceContainer: {
  position: "relative",
  alignSelf: "flex-start",
  marginTop: 2,
},

oldPrice: {
  color: "#9A9A9A",
  fontSize: 18,
  lineHeight: 18,
},

oldPriceStrike: {
  position: "absolute",
  left: -1,
  right: -1,
  top: 11, // Adjust to 8-10 if needed
  height: 1,
  backgroundColor: "#B6FF2E",
  borderRadius: 2,
},

  savePill: {
    backgroundColor: "#B6FF2E",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  saveText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: .8,
  },

  infoRow: {
    marginTop: 30,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  infoItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    marginTop: 8,
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },

  infoSub: {
    marginTop: 3,
    color: "#8D8D8D",
    fontSize: 11,
  },

  divider: {
    width: 1,
    height: 42,
    backgroundColor: "#2C2C2C",
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
    color: "#73D01C",
    fontWeight: "800",
    fontSize: 14,
  },

  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
greenLine:{

  position:"absolute",

  bottom:0,

  left:18,

  right:18,

  height:2,

  backgroundColor:"#B6FF2E",

  borderRadius:2,

},
floatingHeader:{

  position:"absolute",

  top:height*0.045,

  left:16,

  right:16,

  height:60,

  flexDirection:"row",

  alignItems:"center",

  paddingHorizontal:8,

  backgroundColor:"rgba(17,17,17,.94)",

  borderRadius:20,

  borderWidth:1,

  borderColor:"rgba(182,255,46,.12)",

  shadowColor:"#000",

  shadowOpacity:.28,

  shadowRadius:18,

  shadowOffset:{
    width:0,
    height:8,
  },

  elevation:20,

},

headerTitle:{

  flex:1,

  marginHorizontal:10,

  color:"#FFF",

  fontSize:15,

  fontWeight:"800",

  textAlign:"center",

  letterSpacing:.3,

},

headerActions:{

  flexDirection:"row",

  alignItems:"center",

},

iconButton:{

  width:46,

  height:46,

  justifyContent:"center",

  alignItems:"center",

},
  sizeCard: {
    width: "31.5%",
    height: 86,
    borderRadius: 22,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  sizeCardActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  sizeDisabled: {
    opacity: .35,
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
    color: "#E53935",
  },

  descriptionCard: {
    marginTop: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 18,
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
    marginTop: 14,
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
    color: "#73D01C",
    fontWeight: "800",
    fontSize: 14,
  },

  relatedCard: {
    width: 180,
    height: 270,
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 18,
    backgroundColor: "#111",
  },

  relatedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
});