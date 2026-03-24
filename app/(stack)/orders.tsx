import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/config";

export default function OrdersScreen() {
  const router = useRouter();
  const { user, guestId } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"completed" | "pending" | "cancelled">("pending");
console.log(guestId)

  useEffect(() => {
    loadOrders();
  }, []);
const loadOrders = async () => {
  try {
    const res = await api.get("/api/orders/mine", {
      headers: {
        "x-guest-id": guestId || "",
      },
      params: {
        userId: user?._id || null,
      },
    });

    setOrders(res.data.orders || res.data);
  } catch (e) {
    console.log("Order fetch error:", e);
  }
};
console.log("Loaded orders:", JSON.stringify(orders));
const renderItem = ({ item }: any) => {
  const status = getCurrentStatus(item);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      
      {/* HEADER */}
      <View style={styles.rowBetween}>
        <Text style={styles.orderId}>#{item.orderNumber}</Text>

        <View style={[styles.statusBadge, getStatusBg(status)]}>
          <Text style={[styles.statusText, getStatusColor(status)]}>
            {status}
          </Text>
        </View>
      </View>

      {/* DATE */}
      <Text style={styles.date}>
        {new Date(item.createdAt).toDateString()}
      </Text>

      {/* ITEMS */}
      <View style={{ marginTop: 12 }}>
        {item.items?.slice(0, 2).map((it: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Image source={{ uri: it.mainImage }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{it.title}</Text>
              <Text style={styles.sub}>{it.variant}</Text>
            </View>

          </View>
        ))}

        {item.items?.length > 2 && (
          <Text style={styles.moreText}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      {/* TOTAL */}
<View style={styles.summaryBox}>
  <View style={styles.rowBetween}>
  <View style={styles.rowBetween}>
    <Text style={styles.lightText}>Quantity: </Text>
    <Text style={styles.darkText}>
      {item.items?.length || 0}
    </Text>
  </View>
      <View style={styles.rowBetween}>
    <Text style={styles.lightText}>Total Amount: </Text>
    <Text style={styles.darkText}>
      ₹{item.total ?? 0}
    </Text>
  </View>
  </View>


</View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() =>{router.push({
  pathname: "/order-details",
  params: { orderNumber: item.orderNumber },
})}
          }
        >
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
  const getCurrentStatus = (order: any) => {
    if (!order?.statusHistory?.length) return "pending";
    return order.statusHistory[order.statusHistory.length - 1].status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return { color: "#22c55e" };
      case "cancelled":
      case "refunded":
        return { color: "#ef4444" };
      default:
        return { color: "#f59e0b" };
    }
  };
  const filteredOrders = orders.filter((order) => {
    const status = getCurrentStatus(order);

    if (tab === "completed") return status === "delivered";

    if (tab === "pending")
      return (
        status !== "delivered" &&
        status !== "cancelled" &&
        status !== "refunded"
      );

    if (tab === "cancelled")
      return status === "cancelled" || status === "refunded";

    return true;
  });
  const getStatusBg = (status: string) => {
  switch (status) {
    case "delivered":
      return { backgroundColor: "#ecfdf5" };
    case "cancelled":
      return { backgroundColor: "#fef2f2" };
    default:
      return { backgroundColor: "#fffbeb" };
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>MY ORDERS</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "pending", label: "PENDING" },
          { key: "completed", label: "COMPLETED" },
          { key: "cancelled", label: "CANCELLED" },
        ].map((t: any) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)}>
            <Text
              style={[
                styles.tabText,
                tab === t.key && styles.activeTab,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },

  tabText: {
    fontSize: 12,
    color: "#999",
  },

  activeTab: {
    color: "#111",
    fontWeight: "700",
    borderBottomWidth: 2,
    borderColor: "#111",
    paddingBottom: 4,
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: "#999",
  },

lightText: {
  fontSize: 12,
  color: "#999", // light grey
},

darkText: {
  fontSize: 14,
  color: "#111", // dark
  fontWeight: "600",
},

summaryBox: {
  marginTop: 10,
  paddingTop: 10,
  borderTopWidth: 1,
  borderColor: "#eee",
  gap: 6,
},

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontWeight: "600",
  },

  status: {
    color: "#22c55e",
    fontSize: 12,
  },

  date: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: "500",
  },

  sub: {
    fontSize: 11,
    color: "#777",
  },

  price: {
    fontWeight: "600",
  },

  moreText: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  total: {
    marginTop: 10,
    fontWeight: "700",
  },

  view: {
    marginTop: 10,
    fontSize: 12,
    color: "#111",
  },
  statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
},

statusText: {
  fontSize: 11,
  fontWeight: "600",
},

totalLabel: {
  fontSize: 12,
  color: "#777",
  marginTop: 10,
},

actions: {
  flexDirection: "row",
  gap: 10,
  marginTop: 12,
},

trackBtn: {
  flex: 1,
  backgroundColor: "#f5f5f5",
  paddingVertical: 10,
  borderRadius: 20,
  alignItems: "center",
},

trackText: {
  fontSize: 12,
  fontWeight: "600",
},

detailsBtn: {
  flex: 1,
  backgroundColor: "#111",
  paddingVertical: 10,
  borderRadius: 20,
  alignItems: "center",
},

detailsText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},

card: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#eee",
},
});
