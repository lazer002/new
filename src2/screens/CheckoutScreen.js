// src/screens/CheckoutScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/config";

export default function CheckoutScreen({ navigation }) {
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  /* ---------------- ADDRESS STATE ---------------- */
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "Delhi",
    zip: "",
    country: "India",
  });

  const [email, setEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  /* ---------------- PRICE CALC ---------------- */
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      if (it.bundle) return sum + it.bundle.price * it.quantity;
      return sum + it.product.price * it.quantity;
    }, 0);
  }, [items]);

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  /* ---------------- BUILD ORDER ITEMS ---------------- */
  const orderItems = useMemo(() => {
    return items.map((it) => {
      if (it.bundle) {
        return {
          bundleId: it.bundle._id,
          productId: null,
          title: it.bundle.title,
          variant: "",
          quantity: it.quantity,
          price: it.bundle.price,
          total: it.bundle.price * it.quantity,
          mainImage: it.mainImage,

          bundleProducts: it.bundleProducts.map((bp) => ({
            productId: bp.product._id,
            title: bp.product.title,
            variant: `Size: ${bp.size}`,
            quantity: bp.quantity,
            price: bp.product.price,
            mainImage: bp.product.images?.[0] || "",
          })),
        };
      }

      return {
        productId: it.product._id,
        bundleId: null,
        title: it.product.title,
        variant: `Size: ${it.size}`,
        quantity: it.quantity,
        price: it.product.price,
        total: it.product.price * it.quantity,
        mainImage: it.product.images?.[0] || "",
        bundleProducts: [],
      };
    });
  }, [items]);

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    if (!address.firstName || !address.phone || !address.address) {
      alert("Please fill required address fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/orders/create", {
        items: orderItems,
        subtotal,
        shipping,
        total,
        shippingMethod: "free",
        billingSame: true,
        shippingAddress: address,
        contactEmail: email,
        paymentMethod,
        discountCode: "",
        source: "mobile",
      });

      if (paymentMethod === "razorpay") {
        navigation.navigate("Razorpay", {
          order: res.data,
        });
      } else {
        await clearCart();
        navigation.replace("OrderSuccess", {
          orderNumber: res.data.orderNumber,
          email
        });
      }
    } catch (err) {
      console.log("Order error:", err);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader title="Checkout" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* ---------- ADDRESS ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>

          <View style={styles.row}>
            <Input
              placeholder="First Name"
              value={address.firstName}
              onChange={(v) => setAddress({ ...address, firstName: v })}
            />
            <Input
              placeholder="Last Name"
              value={address.lastName}
              onChange={(v) => setAddress({ ...address, lastName: v })}
            />
          </View>

          <Input
            placeholder="Phone"
            keyboardType="phone-pad"
            value={address.phone}
            onChange={(v) => setAddress({ ...address, phone: v })}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />

          <Input
            placeholder="Address"
            value={address.address}
            onChange={(v) => setAddress({ ...address, address: v })}
          />

          <Input
            placeholder="Apartment (optional)"
            value={address.apartment}
            onChange={(v) => setAddress({ ...address, apartment: v })}
          />

          <View style={styles.row}>
            <Input
              placeholder="City"
              value={address.city}
              onChange={(v) => setAddress({ ...address, city: v })}
            />
            <Input
              placeholder="Pincode"
              keyboardType="numeric"
              value={address.zip}
              onChange={(v) => setAddress({ ...address, zip: v })}
            />
          </View>
        </View>

        {/* ---------- ITEMS ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>

          {items.map((it) => {
            const isBundle = !!it.bundle;
            const img = isBundle
              ? it.mainImage
              : it.product.images?.[0];

            return (
              <View key={it._id} style={styles.itemRow}>
                <Image source={{ uri: img }} style={styles.itemImage} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {isBundle ? it.bundle.title : it.product.title}
                  </Text>

                  {isBundle &&
                    it.bundleProducts.map((bp) => (
                      <Text key={bp.product._id} style={styles.subItem}>
                        • {bp.product.title} ({bp.size})
                      </Text>
                    ))}

                  {!isBundle && (
                    <Text style={styles.subItem}>Size: {it.size}</Text>
                  )}
                </View>

                <Text style={styles.itemPrice}>
                  ₹{(isBundle ? it.bundle.price : it.product.price) * it.quantity}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ---------- PAYMENT ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          <PaymentOption
            active={paymentMethod === "cod"}
            label="Cash on Delivery"
            onPress={() => setPaymentMethod("cod")}
          />

          <PaymentOption
            active={paymentMethod === "razorpay"}
            label="Pay Online (Razorpay)"
            onPress={() => setPaymentMethod("razorpay")}
          />
        </View>

        {/* ---------- SUMMARY ---------- */}
        <View style={styles.summary}>
          <Row label="Subtotal" value={`₹${subtotal}`} />
          <Row label="Shipping" value={`₹${shipping}`} />
          <Row bold label="Total" value={`₹${total}`} />
        </View>

        <TouchableOpacity
          style={styles.placeBtn}
          disabled={loading}
          onPress={placeOrder}
        >
          <Text style={styles.placeBtnText}>
            {loading ? "Placing Order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Input = ({ placeholder, value, onChange, ...props }) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChange}
    style={styles.input}
    {...props}
  />
);

const PaymentOption = ({ active, label, onPress }) => (
  <TouchableOpacity style={styles.paymentRow} onPress={onPress}>
    <Ionicons
      name={active ? "radio-button-on" : "radio-button-off"}
      size={20}
      color="#111"
    />
    <Text style={styles.paymentText}>{label}</Text>
  </TouchableOpacity>
);

const Row = ({ label, value, bold }) => (
  <View style={styles.rowBetween}>
    <Text style={[styles.rowText, bold && { fontWeight: "700" }]}>
      {label}
    </Text>
    <Text style={[styles.rowText, bold && { fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

  row: { flexDirection: "row", gap: 10 },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemImage: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  itemTitle: { fontWeight: "600", fontSize: 14 },
  subItem: { fontSize: 12, color: "#666" },
  itemPrice: { fontWeight: "700", marginLeft: 8 },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  paymentText: { fontSize: 14, fontWeight: "600" },

  summary: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  rowText: { fontSize: 14 },

  placeBtn: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  placeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
