import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
 StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "@/utils/config";
import { useCart } from "@/context/CartContext";
import CartIcon from "@/components/CartIcon";
import { SCREEN, scale, normalize } from "@/utils/responsive";

export default function BuildYourLook() {
  const router = useRouter();
  const { addBundleToCart } = useCart();
const imageRefs = useRef<Record<string, View | null>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [drawerVisible, setDrawerVisible] =
    useState(false);

  const [selectedProducts, setSelectedProducts] =
    useState<any[]>([]);

  const [selectedSizes, setSelectedSizes] =
    useState<Record<string, string>>({});

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      restoreSelections(),
    ]);
  };

  const restoreSelections = async () => {
    try {
      const p = await AsyncStorage.getItem(
        "build-look-products"
      );

      const s = await AsyncStorage.getItem(
        "build-look-sizes"
      );

      if (p) setSelectedProducts(JSON.parse(p));

      if (s) setSelectedSizes(JSON.parse(s));
    } catch (e) {}
  };

  useEffect(() => {
    AsyncStorage.setItem(
      "build-look-products",
      JSON.stringify(selectedProducts)
    );

    AsyncStorage.setItem(
      "build-look-sizes",
      JSON.stringify(selectedSizes)
    );
  }, [selectedProducts, selectedSizes]);

  async function fetchProducts() {
    try {
      const res = await api.get("api/products");

      setProducts(res.data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const res = await api.get("api/categories");

    setCategories(res.data.categories || []);
  }

  const filteredProducts = useMemo(() => {
    const list =
      activeCategory === "all"
        ? products
        : products.filter(
            (p) =>
              p.category?._id === activeCategory
          );

    const ids = new Set(
      selectedProducts.map((i) => i._id)
    );

    const selected = list.filter((p) =>
      ids.has(p._id)
    );

    const remaining = list.filter(
      (p) => !ids.has(p._id)
    );

    return [...selected, ...remaining];
  }, [
    products,
    activeCategory,
    selectedProducts,
  ]);

  const toggleProduct = (product: any) => {
    const exists = selectedProducts.some(
      (p) => p._id === product._id
    );

    if (exists) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p._id !== product._id)
      );

      return;
    }

    if (selectedProducts.length >= 3)
      return;

    setSelectedProducts((prev) => [
      ...prev,
      product,
    ]);
  };

  const subtotal = useMemo(() => {
    return selectedProducts.reduce(
      (sum, p) =>
        sum + Number(p.price || 0),
      0
    );
  }, [selectedProducts]);

  const discount = Math.round(
    subtotal * 0.1
  );

  const total = subtotal - discount;

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p._id !== id)
    );

    setSelectedSizes((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleAddLook = () => {
    const bundle = {
      title: "My Custom Look",
      products: selectedProducts,
      price: total,
      custom: true,
    };

    addBundleToCart(
      bundle,
      selectedSizes
    );

    setSelectedProducts([]);
    setSelectedSizes({});
    setTimeout(() => {
      setDrawerVisible(false);
    }, 300);
    

    AsyncStorage.removeItem(
      "build-look-products"
    );

    AsyncStorage.removeItem(
      "build-look-sizes"
    );
  };

  return (
    <SafeAreaView style={styles.safe}>



   <View style={styles.header}>

  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons
      name="chevron-back"
      size={28}
      color="#111"
    />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>
    BUILD YOUR LOOK
  </Text>

      <View style={styles.topBtnWrapper}>
        <CartIcon
         />
      </View>
</View>

{/* CATEGORY TABS */}

<View style={styles.categoryWrap}>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: 18,
    }}
  >

    <TouchableOpacity
      onPress={() => setActiveCategory("all")}
      style={[
        styles.categoryBtn,
        activeCategory === "all" &&
          styles.categoryBtnActive,
      ]}
    >
      <Text
        style={[
          styles.categoryText,
          activeCategory === "all" &&
            styles.categoryTextActive,
        ]}
      >
        All
      </Text>
    </TouchableOpacity>

    {categories.map((cat) => (

      <TouchableOpacity
        key={cat._id}
        onPress={() =>
          setActiveCategory(cat._id)
        }
        style={[
          styles.categoryBtn,
          activeCategory === cat._id &&
            styles.categoryBtnActive,
        ]}
      >

        <Text
          style={[
            styles.categoryText,
            activeCategory === cat._id &&
              styles.categoryTextActive,
          ]}
        >
          {cat.name}
        </Text>

      </TouchableOpacity>

    ))}

  </ScrollView>

</View>

{/* STATS */}

<View style={styles.statsContainer}>

  <View style={styles.statCard}>

    <Text style={styles.statNumber}>
      {selectedProducts.length}/3
    </Text>

    <Text style={styles.statLabel}>
      Items Selected
    </Text>

  </View>

  <View style={styles.divider} />

  <View style={styles.statCard}>

    <Text style={styles.statNumber}>
      10%
    </Text>

    <Text style={styles.statLabel}>
      Bundle Savings
    </Text>

  </View>

</View>

{/* PRODUCTS */}

<FlatList
  data={filteredProducts}
  keyExtractor={(item) => item._id}
  numColumns={2}
  contentContainerStyle={{
    paddingHorizontal: 14,
    paddingBottom: 180,
  }}
  columnWrapperStyle={{
    justifyContent: "space-between",
    marginBottom: 16,
  }}
  showsVerticalScrollIndicator={false}
  renderItem={({ item }) => {

    const selected =
      selectedProducts.some(
        (p) => p._id === item._id
      );

    return (

      <View style={styles.productCard}>

        {/* IMAGE */}

<TouchableOpacity
  activeOpacity={0.95}
  onPress={() => {
    imageRefs.current[item._id]?.measureInWindow(
      (x, y, w, h) => {
        router.push({
          pathname: "/product/[id]",
          params: {
            id: item._id,
            image: item.images?.[0],
            x: String(x),
            y: String(y),
            w: String(w),
            h: String(h),
          },
        });
      }
    );
  }}
>

  <View
    ref={(ref) => {
      imageRefs.current[item._id] = ref;
    }}
    collapsable={false}
  >
    <Image
      source={{ uri: item.images?.[0] }}
      style={styles.productImage}
    />
  </View>

</TouchableOpacity>

          {selected && (

            <View style={styles.selectedBadge}>

              <Text
                style={styles.selectedBadgeText}
              >
                SELECTED
              </Text>

            </View>

          )}

        <View style={styles.productBody}>

          <Text
            numberOfLines={2}
            style={styles.productTitle}
          >
            {item.title}
          </Text>

          <Text style={styles.price}>
            ₹
            {Number(item.price).toLocaleString()}
          </Text>

          {/* SIZE BUTTONS */}

          <View style={styles.sizeRow}>

            {Object.entries(
              item.inventory || {}
            ).map(([size, qty]: any) => (

              <TouchableOpacity
                key={size}
                disabled={qty <= 0 || selected}
                onPress={() =>
                  setSelectedSizes((prev) => ({
                    ...prev,
                    [item._id]: size,
                  }))
                }
                style={[
                  styles.sizeBtn,

                  qty <= 0 &&
                    styles.disabledSize,

                  selectedSizes[item._id] ===
                    size &&
                    styles.activeSize,
                ]}
              >

                <Text
                  style={[
                    styles.sizeText,

                    selectedSizes[item._id] ===
                      size &&
                      styles.activeSizeText,
                  ]}
                >
                  {size}
                </Text>

              </TouchableOpacity>

            ))}

          </View>
          {/* ADD BUTTON */}

<TouchableOpacity
  disabled={
    !selectedSizes[item._id]
  }
  onPress={() => toggleProduct(item)}
  style={[
    styles.addBtn,

    !selectedSizes[item._id] &&
      styles.disabledBtn,

    selected &&
      styles.addedBtn,
  ]}
>

  <Text
    style={[
      styles.addBtnText,

      selected &&
        styles.addedBtnText,
    ]}
  >
    {!selectedSizes[item._id]
      ? "SELECT SIZE"
      : selected
      ? "✓ ADDED"
      : "ADD TO LOOK"}
  </Text>

</TouchableOpacity>

</View>

</View>

);
}}
/>

{/* FLOATING BAR */}

{selectedProducts.length > 0 && (

<TouchableOpacity
  activeOpacity={0.95}
  onPress={() =>
    setDrawerVisible(true)
  }
  style={styles.floatingBar}
>

  <View style={styles.floatLeft}>

    <View style={styles.avatarStack}>

      {selectedProducts
        .slice(0, 3)
        .map((product) => (

          <Image
            key={product._id}
            source={{
              uri: product.images?.[0],
            }}
            style={styles.avatar}
          />

      ))}

    </View>

    <View>

      <Text style={styles.floatTitle}>
        {selectedProducts.length}/3 Selected
      </Text>

      <Text style={styles.floatSub}>
        Tap to view your look
      </Text>

    </View>

  </View>

  <View style={styles.floatRight}>

    <Text style={styles.floatPrice}>
      ₹{total.toLocaleString()}
    </Text>

    <View style={styles.arrowCircle}>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#111"
      />

    </View>

  </View>

</TouchableOpacity>

)}

{/* BOTTOM DRAWER */}

{drawerVisible && (

<View style={styles.drawerOverlay}>

<TouchableOpacity
  style={StyleSheet.absoluteFill}
  activeOpacity={1}
  onPress={() =>
    setDrawerVisible(false)
  }
/>

<View style={styles.drawer}>

  <View style={styles.drawerHandle}/>

  <View style={styles.drawerHeader}>

    <View>

      <Text style={styles.drawerSmall}>
        YOUR LOOK
      </Text>

      <Text style={styles.drawerTitle}>
        {selectedProducts.length}/3 Items
      </Text>

    </View>

    <TouchableOpacity
      onPress={() =>
        setDrawerVisible(false)
      }
    >
      <Ionicons
        name="close"
        size={28}
        color="#111"
      />
    </TouchableOpacity>

  </View>

  <FlatList
    data={selectedProducts}
    keyExtractor={(i) => i._id}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
      paddingBottom: 20,
    }}
    renderItem={({ item }) => (

      <View style={styles.drawerCard}>

        <Image
          source={{
            uri: item.images?.[0],
          }}
          style={styles.drawerImage}
        />

        <View style={{ flex: 1 }}>

          <Text
            numberOfLines={1}
            style={styles.drawerProduct}
          >
            {item.title}
          </Text>

          <Text style={styles.drawerSize}>
            Size {selectedSizes[item._id]}
          </Text>

          <Text style={styles.drawerPrice}>
            ₹
            {Number(item.price).toLocaleString()}
          </Text>

        </View>

        <TouchableOpacity
          onPress={() =>
            removeProduct(item._id)
          }
        >
          <Ionicons
            name="close-circle"
            size={28}
            color="#888"
          />
        </TouchableOpacity>

      </View>

    )}
  />

  <View style={styles.summary}>

    <View style={styles.summaryRow}>
      <Text>Subtotal</Text>
      <Text>
        ₹{subtotal.toLocaleString()}
      </Text>
    </View>

    <View style={styles.summaryRow}>
      <Text
        style={{ color: "#95ff00" }}
      >
        Bundle Saving
      </Text>

      <Text
        style={{ color: "#95ff00" }}
      >
        -₹{discount.toLocaleString()}
      </Text>

    </View>

    <View style={styles.summaryDivider}/>

    <View style={styles.summaryRow}>

      <Text style={styles.total}>
        Total
      </Text>

      <Text style={styles.total}>
        ₹{total.toLocaleString()}
      </Text>

    </View>

  </View>

  <TouchableOpacity
    onPress={handleAddLook}
    style={styles.checkoutBtn}
  >

    <Text style={styles.checkoutText}>
      ADD LOOK TO CART
    </Text>

  </TouchableOpacity>

</View>

</View>

)}

</SafeAreaView>

)}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* ---------- HEADER ---------- */

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: normalize(22),
    fontWeight: "800",
    letterSpacing: 1,
    color: "#111",
  },

  bagBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },

  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#95FF00",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    fontSize: normalize(10),
    fontWeight: "700",
    color: "#111",
  },

  /* ---------- CATEGORY ---------- */

  categoryWrap: {
    marginTop: 12,
    marginBottom: 20,
  },

  categoryBtn: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    marginRight: 10,
  },

  categoryBtnActive: {
    backgroundColor: "#111",
  },

  categoryText: {
    fontWeight: "600",
    color: "#666",
  },

  categoryTextActive: {
    color: "#95FF00",
  },

  /* ---------- STATS ---------- */

  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: "#111",
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#2d2d2d",
  },

  statCard: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: "#95FF00",
    fontSize: normalize(24),
    fontWeight: "800",
  },

  statLabel: {
    marginTop: 4,
    color: "#aaa",
    fontSize: normalize(12),
  },

  /* ---------- PRODUCT ---------- */

  productCard: {
    width: (SCREEN.width - scale(44)) / 2,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },

  selectedBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#95FF00",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  selectedBadgeText: {
    color: "#111",
    fontWeight: "700",
    fontSize: normalize(10),
  },

  productBody: {
    padding: 14,
  },

  productTitle: {
    fontSize: normalize(15),
    fontWeight: "700",
    color: "#111",
    minHeight: 40,
  },

  price: {
    marginTop: 6,
    fontSize: normalize(20),
    fontWeight: "800",
    color: "#111",
  },

  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },

  sizeBtn: {
    minWidth: 38,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },

  activeSize: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  disabledSize: {
    opacity: 0.35,
  },

  sizeText: {
    fontWeight: "700",
    color: "#111",
    fontSize: normalize(12),
  },

  activeSizeText: {
    color: "#95FF00",
  },

  addBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledBtn: {
    backgroundColor: "#ddd",
  },

  addedBtn: {
    backgroundColor: "#95FF00",
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },

  addedBtnText: {
    color: "#111",
  },

  /* ---------- FLOATING BAR ---------- */
topBtnWrapper: {
  marginLeft: 12,
  overflow: "visible",
},

  floatingBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#111",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 12,
  },

  floatLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarStack: {
    flexDirection: "row",
    marginRight: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: -10,
    borderWidth: 2,
    borderColor: "#111",
  },

  floatTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  floatSub: {
    color: "#aaa",
    fontSize: normalize(12),
    marginTop: 2,
  },

  floatRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  floatPrice: {
    color: "#95FF00",
    fontSize: normalize(18),
    fontWeight: "800",
    marginRight: 10,
  },

  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#95FF00",
    justifyContent: "center",
    alignItems: "center",
  },
    /* ---------- DRAWER ---------- */

  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.35)",
    justifyContent: "flex-end",
  },

  drawer: {
    height: "72%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },

  drawerHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
    marginBottom: 18,
  },

  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  drawerSmall: {
    fontSize: normalize(11),
    letterSpacing: 2,
    color: "#888",
    fontWeight: "600",
  },

  drawerTitle: {
    marginTop: 4,
    fontSize: normalize(28),
    fontWeight: "800",
    color: "#111",
  },

  drawerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F1F1",
  },

  drawerImage: {
    width: 72,
    height: 92,
    borderRadius: 18,
    marginRight: 14,
  },

  drawerProduct: {
    fontSize: normalize(16),
    fontWeight: "700",
    color: "#111",
  },

  drawerSize: {
    marginTop: 6,
    color: "#777",
    fontSize: normalize(13),
  },

  drawerPrice: {
    marginTop: 10,
    fontSize: normalize(20),
    fontWeight: "800",
    color: "#111",
  },

  /* ---------- SUMMARY ---------- */

  summary: {
    marginTop: 10,
    backgroundColor: "#111",
    borderRadius: 26,
    padding: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#2B2B2B",
    marginVertical: 14,
  },

  total: {
    color: "#fff",
    fontSize: normalize(24),
    fontWeight: "800",
  },

  /* ---------- CHECKOUT ---------- */

  checkoutBtn: {
    marginTop: 18,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#95FF00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#95FF00",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  checkoutText: {
    color: "#111",
    fontSize: normalize(15),
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* ---------- HELPERS ---------- */

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});