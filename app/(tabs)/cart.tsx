// src/screens/CartScreen.tsx
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
} from "react-native";

import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  withSequence,
  withDelay,
  Easing,

} from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BundleDrawer from "@/components/cart/BundleDrawer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SCREEN, scale, verticalScale, normalize } from "@/utils/responsive";

const SUMMARY_HEIGHT = verticalScale(295);

export default function CartScreen() {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const [coupon, setCoupon] = useState("");
  const [expandedBundle, setExpandedBundle] =
    useState<string | null>(null);


  /* ---------- TOTALS ---------- */
  const subtotal = items.reduce((s, it) => {

    const price =
      it.product?.price ??
      it.bundle?.price ??
      it.customBundle?.price ??
      0;

    return s + price * it.quantity;

  }, 0);

  // const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 1000 ? 0 : 100;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  // const total = subtotal + tax + deliveryFee - discount;

  /* ---------- EMPTY CART ---------- */
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyRoot}>
        <Ionicons name="bag-outline" size={90} color="#111" />
        <Text style={styles.emptyTitle}>YOUR BAG IS EMPTY</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven’t added anything yet.
        </Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.shopBtnText}>SHOP NOW</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ---------- DELETE BACKGROUND ---------- */
const renderDelete = (
  item: any,
  progress: any,
  drag: any
) => {
  const isBundle =
    !!item.bundle || !!item.customBundle;

  const cartItemId = item._id;

  const itemId =
    item.product?._id ??
    item.bundle?._id;

  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0.6, 0.9, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.2, 1],
      [0, 0.7, 1],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      progress.value,
      [0, 1],
      [25, 0],
      Extrapolation.CLAMP
    );

    const rotate = interpolate(
      progress.value,
      [0, 1],
      [-12, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        { translateX },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <View style={styles.deleteWrapper}>
      <Pressable
        style={styles.deleteBox}
        onPress={() =>
          remove(
            isBundle ? cartItemId : itemId,
            isBundle ? undefined : item.size,
            isBundle
          )
        }
      >
        <Animated.View
          style={[styles.deleteCircle, iconStyle]}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#111"
          />
        </Animated.View>

        <Text style={styles.deleteTitle}>
          REMOVE
        </Text>

        <Text style={styles.deleteSubtitle}>
          Swipe
        </Text>
      </Pressable>
    </View>
  );
};



  return (
    <SafeAreaView
      style={styles.root}
    >

      <View
        style={styles.header}
      >

        <View>

          <Text
            style={styles.smallLabel}
          >
            YOUR BAG
          </Text>

          <Text
            style={styles.headerTitle}
          >
            Shopping Cart
          </Text>

        </View>

        <View
          style={styles.headerRight}
        >

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              router.back()
            }
          >

            <Ionicons
              name="chevron-back"
              size={22}
              color="#111"
            />

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.itemCount,
              {
                backgroundColor:
                  "#B6FF2E",
              },
            ]}
          >

            <Text
              style={
                styles.itemCountText
              }
            >

              {items.length}

            </Text>

          </TouchableOpacity>

        </View>

      </View>

      <View
        style={styles.divider}
      />


      {/* ITEMS */}
      <ScrollView
        style={styles.itemsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 380,
        }}
      >
        <View style={styles.itemsContainer}>
          {items.map((it,index) => {

           const cartItemId = it._id;

          const itemId =
            it.product?._id ??
            it.bundle?._id;

            const isBundle =
              !!it.bundle ||
              !!it.customBundle;

            const isExpanded =
              expandedBundle === itemId;


     
            return (
<Animated.View
  key={it._id}
 
>

                <ReanimatedSwipeable
                  renderRightActions={(progress, drag) =>
                    renderDelete(it, progress, drag)
                  }

                  rightThreshold={80}

                  overshootRight={false}

                  friction={2.5}

                  dragOffsetFromRightEdge={30}

                  enableTrackpadTwoFingerGesture

                  containerStyle={{
                    overflow: "hidden",
                    borderRadius: 24,
                  }}
                >

               

                    {/* CARD */}

                    <Animated.View
                      style={[
                        styles.cartCard,

                      ]}
                    >

                      <View style={styles.leftColumn}>

                        <Image
                          source={{
                            uri:
                              it.mainImage ??
                              it.product?.images?.[0] ??
                              it.bundleProducts?.[0]?.product?.images?.[0],
                          }}
                          style={styles.productImage}
                        />

                        {isBundle &&
                          it.bundleProducts?.length > 0 && (

                            <BundleDrawer
                              expanded={isExpanded}
                              bundleProducts={it.bundleProducts}
                              onToggle={() => {

                                setExpandedBundle(prev =>
                                  prev === itemId
                                    ? null
                                    : itemId
                                );

                              }}
                            />

                          )}

                      </View>

                      <View style={styles.productInfo}>

                        {/* TITLE */}

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >

                          <Text
                            numberOfLines={2}
                            style={[
                              styles.productName,
                              { flex: 1 },
                            ]}
                          >

                            {it.customBundle?.title ||
                              it.bundle?.title ||
                              it.product?.title}

                          </Text>


                        </View>

                        {/* SIZE */}

                        <Text style={styles.productMeta}>

                          Size {it.size || "OS"}

                        </Text>

                        {/* PRICE */}

                        <Text style={styles.productPrice}>

                          ₹
                          {(
                            it.customBundle?.price ??
                            it.bundle?.price ??
                            it.product?.price ??
                            0
                          ).toLocaleString()}

                        </Text>

                        {/* INCLUDED PRODUCTS */}



                      </View>

                      {/* RIGHT SIDE */}

                      <View style={styles.rightSide}>

                        <TouchableOpacity
                          onPress={() =>
                            remove(
                              isBundle ? cartItemId : itemId,
                              it.size,
                              isBundle
                            )
                          }
                        >

                          <Ionicons
                            name="trash-outline"
                            size={21}
                            color="#999"
                          />

                        </TouchableOpacity>

                        <View style={styles.qtyBox}>

                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() =>
                              update(
                                isBundle ? cartItemId : itemId,
                                it.quantity - 1,
                                it.size,
                                isBundle
                              )
                            }
                          >

                            <Ionicons
                              name="remove"
                              size={16}
                              color="#111"
                            />

                          </TouchableOpacity>

                          <Text style={styles.qty}>
                            {it.quantity}
                          </Text>

                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() =>
                              update(
                                isBundle ? cartItemId : itemId,
                                it.quantity + 1,
                                it.size,
                                isBundle
                              )
                            }
                          >

                            <Ionicons
                              name="add"
                              size={16}
                              color="#111"
                            />

                          </TouchableOpacity>

                        </View>

                      </View>

                    </Animated.View>

                    {/* BUNDLE DRAWER */}

            

                </ReanimatedSwipeable>
</Animated.View>
            );

          })}
        </View>
      </ScrollView>

      {/* SUMMARY */}
      <View style={styles.checkoutContainer}>

        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>

            <Text style={styles.summaryLabel}>
              Subtotal
            </Text>

            <Text style={styles.summaryValue}>
              ₹{subtotal.toLocaleString()}
            </Text>

          </View>

          <View style={styles.summaryRow}>

            <Text style={styles.summaryLabel}>
              Shipping
            </Text>

            <Text style={styles.freeText}>
              FREE
            </Text>

          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>

            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              ₹{subtotal.toLocaleString()}
            </Text>

          </View>

        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() =>
            router.push("/checkout")
          }
        >

          <Text style={styles.checkoutText}>
            PROCEED TO CHECKOUT
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#111"
          />

        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

/* ---------- SUMMARY ROW ---------- */
const SummaryRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryText, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.summaryText, bold && styles.bold]}>{value}</Text>
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {

    paddingHorizontal: 24,

    paddingTop: 18,

    paddingBottom: 22,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  smallLabel: {

    color: "#999",

    fontSize: normalize(11),

    letterSpacing: 2,

    fontWeight: "800",

  },

  headerTitle: {

    marginTop: 6,

    color: "#111",

    fontSize: normalize(34),

    fontWeight: "900",

    letterSpacing: .4,

  },

  headerRight: {

    flexDirection: "row",

    alignItems: "center",

  },

  iconButton: {

    width: 52,

    height: 52,

    borderRadius: 18,

    backgroundColor: "#F7F7F7",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ECECEC",

  },

  itemCount: {

    width: 46,

    height: 46,

    borderRadius: 23,

    marginLeft: 14,

    justifyContent: "center",

    alignItems: "center",

  },

  itemCountText: {

    color: "#111",

    fontSize: normalize(16),

    fontWeight: "900",

  },

  divider: {

    height: 1,

    backgroundColor: "#F1F1F1",

    marginHorizontal: 24,

  },
  cartCard: {

    flexDirection: "row",

    alignItems: "flex-start",

    padding: 18,

    marginHorizontal: 20,

    marginBottom: 18,

    backgroundColor: "#FFF",

    borderRadius: 24,

    borderWidth: 1,
 overflow: "hidden",
    borderColor: "#EFEFEF",

  },

  productImage: {
    width: 108,

    height: 150,

    borderRadius: 18,

    backgroundColor: "#F5F5F5",
  },

  productInfo: {

    flex: 1,

    marginLeft: 16,

    paddingVertical: 6,

  },

  productName: {

    fontSize: normalize(18),

    color: "#111",

    fontWeight: "900",

    lineHeight: normalize(24),

  },

  productMeta: {

    marginTop: 8,

    color: "#888",

    fontSize: normalize(13),

    letterSpacing: .5,

  },

  productPrice: {


    marginTop: 14,

    marginBottom: 18,

    fontSize: normalize(22),

    fontWeight: "900",

  },

  rightSide: {

    height: 150,

    justifyContent: "space-between",

    alignItems: "center",

    marginLeft: 8,

  },

  qtyBox: {

    width: 54,

    height: 118,

    backgroundColor: "#B6FF2E",

    borderRadius: 18,

    justifyContent: "space-evenly",

    alignItems: "center",

    paddingVertical: 6,

  },

  qtyBtn: {

    width: 32,

    height: 32,

    justifyContent: "center",

    alignItems: "center",

  },

  qty: {

    fontSize: normalize(17),

    fontWeight: "900",

    color: "#111",

    marginVertical: 4,

  },
  /* Items */
  itemsScroll: { flex: 1 },
  itemsContainer: {



    paddingTop: 20,

    // paddingBottom: 80,

  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    elevation: 3,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemHeader: { marginBottom: 4 },
  itemTitle: { fontWeight: "700", fontSize: normalize(15), maxWidth: SCREEN.width - scale(160) },
  variant: { fontSize: normalize(12), color: "#666" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  price: { fontWeight: "700", fontSize: normalize(15) },

  /* Qty */
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 18,
    paddingHorizontal: 6,
    height: 36,
  },

  qtyAdd: { backgroundColor: "#7CFC6A" },
  qtyBtnText: {
    fontSize: normalize(18),
    fontWeight: "700",
    lineHeight: normalize(18),
  },
  qtyValue: {
    width: 26,
    textAlign: "center",
    fontWeight: "600",
  },

  /* Delete */
deleteBox: {
  flex: 1,

  width: 100,

  backgroundColor: "#111",

  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,

  justifyContent: "center",
  alignItems: "center",

  marginBottom: verticalScale(15), // same as cartCard marginBottom
},
deleteCircle: {

  width: 58,

  height: 58,

  borderRadius: 29,

  backgroundColor: "#B6FF2E",

  justifyContent: "center",

  alignItems: "center",

  shadowColor: "#B6FF2E",

  shadowOpacity: .35,

  shadowRadius: 12,

  shadowOffset: {
    width: 0,
    height: 5,
  },

},

deleteTitle: {

  marginTop: verticalScale(15),

  color: "#FFF",

  fontSize: normalize(12),

  fontWeight: "900",

  letterSpacing: 2,

},

deleteSubtitle: {

  marginTop: 4,

  color: "#777",

  fontSize: normalize(11),

},
  /* Summary */
  summaryContainer: {
    height: SUMMARY_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10,
  },
  summaryTitle: { fontSize: normalize(16), fontWeight: "700", marginBottom: 12 },

  summaryText: { fontSize: normalize(14) },
  bold: { fontWeight: "700" },

  /* Coupon */
  couponRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 6,
    marginTop: 14,
  },
  couponInput: { flex: 1, paddingHorizontal: 10 },
  applyBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  /* Checkout */
  checkoutBtn: {
    backgroundColor: "#7CFC6A",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 20,
  },

  /* Empty */
  emptyRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: { fontSize: normalize(18), fontWeight: "700", marginTop: 12 },
  emptySubtitle: {
    textAlign: "center",
    color: "#666",
    marginVertical: 12,
  },
  shopBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  shopBtnText: { color: "#fff", fontWeight: "600" },
  checkoutContainer: {

    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    paddingHorizontal: 22,

    paddingTop: 20,

    paddingBottom: 34,

    backgroundColor: "#FFF",

    borderTopLeftRadius: 34,

    borderTopRightRadius: 34,

    borderTopWidth: 1,

    borderColor: "#ECECEC",

  },

  summaryCard: {

    backgroundColor: "#FAFAFA",

    borderRadius: 22,

    padding: 20,

    borderWidth: 1,

    borderColor: "#EFEFEF",

  },

  summaryRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 14,

  },

  summaryLabel: {

    color: "#777",

    fontSize: normalize(14),

  },

  summaryValue: {

    color: "#111",

    fontWeight: "700",

    fontSize: normalize(15),

  },

  freeText: {

    color: "#4CAF50",

    fontWeight: "900",

    fontSize: normalize(15),

  },

  summaryDivider: {

    height: 1,

    backgroundColor: "#ECECEC",

    marginVertical: 6,

  },

  totalLabel: {

    fontSize: normalize(18),

    color: "#111",

    fontWeight: "900",

  },

  totalValue: {

    fontSize: normalize(26),

    color: "#111",

    fontWeight: "900",

  },

  checkoutButton: {

    marginTop: 20,

    height: 62,

    borderRadius: 18,

    backgroundColor: "#B6FF2E",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

  },

  checkoutText: {

    color: "#111",

    fontWeight: "900",

    fontSize: normalize(15),

    letterSpacing: .8,

    marginRight: 10,

  },


  moreCircle: {

    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor: "#111",

    justifyContent: "center",

    alignItems: "center",

    marginLeft: -18,

  },

  moreText: {

    color: "#FFF",

    fontWeight: "900",

    fontSize: normalize(12),

  },
  includeSection: {

    marginTop: 0,

    paddingTop: 14,

    borderTopWidth: 1,

    borderColor: "#F2F2F2",

  },

  includeHeader: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 14,

  },

  includeTitle: {

    fontSize: normalize(12),

    fontWeight: "900",

    letterSpacing: 1,

    color: "#777",

    textTransform: "uppercase",

  },

  previewRow: {

    flexDirection: "row",

    alignItems: "center",

    marginTop: 10,

    height: 44,

  },

  previewBubble: {

    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFF",

    borderWidth: 2,

    borderColor: "#FFF",

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity: .08,

    shadowRadius: 8,

    shadowOffset: {

      width: 0,

      height: 3,

    },

    elevation: 3,

  },

  previewImage: {

    width: "100%",

    height: "100%",

  },

  leftColumn: {

    width: 110,

    alignItems: "flex-start",

  },

  bundlePreview: {

    marginTop: 12,
    width: "100%",
    alignItems: "flex-start",

  },

  bundlePreviewRow: {

    flexDirection: "row",
    alignItems: "center",

  },

  previewImageSmall: {

    width: 34,

    height: 34,

    borderRadius: 17,

    borderWidth: 2,

    borderColor: "#FFF",

    backgroundColor: "#F5F5F5",

  },

  bundleArrow: {

    marginLeft: 12,

    width: 28,

    height: 28,

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",

  },


  bundleRow: {

    marginBottom: 18,

    paddingLeft: 12,

  },

  bundleItemRow: {

    flexDirection: "row",

    alignItems: "center",

    minHeight: 58,

    paddingVertical: 8,

  },

  bundleItemImage: {

    width: 42,

    height: 42,

    borderRadius: 12,

    backgroundColor: "#F5F5F5",

  },

  bundleDetails: {

    width: 220, // or width: "100%"
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    //   width: "100%",
    // overflow: "hidden",

  },

  bundleName: {

    fontSize: normalize(14),

    fontWeight: "800",

    color: "#111",

  },

  bundleSize: {

    marginTop: 3,

    fontSize: normalize(12),

    color: "#777",

  },
deleteWrapper: {
  width: 100,
  height: "100%",
  justifyContent: "center",
},
});
