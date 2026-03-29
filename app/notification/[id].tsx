import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

export default function NotificationDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { guestId } = useAuth();

  const [notification, setNotification] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH ---------- */

  const fetchData = async () => {
    try {
      const notifRes = await api.get(
        `/api/notifications/notifications-detail/${id}`,
        { headers: { "x-guest-id": guestId || "" } }
      );

      const notif = notifRes.data.notification;
      setNotification(notif);

      // mark as read
      await api.patch(`/api/notifications/${id}/read`);

      // fetch order if exists
      if (notif?.payload?.orderNumber) {
        const orderRes = await api.get(
          `/api/orders/track?orderNumber=${notif.payload.orderNumber}`,
          { headers: { "x-guest-id": guestId || "" } }
        );

        setOrder(orderRes.data.order);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* NOTIFICATION CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>{notification?.title}</Text>
          <Text style={styles.body}>{notification?.body}</Text>
          <Text style={styles.time}>
            {new Date(notification?.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* ORDER SECTION */}
        {order && (
          <>
            {/* ORDER HEADER */}
            <View style={styles.card}>
              <Text style={styles.orderId}>#{order.orderNumber}</Text>
              <Text style={styles.status}>{order.orderStatus}</Text>
            </View>

            {/* ITEMS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Items</Text>

              {order.items.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <Image
                    source={{ uri: item.mainImage }}
                    style={styles.image}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      {item.variant}
                    </Text>
                    <Text style={styles.itemMeta}>
                      Qty: {item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.price}>₹{item.price}</Text>
                </View>
              ))}
            </View>

            {/* ADDRESS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Shipping</Text>
              <Text>
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
              </Text>
              <Text>{order.shippingAddress?.address}</Text>
              <Text>{order.shippingAddress?.phone}</Text>
            </View>

            {/* ACTION BUTTONS */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() =>
                  router.push(`/track/${order.orderNumber}`)
                }
              >
                <Text>Track Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={() =>
                  router.push(`/order/${order.orderNumber}`)
                }
              >
                <Text style={{ color: "#fff" }}>
                  View Order
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f6f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  card: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#fff",
  },

  title: { fontSize: 16, fontWeight: "700" },
  body: { marginTop: 6, color: "#555" },
  time: { marginTop: 8, fontSize: 12, color: "#999" },

  orderId: { fontWeight: "700" },
  status: { color: "#22c55e", marginTop: 6 },

  sectionTitle: { fontWeight: "700", marginBottom: 10 },

  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  itemName: { fontWeight: "600" },
  itemMeta: { fontSize: 12, color: "#666" },
  price: { fontWeight: "600" },

  btn: {
    flex: 1,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    margin: 16,
  },

  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#111",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    margin: 16,
  },
});