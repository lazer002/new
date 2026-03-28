import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,Image
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

/* ---------- TYPES ---------- */

type Order = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress?: {
    name: string;
    address: string;
    phone: string;
  };
};

/* ---------- COMPONENT ---------- */

export default function TrackOrderPage() {
  const params = useLocalSearchParams<{ orderNumber?: string }>();
  const { guestId,user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState(
    params.orderNumber || ""
  );

  /* ---------- FETCH ---------- */

  const fetchOrder = async (orderNum?: string) => {
    if (!orderNum) return;

    try {
      setLoading(true);



      const res = await api.get(
        `/api/orders/track?orderNumber=${orderNum}`,
        {
          headers: {
            "x-guest-id": guestId || "",
          },
        }
      );

      setOrder(res.data.order);
    } catch (err: any) {
      Alert.alert("Error", "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- AUTO FETCH ---------- */

  useFocusEffect(
    useCallback(() => {
      if (params.orderNumber) {
        fetchOrder(params.orderNumber);
      }
    }, [params.orderNumber])
  );

  /* ---------- SEARCH MODE ---------- */

  if (!params.orderNumber && !order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.searchContainer}>
          <Text style={styles.heading}>Track Your Order</Text>
          <Text style={styles.subHeading}>
            Enter your order number to view status
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. ORD123456"
              value={searchOrderNumber}
              onChangeText={setSearchOrderNumber}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => fetchOrder(searchOrderNumber)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------- LOADING ---------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  /* ---------- EMPTY ---------- */

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }

  /* ---------- ORDER VIEW ---------- */
const STATUS_STEPS = [
  "pending",
  "confirmed",
  "dispatched",
  "shipped",
  "delivered",
];
const currentIndex = STATUS_STEPS.indexOf(order.orderStatus);
console.log(order)
return (
  <SafeAreaView style={styles.safe}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.orderTitle}>
          Order #{order.orderNumber}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {order.orderStatus}
          </Text>
        </View>
      </View>

      {/* 🚀 TRACKING TIMELINE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tracking</Text>

        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;

          return (
            <View key={step} style={styles.timelineRow}>
              {/* LEFT */}
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    isCompleted
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />

                {index !== STATUS_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      isCompleted
                        ? styles.lineActive
                        : styles.lineInactive,
                    ]}
                  />
                )}
              </View>

              {/* RIGHT */}
              <View>
                <Text
                  style={
                    isCompleted
                      ? styles.timelineTextActive
                      : styles.timelineTextInactive
                  }
                >
                  {step}
                </Text>

                <Text style={styles.timelineSubText}>
                  {isCompleted ? "Completed" : "Pending"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ITEMS */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>Items</Text>

  {order.items.map((item: any, i: number) => (
    <View key={i} style={styles.itemRow}>
      
      {/* IMAGE */}
      <Image
        source={{ uri: item.mainImage }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      {/* TEXT */}
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
      </View>

      {/* QTY */}
      <Text style={styles.itemQty}>x{item.quantity}</Text>
    </View>
  ))}
</View>

      {/* ADDRESS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipping Address</Text>
        <Text style={styles.text}>
          {order.shippingAddress?.name}
        </Text>
        <Text style={styles.text}>
          {order.shippingAddress?.address}
        </Text>
        <Text style={styles.text}>
          {order.shippingAddress?.phone}
        </Text>
      </View>

      {/* SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Summary</Text>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>₹{order.subtotal}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={styles.value}>₹{order.shipping}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>₹{order.total}</Text>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* SEARCH */
  searchContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },

  subHeading: {
    fontSize: 14,
    color: "#777",
    marginBottom: 24,
  },

  inputWrapper: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },

  input: {
    height: 48,
    fontSize: 14,
    color: "#000",
  },

  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  /* HEADER */
  header: {
    marginBottom: 20,
  },

  orderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  statusBadge: {
    marginTop: 8,
    backgroundColor: "#000",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
  },

  /* CARD */
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  itemName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },

  itemQty: {
    fontSize: 13,
    color: "#777",
  },

  text: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#777",
  },

  value: {
    fontSize: 14,
    color: "#000",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  timelineRow: {
  flexDirection: "row",
  marginBottom: 20,
},

timelineLeft: {
  alignItems: "center",
  marginRight: 12,
},

dot: {
  width: 14,
  height: 14,
  borderRadius: 7,
},
itemImage: {
  width: 50,
  height: 50,
  borderRadius: 10,
  marginRight: 10,
  backgroundColor: "#f5f5f5",
},

itemVariant: {
  fontSize: 12,
  color: "#777",
  marginTop: 2,
},
dotActive: {
  backgroundColor: "#000",
},

dotInactive: {
  backgroundColor: "#ccc",
},

line: {
  width: 2,
  height: 40,
},

lineActive: {
  backgroundColor: "#000",
},

lineInactive: {
  backgroundColor: "#ccc",
},

timelineTextActive: {
  color: "#000",
  fontWeight: "600",
  textTransform: "capitalize",
},

timelineTextInactive: {
  color: "#aaa",
  textTransform: "capitalize",
},

timelineSubText: {
  fontSize: 12,
  color: "#999",
},
});