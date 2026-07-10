import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { findNodeHandle, UIManager } from "react-native";
import { useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withTiming,
} from "react-native-reanimated";
import api from "@/utils/config";
import { LinearGradient } from "expo-linear-gradient";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import CartIcon from "@/components/CartIcon";
import Screen from "@/components/Screen";
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height;
const H_PADDING = 20;
const CARD_GAP = 16;



const RADIUS = SCREEN_WIDTH * 0.07;

const HEART_SIZE = SCREEN_WIDTH * 0.11;



export default function Wishlist() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { add } = useCart();
const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  /* ================= FETCH DATA ================= */
  const sheetY = useSharedValue(300);

  useEffect(() => {
    sheetY.value = sizeModalVisible
      ? withTiming(0, { duration: 300 })
      : withTiming(300, { duration: 200 });
  }, [sizeModalVisible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 180],
          [0, -180],
          Extrapolation.CLAMP
        ),
      },
    ],

    opacity: interpolate(
      scrollY.value,
      [0, 70],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [40, 90],
      [0, 1],
      Extrapolation.CLAMP
    ),

    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [40, 90],
          [-25, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, 120],
      [42, 24],
      Extrapolation.CLAMP
    ),

    marginTop: interpolate(
      scrollY.value,
      [0, 120],
      [30, 8],
      Extrapolation.CLAMP
    ),
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const accentStyle = useAnimatedStyle(() => ({
    width: interpolate(
      scrollY.value,
      [0, 120],
      [86, 42],
      Extrapolation.CLAMP
    ),
  }));

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/bundles"),
        ]);

        setProducts(pRes.data.items || []);
        setBundles(bRes.data.items || bRes.data || []);
      } catch (err) {
        console.log("Wishlist load error:", err);
      }
    };

    load();
  }, []);

  /* ================= BUILD WISHLIST ITEMS ================= */

  const wishlistItems = useMemo(() => {
    const productItems = products
      .filter((p) => wishlist.includes(p._id))
      .map((p) => ({ ...p, _type: "product" }));

    const bundleItems = bundles
      .filter((b) => wishlist.includes(b._id))
      .map((b) => ({ ...b, _type: "bundle" }));

    return [...productItems, ...bundleItems];
  }, [wishlist, products, bundles]);

  /* ================= HANDLERS ================= */

  const openSizeModal = (product: any) => {
    setSelectedProduct(product);
    setSizeModalVisible(true);
  };

  const addToCartWithSize = (size: string) => {
    if (!selectedProduct) return;

    add(selectedProduct._id, size);
    removeFromWishlist(selectedProduct._id);
    setSizeModalVisible(false);
  };

  /* ================= RENDER CARD ================= */

  const renderItem = ({ item, index }: any) => {
   
    const isBundle = item._type === "bundle";
    const image = isBundle
      ? item.mainImages?.[0]
      : item.images?.[0];

    const price = Number(item.price || 0);
    const oldPrice = Math.round(price * 1.35);
    const save = oldPrice - price;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={[
          styles.productCard,
          index % 2 === 1 && { marginTop: 24 },
        ]}
   onPress={(e) => {
 e.currentTarget?.measureInWindow((x, y, w, h) => {
      router.push({
        pathname: isBundle
          ? "/bundle/[id]"
          : "/product/[id]",
        params: {
          id: item._id,
          image,
         x,
          y,
          w,
          h,
        },
      });
    }
  );
}}
      >
        {/* IMAGE */}

        <View  
  collapsable={false}  style={styles.imageContainer}>

  <Image
    source={{ uri: image }}
    style={styles.productImage}
  />


          <LinearGradient
            colors={[
              "transparent",
              "rgba(17,17,17,0.08)",
              "rgba(17,17,17,0.35)",
              "rgba(17,17,17,0.88)",
            ]}
            locations={[0, 0.45, 0.72, 1]}
            style={styles.imageOverlay}
          />
          {/* NEW / BUNDLE */}

          <View
            style={
              isBundle
                ? styles.bundleBadge
                : styles.newBadge
            }
          >
            <Text
              style={
                isBundle
                  ? styles.bundleBadgeText
                  : styles.newBadgeText
              }
            >
              SAVE ₹{save}
            </Text>
          </View>

          {/* HEART */}

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() =>
              removeFromWishlist(item._id)
            }
          >
            <Ionicons
              name="heart"
              size={22}
              color="#111"
            />
          </TouchableOpacity>

          {/* PRODUCT INFO */}

          <View style={styles.cardContent}>

            <Text
              numberOfLines={2}
              style={styles.productTitle}
            >
              {item.title}
            </Text>



            <View style={styles.bottomRow}>

              <View style={styles.priceContainer}>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    ₹{price}
                  </Text>

                  <Text style={styles.oldPrice}>
                    ₹{oldPrice}
                  </Text>
                </View>

          

              </View>

              {isBundle ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.bundleArrow}
                  onPress={() => router.push(`/bundle/${item._id}`)}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color="#B6FF2E"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.cartArrow}
                  onPress={() => openSizeModal(item)}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color="#B6FF2E"
                  />
                </TouchableOpacity>
              )}

            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */

  return (
    <Screen style={styles.container}>

      <Animated.View
        style={[
          styles.stickyHeader,
          stickyHeaderStyle,
        ]}
      >

        <TouchableOpacity
          style={styles.stickyIcon}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.stickyTitle}>
          Wishlist
        </Text>

        <CartIcon />

      </Animated.View>

      {/* HEADER */}
      <Animated.View
        style={[
          styles.hero,
          headerStyle,
             {
      top: insets.top + 10,
    },
        ]}
      >

        <View style={styles.heroTop}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >

            <Ionicons
              name="chevron-back"
              size={22}
              color="#111"
            />

          </TouchableOpacity>
 <Text style={styles.stickyTitle}>
          Wishlist
        </Text>
          <CartIcon />

        </View>


    

      </Animated.View>

      {wishlistItems.length === 0 ? (
        <View style={styles.empty}>

          <View
            style={styles.emptyCircle}
          >

            <Ionicons
              name="heart-outline"
              size={44}
              color="#111"
            />

          </View>

          <Text style={styles.emptyTitle}>
            Nothing Saved Yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Save products you love and
            they'll appear here.
          </Text>

          <TouchableOpacity
            style={styles.shopButton}
            onPress={() =>
              router.push("/")
            }
          >

            <Text
              style={styles.shopButtonText}
            >

              START SHOPPING

            </Text>

          </TouchableOpacity>

        </View>
      ) : (
        <Animated.FlatList

          data={wishlistItems}

          renderItem={renderItem}

          keyExtractor={(item) => item._id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",

          }}
          showsVerticalScrollIndicator={false}

          contentContainerStyle={styles.listContent}



        />
      )}

      {/* SIZE MODAL */}
      <Modal
        visible={sizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.overlay}>

          {/* BACKDROP CLICK */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSizeModalVisible(false)}
          />

          {/* 🔥 BOTTOM SHEET */}
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
            ]}
          >

            <View
              style={styles.dragHandle}
            />

            <Text
              style={styles.sheetHeading}
            >
              SELECT SIZE
            </Text>

            <Text
              style={styles.sheetSubheading}
            >
              Choose your preferred fit
            </Text>

            <View
              style={styles.sizeGrid}
            >

              {SIZE_OPTIONS.map(
                (size) => {

                  const selected =
                    selectedSizes[
                    selectedProduct?._id
                    ] === size;

                  return (

                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeCard,
                        selected &&
                        styles.sizeCardActive,
                      ]}
                      onPress={() =>
                        setSelectedSizes(
                          (prev) => ({
                            ...prev,
                            [
                              selectedProduct._id
                            ]: size,
                          })
                        )
                      }
                    >

                      <Text
                        style={[
                          styles.sizeLabel,
                          selected &&
                          styles.sizeLabelActive,
                        ]}
                      >
                        {size}
                      </Text>

                    </TouchableOpacity>

                  );

                }
              )}

            </View>

            <TouchableOpacity
              disabled={
                !selectedSizes[
                selectedProduct?._id
                ]
              }
              style={[
                styles.addCartButton,
                !selectedSizes[
                selectedProduct?._id
                ] && {
                  opacity: .4,
                },
              ]}
              onPress={() =>
                addToCartWithSize(
                  selectedSizes[
                  selectedProduct._id
                  ]
                )
              }
            >

              <Ionicons
                name="bag-add"
                size={20}
                color="#111"
              />

              <Text
                style={styles.addCartText}
              >
                ADD TO CART
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeSheet}
              onPress={() =>
                setSizeModalVisible(false)
              }
            >

              <Text
                style={styles.closeSheetText}
              >
                CANCEL
              </Text>

            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  productCard: {
    width: "47.5%",

    marginBottom: 20,

    overflow: "visible",
  },



  imageContainer: {
    width: "100%",
    aspectRatio: 0.68,

    position: "relative",

    borderRadius: RADIUS,

    overflow: "hidden",
  },

  productImage: {
    width: "100%",

    height: "100%",

    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: "42%",
  },

  cardContent: {
    position: "absolute",

    left: SCREEN_WIDTH * 0.04,

    right: SCREEN_WIDTH * 0.04,

    bottom: 16,
  },
  favoriteButton: {
    position: "absolute",

    top: 14,

    right: 14,

    width: "18%",

    height: "18%",

    borderRadius: 18 / 2,


    justifyContent: "center",

    alignItems: "center",

  },

  newBadge: {
    position: "absolute",

    left: 14,

    top: 14,

    height: 34,

    paddingHorizontal: 16,

    borderRadius: width * 8,

    justifyContent: "center",

    backgroundColor: "#B6FF2E",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  priceContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  price: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },

  oldPrice: {
    marginLeft: 6,
    color: "#B6FF2E",
    fontSize: SCREEN_WIDTH * 0.035,
    textDecorationLine: "line-through",
  },

  saveLabel: {
    marginTop: 2,
    color: "#B6FF2E",
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  cartArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  bundleArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  newBadgeText: {
    color: "#000000",

    fontWeight: "900",

    fontSize: SCREEN_WIDTH * 0.020,

    letterSpacing: 1,
  },

  bundleBadge: {
    position: "absolute",

    left: 14,

    top: 14,

    height: 34,

    paddingHorizontal: 16,

    borderRadius: 18,

    justifyContent: "center",

    backgroundColor: "#B6FF2E",
  },

  bundleBadgeText: {
    color: "#111",

    fontWeight: "900",

    fontSize: SCREEN_WIDTH * 0.020,

    letterSpacing: 1,
  },

  productTitle: {
    color: "#FFF",

    fontSize: SCREEN_WIDTH * 0.05,

    fontWeight: "900",

    // lineHeight: SCREEN_WIDTH * 0.065,


  },



  savePill: {
    backgroundColor: "#B6FF2E",

    height: 34,

    paddingHorizontal: 12,

    borderRadius: 17,

    justifyContent: "center",
  },

  saveText: {
    color: "#111",

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: 0.8,
  },




  imageWrapper: {
    position: "relative",

    overflow: "hidden",

    borderTopLeftRadius: 30,

    borderTopRightRadius: 30,
  },



  productContent: {
    padding: 22,
  },


  priceSection: {
    marginTop: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-end",
  },







  bundlePill: {

    position: "absolute",

    left: 18,

    top: 18,

    backgroundColor: "#111",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 14,

  },

  bundlePillText: {

    color: "#B6FF2E",

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: 1,

  },

  productInfo: {

    padding: 20,

  },








  bundleArrowIcon: {
    color: "#B6FF2E",
  },
  primaryButton: {

    height: 58,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

    flexDirection: "row",

  },

  primaryText: {

    marginLeft: 8,

    fontWeight: "900",

    fontSize: 14,

    color: "#111",

    letterSpacing: .8,

  },

  secondaryButton: {

    height: 58,

    borderRadius: 18,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

  },

  secondaryText: {

    fontWeight: "900",

    fontSize: 14,

    letterSpacing: .8,

    color: "#FFF",

  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },

  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#f5f5f5',
  },

  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },

  info: { padding: 10 },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },



  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 8,
    borderRadius: 8,
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },

  bundleBtn: {
    borderWidth: 1,
    borderColor: '#111',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  bundleBtnText: {
    fontWeight: '600',
    color: '#111',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },



  sizeBtn: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },





  /* PRIMARY BUTTON */
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 10,
  },



  /* SECONDARY BUTTON */
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },


  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  hero: {
    position: "absolute",

    left: 0,
    right: 0,

    zIndex: 10,

    backgroundColor: "#FFF",

    paddingHorizontal: 22,

    paddingTop: 18,

    paddingBottom: 28,
  },

  heroTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  backButton: {

    width: 52,

    height: 52,

    borderRadius: 18,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",

    alignItems: "center",

  },

  heroTitle: {

    marginTop: 30,

    fontSize: 42,

    color: "#111",

    fontWeight: "900",

    letterSpacing: 1,

  },

  heroSubtitle: {

    marginTop: 10,

    fontSize: 16,

    color: "#777",

    lineHeight: 24,

  },

  heroAccent: {

    width: 86,

    height: 6,

    borderRadius: 3,

    backgroundColor: "#B6FF2E",

    marginTop: 20,

  },

  listContent: {
    paddingHorizontal: H_PADDING,

    paddingTop: SCREEN_HEIGHT * 0.1,

    paddingBottom: SCREEN_HEIGHT * 0.1,
  },

  emptyCircle: {

    width: 110,

    height: 110,

    borderRadius: 55,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",

    alignItems: "center",

  },

  emptyTitle: {

    marginTop: 28,

    fontSize: 28,

    color: "#111",

    fontWeight: "900",

  },

  emptySubtitle: {

    marginTop: 12,

    color: "#777",

    fontSize: 15,

    lineHeight: 24,

    textAlign: "center",

  },
  dragHandle: {

    alignSelf: "center",

    width: 52,

    height: 5,

    borderRadius: 3,

    backgroundColor: "#DDD",

    marginBottom: 24,

  },

  sheetHeading: {

    fontSize: 30,

    fontWeight: "900",

    color: "#111",

    letterSpacing: .5,

  },

  sheetSubheading: {

    marginTop: 8,

    marginBottom: 28,

    fontSize: 15,

    color: "#777",

  },

  sizeGrid: {

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

  },

  sizeCard: {

    width: "30%",

    height: 62,

    marginBottom: 16,

    borderRadius: 18,

    backgroundColor: "#F6F6F6",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ECECEC",

  },

  sizeCardActive: {

    backgroundColor: "#B6FF2E",

    borderColor: "#B6FF2E",

  },

  sizeLabel: {

    fontSize: 16,

    fontWeight: "900",

    color: "#111",

  },

  sizeLabelActive: {

    color: "#111",

  },

  addCartButton: {

    marginTop: 20,

    height: 62,

    borderRadius: 20,

    backgroundColor: "#B6FF2E",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

  },

  addCartText: {

    marginLeft: 10,

    fontSize: 15,

    fontWeight: "900",

    color: "#111",

    letterSpacing: .8,

  },

  closeSheet: {

    marginTop: 16,

    alignItems: "center",

    paddingVertical: 16,

  },

  closeSheetText: {

    fontSize: 14,

    fontWeight: "800",

    color: "#888",

    letterSpacing: .8,

  },
  shopButton: {

    marginTop: 34,

    height: 58,

    paddingHorizontal: 34,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    justifyContent: "center",

    alignItems: "center",

  },
  actionRow: {
    marginTop: 22,
  },

  cartButton: {
    height: 58,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    paddingHorizontal: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  cartButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  cartButtonText: {
    marginLeft: 10,

    color: "#111",

    fontWeight: "900",

    fontSize: 14,

    letterSpacing: 0.8,
  },

  bundleButton: {
    height: 58,

    borderRadius: 18,

    backgroundColor: "#111",

    paddingHorizontal: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  bundleButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  bundleButtonText: {
    marginLeft: 10,

    color: "#B6FF2E",

    fontWeight: "900",

    fontSize: 14,

    letterSpacing: 0.8,
  },
  shopButtonText: {

    color: "#111",

    fontSize: 14,

    fontWeight: "900",

    letterSpacing: 1,

  },
  sizeChip: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  sizeText: {
    fontWeight: "600",
  },

  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },

  cancelText: {
    color: "#FF4D4F",
    fontWeight: "600",
  },
  stickyHeader: {
    position: "absolute",

    // left: 16,
    // right: 16,

    top: width * 0.08,

    zIndex: 999,

    backgroundColor: "#FFF",

    paddingHorizontal: 12,

    paddingTop: 12,

    paddingBottom: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#EFEFEF",
  },

  stickyTitle: {
    flex: 1,

    textAlign: "center",

    fontSize: 18,

    fontWeight: "900",

    color: "#111",
  },

  stickyIcon: {
    width: 46,

    height: 46,

    borderRadius: 16,

    backgroundColor: "#F5F5F5",

    justifyContent: "center",

    alignItems: "center",
  },




});
