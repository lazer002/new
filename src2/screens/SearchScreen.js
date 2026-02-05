// src/screens/SearchScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { api } from "../utils/config";
import { useWishlist } from "../context/WishlistContext";

const { width, height } = Dimensions.get("window");

export default function SearchScreen({ navigation }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [categories, setCategories] = useState([
    "ALL",
    "Hoodie",
    "Pant",
    "Shirt",
    "Jacket",
    "Tshirt",
    
  ]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/products");
        setProducts(res.data.items || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || (p.tags && p.tags.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const renderProduct = ({ item }) => {
    const isFav = isInWishlist(item._id);

    return (
      <TouchableOpacity
        style={[styles.productCard, viewMode === "list" && styles.listCard]}
        onPress={() => navigation.navigate("ProductScreen", { id: item._id })}
      >
        {/* Wishlist */}
        <TouchableOpacity
          style={styles.wishlistIcon}
          onPress={() =>
            isFav ? removeFromWishlist(item._id) : addToWishlist(item._id)
          }
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={viewMode === "list" ? 28 : 22}
            color={isFav ? "#FF6363" : "#111827"}
          />
        </TouchableOpacity>

        {/* Product Image */}
        <Image
          source={{ uri: item.images[0] || "https://via.placeholder.com/200" }}
          style={viewMode === "list" ? styles.listImage : styles.productImage}
        />

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // if (loading) {
  //   return (
  //     <SafeAreaView style={styles.loader}>
  //       <ActivityIndicator color="#111827" size="large" />
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Search Bar ===== */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* ===== Category Pills ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10 }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ===== Products Grid/List ===== */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={viewMode === "grid" ? 2 : 1}
        renderItem={renderProduct}
        columnWrapperStyle={
          viewMode === "grid"
            ? { justifyContent: "space-between", paddingHorizontal: 10 }
            : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, minHeight: height }}
        key={viewMode} // rerender when view mode changes
      />

      {/* ===== View Mode Toggle ===== */}
      <View style={styles.viewToggle}>
        <MaterialIcons
          name={viewMode === "grid" ? "grid-view" : "view-agenda"}
          size={28}
          color="#fff"
          onPress={() =>
            setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginVertical: 8,
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  categoryPill: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryPillActive: { backgroundColor: "#111827" },
  categoryText: { fontWeight: "500", color: "#111827" },
  categoryTextActive: { color: "#fff" },
  productCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    height: 280, // grid height
  },
  listCard: {
    flexDirection: "column",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 12,
    height: height * 0.75,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  productImage: {
    width: "100%",
    height: "80%",
    resizeMode: "cover",
  },
  listImage: {
    width: "100%",
    height: "85%",
    resizeMode: "cover",
  },
  productDetails: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  viewToggle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 30,
  },
});
