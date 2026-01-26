// src/screens/TrackOrderScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../utils/config";
import { useSafeAreaInsets,SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

export default function TrackOrderScreen({ route, navigation }) {
  const params = route.params || {};
  const [email, setEmail] = useState(params.email || "");
  const [orderNumber, setOrderNumber] = useState(params.orderNumber || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  // auto-fetch when coming from success or OrdersScreen
  useEffect(() => {
    if (params.email && params.orderNumber) {
      fetchOrder();
    }
  }, []);

  async function fetchOrder() {
    if (!email || !orderNumber) {
      setError("Enter email & order number");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/orders/track?email=${email}&orderNumber=${orderNumber}`);
      setOrder(res.data.order);
      setError("");
    } catch (err) {
      setError("Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }
  const insets = useSafeAreaInsets(); 

  return (
    <KeyboardAvoidingView
      style={{ flex: 1,paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <Text style={styles.header}>Track Order</Text>
        <Text style={styles.subText}>
          Enter your order number and email to view your order status.
        </Text>

        {/* FORM */}
        <View style={{ marginTop: 24 }}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Order Number"
            value={orderNumber}
            onChangeText={setOrderNumber}
            style={styles.input}
          />

          <TouchableOpacity style={styles.trackBtn} onPress={fetchOrder}>
            <Text style={styles.trackText}>Track</Text>
          </TouchableOpacity>
        </View>

        {/* STATUS */}
        {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

        {error !== "" && (
          <Text style={styles.errorMsg}>
            {error}
          </Text>
        )}

        {/* ORDER SUMMARY */}
        {order && (
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Ionicons name="cube-outline" size={28} color="#111" />
              <Text style={styles.cardTitle}>Order #{order.orderNumber}</Text>
            </View>

            <Text style={styles.meta}>
              Status: <Text style={styles.bold}>{order.status}</Text>
            </Text>
            <Text style={styles.meta}>
              Items: {order.items.length}
            </Text>
            <Text style={styles.meta}>
              Total: ₹{order.total}
            </Text>

            <TouchableOpacity
              style={[styles.trackBtn, { marginTop: 20 }]}
              onPress={() =>
                navigation.navigate("Orders") // until OrderDetailsScreen exists
              }
            >
              <Text style={styles.trackText}>View All Orders</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---- THEME STYLES ---- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 28, fontWeight: "900" },
  subText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    lineHeight: 20,
    maxWidth: width * 0.8
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    fontSize: 15,
    backgroundColor: "#fafafa"
  },

  trackBtn: {
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  trackText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  errorMsg: {
    color: "red",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600"
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginTop: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8
  },

  cardTitle: { fontSize: 17, fontWeight: "800", marginLeft: 6 },
  meta: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  bold: { fontWeight: "800", opacity: 1 }
});
