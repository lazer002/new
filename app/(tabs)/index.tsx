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

function ProductCard({ item }: { item: any }) {
  const router = useRouter();
  const imageRef = useRef<View>(null);

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

      <Text style={styles.category}>
        {item.category?.name || "Outerwear"}
      </Text>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{item.price}</Text>
        {item.oldPrice && (
          <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
        )}
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
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => <ProductCard item={item} />}
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
      <View style={styles.search}>
        <Ionicons name="search" size={18} color="#aaa" />
        <TextInput
          placeholder="Explore Fashion"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable onPress={openFilter}>
          <Ionicons name="options-outline" size={18} color="#aaa" />
        </Pressable>
      </View>

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
          <Text
            style={[
              styles.tabText,
              activeCategory === null && styles.tabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((cat) => (
          <Pressable
            key={cat._id}
            onPress={() => setActiveCategory(cat._id)}
            style={[
              styles.tab,
              activeCategory === cat._id && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === cat._id && styles.tabTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
  screen: { backgroundColor: "#fafafa" },

  header: { paddingHorizontal: 16, paddingTop: 16 },

  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 44,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#000",
  },

  tabs: { paddingVertical: 16 },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },

  tabActive: { backgroundColor: "#000" },

  tabText: { fontSize: 13, color: "#000" },

  tabTextActive: { color: "#fff" },

  card: { width: CARD_WIDTH, marginBottom: 20 },

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

  category: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  priceRow: { flexDirection: "row", marginTop: 4 },

  price: { fontSize: 14, fontWeight: "700" },

  oldPrice: {
    marginLeft: 6,
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
});
