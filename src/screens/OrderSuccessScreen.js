import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../utils/config"; // <-- your axios wrapper

const { width } = Dimensions.get("window");

export default function OrderSuccessScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { orderNumber, email } = route.params;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  async function fetchOrderDetails() {
    try {
      const res = await api.get(
        `/api/orders/track?orderNumber=${orderNumber}&email=${email}`
      );
      setOrderData(res.data.order);
    } catch (err) {
      console.log("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---- LOADING STATE ----
  if (loading || !orderData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 10, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  // ---- DATA EXTRACTION ----
  const firstItem = orderData.items?.[0];
  const moreItemsCount = (orderData.items?.length || 1) - 1;
  const deliveryEstimate = orderData.estimatedDelivery || "3–6 days";

  const itemImage = firstItem.images?.[0];
  const itemTitle = firstItem.title;
  const itemPrice = firstItem.price;
  const itemSize = firstItem.selectedSize ?? firstItem.size ?? "Free";
  const itemQty = firstItem.qty;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      
      {/* ---- HEADER ---- */}
      <View style={styles.headerBox}>
        <Ionicons name="checkmark" size={42} color="#111" />
        <Text style={styles.title}>Order Placed</Text>
        <Text style={styles.subTitle}>
          Your order has been received and is being processed.
        </Text>
        <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
      </View>

      {/* ---- ORDER CARD ---- */}
      <View style={styles.card}>
        <Image source={{ uri: itemImage }} style={styles.productImg} />

        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {itemTitle}
          </Text>

          <Text style={styles.metaLine}>
            Size: {itemSize}  •  Qty: {itemQty}
          </Text>

          <Text style={styles.price}>₹{itemPrice}</Text>

          <Text style={styles.delivery}>
            Estimated Delivery: {deliveryEstimate}
          </Text>

          {moreItemsCount > 0 && (
            <Text style={styles.moreText}>+{moreItemsCount} more item(s)</Text>
          )}
        </View>
      </View>

      {/* ---- ACTIONS ---- */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate("OrdersScreen")}
        >
          <Text style={styles.trackText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate("Tabs")}
        >
          <Text style={styles.homeText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---- STYLES ---- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerBox: {
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 8,
    color: "#111",
  },
  subTitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    maxWidth: width * 0.7,
    lineHeight: 20,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  productImg: {
    width: 72,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#e9e9e9",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  delivery: {
    fontSize: 12,
    opacity: 0.6,
  },
  moreText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },

  actions: {
    marginTop: 28,
    paddingHorizontal: 20,
    gap: 14,
  },
  trackBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  trackText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  homeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111",
  },
  homeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },
});
