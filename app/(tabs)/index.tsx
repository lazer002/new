import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import api from "@/utils/config";
import { router, useRouter } from "expo-router";
import { useFilter } from "@/context/FilterContext";
import BottomFilterSheet from "@/components/BottomFilterSheet";
import { useWishlist } from "@/context/WishlistContext";
import { LinearGradient } from "expo-linear-gradient";
import PremiumDrawer from "@/components/PremiumDrawer";
import FloatingHeader from "@/components/FloatingHeader";


import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useUI } from "@/context/UIContext";
import { theme } from "@/utils/theme";
// or from responsive if you merge them
import {
  SCREEN,
  scale,
  verticalScale,
  normalize,
} from "@/utils/responsive";

const GRID_PADDING = theme.spacing.lg;
const GRID_GAP = theme.spacing.md;

const CARD_WIDTH =
  (SCREEN.width - GRID_PADDING * 2 - GRID_GAP) / 2;

/* ───────────────── PRODUCT CARD ───────────────── */
const getProductMeta = (id: string) => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const positiveHash = Math.abs(hash);

  // ⭐ Rating between 4.0 - 4.9
  const rating = (4 + (positiveHash % 10) / 10).toFixed(1);

  // 🛒 Buy count between 50 - 100
  const buyCount = 50 + (positiveHash % 51); // 50 to 100

  return { rating, buyCount };
};


// product card 
function ProductCard({ item }: { item: any }) {

  const router = useRouter();

  const imageRef = useRef<View>(null);

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const {
    rating,
    buyCount,
  } = getProductMeta(item._id);

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

      onPress={onOpenPDP}

      style={({ pressed }) => [

        styles.card,

        pressed && {
          transform: [
            {
              scale: .98,
            },
          ],
        },

      ]}

    >

      {/* IMAGE */}

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

      {/* DARK GRADIENT */}

      <LinearGradient

        colors={[

          "transparent",

          "rgba(0,0,0,.10)",

          "rgba(0,0,0,.45)",

          "rgba(0,0,0,.92)",

        ]}

        locations={[

          0,

          .45,

          .72,

          1,

        ]}

        style={styles.cardGradient}

      />

      {/* NEW BADGE */}

      <View style={styles.newBadge}>

        <Text style={styles.newText}>
          NEW
        </Text>

      </View>

      {/* WISHLIST */}



      <Pressable
        hitSlop={15}
        style={styles.heart}
        onPress={() =>
          isFav
            ? removeFromWishlist(item._id)
            : addToWishlist(item._id)
        }
      >

        <View style={styles.heartGlass}>

          <Ionicons
            name={
              isFav
                ? "heart"
                : "heart-outline"
            }
            size={theme.icon.sm}
            color={
              isFav
                ? theme.colors.black
                : theme.colors.black
            }
          />

        </View>

      </Pressable>

      {/* ---------- PREMIUM BADGE ---------- */}


      {/* CONTENT */}

      <View style={styles.cardContent}>

        {/* RATING */}
        {/* 
        <View style={styles.ratingRow}>

          <Ionicons
            name="star"
            size={theme.icon.xs}
            color=theme.colors.primary
          />

          <Text style={styles.ratingText}>
            {rating}
          </Text>

          <Text style={styles.buyText}>
            ({buyCount})
          </Text>

        </View>

    */}





        <View style={styles.bottomRow}>

          <View style={{ flex: 1 }}>

            <Text
              numberOfLines={2}
              style={styles.cardTitle}
            >
              {item.title}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{item.price}</Text>

              <View style={styles.oldPriceContainer}>
                <Text style={styles.oldPrice}>
                  ₹{Math.round(item.price * 1.3)}
                </Text>

                <View style={styles.oldPriceStrike} />
              </View>
            </View>

          </View>

{SCREEN.height >= 420 && (
  <Pressable style={styles.arrowBtn} onPress={onOpenPDP}>
    <Ionicons
      name="arrow-forward"
      size={theme.icon.sm}
      color={theme.colors.black}
    />
  </Pressable>
)}

        </View>

      </View>

    </Pressable>

  );

}
/* ───────────────── HOME ───────────────── */

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);



  const { setTabBarVisible } = useUI();
  const {
    drawerOpen,
    setDrawerOpen,
  } = useUI();
  const { filters, setFilters, isFilterOpen, setIsFilterOpen } = useFilter();
  useEffect(() => {
    api.get("/api/categories").then((res) =>
      setCategories(res.data.categories || [])
    );
    api.get("/api/products").then((res) =>
      setProducts(res.data.items || [])
    );
  }, []);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const lastOffset = useRef(0);

  const scrollingDown = useRef(false);


  const handleScroll = (
    event: any
  ) => {

    const offset =
      event.nativeEvent
        .contentOffset.y;

    const SHOW_AT = Math.max(headerHeight - 10, 120);
    const HIDE_AT = Math.max(headerHeight - 70, 80);

    if (!showFloatingHeader && offset >= SHOW_AT) {
      setShowFloatingHeader(true);
    } else if (showFloatingHeader && offset <= HIDE_AT) {
      setShowFloatingHeader(false);
    }

    if (offset < 10) {

      setTabBarVisible(true);

      lastOffset.current = offset;

      return;

    }

    if (
      offset >
      lastOffset.current + 8 &&
      !scrollingDown.current
    ) {

      scrollingDown.current = true;

      setTabBarVisible(false);

    }

    else if (
      offset <
      lastOffset.current - 8 &&
      scrollingDown.current
    ) {

      scrollingDown.current = false;

      setTabBarVisible(true);

    }

    lastOffset.current = offset;

  };


  /* ───────── FILTER LOGIC (INVENTORY SAFE) ───────── */

  const filteredProducts = products.filter((product) => {
    const productCategoryId =
      typeof product.category === "string"
        ? product.category
        : product.category?._id;

    const categoryMatch =
      !filters.category || productCategoryId === filters.category;

    const searchMatch = product.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const sizeMatch =
      filters.sizes.length === 0 ||
      filters.sizes.some(
        (size) => product.inventory?.[size] > 0
      );

    const colorMatch =
      filters.colors.length === 0 ||
      filters.colors.some((c) =>
        product.description?.toLowerCase().includes(c.toLowerCase())
      );

    const priceMatch =
      !filters.price ||
      (product.price >= filters.price.min &&
        product.price <= filters.price.max);

    return (
      categoryMatch &&
      searchMatch &&
      sizeMatch &&
      colorMatch &&
      priceMatch
    );
  });

  return (
    <Screen style={styles.screen}>
      <FloatingHeader
        visible={showFloatingHeader}
        categories={categories}
        activeCategory={filters.category}
        setActiveCategory={(id) =>
          setFilters((f) => ({
            ...f,
            category: id === "all" ? null : id,
          }))
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openFilter={() => setIsFilterOpen(true)}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}

        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Header
              categories={categories}
              activeCategory={filters.category}
              setActiveCategory={(id) =>
                setFilters((f) => ({
                  ...f,
                  category: id === "all" ? null : id,
                }))
              }
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openFilter={() => setIsFilterOpen(true)}
              openMenu={() => setDrawerOpen(true)}
              setHeaderHeight={setHeaderHeight}
            />
            <SectionHeader onSeeAll={() => router.push("/category")} />
          </>
        }
        contentContainerStyle={{
          paddingTop: theme.spacing.md,
          paddingBottom: verticalScale(120),
        }}
        renderItem={({ item, index }) => {

          const isLeft = index % 2 === 0;

          return (

            <View
              style={{
                width: CARD_WIDTH,
                marginBottom: theme.spacing.xs,
                marginTop: isLeft ? 0 : verticalScale(34),
                marginLeft: theme.spacing.sm,
                marginRight: theme.spacing.sm,
              }}
            >

              <ProductCard item={item} />

            </View>

          );

        }}

      />

      {/* ✅ BOTTOM FILTER SHEET */}
      <BottomFilterSheet
        visible={isFilterOpen}
        categories={categories}
        onClose={() => setIsFilterOpen(false)}
      />
      <PremiumDrawer
        visible={drawerOpen}
        categories={categories}
        onClose={() => setDrawerOpen(false)}
      />
    </Screen>
  );
}

/* ───────────────── HEADER ───────────────── */
function SectionHeader({
  onSeeAll,

}: {
  onSeeAll: () => void;

}) {

  return (

    <View style={styles.sectionHeader}>

      <View>

        <Text style={styles.sectionLabel}>
          JUST DROPPED
        </Text>

        <Text style={styles.sectionTitle}>
          Curated For You
        </Text>

      </View>

      <Pressable
        onPress={onSeeAll}
        style={styles.sectionBtn}
      >

        <Text style={styles.sectionBtnText}>
          View All
        </Text>

        <Ionicons
          name="arrow-forward"
          size={theme.icon.xs}
          color={theme.colors.primary}
          style={{
            marginLeft: theme.spacing.xs,
          }}
        />

      </Pressable>

    </View>

  );

}

function Header({
  categories,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  openFilter,
  openMenu,
  setHeaderHeight

}: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  openFilter: () => void;
  openMenu: () => void;
  setHeaderHeight: (height: number) => void;
}) {

  const categoryScrollRef = useRef<ScrollView>(null);

  const categoryRefs = useRef<
    Record<string, View | null>
  >({});

  const scrollToCategory = (key: string) => {
    const pill = categoryRefs.current[key];
    const scroll = categoryScrollRef.current;

    if (!pill || !scroll) return;

    requestAnimationFrame(() => {
      pill.measureLayout(
        scroll as any,
        (x, y, w) => {
          scroll.scrollTo({
            x: Math.max(0, x - SCREEN.width / 2 + w / 2),
            animated: true,
          });
        },
        () => { }
      );
    });
  };
  return (

    <View style={styles.header}
      onLayout={(e) =>
        setHeaderHeight(e.nativeEvent.layout.height)
      }>

      {/* ---------- TOP ---------- */}

      <View style={styles.topRow}>

        <Pressable
          style={styles.menuButton}
          onPress={openMenu}
        >

          <View style={styles.menuLineTop} />

          <View style={styles.menuLineMiddle} />

          <View style={styles.menuLineBottom} />

        </Pressable>

        <Pressable
          style={styles.profileBtn}
          onPress={() => router.push("/profile")}
        >
          <Ionicons
            name="person-outline"
            size={theme.icon.md}
            color={theme.colors.black}
          />
          <View style={styles.onlineDot} />
        </Pressable>

      </View>

      {/* ---------- TITLE ---------- */}

      <Text style={styles.explore}>
        Explore
      </Text>

      <Text style={styles.heroTitle}>

        The Latest

      </Text>

      <Text style={styles.heroAccent}>

        Drops

      </Text>

      {/* ---------- SEARCH ---------- */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search-outline"
          size={theme.icon.md}
          color="#8A8A8A"
        />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search sneakers, apparel..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />

        <Pressable
          onPress={openFilter}
          style={styles.filterIcon}
        >

          <Ionicons
            name="options-outline"
            size={theme.icon.sm}
            color={theme.colors.white}

          />

        </Pressable>

      </View>

      {/* ---------- CATEGORY ---------- */}

      <ScrollView
        ref={categoryScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >

        {/* ALL */}

        <Pressable
          ref={(ref) => {
            categoryRefs.current["all"] = ref;
          }}
          onPress={() => {
            setActiveCategory("all");
            scrollToCategory("all");
          }}
          style={[
            styles.pill,
            activeCategory === null &&
            styles.pillActive,
          ]}
        >

          <View style={styles.pillRow}>

            {activeCategory === null && (

              <Ionicons
                name="sparkles"
                size={theme.icon.xs}
                color={theme.colors.primary}
                style={{
                  marginRight: theme.spacing.xs,
                }}
              />

            )}

            <Text
              style={[
                styles.pillText,
                activeCategory === null &&
                styles.pillTextActive,
              ]}
            >
              All
            </Text>

          </View>

        </Pressable>

        {/* CATEGORIES */}
        <Pressable
          onPress={() => router.push("/bundle")}
          style={styles.bundlePill}
        >
          <Ionicons
            name="sparkles"
            size={theme.icon.xs}
            color={theme.colors.black}
            style={{ marginRight: theme.spacing.xs }}
          />

          <Text style={styles.bundlePillText}>
            Bundle
          </Text>


        </Pressable>
        {categories.map((cat) => {

          const active =
            activeCategory === cat._id;

          return (

            <Pressable
              ref={(ref) => {
                categoryRefs.current[cat._id] = ref;
              }}
              key={cat._id}
              onPress={() => {
                setActiveCategory(cat._id);
                scrollToCategory(cat._id);
              }}
              style={[
                styles.pill,
                active &&
                styles.pillActive,
              ]}
            >

              <View style={styles.pillRow}>

                {active && (

                  <Ionicons
                    name="sparkles"
                    size={theme.icon.xs}
                    color={theme.colors.primary}
                    style={{
                      marginRight: theme.spacing.xs,
                    }}
                  />

                )}

                <Text
                  numberOfLines={1}
                  style={[
                    styles.pillText,
                    active &&
                    styles.pillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>

              </View>

            </Pressable>

          );

        })}

      </ScrollView>

    </View>

  );

}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
screen: {
  backgroundColor: theme.colors.background,
},



  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLabel: {
    fontSize: theme.typography.sm,
    fontWeight: "700",
    color: theme.colors.textMuted,
    letterSpacing: theme.spacing.xs,
    textTransform: "uppercase",
  },

  headerTitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.h6,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -.8,
  }

  ,
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    height: theme.spacing.xl,
  },







  category: {
    fontSize: theme.typography.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },

  title: {
    fontSize: theme.typography.xs,
    fontWeight: "600",
    marginTop: theme.spacing.xs,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg, // if not supported use marginRight
  },



  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",

    paddingHorizontal: theme.spacing.xl,

    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },

  sectionLabel: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    letterSpacing: theme.spacing.xs,
    textTransform: "uppercase",
  },

  sectionTitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.h3,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -.5,
  },

  sectionBtn: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: theme.spacing.md,
    height: verticalScale(38),

    borderRadius: theme.radius.full,

    backgroundColor: theme.colors.black,
  },

  sectionBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },


  oldPriceWrapper: {
    marginLeft: theme.spacing.sm,
    position: "relative",
    justifyContent: "center",
  },

  oldPriceText: {
    fontSize: theme.typography.lg,
    fontWeight: "500",
      color: theme.colors.text,
  },



  seeAll: {
    fontSize: theme.typography.xs,
     color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.55,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.black,
    ...theme.shadow.lg
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  newBadge: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.black,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  newText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: theme.fontWeight.black,
    letterSpacing: theme.spacing.xs,
  },

  heart: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: theme.layout.iconButton,
    height: theme.layout.iconButton,
    borderRadius: theme.radius.lg,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.white,
    fontSize: theme.typography.md,
    fontWeight: theme.fontWeight.bold,
  },

  buyText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontSize: theme.typography.sm,
  },

  cardTitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: theme.fontWeight.black,
    lineHeight: theme.typography.h6,
  },
  bottomRow: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  price: {
    color: theme.colors.white,
    fontSize: theme.typography.h6,
    fontWeight: "900",
  },

  oldPriceContainer: {
    position: "relative",
    marginLeft: theme.spacing.xs,
    justifyContent: "center",
    alignSelf: "center",
  },

  oldPrice: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.lg,
    paddingHorizontal: theme.spacing.xxs,
  },

  oldPriceStrike: {
    position: "absolute",
    left: 0,
    right: 0,
    top: theme.spacing.sm,
    height: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
  },

  heartGlass: {
    width: theme.layout.iconButton,
    height: theme.layout.iconButton,
    borderRadius: theme.radius.lg,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeRow: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.spacing.sm,
    height: theme.layout.pillHeight,
    borderRadius: theme.radius.full,
  },

  ratingPillText: {
    color: theme.colors.white,
    fontWeight: "700",
    marginLeft: theme.spacing.xs,
  },

  priceRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  arrowBtn: {
    width: theme.layout.iconButtonLg,
    height: theme.layout.iconButtonLg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },


  menuButton: {
    width: theme.layout.headerButton,
    height: theme.layout.headerButton,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    ...theme.shadow.sm,
  },

menuLineTop: {
  width: scale(26),
  height: verticalScale(3),
  borderRadius: theme.radius.xs,
  backgroundColor: theme.colors.black,
  marginBottom: theme.spacing.xs,
},

menuLineMiddle: {
  width: scale(20),
  height: verticalScale(3),
  borderRadius: theme.radius.xs,
  backgroundColor: theme.colors.primary,
  marginBottom: theme.spacing.xs,
},

menuLineBottom: {
  width: scale(26),
  height: verticalScale(3),
  borderRadius: theme.radius.xs,
  backgroundColor: theme.colors.black,
},
  profileBtn: {
    width: theme.layout.headerButton,
  height: theme.layout.headerButton,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  profileImage: {
    width: scale(58),
    height: "auto",
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    resizeMode: "contain",
    filter: "hue-rotate(45deg) saturate(1.2) brightness(1.1)",
  },

  onlineDot: {
    position: "absolute",
    top: theme.spacing.xxs,
    right: theme.spacing.xxs,
    width: theme.layout.onlineDot,
    height: theme.layout.onlineDot,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.black,
    borderWidth: theme.spacing.xxs,
    ...theme.shadow.md,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  explore: {
    marginTop: verticalScale(25),
    color: theme.colors.black,
    fontSize: theme.typography.h6,
    fontWeight: "500",
  },

  heroTitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.display,
    fontWeight: "900",
    color: theme.colors.text,
    lineHeight: theme.typography.h1,
  },

  heroAccent: {
    marginTop: -2,
    fontSize: theme.typography.display,
    fontWeight: "900",
    color: theme.colors.primary,
    lineHeight: theme.typography.display,

  },

  searchBox: {
    marginTop: verticalScale(27),
    height: verticalScale(63),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },

  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.lg,
  },
  filterIcon: {
    width: theme.layout.filterButton,
    height: theme.layout.filterButton,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.black,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadow.sm,
  },
  tabs: {
    paddingVertical: verticalScale(theme.spacing.lg),

    paddingRight: theme.spacing.xl,
  },

  pill: {
    height: theme.layout.pillHeight,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginRight: theme.spacing.md,
  },

  pillActive: {
    backgroundColor: theme.colors.black,
  },

  pillText: {
    color: theme.colors.textSecondary,
    fontWeight: "700",
    fontSize: theme.typography.md,
  },

  pillTextActive: {
    color: theme.colors.white,
  },


  bundlePill: {
    height: theme.layout.pillHeight,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.md,
    // ...theme.shadow.sm,
  },
  bundlePillText: {
    color: theme.colors.text,
    fontSize: theme.typography.md,
    fontWeight: "900",
  },


});
