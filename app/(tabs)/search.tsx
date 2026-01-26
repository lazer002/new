// app/search.tsx or SearchScreen.tsx
import React, { useEffect, useState,useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import GlassCard from "@/components/GlassCard";
import api from "@/utils/config";

const { width, height } = Dimensions.get("window");

export default function SearchScreen() {
  /* ---------------- STATE ---------------- */

  const [products, setProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quickAddOpen, setQuickAddOpen] = useState(false);
      const slideAnim = useRef(new Animated.Value(0)).current;
    
  /* ---------------- CATEGORIES ---------------- */

  const categories = [
    { label: "All", value: "all" },
    { label: "Hoodie", value: "hoodie" },
    { label: "Pant", value: "pant" },
    { label: "Shirt", value: "shirt" },
    { label: "Jacket", value: "jacket" },
    { label: "Tshirt", value: "tshirt" },
  ];

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    api.get("/api/products").then((res) => {
      setProducts(res.data.items || []);
    });
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredProducts = products.filter((p) => {
    const titleMatch = p.title
      ?.toLowerCase()
      .includes(searchText.toLowerCase());

    if (selectedCategory === "all") {
      return titleMatch;
    }

    const catSlug = p.category?.slug?.toLowerCase();
    const catName = p.category?.name?.toLowerCase();
    const tags = p.tags?.map((t: string) => t.toLowerCase()) || [];

    const categoryMatch =
      catSlug === selectedCategory ||
      catName === selectedCategory ||
      tags.includes(selectedCategory);

    return titleMatch && categoryMatch;
  });

  /* ---------------- RENDER ---------------- */
  const openQuickAdd = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setQuickAddOpen(true);
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const closeQuickAdd = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setQuickAddOpen(false));
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, height * 0.35],
  });
  return (
    <Screen>
      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#aaa" />
        <TextInput
          placeholder="Search products"
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* CATEGORY PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat.value;

          return (
            <Pressable
              key={cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              style={[
                styles.pill,
                active && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  active && styles.pillTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* PRODUCTS GRID */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <GlassCard style={styles.productCard}>
            <Image
              source={{ uri: item.images?.[0] }}
              style={styles.productImage}
            />

            <View style={styles.glassBar}>
              <Text style={styles.price}>₹{item.price}</Text>
              <Pressable style={styles.cartBtn} onPress={() => openQuickAdd(item)}>
                <Ionicons name="bag-outline" size={18} color="#000" />
              </Pressable>
            </View>
          </GlassCard>
        )}
      />
            <Modal visible={quickAddOpen} transparent animationType="none">
              <Pressable style={StyleSheet.absoluteFill} onPress={closeQuickAdd} />
              <Animated.View
                style={[styles.modalRoot, { transform: [{ translateY }] }]}
              >
                <GlassCard style={styles.modalCard}>
                  <Text style={styles.modalTitle}>{selectedProduct?.title}</Text>
      
                  <View style={styles.sizes}>
                    {["S", "M", "L", "XL"].map((size) => (
                      <Pressable
                        key={size}
                        style={[
                          styles.sizeChip,
                          selectedSize === size && styles.sizeActive,
                        ]}
                        onPress={() => setSelectedSize(size)}
                      >
                        <Text style={styles.sizeText}>{size}</Text>
                      </Pressable>
                    ))}
                  </View>
      
                  <Pressable
                    style={[
                      styles.addToCartBtn,
                      !selectedSize && { opacity: 0.5 },
                    ]}
                    disabled={!selectedSize}
                    onPress={closeQuickAdd}
                  >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </Pressable>
                </GlassCard>
              </Animated.View>
            </Modal>
    </Screen>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  /* SEARCH */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    // marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 15,
  },

  /* PILLS */
  pillRow: {
    // paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pill: {
    paddingHorizontal: 22,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pillActive: {
    backgroundColor: "#7CFF6B",
    borderColor: "#7CFF6B",
    shadowColor: "#7CFF6B",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  pillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#000",
    fontWeight: "700",
  },

  /* GRID */
  gridRow: {
    justifyContent: "space-between",
    // paddingHorizontal: 16,
  },
  productCard: {
    width: "48%",
    height: height * 0.32,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  glassBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  price: {
    fontWeight: "700",
    color: "#000",
  },
  cartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
    modalRoot: { alignItems: "center" },
  modalCard: {
    width: width - 52,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalTitle: { color: "#fff", textAlign: "center", marginBottom: 16 },
   sizes: { flexDirection: "row", marginBottom: 24 },
  sizeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  sizeActive: { backgroundColor: "#7CFF6B" },
  sizeText: { color: "#fff" },

  addToCartBtn: {
    backgroundColor: "#7CFF6B",
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
  },
  addToCartText: { fontWeight: "700", color: "#000" },
});
