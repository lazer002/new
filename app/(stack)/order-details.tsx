import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function OrderDetails() {
  const { orderNumber } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const loadOrder = async () => {
      const data = await AsyncStorage.getItem("orders");
      if (data) {
        const parsed = JSON.parse(data);
        const found = parsed.find(
          (o: any) => o.orderNumber === orderNumber
        );
        setOrder(found);
      }
    };
    loadOrder();
  }, []);

  if (!order) return null;
console.log("Loaded order:", JSON.stringify(order));
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>ORDER DETAILS</Text>

          <View style={{ width: 22 }} />
        </View>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{order.orderNumber}</Text>

            <Text style={[styles.label, { marginTop: 10 }]}>
              Tracking ID
            </Text>
            <Text style={styles.value}>#{order.orderNumber}</Text>

            {/* STATUS */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Order Placed</Text>
            <Text style={styles.value}>
              {new Date(order.createdAt).toDateString()}
            </Text>

            <Text style={[styles.label, { marginTop: 10 }]}>
              Order Delivered
            </Text>
            <Text style={styles.value}>
              {new Date(order.createdAt).toDateString()}
            </Text>
          </View>
        </View>

        {/* RECEIVER */}
        <View style={styles.card}>
          <Text style={styles.section}>RECEIVER INFO</Text>

          <InfoRow
            label="Name"
            value={`${order.address?.firstName} ${order.address?.lastName}`}
          />
          <InfoRow
            label="Address"
            value={`${order.address?.address}, ${order.address?.city}`}
          />
          <InfoRow label="Phone" value={order.phone} />
          <InfoRow label="Email" value={order.email} />
        </View>

        {/* PAYMENT */}
        <View style={styles.card}>
          <Text style={styles.section}>PAYMENT METHOD</Text>

          <View style={styles.paymentBox}>
            <Text style={styles.value}>
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Debit / Credit Card"}
            </Text>

            {order.paymentMethod !== "cod" && (
              <Text style={styles.sub}>
                **** **** **** {order.paymentDetails?.last4 || "----"}
              </Text>
            )}
          </View>
        </View>

        {/* PRODUCTS */}
        <View style={styles.card}>
          <Text style={styles.section}>PRODUCTS</Text>

          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <Image source={{ uri: item.mainImage }} style={styles.image} />

              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.sub}>Size {item.variant}</Text>

                <View style={styles.rowBetween}>
                  <Text style={styles.qty}>
                    Qty {item.quantity || 1}
                  </Text>
                  <Text style={styles.price}>₹{item.total}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* TOTAL BAR */}
      <View style={styles.totalBar}>
        <View style={styles.summaryRow}>
          <Text style={styles.subLabel}>Subtotal</Text>
          <Text style={styles.subValue}>
            ₹{order.subtotal ?? order.total}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.subLabel}>Shipping</Text>
          <Text style={styles.subValue}>
            {order.shipping > 0 ? `₹${order.shipping}` : "Free"}
          </Text>
        </View>

        {order.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.subLabel}>Discount</Text>
            <Text style={[styles.subValue, { color: "#22c55e" }]}>
              -₹{order.discount}
            </Text>
          </View>
        )}

        <View style={styles.totalDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.total}>
            ₹{order.total ?? order.subtotal ?? 0}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  content: { padding: 16, paddingBottom: 120 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  topTitle: { fontSize: 18, fontWeight: "700" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: { fontSize: 10, color: "#aaa" },
  value: { fontSize: 13, fontWeight: "600", marginTop: 2 },

  statusBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },

  statusText: { color: "#22c55e", fontSize: 11 },

  card: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  section: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: "600",
  },

  infoRow: { marginBottom: 8 },
  infoLabel: { fontSize: 10, color: "#aaa" },
  infoValue: { fontSize: 13, fontWeight: "500" },

  paymentBox: { marginTop: 4 },

  sub: { fontSize: 11, color: "#777", marginTop: 2 },

  productRow: { flexDirection: "row", marginBottom: 16 },

  image: {
    width: width * 0.2,
    height: height * 0.12,
    borderRadius: 10,
    marginRight: 12,
  },

  productTitle: { fontSize: 13, fontWeight: "600" },

  qty: { fontSize: 11, color: "#777", marginTop: 6 },

  price: { fontWeight: "600" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  subLabel: { fontSize: 12, color: "#777" },
  subValue: { fontSize: 12, color: "#111" },

  totalDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  totalLabel: { fontSize: 13, fontWeight: "600" },
  total: { fontSize: 18, fontWeight: "700" },
});