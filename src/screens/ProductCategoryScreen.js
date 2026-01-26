// category base plp





// category base plp





import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Switch,
} from "react-native";
import Modal from "react-native-modal";
import Collapsible from "react-native-collapsible";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import  api  from "../utils/config";
import { useWishlist } from "../context/WishlistContext";

const { width, height } = Dimensions.get("window");

export default function ProductCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const filters = ["ALL", "NEW", "POLO", "BASICS", "OVERSIZED"];

  // Accordion states
  const [brandCollapsed, setBrandCollapsed] = useState(true);
  const [sizeCollapsed, setSizeCollapsed] = useState(true);
  const [colorCollapsed, setColorCollapsed] = useState(true);

  // Filter selections
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const availableBrands = ["Nike", "Adidas", "Puma", "Reebok"];
  const availableSizes = ["S", "M", "L", "XL"];
  const availableColors = ["Red", "Blue", "Black", "White"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products?category=${category.name}`);
        setProducts(res.data.items || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter =
      selectedFilter === "ALL" || (p.tags && p.tags.includes(selectedFilter));

    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchesSize =
      selectedSizes.length === 0 || p.sizes?.some((s) => selectedSizes.includes(s));
    const matchesColor =
      selectedColors.length === 0 || selectedColors.includes(p.color);

    return matchesSearch && matchesFilter && matchesBrand && matchesSize && matchesColor;
  });

  const toggleSelection = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((i) => i !== value));
    } else {
      setList([...list, value]);
    }
  };

  const renderProduct = ({ item }) => {
    const isFav = isInWishlist(item._id);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductScreen", { id: item._id })}
        activeOpacity={0.8}
        style={[styles.productCard, viewMode === "list" && styles.listCard]}
      >
        <TouchableOpacity
          style={styles.wishlistIcon}
          onPress={() => (isFav ? removeFromWishlist(item._id) : addToWishlist(item._id))}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={viewMode === "list" ? 30 : 22}
            color={isFav ? "#FF6363" : "black"}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: item.images[0] || "https://via.placeholder.com/200" }}
          style={viewMode === "list" ? styles.listImage : styles.productImage}
        />

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceContainer}>
            {item.oldPrice && <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>}
            <Text style={styles.productPrice}>₹{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator color="#000" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name.toUpperCase()}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SearchScreen")}>
          <Ionicons name="search-outline" size={32} />
        </TouchableOpacity>
      </View>

      {/* Filters Horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, selectedFilter === f && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text style={[styles.filterText, selectedFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Icon Bar */}
      <View style={styles.iconBar}>
        <MaterialIcons
          name={viewMode === "grid" ? "grid-view" : "view-agenda"}
          size={32}
          onPress={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
        />
           <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="options-outline" size={32} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={viewMode === "grid" ? 2 : 1}
        renderItem={renderProduct}
        columnWrapperStyle={viewMode === "grid" ? { justifyContent: "space-between" } : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: viewMode === "grid" ? 80 : 10, minHeight: height }}
        key={viewMode}
      />

      {/* ===== Bottom Filter Modal ===== */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View style={styles.modalContent}>
          <ScrollView>
            {/* Brand */}
            <TouchableOpacity onPress={() => setBrandCollapsed(!brandCollapsed)}>
              <Text style={styles.accordionTitle}>Brand</Text>
            </TouchableOpacity>
            <Collapsible collapsed={brandCollapsed}>
              {availableBrands.map((b) => (
                <View key={b} style={styles.checkboxContainer}>
                  <Text>{b}</Text>
                  <Switch
                    value={selectedBrands.includes(b)}
                    onValueChange={() => toggleSelection(b, selectedBrands, setSelectedBrands)}
                  />
                </View>
              ))}
            </Collapsible>

            {/* Size */}
            <TouchableOpacity onPress={() => setSizeCollapsed(!sizeCollapsed)}>
              <Text style={styles.accordionTitle}>Size</Text>
            </TouchableOpacity>
            <Collapsible collapsed={sizeCollapsed}>
              {availableSizes.map((s) => (
                <View key={s} style={styles.checkboxContainer}>
                  <Text>{s}</Text>
                  <Switch
                    value={selectedSizes.includes(s)}
                    onValueChange={() => toggleSelection(s, selectedSizes, setSelectedSizes)}
                  />
                </View>
              ))}
            </Collapsible>

            {/* Color */}
            <TouchableOpacity onPress={() => setColorCollapsed(!colorCollapsed)}>
              <Text style={styles.accordionTitle}>Color</Text>
            </TouchableOpacity>
            <Collapsible collapsed={colorCollapsed}>
              {availableColors.map((c) => (
                <View key={c} style={styles.checkboxContainer}>
                  <Text>{c}</Text>
                  <Switch
                    value={selectedColors.includes(c)}
                    onValueChange={() => toggleSelection(c, selectedColors, setSelectedColors)}
                  />
                </View>
              ))}
            </Collapsible>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, backgroundColor: "#F9FAFB" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  filterContainer: { paddingVertical: 12, height: 67 },
  filterButton: { backgroundColor: "#E5E7EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 12, minWidth: 60, justifyContent: "center", alignItems: "center" },
  filterButtonActive: { backgroundColor: "#111827" },
  filterText: { fontSize: 14, fontWeight: "500", color: "#111827" },
  filterTextActive: { color: "white" },
  iconBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8, paddingHorizontal: 5 },
  productCard: { flex: 1, marginHorizontal: 5, backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5, borderColor: "#E5E7EB", overflow: "hidden", height: 300 },
  listCard: { flex: 1, flexDirection: "column", borderWidth: 0.5, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", backgroundColor: "#fff", marginBottom: 12, height: height * 0.75, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  wishlistIcon: { position: "absolute", top: 8, right: 8, zIndex: 10 },
  productImage: { width: "100%", height: "80%", resizeMode: "cover" },
  listImage: { width: "100%", height: "85%", resizeMode: "cover" },
  productDetails: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, justifyContent: "space-between", backgroundColor: "#fff" },
  productName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  productPrice: { fontSize: 18, fontWeight: "700", color: "#111827" },
  priceContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  oldPrice: { color: "#888", textDecorationLine: "line-through", fontSize: 12 },
  modalContent: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.7 },
  accordionTitle: { fontSize: 18, fontWeight: "600", paddingVertical: 10 },
  checkboxContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
});
 