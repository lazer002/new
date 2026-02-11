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
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import api from "@/utils/config";
import { useRouter } from "expo-router";
import { useFilter } from "@/context/FilterContext";
import BottomFilterSheet from "@/components/BottomFilterSheet";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

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
const { rating, buyCount } = getProductMeta(item._id);
  return (
    <View style={styles.card}>
      <Pressable
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
        <View ref={imageRef} collapsable={false}>
          <Image source={{ uri: item.images?.[0] }} style={styles.image} />
        </View>

        <View style={styles.heart}>
          <Ionicons name="heart-outline" size={18} />
        </View>
      </Pressable>

  <View style={{ paddingHorizontal: 7,paddingBottom: 12, paddingTop: 8 }}>
      <View style={styles.ratingRow}>
  <Ionicons name="star" size={14} color="#d37b09c5" />
  <Text style={styles.ratingText}>{rating}</Text>

  <Text style={styles.buyText}>  ({buyCount})</Text>
</View>


      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>

    <View style={styles.priceRow}>
  <Text style={styles.price}>₹{item.price}</Text>

  {/* {item.oldPrice && ( */}
    <View style={styles.oldPriceWrapper}>
      <Text style={styles.oldPriceText}>₹999</Text>
      <View style={styles.strikeLine} />
    </View>
  {/* )} */}
</View>
</View>
    </View>
  );
}

/* ───────────────── HOME ───────────────── */

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false); // ✅ single source

  const { filters, setFilters } = useFilter();

  useEffect(() => {
    api.get("/api/categories").then((res) =>
      setCategories(res.data.categories || [])
    );
    api.get("/api/products").then((res) =>
      setProducts(res.data.items || [])
    );
  }, []);


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
        columnWrapperStyle={{ justifyContent: "space-between" }}
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
            openFilter={() => setFilterVisible(true)} // ✅ FIXED
          />
          <SectionHeader onSeeAll={() => console.log("See all pressed")} />
            </>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
       renderItem={({ item, index }) => (
  <View style={{ marginTop: index % 2 !== 0 ? 20 : 0 }}>
    <ProductCard item={item} />
  </View>
)}

      />

      {/* ✅ BOTTOM FILTER SHEET */}
      <BottomFilterSheet
        visible={filterVisible}
        categories={categories}
        onClose={() => setFilterVisible(false)}
      />
    </Screen>
  );
}

/* ───────────────── HEADER ───────────────── */
function SectionHeader({ onSeeAll }: { onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Special For You</Text>

      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
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
}: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  openFilter: () => void;
}) {
return (
  <View style={styles.header}>

    {/* 🔎 SEARCH ROW */}
    <View style={styles.searchRow}>

      {/* SEARCH INPUT */}
      <View style={styles.search}>
        <Ionicons name="search-outline" size={25} color="#aaa" />
        <TextInput
          placeholder="Explore Fashion"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* FILTER BUTTON (OUTSIDE INPUT) */}
      <Pressable style={styles.filterBtn} onPress={openFilter}>
        <Ionicons name="options-outline" size={23} color="#555" />
      </Pressable>

    </View>

    {/* CATEGORY TABS */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
 <Pressable
  onPress={() => setActiveCategory("all")}
  style={[
    styles.tab,
    activeCategory === null && styles.tabActive,
  ]}
>
  <View style={styles.tabContent}>
    {activeCategory === null && (
      <Ionicons name="sparkles" size={14} color="#0af16bff" style={{ marginRight: 6 }} />
    )}
    <Text
      style={[
        styles.tabText,
        activeCategory === null && styles.tabTextActive,
      ]}
    >
      All
    </Text>
  </View>
</Pressable>

{categories.map((cat) => {
  const isActive = activeCategory === cat._id;

  return (
    <Pressable
      key={cat._id}
      onPress={() => setActiveCategory(cat._id)}
      style={[styles.tab, isActive && styles.tabActive]}
    >
      <View style={styles.tabContent}>
        {isActive && (
          <Ionicons
            name="sparkles"
            size={14}
            color="#0af16bff"
            style={{ marginRight: 6 }}
          />
        )}
        <Text
          style={[styles.tabText, isActive && styles.tabTextActive]}
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

  header: { paddingHorizontal: 16, paddingTop: 16 },

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

searchInput: {
  flex: 1,
  marginLeft: 2,
  marginTop: -1,
  fontSize: 18,
  color: "#000",
},


  tabs: { paddingVertical: 16 },

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


  card: { width: CARD_WIDTH, marginBottom: 20, borderRadius: 20 },

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
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
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

  priceRow: { flexDirection: "row", marginTop: 4, alignItems: "center" },

  price: { fontSize: 18, fontWeight: "700" },

  oldPrice: {
    marginTop: 5,
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "500",
    color: "#616161ff",
    textDecorationLine: "line-through",
  },
  searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10, // if not supported use marginRight
},

filterBtn: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#f2f2f2",
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
sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  marginTop: 10,
  marginBottom: 20,
},

sectionTitle: {
  fontSize: 24,
  fontWeight: "700",
},

seeAll: {
  fontSize: 18,
  color: "#464747ff", // green accent
  fontWeight: "600",
},

});
