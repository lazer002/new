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
  const { orderNumber, email } = useLocalSearchParams();
  const { clearCart } = useCart();
  const { guestId } = useAuth();

  const [order, setOrder] = useState<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ Clear cart
    clearCart({ skipLocal: true }).catch(console.log);

    // 🧹 CLEAN OLD LOCAL ORDERS (ONE LINE YOU ASKED)
    AsyncStorage.removeItem("orders");

    // ✅ FETCH ORDER FROM BACKEND
    const loadOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${orderNumber}`, {
          headers: {
            "x-guest-id": guestId || "",
          },
        });

        setOrder(res.data);
      } catch (e) {
        console.log("Order fetch error:", e);
      }
    };

    loadOrder();

    // ✅ ANIMATION
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
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Loading order...
        </Text>
      </SafeAreaView>
    );
  }

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

            {/* BASIC INFO */}
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.value}>#{order.orderNumber}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{email}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* ITEMS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Items</Text>

              {order.items?.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <Image
                    source={{ uri: item.mainImage }}
                    style={styles.image}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>{item.variant}</Text>
                  </View>

                  <Text style={styles.itemPrice}>₹{item.total}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.value}>
                  ₹{order.total ?? order.subtotal ?? 0}
                </Text>
              </View>
            </View>

            {/* DELIVERY */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>

              <Text style={styles.value}>
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
              </Text>

              <Text style={styles.subText}>
                {order.shippingAddress?.address}
              </Text>

              <Text style={styles.subText}>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.zip}
              </Text>

              <Text style={styles.subText}>
                📞 {order.shippingAddress?.phone || "N/A"}
              </Text>
            </View>

            <Text style={styles.infoText}>
              A confirmation email has been sent. You can track your order anytime.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },

  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    color: "#888",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
  },

  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#eee",
  },

  itemTitle: {
    fontWeight: "600",
    fontSize: 13,
  },

  itemSub: {
    fontSize: 11,
    color: "#666",
  },

  itemPrice: {
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 10,
  },

  infoText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },

  secondaryBtn: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  secondaryText: {
    color: "#111",
    fontWeight: "600",
  },
});
