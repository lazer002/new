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

import Animated, {
  useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useUI } from "@/context/UIContext";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

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
      size={22}
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

  <Pressable style={styles.arrowBtn}>

    <Ionicons
      name="arrow-forward"
      size={20}
      color="#111"
    />

  </Pressable>

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
            openFilter={() => setIsFilterOpen(true)} // ✅ FIXED
            openMenu={() => setDrawerOpen(true)}
          />
          <SectionHeader onSeeAll={() => router.push("/category")} />
            </>
        }
        contentContainerStyle={{   paddingTop: 10,
  paddingBottom: 120, }}
renderItem={({ item, index }) => {

  const isLeft = index % 2 === 0;

  return (

    <View
      style={{
        width: CARD_WIDTH,

        marginBottom: 2,

        marginTop: isLeft ? 0 : 34,

        marginLeft: isLeft ? 12  : 8,

        marginRight: isLeft ? 8 : 16,
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
          size={16}
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
}: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  openFilter: () => void;
  openMenu: () => void;
}) {

  return (

    <View style={styles.header}>

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

  <Image
    source={{
      uri: "https://i.pravatar.cc/150?img=12",
    }}
    style={styles.profileImage}
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
    size={23}
    color="#8A8A8A"
  />

  <TextInput
    value={searchQuery}
    onChangeText={setSearchQuery}
    placeholder="Search sneakers, apparel..."
    placeholderTextColor="#9A9A9A"
    style={styles.searchInput}
  />

  <Pressable
    onPress={openFilter}
    style={styles.filterIcon}
  >

    <Ionicons
      name="options-outline"
      size={22}
      color="#ffffffc0"
      
    />

  </Pressable>

</View>

      {/* ---------- CATEGORY ---------- */}

   <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.tabs}
>

  {/* ALL */}

  <Pressable
    onPress={() => setActiveCategory("all")}
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
          size={14}
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

  {categories.map((cat) => {

    const active =
      activeCategory === cat._id;

    return (

      <Pressable
        key={cat._id}
        onPress={() =>
          setActiveCategory(cat._id)
        }
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
              size={14}
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



headerTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

headerLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#9A9A9A",
  letterSpacing: 2,
  textTransform: "uppercase",
},

headerTitle: {
  marginTop: 4,
  fontSize: 36,
  fontWeight: "900",
  color: "#111",
  letterSpacing: -.8,
}

,
search: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f2f2f2",
  borderRadius: 30,
  paddingHorizontal: 16,
  paddingTop: 1,
  height: 46,
},



tab: {
  paddingHorizontal: 24,
  paddingVertical: 10,
  backgroundColor: "#eee",
  borderRadius: 20,
  marginRight: 10,
},

tabActive: {
  backgroundColor: "#000000ff", // green like your design
},

tabText: {
  fontSize: 16,
  color: "#000",
  fontWeight: "500",
},

tabTextActive: {
  color: "#fff",
  fontWeight: "600",
},

tabContent: {
  flexDirection: "row",
  alignItems: "center",
},





  category: {
    fontSize: 14,
    color: "#999",
    marginTop: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },

  searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10, // if not supported use marginRight
},



sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",

  paddingHorizontal: 20,

  marginTop: 18,
  marginBottom: 24,
},

sectionLabel: {
  fontSize: 11,
  fontWeight: "800",
  color: "#A1A1A1",
  letterSpacing: 2,
  textTransform: "uppercase",
},

sectionTitle: {
  marginTop: 6,
  fontSize: 30,
  fontWeight: "900",
  color: "#111",
  letterSpacing: -.5,
},

sectionBtn: {
  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 16,
  height: 42,

  borderRadius: 21,

  backgroundColor: "#111",
},

sectionBtnText: {
  color: "#FFF",
  fontSize: 14,
  fontWeight: "700",
},


oldPriceWrapper: {
  marginLeft: 8,
  position: "relative",
  justifyContent: "center",
},

oldPriceText: {
  fontSize: 16,
  fontWeight: "500",
  color: "#272727ff",
},

strikeLine: {
  position: "absolute",
  left: 0,
  right: -2,
  top: "55%",
  height: 2,
  backgroundColor: "red",
  transform: [{ rotate: "-12deg" }], // 👈 diagonal slash
},


seeAll: {
  fontSize: 18,
  color: "#464747ff", // green accent
  fontWeight: "600",
},
card: {
  width: CARD_WIDTH,
  height: CARD_WIDTH * 1.55,
  borderRadius: 30,
  overflow: "hidden",
  marginBottom: 26,
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
  top: 16,
  left: 16,
  backgroundColor: "#000000",
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 8,
},

newText: {
  color: "#ffffff",
  fontSize: 11,
  fontWeight: "900",
  letterSpacing: 1.2,
},

heart: {
  position: "absolute",
  top: 14,
  right: 14,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "rgba(255, 255, 255, 0)",
  justifyContent: "center",
  alignItems: "center",
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

ratingText: {
  marginLeft: 5,
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
  marginTop: 12,
  color: "#FFF",
  fontSize: 22,
  fontWeight: "900",
  lineHeight: 28,
},

bottomRow: {
  marginTop: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
},

price: {
  color: "#FFF",
  fontSize: 28,
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
  top: 11, // Adjust between 8-10 if needed
  height: 1,
  backgroundColor: "#B6FF2E",
  borderRadius: 2,
},

heartGlass: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "rgba(255, 255, 255, 0)",

  justifyContent: "center",
  alignItems: "center",
},

badgeRow: {
  position: "absolute",
  top: 16,
  left: 16,
  right: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

ratingPill: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,.55)",
  paddingHorizontal: 10,
  height: 30,
  borderRadius: 15,
},

ratingPillText: {
  color: "#FFF",
  fontWeight: "700",
  marginLeft: 4,
},

priceRow: {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "center",
},

arrowBtn: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#B6FF2E",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 12,
},
header: {
  paddingHorizontal: 12,
  paddingTop: 8,
  paddingBottom: 6,
},

topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},


menuButton: {
  width: 52,
  height: 52,

  borderRadius: 18,

  backgroundColor: "#FFF",

  justifyContent: "center",

  paddingHorizontal: 14,

  shadowColor: "#000",

  shadowOpacity: 0.08,




  elevation: 1,
},

menuLineTop: {
  width: 26,
  height: 3,
  borderRadius: 2,
  backgroundColor: "#111",

  marginBottom: 6,
},

menuLineMiddle: {
  width: 20,
  height: 3,
  borderRadius: 2,
  backgroundColor: "#B6FF2E",

  marginBottom: 6,
},

menuLineBottom: {
  width: 26,
  height: 3,
  borderRadius: 2,
  backgroundColor: "#111",
},
profileBtn: {
  width: 46,
  height: 46,
  borderRadius: 23,
  overflow: "hidden",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 6,
},

profileImage: {
  width: "100%",
  height: "100%",
},

onlineDot: {
  position: "absolute",
  right: 2,
  top: 2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#B6FF2E",
  borderWidth: 2,
  borderColor: "#FFF",
},
pillRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},
explore: {
  marginTop: 34,
  color: "#000000",
  fontSize: 18,
  fontWeight: "500",
},

heroTitle: {
  marginTop: 8,
  fontSize: 58,
  fontWeight: "900",
  color: "#111",
  lineHeight: 60,
},

heroAccent: {
  marginTop: -2,
  fontSize: 58,
  fontWeight: "900",
  color: "#B6FF2E",
  lineHeight: 60,
},

searchBox: {
  marginTop: 32,
  height: 60,
  borderRadius: 32,
  backgroundColor: "#F5F5F5",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
},

searchInput: {
  flex: 1,
  marginLeft: 12,
  color: "#111",
  fontSize: 17,
},
filterIcon: {
  width: 42,
  height: 42,
  borderRadius: 8,
  backgroundColor: "#000000ee",

  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
 
},
tabs: {
  paddingTop: 22,
  paddingBottom: 10,
  paddingRight: 20,
},

pill: {
  height: 42,
  borderRadius: 21,
  backgroundColor: "#F5F5F5",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
  marginRight: 12,
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
});
