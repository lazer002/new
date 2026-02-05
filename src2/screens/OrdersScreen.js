// src/screens/OrdersScreen.js
import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/config";

const { width } = Dimensions.get("window");

export default function OrdersScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_FLOW = [
    "pending",
    "confirmed",
    "dispatched",
    "shipped",
    "out for delivery",
    "delivered",
  ];

  const TERMINAL = ["cancelled", "refunded"];

  const STATUS_ICONS = {
    pending: "receipt-outline",
    confirmed: "checkmark-done-outline",
    dispatched: "cube-outline",
    shipped: "airplane-outline",
    "out for delivery": "navigate-outline",
    delivered: "checkmark-circle-outline",
    cancelled: "close-circle-outline",
    refunded: "cash-outline",
  };

  const getProgressIndex = (status) =>
    TERMINAL.includes(status) ? -1 : STATUS_FLOW.indexOf(status);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders/user?email=${user.email}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Orders error:", err);
    } finally {
      setLoading(false);
    }
  };

// inside OrdersScreen.js
useEffect(() => {
  if (!user) {
    navigation.replace("TrackOrderScreen");
  }
}, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  const renderOrder = ({ item }) => {
    const first = item.items[0];
    const more = item.items.length - 1;
    const progress = getProgressIndex(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetails", { order: item })}
      >
        <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toDateString()}
        </Text>

        {/* PRODUCT PREVIEW */}
        <View style={styles.row}>
          <Image source={{ uri: first.images[0] }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {first.title}
            </Text>
            {more > 0 && (
              <Text style={styles.more}>+{more} more item(s)</Text>
            )}
            <Text style={styles.price}>₹{item.total}</Text>
          </View>
        </View>

        {/* STATUS */}
        {TERMINAL.includes(item.status) ? (
          <Text style={styles.cancelText}>
            {item.status.toUpperCase()}
          </Text>
        ) : (
          <View style={styles.timeline}>
            {STATUS_FLOW.map((stage, i) => {
              const active = progress >= i;
              return (
                <View key={stage} style={styles.timelineStep}>
                  <Text style={{ color: active ? "#111" : "#bbb" }}>
                    ●
                  </Text>
                  {i < STATUS_FLOW.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: active ? "#111" : "#ccc" },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}

/* --- styles matching your theme --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
  header: { fontSize: 26, fontWeight: "900", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: { flexDirection: "row", marginTop: 8 },
  orderNum: { fontWeight: "700", fontSize: 15 },
  date: { fontSize: 12, opacity: 0.5 },
  thumb: {
    width: 65,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  title: { fontWeight: "700", fontSize: 15, color: "#111" },
  more: { fontSize: 12, opacity: 0.6 },
  price: { fontSize: 15, fontWeight: "800", marginTop: 6 },
  timeline: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  timelineStep: { flexDirection: "row", alignItems: "center" },
  line: {
    width: (width - 160) / 5,
    height: 2,
    marginHorizontal: 4,
  },
  cancelText: {
    color: "#b10f0f",
    marginTop: 8,
    fontWeight: "700",
  },
});
