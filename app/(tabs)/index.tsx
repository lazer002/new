import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons,AntDesign  } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import api from "@/utils/config";
import { router, useRouter } from "expo-router";
import { useFilter } from "@/context/FilterContext";
import BottomFilterSheet from "@/components/BottomFilterSheet";
import { useWishlist } from "@/context/WishlistContext";
import { LinearGradient } from "expo-linear-gradient";
import PremiumDrawer from "@/components/PremiumDrawer";
import FloatingHeader from "@/components/FloatingHeader";
import {
  FONT,
  ICON,
  BUTTON,
  SPACING,
  RADIUS,
  SAFE,
  SHADOW,
  PRODUCT,
  productCardWidth,
  hairline,
  lineHeight,
  SCREEN,
} from "@/theme/responsive";

import Animated, {
  useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useUI } from "@/context/UIContext";
const CARD_WIDTH = productCardWidth;
const CARD_HEIGHT = CARD_WIDTH * PRODUCT.imageRatio;



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
    size={ICON.md}
      color={
        isFav
          ? "#000000"
          : "#000000"
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
            size={16}
            color="#B6FF2E"
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

<View style={styles.priceRow} >
  <Text style={styles.price}>₹{item.price}</Text>

  <View style={styles.oldPriceContainer}>
    <Text style={styles.oldPrice}>
      ₹{Math.round(item.price * 1.3)}
    </Text>

    <View style={styles.oldPriceStrike} />
  </View>
</View>

  </View>

  {/* <Pressable style={styles.arrowBtn} onPress={onOpenPDP}>

    <Ionicons
      name="arrow-forward"
      size={20}
      color="#111"
    />

  </Pressable> */}

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
  const { filters, setFilters,isFilterOpen, setIsFilterOpen } = useFilter();
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
        contentContainerStyle={{   paddingTop:10,
  paddingBottom: 120, }}
renderItem={({ item, index }) => {

  const isLeft = index % 2 === 0;

  return (

    <View
      style={{
        width: CARD_WIDTH,

        marginBottom: -6,

        marginTop: isLeft ? 0 : 32,

        marginLeft: isLeft ? SPACING.md : SPACING.sm,

        marginRight: isLeft ? SPACING.sm : SPACING.lg,
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
          size={ICON.xs}
          color="#B6FF2E"
          style={{
            marginLeft: 6,
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
      () => {}
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
   size={ICON.md}
    color="#000000"
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
    size={ICON.md}
    color="#8A8A8A"
  />

  <TextInput
    value={searchQuery}
    onChangeText={setSearchQuery}
    placeholder="Search sneakers..."
    placeholderTextColor="#9A9A9A"
    style={styles.searchInput}
  />

  <Pressable
    onPress={openFilter}
    style={styles.filterIcon}
  >

    <Ionicons
      name="options-outline"
     size={ICON.md}
      color="#ffffffc0"
      
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
          size={ICON.xs}
          color="#9dff00"
          style={{
            marginRight: 6,
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
    size={ICON.xs}
    color="#111"
    style={{ marginRight: 6 }}
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
              size={ICON.xs}
              color="#9dff00"
              style={{
                marginRight: 6,
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
  screen: { backgroundColor: "#fafafa" },



sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",

paddingHorizontal: SAFE.horizontal,
marginTop: SPACING.xl,
marginBottom: SPACING.xxl,
},

sectionLabel: {
  fontWeight: "800",
  color: "#A1A1A1",
fontSize: FONT.xs,
letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: -SPACING.md,
},

sectionTitle: {
marginTop: SPACING.sm,
fontSize: 27,
letterSpacing: -0.5,
  fontWeight: "900",
  color: "#111",
},

sectionBtn: {
  flexDirection: "row",
  alignItems: "center",

paddingHorizontal: SPACING.lg,

height: BUTTON.sm,

borderRadius: RADIUS.full,

  backgroundColor: "#111",
},

sectionBtnText: {
  color: "#FFF",
fontSize: FONT.sm,
  fontWeight: "700",
},

oldPriceWrapper: {
  marginLeft: SPACING.xs,
  position: "relative",
  justifyContent: "center",
},

oldPriceText: {
  fontSize: FONT.md,
  fontWeight: "500",
  color: "#272727ff",
},

strikeLine: {
  position: "absolute",
  left: 0,
  right: -2,
  top: "55%",
  height: hairline * 2,
  backgroundColor: "red",
  transform: [{ rotate: "-12deg" }],
},

seeAll: {
  fontSize: 18,
  color: "#464747ff",
  fontWeight: "600",
},

card: {
  width: CARD_WIDTH,
  height: CARD_HEIGHT ,
  borderRadius: RADIUS.xxl,
  overflow: "hidden",
  marginBottom: SPACING.xxl,
  backgroundColor: "#111",

  shadowColor: "#000",
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10,
  },

  elevation: 12,
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
  top: SPACING.md,
  left: SPACING.md,

  backgroundColor: "#000000",

  borderRadius: RADIUS.xl,

  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.xs,
},

newText: {
  color: "#ffffff",
  fontSize:FONT.xs,
  fontWeight: "900",
  letterSpacing: 1.2,
},

heart: {
  position: "absolute",

   top: SPACING.sm,

  right: SPACING.sm,

  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "rgba(255,255,255,0)",

  justifyContent: "center",
  alignItems: "center",
},

cardContent: {
  position: "absolute",

  left: SPACING.lg,
  right: SPACING.lg,
  bottom: SPACING.lg,
},

ratingRow: {
  flexDirection: "row",
  alignItems: "center",
},

ratingText: {
  marginLeft: SPACING.xs,
  color: "#FFF",
  fontSize: 15,
  fontWeight: "800",
},

buyText: {
  marginLeft: 4,
  color: "#D5D5D5",
  fontSize: 13,
},

cardTitle: {
  marginTop: SPACING.sm,
  color: "#FFF",
  fontSize: FONT.md,
  fontWeight: "900",
 lineHeight: lineHeight(FONT.md),
},

bottomRow: {
  marginTop: SPACING.lg,
  flexDirection: "row",
  justifyContent: "space-between",
  // alignItems: "flex-end",
},

price: {
  color: "#FFF",
  fontSize: 23,
  fontWeight: "900",
},

oldPriceContainer: {
  position: "relative",
  marginLeft: 4,
  justifyContent: "center",
  alignSelf: "center",
},

oldPrice: {
  color: "#9A9A9A",
  fontSize: 17,
  paddingHorizontal: 2,
},

oldPriceStrike: {
  position: "absolute",
  left: 0,
  right: 0,

  top: 12,

  height: hairline * 3,

  backgroundColor: "#B6FF2E",

  borderRadius: 2,
},

heartGlass: {
  width: 46,
  height: 46,

  borderRadius: 23,

  backgroundColor: "rgba(255,255,255,0)",

  justifyContent: "center",
  alignItems: "center",
},
badgeRow: {
  position: "absolute",

  top: SPACING.md,
  left: SPACING.md,
  right: SPACING.md,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

ratingPill: {
  flexDirection: "row",
  alignItems: "center",

  backgroundColor: "rgba(0,0,0,.55)",

  paddingHorizontal: SPACING.sm,

  height: 30,

  borderRadius: 15,
},

ratingPillText: {
  color: "#FFF",
  fontWeight: "700",

  marginLeft: 4,

  fontSize: 13,
},

priceRow: {
  marginTop: SPACING.sm,

  flexDirection: "row",
  alignItems: "center",
},
arrowBtn: {
  width: 40,
  height: 40,

  borderRadius: 20,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",
  alignItems: "center",

  marginLeft: SPACING.sm,
},

header: {
  paddingHorizontal: SAFE.horizontal,
  paddingTop: SPACING.sm,
  paddingBottom: SPACING.xs,
},

topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

menuButton: {
  width: 52,
  height: 52,

  borderRadius: RADIUS.xl,

  backgroundColor: "#FFF",

  justifyContent: "center",

  paddingHorizontal: SPACING.md,

  ...SHADOW.xs,
},

menuLineTop: {
  width: 26,
  height: hairline * 3,

  borderRadius: 2,

  backgroundColor: "#111",

  marginBottom: SPACING.xs,
},

menuLineMiddle: {
  width: 20,
  height: hairline * 3,

  borderRadius: 2,

  backgroundColor: "#B6FF2E",

  marginBottom: SPACING.xs,
},

menuLineBottom: {
  width: 26,
  height: hairline * 3,

  borderRadius: 2,

  backgroundColor: "#111",
},

profileBtn: {
  width: 52,
  height: 52,

  borderRadius: RADIUS.xl,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",
  alignItems: "center",
},

profileImage: {
  width: 64,
  aspectRatio: 1,

  borderRadius: 23,

  resizeMode: "contain",
},

onlineDot: {
  position: "absolute",

  top: 4,
  right: 4,

  width: 10,
  height: 10,

  borderRadius: 5,

  backgroundColor: "#000",

  borderWidth: hairline * 3,

  shadowColor: "#B6FF2E",
  shadowOpacity: 0.45,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 2,
  },

  elevation: 5,
},

pillRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

explore: {
  marginTop: SPACING.xxxl,

  color: "#000",

  fontSize: FONT.xxl,

  fontWeight: "500",
},

heroTitle: {
  fontSize: FONT.hero,

  fontWeight: "900",

  color: "#111",

  lineHeight: lineHeight(FONT.hero),
},

heroAccent: {
  marginTop: -22,

  fontSize: FONT.hero,

  fontWeight: "900",

  color: "#B6FF2E",

  lineHeight: lineHeight(FONT.hero),
},

searchBox: {
  marginTop: SPACING.lg,

  height: 54,

  borderRadius: RADIUS.full,

  backgroundColor: "#F5F5F5",

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: SPACING.xl,
},

searchInput: {
  flex: 1,

  marginLeft: SPACING.sm,

  color: "#111",

  fontSize: 13,
},

filterIcon: {
  width: 36,
  height: 36,

  borderRadius: RADIUS.md,

  backgroundColor: "#000000ee",

  justifyContent: "center",

  alignItems: "center",

  ...SHADOW.sm,
},

tabs: {
  paddingTop: SPACING.xl,

  paddingRight: SPACING.xxl,
},

pill: {
  height: 44,

  borderRadius: RADIUS.full,

  backgroundColor: "#F5F5F5",

  justifyContent: "center",

  alignItems: "center",

  paddingHorizontal: SPACING.xl,

  marginRight: SPACING.sm,
},

pillActive: {
  backgroundColor: "#111",
},

pillText: {
  color: "#444",

  fontWeight: "700",

  fontSize: 15,
},

pillTextActive: {
  color: "#FFF",
},

bundlePill: {
  height: 44,

  borderRadius: RADIUS.full,

  backgroundColor: "#B6FF2E",

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: SPACING.lg,

  marginRight: SPACING.sm,

  shadowColor: "#B6FF2E",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 6,
},

bundlePillText: {
  color: "#111",

  fontSize: 15,

  fontWeight: "900",
},
});
