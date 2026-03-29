import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";
import { Swipeable } from "react-native-gesture-handler";

/* ---------- TYPES ---------- */

type Notification = {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  payload?: {
    orderNumber?: string;
  };
};

export default function Notifications() {
  const router = useRouter();
  const { guestId } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH ---------- */

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/notifications", {
        headers: {
          "x-guest-id": guestId || "",
        },
      });

      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.log("NOTIFICATION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ---------- ACTIONS ---------- */

  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.log("READ ERROR:", err);
    }
  };

  /* ---------- NAVIGATION ---------- */

  const handlePress = (item: Notification) => {
    console.log("ITEM:", item);
    markAsRead(item._id);
    if (item.payload?.orderNumber) {
     router.push(`/notification/${item._id}`);
    }
  };

  /* ---------- ICON ---------- */

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <MaterialIcons name="local-shipping" size={22} color="#111" />;
      case "offer":
        return <Ionicons name="pricetag-outline" size={22} color="#111" />;
      case "return":
        return <Ionicons name="refresh-outline" size={22} color="#111" />;
      default:
        return <Ionicons name="notifications-outline" size={22} color="#111" />;
    }
  };

  /* ---------- TIME ---------- */

  const formatTime = (time: string) => {
    const now = new Date().getTime();
    const t = new Date(time).getTime();
    const diff = Math.floor((now - t) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
const renderRightActions = (id: string) => {
  return (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => removeNotification(id)}
    >
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );
};
  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity onPress={fetchNotifications}>
          <Ionicons name="refresh-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchNotifications}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
  renderItem={({ item }) => (
  <Swipeable
    renderRightActions={() => renderRightActions(item._id)}
  >
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[
        styles.card,
        item.read ? styles.readCard : styles.unreadCard,
      ]}
    >
      <TouchableOpacity onPress={() => handlePress(item)}>
        <View style={{ flexDirection: "row" }}>
          <View style={styles.iconBox}>
            {getIcon(item.type)}
          </View>

          <View style={{ flex: 1 }}>
            {!item.read && <View style={styles.dot} />}

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  </Swipeable>
)}
      />
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f6f7" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 3,
  },

  unreadCard: {
    borderColor: "#111",
  },

  readCard: {
    opacity: 0.55,
  },

  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#111",
    padding: 6,
    borderRadius: 20,
    zIndex: 5,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111",
    position: "absolute",
    top: 4,
    left: -12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  body: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },

  time: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 8,
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    marginTop: 10,
    color: "#999",
  },
  swipeDelete: {
  backgroundColor: "#111",
  justifyContent: "center",
  alignItems: "center",
  width: 80,
  borderRadius: 18,
  marginLeft: 12,
},
});