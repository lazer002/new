// src/screens/CartScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  useColorScheme
} from "react-native";
import { useCart } from "../context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get("window");
import { useSafeAreaInsets,SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from "../components/AppHeader";

export default function CartScreen() {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const theme = useColorScheme();
  const navigation = useNavigation();
  const isDark = theme === 'dark';
  const [coupon, setCoupon] = useState("");

  // ---- FIXED SUBTOTAL (handles bundle + single products)
  const subtotal = items.reduce((s, it) => {
    if (it.bundle) {
      return s + it.bundle.price * it.quantity;
    }
    return s + (it.product?.price || 0) * it.quantity;
  }, 0);

  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const discount = 0;
  const total = subtotal + tax + deliveryFee - discount;

  // ---- EMPTY CART UI
if (items.length === 0) {
  const insets = useSafeAreaInsets(); // 👈 add this here

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      {/* 🔝 AppHeader now gets top safe padding */}
      <View style={{ paddingTop: insets.top }}>
        <AppHeader  />
      </View>

      {/* 🎯 empty UI centered below */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
      }}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? '#111' : '#f2f2f2' },
          ]}
        >
          <Ionicons
            name="bag-outline"
            size={90}
            color={isDark ? 'black' : '#111'}
          />
        </View>

        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>
          YOUR BAG IS EMPTY
        </Text>

        <Text
          style={[
            styles.emptySubtitle,
            { color: isDark ? '#aaa' : '#666' },
          ]}
        >
          Your cart is ready to roll, but it's feeling a bit empty without some
          stylish finds.
        </Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnPrimaryText}>SHOP NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


  // Debug

  return (
    <SafeAreaView >
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        {/* ---- CART ITEMS ---- */}
        <View style={styles.itemsContainer}>
          {items.map((it) => {
            const isBundle = !!it.bundle;

            // ---- IMAGE ----
            const displayImage = isBundle
              ? it.mainImage ||
              it.bundleProducts?.[0]?.product?.images?.[0] ||
              "https://via.placeholder.com/150"
              : it.product?.images?.[0];

            // ---- TITLE ----
            const displayTitle = isBundle ? it.bundle.title : it.product.title;

            // ---- PRICE ----
            const displayPrice = isBundle ? it.bundle.price : it.product.price;

            // ---- REMOVE KEY ----
            const removeId = isBundle ? it.bundle._id : it.product._id;

            return (
              <View key={it._id} style={styles.itemCard}>

                {/* IMAGE */}
                <Image source={{ uri: displayImage }} style={styles.itemImage} />

                <View style={styles.itemInfo}>

                  {/* TITLE + REMOVE */}
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {displayTitle}
                    </Text>

                    <TouchableOpacity onPress={() => remove(
                      removeId,
                      isBundle ? null : it.size,
                      isBundle ? true : false
                    )}>
                      <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>

                  {/* 🔥 BUNDLE SUB-ITEMS */}
                  {isBundle && (
                    <View style={{ marginTop: 6 }}>
                      {it.bundleProducts.map((bp) => {
                        const img =
                          bp.product?.images?.[0] ||
                          "https://via.placeholder.com/80";

                        return (
                          <View
                            key={bp.product._id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginVertical: 4,
                              gap: 10,
                            }}
                          >
                            {/* SUB-ITEM IMAGE */}
                            <Image
                              source={{ uri: img }}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 6,
                                backgroundColor: "#f0f0f0",
                              }}
                            />

                            {/* TITLE + SIZE */}
                            <View style={{ flex: 1 }}>
                              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600" }}>
                                {bp.product.title}
                              </Text>
                              <Text style={{ fontSize: 12, color: "#555" }}>
                                Size: {bp.size}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}


                  {/* Product size (normal item only) */}
                  {!isBundle && it.size && (
                    <View style={styles.variants}>
                      <Text style={styles.variant}>Size: {it.size}</Text>
                    </View>
                  )}

                  {/* QUANTITY CONTROLS */}
                  {/* Quantity */}
                  <View style={styles.qtyContainer}>
                    <Text style={{ fontWeight: "500" }}>Qty:</Text>

                    <View style={styles.qtyControls}>
                      {/* ➖ DECREASE */}
                      <TouchableOpacity
                        onPress={() => {
                          if (it.quantity === 1) {

                            isBundle
                              ? remove(it.bundle._id, null, true)
                              : remove(it.product._id, it.size);
                          } else {
                            update(
                              isBundle ? it.bundle._id : it.product._id,
                              it.quantity - 1,
                              it.size,
                              isBundle
                            );
                          }
                        }}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>


                      {/* 🔢 INPUT FIELD */}
                      <TextInput
                        value={String(it.quantity)}
                        keyboardType="numeric"
                        onChangeText={(val) => {
                          const num = Number(val);
                          if (!num || num <= 0) return; // prevent 0 or blank
                          update(
                            isBundle ? it.bundle._id : it.product._id,
                            num,
                            it.size,
                            isBundle
                          );
                        }}
                        style={styles.qtyInput}
                      />

                      {/* ➕ INCREASE */}
                      <TouchableOpacity
                        onPress={() =>
                          update(
                            isBundle ? it.bundle._id : it.product._id,
                            it.quantity + 1,
                            it.size,
                            isBundle
                          )
                        }
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>


                  {/* PRICE */}
                  <Text style={styles.itemPrice}>
                    ₹ {(displayPrice * it.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}

        </View>

        {/* ---- SUMMARY ---- */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>₹ {subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Tax (5%)</Text>
            <Text>₹ {tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Delivery Fee</Text>
            <Text>₹ {deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Discount</Text>
            <Text>₹ {discount.toFixed(2)}</Text>
          </View>

          <View
            style={[
              styles.summaryRow,
              { borderTopWidth: 1, marginTop: 8, paddingTop: 8 },
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>Total</Text>
            <Text style={{ fontWeight: "bold" }}>
              ₹ {total.toFixed(2)}
            </Text>
          </View>

          {/* COUPON */}
          <View style={styles.couponContainer}>
            <TextInput
              placeholder="Enter coupon code"
              value={coupon}
              onChangeText={setCoupon}
              style={styles.couponInput}
            />
            <TouchableOpacity style={styles.couponBtn}>
              <Text style={{ color: "#fff" }}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* CHECKOUT */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate("CheckoutScreen")}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

//
// ---- STYLES (UNCHANGED) ----
//
const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, backgroundColor: "#fff", paddingBottom: 200 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  wishlistIcon: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  iconWrapper: {
    width: 150,
    height: 150,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    width: '85%',
  },
  emptyButtons: { gap: 10, alignItems: 'center', width: '100%' },
  btn: {
    width: '80%',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: '#111' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  itemsContainer: { marginBottom: 20 },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: { width: 90, height: 90, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitle: { fontWeight: "600", fontSize: 16, maxWidth: width - 180 },

  variants: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  variant: { borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 12 },

  qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyControls: { flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 6, overflow: "hidden", marginLeft: 8 },
  qtyBtn: { paddingHorizontal: 12, justifyContent: "center", alignItems: "center" },
  qtyBtnText: { fontWeight: "bold", fontSize: 16 },
  qtyInput: { width: 40, textAlign: "center", borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#ccc" },

  itemPrice: { marginTop: 8, fontWeight: "bold", color: "#042354" },

  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  summaryTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },

  couponContainer: { flexDirection: "row", marginTop: 12 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 12 },
  couponBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginLeft: 8
  },

  checkoutBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 16
  }
});
