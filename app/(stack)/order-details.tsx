import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";
import * as Clipboard from "expo-clipboard";
export default function OrderDetails() {
  const { orderNumber } = useLocalSearchParams();
  const { guestId,user } = useAuth();
  const [order, setOrder] = useState<any>(null);

useFocusEffect(
  useCallback(() => {
    loadOrder();
  }, [guestId])
);

    const loadOrder = async () => {
      const res = await api.get(
        `/api/orders/track?orderNumber=${orderNumber}`,
        { headers: { "x-guest-id": guestId || "" } }
      );
      setOrder(res.data.order);
    };

  if (!order) return null;

  const steps = [
    "pending",
    "confirmed",
    "dispatched",
    "shipped",
    "out for delivery",
    "delivered",
  ];

  const currentStatus =
    order.statusHistory?.length > 0
      ? order.statusHistory[order.statusHistory.length - 1].status
      : order.orderStatus;

  const currentIndex = steps.findIndex((s) => s === currentStatus);

const getAction = () => {
  if (["pending", "confirmed"].includes(currentStatus)) return "cancel";
  if (["shipped", "out for delivery", "delivered"].includes(currentStatus))
    return "return";
  return null;
};

const handleCancel = () => {
  Alert.alert(
    "Cancel Order",
    "Are you sure you want to cancel this order?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: confirmCancel,
      },
    ]
  );
};
const confirmCancel = async () => {
  try {
    await api.put(
      "/api/orders/cancel",
      { orderId: order._id }, // ✅ correct
      { headers: { "x-guest-id": guestId || "" } }
    );

    setOrder((prev: any) => ({
      ...prev,
      orderStatus: "cancelled",
      statusHistory: [
        ...(prev.statusHistory || []),
        { status: "cancelled", updatedAt: new Date() },
      ],
    }));

 await loadOrder();

    Toast.show({
      type: "success",
      text1: "Order Cancelled",
    });
  } catch (e) {
    Toast.show({
      type: "error",
      text1: "Cancel Failed",
    });
  }
};

const handleReturn = () => {
  Toast.show({
    type: "info",
    text1: "Return Available",
    text2: "You can reject delivery or request return",
  });
};
const actionType = getAction();

const handleCopyOrderId = async () => {
  await Clipboard.setStringAsync(order.orderNumber);
};
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Details</Text>

          <View style={{ width: 22 }} />
        </View>

        {/* ORDER CARD */}
 <View style={styles.card}>
  
  {/* TOP ROW */}
  <View style={styles.topRow}>
    <Text style={styles.orderId}>#{order.orderNumber}</Text>

    <TouchableOpacity onPress={handleCopyOrderId}>
    <Ionicons name="copy-outline" size={18} color="#000" />
    </TouchableOpacity>
  </View>

  {/* DATE */}
  <Text style={styles.date}>
    {new Date(order.createdAt).toDateString()}
  </Text>

  {/* STATUS */}
  <View style={styles.statusBadge}>
    <Text style={styles.statusText}>{currentStatus}</Text>
  </View>

</View>

        {/* TRACKING */}
        <View style={styles.card}>
          <Text style={styles.section}>TRACK ORDER</Text>

          {steps.map((step, i) => (
            <View key={i} style={styles.trackRow}>
              
              {/* LINE */}
              <View style={styles.trackLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: i <= currentIndex ? "#22c55e" : "#ddd" },
                  ]}
                />
                {i !== steps.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: i < currentIndex ? "#22c55e" : "#ddd" },
                    ]}
                  />
                )}
              </View>

              {/* TEXT */}
              <View>
                <Text
                  style={[
                    styles.trackText,
                    i === currentIndex && { fontWeight: "700" },
                  ]}
                >
                  {step}
                </Text>

                {order.statusHistory?.[i]?.updatedAt && (
                  <Text style={styles.trackSub}>
                    {new Date(
                      order.statusHistory[i].updatedAt
                    ).toDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* DELIVERY */}
        <View style={styles.card}>
          <Text style={styles.section}>DELIVERY</Text>

          <Text style={styles.value}>
            {order.shippingAddress.firstName}{" "}
            {order.shippingAddress.lastName}
          </Text>

          <Text style={styles.sub}>{order.shippingAddress.address}</Text>
          <Text style={styles.sub}>
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </Text>
          <Text style={styles.sub}>
            📞 {order.shippingAddress.phone}
          </Text>
        </View>

        {/* PAYMENT */}
        <View style={styles.card}>
          <Text style={styles.section}>PAYMENT</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.value}>
              {order.paymentMethod.toUpperCase()}
            </Text>

            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>
                {order.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* ITEMS */}
        <View style={styles.card}>
          <Text style={styles.section}>ITEMS</Text>

          {order.items.map((item: any, i: number) => (
            <View key={i} style={styles.item}>
              <Image source={{ uri: item.mainImage }} style={styles.img} />

              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.sub}>
                  {item.variant} • Qty {item.quantity}
                </Text>
              </View>

              <Text style={styles.price}>₹{item.total}</Text>
            </View>
          ))}
        </View>
        {/* ACTION BUTTON */}
{actionType === "cancel" && (
  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
    <Text style={styles.cancelText}>Cancel Order</Text>
  </TouchableOpacity>
)}

{actionType === "return" && (
  <TouchableOpacity style={styles.returnBtn} onPress={handleReturn}>
    <Text style={styles.returnText}>Return / Reject</Text>
  </TouchableOpacity>
)}
      </ScrollView>

      {/* TOTAL */}
      <View style={styles.totalBar}>
        <Row label="Subtotal" value={`₹${order.subtotal}`} />
        <Row
          label="Shipping"
          value={
            order.shippingFee > 0 ? `₹${order.shippingFee}` : "Free"
          }
        />

        <View style={styles.divider} />

        <Row label="Total" value={`₹${order.total}`} bold />
      </View>
      
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENT ---------- */
const Row = ({ label, value, bold }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, bold && { fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eee",
  },

  orderId: { fontSize: 16, fontWeight: "700" },
  date: { fontSize: 12, color: "#777", marginTop: 4 },

  statusBadge: {
    marginTop: 8,
    backgroundColor: "#ecfdf5",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: { color: "#22c55e", fontSize: 11 },

  section: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
    fontWeight: "600",
  },

  trackRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  trackLeft: {
    alignItems: "center",
    marginRight: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },

  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },

  trackText: { fontSize: 13 },
  trackSub: { fontSize: 11, color: "#777" },

  value: { fontSize: 13, fontWeight: "500" },
  sub: { fontSize: 12, color: "#666", marginTop: 2 },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  paymentBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  paymentBadgeText: { fontSize: 11 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  img: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginRight: 10,
  },

  itemTitle: { fontSize: 13, fontWeight: "600" },

  price: { fontWeight: "700" },

  totalBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: { fontSize: 12, color: "#777" },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  cancelBtn: {
  marginHorizontal: 16,
  marginBottom: 12,
  padding: 14,
  borderRadius: 30,
  backgroundColor: "#fee2e2",
  alignItems: "center",
},
topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

copyText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#000",
},
cancelText: {
  color: "#dc2626",
  fontWeight: "700",
},

returnBtn: {
  marginHorizontal: 16,
  marginBottom: 12,
  padding: 14,
  borderRadius: 30,
  backgroundColor: "#111",
  alignItems: "center",
},

returnText: {
  color: "#fff",
  fontWeight: "700",
},
});