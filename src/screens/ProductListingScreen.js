// screens/ProductListingScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image,
  TouchableOpacity, Modal, Pressable, Dimensions, ScrollView, StyleSheet
} from "react-native";
import Animated, { Layout, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import api from "../utils/config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import SideFilterPanel from "../components/SideFilterPanel"; // ⭐ SAME FILTER
import AppHeader from "../components/AppHeader";              // ⭐ SAME HEADER
import { useFilter } from "../context/FilterContext";
import { SafeAreaView,useSafeAreaInsets  } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

export default function ProductListingScreen({ navigation }) {
  const {filters}= useFilter();
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { add } = useCart();
  const insets = useSafeAreaInsets();

  const [filterVisible, setFilterVisible] = useState(false);

  // 🔔 same touch animation as bundle PLP
  const CardContainer = ({ children }) => {
    const scale = useSharedValue(1);
    const anim = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }]
    }));
    return (
      <Animated.View
        style={[anim]}
        onTouchStart={() => scale.value = withTiming(0.97, { duration: 120 })}
        onTouchEnd={() => scale.value = withTiming(1, { duration: 120 })}
      >
        {children}
      </Animated.View>
    );
  };

  /* 📦 Fetch products */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/api/products`);
        setProducts(res.data.items ?? []);
      } catch (e) {
        console.log("Product API error:", e);
      }
    };
    fetchProducts();
  }, []);

  /* ❤️ wishlist */
  const toggleWishlist = (id) =>
    isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id);

  /* 🛒 add product */
  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setModalVisible(true);
  };





  /* 🔍 product card */
  const ProductCard = ({ item }) => {
    const img = item.images?.[0];
    const wish = isInWishlist(item._id);

    return (
      <CardContainer>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.card, viewMode === "list" && styles.cardList]}
          onPress={() => navigation.navigate("ProductScreen", { id: item._id })}
        >
          {/* 🖼 image */}
          <Image
            source={{ uri: img }}
            style={viewMode === "grid" ? styles.imageGrid : styles.imageList}
          />

          {/* ❤️ */}
          <TouchableOpacity style={styles.wishlistIcon} onPress={() => toggleWishlist(item._id)}>
            {wish
              ? <Ionicons name="heart-sharp" size={22} color="#000" />
              : <Ionicons name="heart-outline" size={22} color="#000" />}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            {/* 🏷 title */}
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

            {/* 💰 price */}
            <Text style={styles.price}>₹{item.price}</Text>

            {/* 🛒 cart icon to open modal */}
            <TouchableOpacity style={styles.cartIcon} onPress={() => openModal(item)}>
              <MaterialIcons name="add-shopping-cart" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </CardContainer>
    );
  };

   const filteredProducts = products.filter((item) => {
    if (filters.price && item.price > filters.price) return false;
    if (filters.sizes.length > 0 && !item.sizes?.some(s => filters.sizes.includes(s)))
      return false;
    if (filters.colors.length > 0 && !filters.colors.includes(item.color))
      return false;
    if (filters.category && item.category !== filters.category) return false;
    return true;
  });


  return (
    <View style={{ flex:1, paddingTop: insets.top,backgroundColor:"#fff" }}>
      {/* ⭐ SAME Header */}
      <AppHeader title="Products" />

      {/* ⭐ SAME Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter-outline" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
          {viewMode === "grid"
            ? <MaterialIcons name="view-agenda" size={26} color="#000" />
            : <MaterialIcons name="grid-view" size={26} color="#000" />}
        </TouchableOpacity>
      </View>

      {/* ⭐ SAME layout list */}
      <Animated.View layout={Layout} style={{ flex: 1 }}>
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard item={item} />}
          key={viewMode}
          numColumns={viewMode === "grid" ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      </Animated.View>

      {/* ⭐ SIDE FILTER SAME COMPONENT */}
  <SideFilterPanel
  visible={filterVisible}
  onClose={() => setFilterVisible(false)}
/>

      {/* ⭐ PRODUCT SIZE MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Image source={{ uri: selectedProduct?.images?.[0] }} style={styles.modalImg} />

            <Text style={styles.modalTitle}>{selectedProduct?.title}</Text>
            <Text style={styles.modalPrice}>₹{selectedProduct?.price}</Text>

            <Text style={styles.modalLabel}>Select Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sizeRow}>
                {SIZE_OPTIONS.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeBtn,
                      selectedSize === size && styles.sizeBtnActive
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeTxt,
                      selectedSize === size && { color: "#fff" }
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.addCartBtn} onPress={() => {
              if (!selectedSize) return alert("Select size");
              add(selectedProduct,selectedSize);
              setModalVisible(false);
              setSelectedSize(null);
            }}>
              <Text style={styles.addCartTxt}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}


/* 🎨 SAME styles from Bundle PLP */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    marginHorizontal: 6,
    width: (width / 2) - 18,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  cardList: {
    width: width - 18,
    flexDirection: "row",
  },

  imageGrid: {
    width: "100%",
    height: (width / 2) * 1.4,
    resizeMode: "cover",
  },

  imageList: {
    width: (width / 2) - 18,
    height: width * 0.9,
    resizeMode: "cover",
  },

  wishlistIcon: { position: "absolute", top: 10, right: 10 },

  infoBox: { padding: 12, position: "relative" },
  title: { fontSize: 18, fontWeight: "800" },
  price: { fontSize: 22, fontWeight: "900", marginVertical: 6 },

  /* 🛒 cart icon */
  cartIcon: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: 4,
  },

  /* ===== MODAL ===== */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalImg: { width: "100%", height: 320, borderRadius: 12, backgroundColor: "#eee" },
  modalTitle: { fontSize: 20, fontWeight: "900", marginTop: 6 },
  modalPrice: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  modalLabel: { marginTop: 12, fontWeight: "700" },

  sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  sizeBtn: { borderWidth: 1, borderColor: "#000", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  sizeBtnActive: { backgroundColor: "#000" },
  sizeTxt: { fontWeight: "800", color: "#000" },

  addCartBtn: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 10, marginTop: 16 },
  addCartTxt: { color: "#fff", fontWeight: "900", fontSize: 16, textAlign: "center" },
});
