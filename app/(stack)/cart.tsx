// src/screens/CartScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");
const SUMMARY_HEIGHT = height * 0.38;

export default function CartScreen() {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const [coupon, setCoupon] = useState("");

  /* ---------- TOTALS ---------- */
  const subtotal = items.reduce((s, it) => {
    if (it.bundle) return s + it.bundle.price * it.quantity;
    return s + (it.product?.price || 0) * it.quantity;
  }, 0);

  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const discount = 0;
  const total = subtotal + tax + deliveryFee - discount;

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
  const renderDelete = () => (
    <View style={styles.deleteBox}>
      <Ionicons name="trash-outline" size={26} color="#fff" />
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Cart</Text>

        <View style={styles.headerBtn}>
          <Ionicons name="bag-outline" size={20} />
        </View>
      </View>

      {/* ITEMS */}
      <ScrollView style={styles.itemsScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {items.map((it) => {
            const isBundle = !!it.bundle;

            const image =
              it.mainImage ||
              it.bundleProducts?.[0]?.product?.images?.[0] ||
              it.product?.images?.[0];

            const title = isBundle ? it.bundle.title : it.product.title;
            const price = isBundle ? it.bundle.price : it.product.price;

            return (
              <Swipeable
                key={it._id}
                renderRightActions={renderDelete}
                onSwipeableOpen={() =>
                  remove(
                    isBundle ? it.bundle._id : it.product._id,
                    isBundle ? undefined : it.size,
                    isBundle
                  )
                }
              >
                <View style={styles.itemCard}>
                  <Image source={{ uri: image }} style={styles.itemImage} />

                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {title}
                      </Text>
                    </View>

                    {!isBundle && it.size && (
                      <Text style={styles.variant}>Size: {it.size}</Text>
                    )}

                    <View style={styles.row}>
                      <Text style={styles.price}>₹ {price.toFixed(2)}</Text>

                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => {
                            if (it.quantity === 1) {
                              remove(
                                isBundle ? it.bundle._id : it.product._id,
                                isBundle ? undefined : it.size,
                                isBundle
                              );
                            } else {
                              update(
                                isBundle ? it.bundle._id : it.product._id,
                                it.quantity - 1,
                                it.size,
                                isBundle
                              );
                            }
                          }}
                        >
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.qtyValue}>{it.quantity}</Text>

                        <TouchableOpacity
                          style={[styles.qtyBtn, styles.qtyAdd]}
                          onPress={() =>
                            update(
                              isBundle ? it.bundle._id : it.product._id,
                              it.quantity + 1,
                              it.size,
                              isBundle
                            )
                          }
                        >
                          <Text style={[styles.qtyBtnText, { color: "#fff" }]}>
                            +
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            );
          })}
        </View>
      </ScrollView>

      {/* SUMMARY */}
      <View style={styles.summaryContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <SummaryRow label="Subtotal" value={`₹ ${subtotal.toFixed(2)}`} />
          <SummaryRow label="Tax (5%)" value={`₹ ${tax.toFixed(2)}`} />
          <SummaryRow
            label="Delivery Fee"
            value={`₹ ${deliveryFee.toFixed(2)}`}
          />
          <SummaryRow label="Discount" value={`₹ ${discount.toFixed(2)}`} />

          <View style={styles.divider} />

          <SummaryRow
            label="Total"
            value={`₹ ${total.toFixed(2)}`}
            bold
          />

          <View style={styles.couponRow}>
            <TextInput
              placeholder="Enter Discount Code"
              value={coupon}
              onChangeText={setCoupon}
              style={styles.couponInput}
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={{ fontWeight: "600" }}>Apply</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
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
  root: { flex: 1, backgroundColor: "#f6f6f6" },

  /* Header */
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Items */
  itemsScroll: { flex: 1 },
  itemsContainer: { padding: 16, paddingBottom: 20 },

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
  itemTitle: { fontWeight: "700", fontSize: 15, maxWidth: width - 160 },
  variant: { fontSize: 12, color: "#666" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  price: { fontWeight: "700", fontSize: 15 },

  /* Qty */
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 18,
    paddingHorizontal: 6,
    height: 36,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyAdd: { backgroundColor: "#7CFC6A" },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
  qtyValue: {
    width: 26,
    textAlign: "center",
    fontWeight: "600",
  },

  /* Delete */
  deleteBox: {
    width: 80,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginVertical: 6,
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
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryText: { fontSize: 14 },
  bold: { fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },

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
  checkoutText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  /* Empty */
  emptyRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 12 },
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
});
