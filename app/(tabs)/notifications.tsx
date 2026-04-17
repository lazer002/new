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
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import api from "@/utils/config";
import { useAuth } from "@/context/AuthContext";
import { Swipeable } from "react-native-gesture-handler";
import { useNotification } from "@/context/NotificationContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
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

/* ---------- MAIN SCREEN ---------- */

export default function Notifications() {
  const router = useRouter();
  const { guestId } = useAuth();
  const { refreshNotifCount } = useNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH ---------- */

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/notifications");

      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.log("NOTIFICATION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchNotifications();
  }, [guestId])
);

  /* ---------- ACTIONS ---------- */

  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      refreshNotifCount();
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

      refreshNotifCount();
    } catch (err) {
      console.log("READ ERROR:", err);
    }
  };

  const handlePress = (item: Notification) => {
    markAsRead(item._id);
    if (item.payload?.orderNumber) {
      router.push(`/notification/${item._id}`);
    }
  };

  /* ---------- ICON ---------- */

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <MaterialIcons name="local-shipping" size={22} color="#fff" />;
      case "offer":
        return <Ionicons name="pricetag-outline" size={22} color="#fff" />;
      case "return":
        return <Ionicons name="refresh-outline" size={22} color="#fff" />;
      default:
        return <Ionicons name="notifications-outline" size={22} color="#fff" />;
    }
  };

  /* ---------- TIME ---------- */

  const formatTime = (time: string) => {
    const now = Date.now();
    const t = new Date(time).getTime();
    const diff = Math.floor((now - t) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => removeNotification(id)}
    >
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );

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
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} />
        }
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={44} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <AnimatedNotificationCard
            item={item}
            index={index}
            onPress={handlePress}
            renderRightActions={renderRightActions}
            getIcon={getIcon}
            formatTime={formatTime}
          />
        )}
      />
    </SafeAreaView>
  );
}

/* ---------- ANIMATED CARD ---------- */

const AnimatedNotificationCard = ({
  item,
  index,
  onPress,
  renderRightActions,
  getIcon,
  formatTime,
}: any) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

useEffect(() => {
  opacity.value = withDelay(
    index * 80,
    withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  );

  translateY.value = withDelay(
    index * 80,
    withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  );
}, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Swipeable renderRightActions={() => renderRightActions(item._id)}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPress(item)}
          style={[
            styles.card,
            item.read ? styles.readCard : styles.unreadCard,
          ]}
        >
          <View style={styles.row}>
            <View style={[
              styles.iconBox,
              !item.read && styles.iconHighlight
            ]}>
              {getIcon(item.type)}
            </View>

            <View style={styles.content}>
              {!item.read && <View style={styles.dot} />}

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>

              <View style={styles.footer}>
                <Text style={styles.time}>
                  {formatTime(item.createdAt)}
                </Text>

                {!item.read && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  unreadCard: {
    borderWidth: 1.2,
    borderColor: "#111",
  },

  readCard: {
    opacity: 0.6,
  },

  row: {
    flexDirection: "row",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconHighlight: {
    backgroundColor: "#111",
  },

  content: {
    flex: 1,
    position: "relative",
  },

  dot: {
    position: "absolute",
    top: 2,
    left: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
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

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    fontSize: 11,
    color: "#999",
  },

  newBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  newText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    marginTop: 12,
    color: "#999",
  },

  swipeDelete: {
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 20,
    marginLeft: 12,
  },
});