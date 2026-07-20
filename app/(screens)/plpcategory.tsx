
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Text,
  Animated,
  ActivityIndicator
} from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import { useFilter } from "@/context/FilterContext";
import api from "@/utils/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWishlist } from "@/context/WishlistContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { SCREEN, scale, normalize } from "@/utils/responsive";
const CARD_WIDTH = (SCREEN.width - scale(48)) / 2;
const HERO_HEIGHT = 280;
const AnimatedFlatList =
  Animated.FlatList
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

      <View

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
                ? "#000000"
                : "#111"
            }
          />

        </Pressable>

      </View>

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
  const { filters, setFilters, isFilterOpen, setIsFilterOpen, activeCount } = useFilter();
  const router = useRouter();

  const [allProducts, setAllProducts] =
    useState<any[]>([]);

  const [products, setProducts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [heroLoaded, setHeroLoaded] =
    useState(false);



  const scrollY =
    useRef(
      new Animated.Value(0)
    ).current;

  const stickyOpacity =
    scrollY.interpolate({
      inputRange: [
        HERO_HEIGHT - 90,
        HERO_HEIGHT - 20,
      ],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

  const heroTranslate =
    scrollY.interpolate({
      inputRange: [0, HERO_HEIGHT],
      outputRange: [0, -80],
      extrapolate: "clamp",
    });

  const heroFade =
    scrollY.interpolate({
      inputRange: [0, HERO_HEIGHT - 60],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });



  const Header = () => (
    <View>

      <Animated.View
        style={[
          styles.heroContainer,
          {
            opacity: heroFade,
          },
        ]}
      >

        {loading || !heroLoaded ? (

          <View style={styles.heroSkeleton}>

            <ActivityIndicator
              size="large"
              color="#B6FF2E"
            />

          </View>

        ) : (

          <Image
            source={{
              uri: products?.[0]?.images?.[0],
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

        )}

        <View style={styles.heroOverlay} />

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
            <Pressable style={styles.glassInner}  onPress={() => router.replace("/(tabs)")}>
            <Octicons
          name="home-fill"
          size={20}
          color="#111"
        />
            </Pressable>
          </BlurView>

        </View>

        <View style={styles.heroContent}>

          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>
              NEW ARRIVALS
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            {products?.[0]?.category?.name ??
              "COLLECTION"}
          </Text>

          <Text style={styles.heroSubtitle}>
            {products.length} PRODUCTS
          </Text>

        </View>

      </Animated.View>

      <View style={styles.collectionBar}>

        <View style={{ flex: 1 }}>

          <Text style={styles.collectionEyebrow}>
            CURATED
          </Text>

          <Text style={styles.collectionTitle}>
            {products.length} PRODUCTS
          </Text>

        </View>

        <Pressable
          style={styles.filterButton}
          onPress={() =>
            setIsFilterOpen(true)
          }
        >

          <View>

            <Ionicons
              name="options-outline"
              size={20}
              color="#111"
            />

            {activeCount > 0 && (

              <View
                style={styles.filterBadge}
              >

                <Text
                  style={
                    styles.filterBadgeText
                  }
                >
                  {activeCount}
                </Text>

              </View>

            )}

          </View>

        </Pressable>

      </View>

    </View>
  );



  useEffect(() => {

    let mounted = true;

    const load = async () => {

      setLoading(true);

      try {

        const res =
          await api.get(
            "/api/products"
          );

        const items =
          res.data.items || [];

        const filtered =
          items.filter(
            (p: any) => {

              const catId =
                typeof p.category ===
                  "string"
                  ? p.category
                  : p.category?._id;

              return (
                !category ||
                catId === category
              );

            }
          );

        if (!mounted) return;

        setAllProducts(filtered);

        setProducts(filtered);

        const first =
          filtered?.[0]?.images?.[0];

        if (first) {
          Image.prefetch(first).then(() => {
            setHeroLoaded(true);
          });
        }
      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    load();

    return () => {
      mounted = false;
    };

  }, [category]);

  useEffect(() => {

    let result = [...allProducts];

    if (filters.category) {

      result = result.filter(
        p =>
          (typeof p.category === "string"
            ? p.category
            : p.category?._id) ===
          filters.category
      );

    }

    if (filters.sizes.length) {

      result = result.filter(p =>
        p.sizes?.some((size: any) =>
          filters.sizes.includes(size)
        )
      );

    }

    if (filters.colors.length) {

      result = result.filter(p =>
        p.colors?.some((color: any) =>
          filters.colors.includes(color)
        )
      );

    }

    if (filters.price) {

      result = result.filter(
        p =>
          p.price >= filters.price!.min &&
          p.price <= filters.price!.max
      );

    }

    if (filters.inStockOnly) {

      result = result.filter(
        p => p.stock > 0
      );

    }

    if (filters.onSale) {

      result = result.filter(
        p => p.discount > 0
      );

    }

    if (filters.isNewProduct) {

      result = result.filter(
        p => p.isNew
      );

    }

    setProducts(result);

  }, [
    allProducts,
    filters,
  ]);

  if (loading) {

    return (

      <Screen style={styles.screen}>

        <View style={styles.heroSkeleton}>

          <ActivityIndicator
            size="large"
            color="#B6FF2E"
          />

        </View>

        <View
          style={styles.skeletonGrid}
        >

          {Array.from({
            length: 6,
          }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                i % 2 === 1 && {
                  marginTop: 18,
                },
              ]}
            />
          ))}

        </View>

      </Screen>

    );

  }

  return (
    <Screen style={styles.screen}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.stickyHeader,
          {
            opacity:
              stickyOpacity,
          },
        ]}
      >

        <Pressable
          style={styles.stickyBack}
          onPress={() =>
            router.back()
          }
        >

          <Ionicons
            name="chevron-back"
            size={22}
            color="#111"
          />

        </Pressable>

        <Text
          style={
            styles.stickyTitle
          }
        >

          {
            products.length
          } PRODUCTS

        </Text>


        <Pressable style={styles.filterButton}>



          <Ionicons
            name="options-outline"
            size={20}
            color="#111"
          />

        </Pressable>

      </Animated.View>



      <AnimatedFlatList
        data={products}
        keyExtractor={(item: any) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {
            useNativeDriver: false,
          }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (

          <Animated.View
            style={[
              styles.cardWrapper,
              {
                marginTop: index % 2 ? 18 : 0,
                marginRight: index % 2 === 0 ? 12 : 0,

              },
            ]}
          >

            <ProductCard item={item} />

          </Animated.View>

        )}
        ListHeaderComponent={Header}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </Screen>
  );
}

/* 🎨 STYLES (SAME AS HOME) */

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor: "#fff",
  },
  heroContainer: {
    width: "100%",
    height: HERO_HEIGHT,

    overflow: "hidden",

    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,

    backgroundColor: "#111",

    marginBottom: 0,
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

    // borderWidth: 1,

    // borderColor: "rgba(255,255,255,.35)",
  },

  newBadge: {
    position: "absolute",

    top: 14,
    left: 14,

    backgroundColor: "#000000",

    borderRadius: 16,

    paddingHorizontal: 12,

    paddingVertical: 6,
  },

  newBadgeText: {
    color: "#ffffff",

    fontWeight: "900",

    fontSize: normalize(11),

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

    fontSize: normalize(14),
  },

  buyCount: {
    color: "#CFCFCF",

    marginLeft: 4,

    fontSize: normalize(12),
  },

  productTitle: {
    color: "#FFF",

    fontSize: normalize(22),

    fontWeight: "900",

    marginTop: 10,

    lineHeight: normalize(28),
  },

  bottomRow: {
    marginTop: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  price: {
    color: "#FFF",

    fontSize: normalize(28),

    fontWeight: "900",
  },

  oldPrice: {
    color: "#AFAFAF",

    marginTop: 3,

    textDecorationLine: "line-through",

    fontSize: normalize(15),
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
  heroImage: {
    width: "100%",

    height: "100%",

    position: "absolute",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0,0,0,.42)",
  },
  heroTop: {
    position: "absolute",

    top: 28,

    left: 20,

    right: 20,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  glassBtn: {
    width: 54,

    height: 54,

    borderRadius: 27,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,.35)",
  },

  glassInner: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  heroPill: {
    alignSelf: "flex-start",

    backgroundColor: "#B6FF2E",

    borderRadius: 18,

    paddingHorizontal: 14,

    paddingVertical: 7,
  },

  heroPillText: {
    color: "#111",

    fontWeight: "900",

    fontSize: normalize(11),

    letterSpacing: 1.5,
  },

  heroSubtitle: {
    marginTop: 8,

    color: "#DDD",

    fontSize: normalize(15),

    letterSpacing: 1.2,

    fontWeight: "600",
  },

  heroBottom: {
    marginTop: 30,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  heroStat: {
    alignItems: "flex-start",
  },

  heroStatNumber: {
    color: "#FFF",

    fontSize: normalize(36),

    fontWeight: "900",
  },

  heroStatLabel: {
    color: "#AAA",

    letterSpacing: 2,

    fontWeight: "700",
  },

  heroArrow: {
    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",
  },



  backBtn: {
    position: "absolute",
    top: SCREEN.width > 600 ? 30 : 20,
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
  heroContent: {
    position: "absolute",

    left: 24,
    right: 24,
    bottom: 26,
  },
  heroTitle: {
    marginTop: 12,

    color: "#FFF",

    fontSize: normalize(34),

    fontWeight: "900",

    letterSpacing: -1,

    lineHeight: normalize(38),
  },
  filterTopBtn: {
    position: "absolute",
    top: SCREEN.width > 600 ? 30 : 20,
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


  listContent: {
    paddingHorizontal: 6,

    paddingBottom: 120,

    paddingTop: 6,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  heroSkeleton: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#EEE",
  },
  cardWrapper: {
    marginBottom: 10,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: normalize(15),
    fontWeight: "600",
  },

  buyText: {
    fontSize: normalize(12),
    color: "#3f3e3eff",
  },


  skeletonGrid: {
    paddingHorizontal: 6,

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    paddingTop: 18,
  },

  skeletonCard: {
    width: CARD_WIDTH,

    height: CARD_WIDTH * 1.58,

    borderRadius: 28,

    backgroundColor: "#ECECEC",

    marginBottom: 20,
  },

  collectionBar: {
    marginHorizontal: 18,

    marginTop: -26,

    marginBottom: 18,

    height: 78,

    borderRadius: 26,

    backgroundColor: "#FFF",

    paddingHorizontal: 22,

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 10,
  }, collectionTitle: {
    marginTop: 2,

    color: "#111",

    fontSize: normalize(22),

    fontWeight: "900",
  }, collectionEyebrow: {
    color: "#999",

    fontSize: normalize(11),

    letterSpacing: 2,
  }, stickyHeader: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    zIndex: 100,

    height: 92,

    paddingTop: 42,

    paddingHorizontal: 18,

    backgroundColor: "#FFF",

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 14,
  },
  filterBadge: {
    position: "absolute",

    top: -6,

    right: -8,

    width: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",
  },

  filterBadgeText: {
    color: "#B6FF2E",

    fontSize: normalize(10),

    fontWeight: "900",
  },
  filterButton: {
    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#B6FF2E",

    shadowOpacity: 0.28,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8,
  },
  stickyBack: {
    width: 44,

    height: 44,

    justifyContent: "center",

    alignItems: "center",
  }, stickyTitle: {
    flex: 1,

    textAlign: "center",

    color: "#111",

    fontSize: normalize(18),

    fontWeight: "900",
  },



});

