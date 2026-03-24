import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/config";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams();
  const { clearCart } = useCart();
  const { guestId } = useAuth();

  const [order, setOrder] = useState<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getStatus = (order: any) => {
    if (order?.statusHistory?.length > 0) {
      return order.statusHistory[order.statusHistory.length - 1].status;
    }
    return order?.orderStatus || "pending";
  };

  useEffect(() => {
    clearCart({ skipLocal: true }).catch(console.log);

    // 🧹 remove old local orders
    AsyncStorage.removeItem("orders");

    const loadOrder = async () => {
      try {
        const res = await api.get(
          `/api/orders/track?orderNumber=${orderNumber}`,
          {
            headers: { "x-guest-id": guestId || "" },
          }
        );

        setOrder(res.data.order);
      } catch (e) {
        console.log("Order fetch error:", e);
      }
    };

    loadOrder();

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 60 }}>
          Loading order...
        </Text>
      </SafeAreaView>
    );
  }

  const status = getStatus(order);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.content}>
          
          {/* ICON */}
          <Animated.View
            style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}
          >
            <Ionicons name="checkmark" size={60} color="#22c55e" />
          </Animated.View>

          {/* HEADER */}
          <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
            <Text style={styles.title}>Order Confirmed</Text>
            <Text style={styles.subtitle}>
              Your order has been placed successfully
            </Text>

            {/* STATUS BADGE */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>

            {/* ORDER INFO */}
            <View style={styles.card}>
              <Row label="Order ID" value={`#${order.orderNumber}`} />
              <Divider />

              <Row label="Email" value={order.email} />
              <Divider />

              <Row
                label="Date"
                value={new Date(order.createdAt).toDateString()}
              />
              <Divider />

              <Row label="Payment" value={`${order.paymentMethod} (${order.paymentStatus})`} />
            </View>

            {/* ITEMS */}
            <View style={styles.card}>
              <Text style={styles.section}>Items</Text>

              {order.items.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <Image source={{ uri: item.mainImage }} style={styles.image} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>
                      {item.variant} • Qty {item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.itemPrice}>₹{item.total}</Text>
                </View>
              ))}
            </View>

            {/* DELIVERY */}
            <View style={styles.card}>
              <Text style={styles.section}>Delivery</Text>

              <Text style={styles.value}>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </Text>

              <Text style={styles.sub}>
                {order.shippingAddress.address}
              </Text>

              <Text style={styles.sub}>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </Text>

              <Text style={styles.sub}>
                📞 {order.shippingAddress.phone}
              </Text>
            </View>

            {/* BILLING */}
            <View style={styles.card}>
              <Text style={styles.section}>Summary</Text>

              <Row label="Subtotal" value={`₹${order.subtotal}`} />
              <Row
                label="Shipping"
                value={
                  order.shippingFee > 0
                    ? `₹${order.shippingFee}`
                    : "Free"
                }
              />

              <Divider />

              <Row
                label="Total"
                value={`₹${order.total}`}
                bold
              />
            </View>

            <Text style={styles.info}>
              You can track your order anytime from My Orders.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* BUTTONS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.secondaryText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/orders")}
        >
          <Text style={styles.primaryText}>View Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Row = ({ label, value, bold }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, bold && { fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  content: { alignItems: "center", paddingHorizontal: 20, marginTop: 60 },

  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },

  statusBadge: {
    alignSelf: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },

  statusText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  section: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: { fontSize: 12, color: "#777" },

  value: { fontSize: 13, fontWeight: "500" },

  sub: { fontSize: 12, color: "#666", marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },

  itemTitle: { fontSize: 13, fontWeight: "600" },

  itemSub: { fontSize: 11, color: "#666" },

  itemPrice: { fontWeight: "600" },

  info: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  primaryText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  secondaryText: { fontWeight: "600" },
});