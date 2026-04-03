import { Tabs } from "expo-router";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Text,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import api from "@/utils/config";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFilter } from "@/context/FilterContext";

/* ---------------- CONSTANTS ---------------- */

const CIRCLE_SIZE = 56;
const Badge = ({ count }: { count: number }) => {
  if (!count) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 9 ? "9+" : count}
      </Text>
    </View>
  );
};
/* ---------------- CUSTOM TAB BAR ---------------- */

function CustomTabBar({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const { isFilterOpen } = useFilter();

  const tabCount = state.routes.length;
const [notifCount, setNotifCount] = useState(0);
  const { wishlist } = useWishlist();

  const { user, logout,guestId } = useAuth()
const [hasProfileAlert, setHasProfileAlert] = useState(false);
  const navWidth = width * 0.85;
  const tabWidth = navWidth / tabCount;

  const translateX = useRef(new Animated.Value(0)).current;
const Dot = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return <View style={styles.dot} />;
};
  useEffect(() => {
    const toValue =
      state.index * tabWidth + (tabWidth - CIRCLE_SIZE) / 2;

    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();
  }, [state.index, tabWidth]);

  useEffect(() => {
     if (!guestId) return;
  const loadCounts = async () => {
    try {
      const notifRes = await api.get("/api/notifications/unread-count");
      setNotifCount(notifRes.data.count);

    } catch (err) {
      console.log("COUNT ERROR", err);
    }
  };

  loadCounts();
}, [guestId]);

useEffect(() => {
   if (!guestId) return;
  const checkProfileAlert = async () => {
    try {
      const res = await api.get("/api/orders/mine", {
        headers: {
          "x-guest-id": guestId || "",
        },
      });

      const orders = res.data.orders || [];

      const activeStatuses = [
        "pending",
        "confirmed",
        "dispatched",
        "shipped",
        "out for delivery",
      ];

      const hasActive = orders.some((o: any) =>
        activeStatuses.includes(
          (o.orderStatus || "").toLowerCase()
        )
      );

      setHasProfileAlert(hasActive);
    } catch (err) {
      console.log("Profile dot error", err);
    }
  };

  checkProfileAlert();
}, [guestId]);

 
  if (isFilterOpen) return null;
  return (
    <View style={[styles.wrapper, { width: navWidth }]}>
      {/* 🔘 Sliding Circle */}
      <Animated.View
        style={[
          styles.circle,
          { transform: [{ translateX }] },
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, { width: tabWidth }]}
          >
            {/* Notifications (MaterialIcons) */}
     {route.name === "notifications" ? (
  <View>
    <MaterialIcons
      name={
        isFocused
          ? "notifications"
          : "notifications-none"
      }
      size={26}
      color={isFocused ? "#000" : "#999"}
    />
    <Badge count={notifCount} />
  </View>
) : route.name === "wishlist" ? (
  <View>
    <Octicons
      name={isFocused ? "heart-fill" : "heart"}
      size={22}
      color={isFocused ? "#000" : "#999"}
    />
    <Badge count={wishlist.length} />
  </View>
) : route.name === "profile" ? (
  <View>
    <Octicons
      name={isFocused ? "person-fill" : "person"}
      size={22}
      color={isFocused ? "#000" : "#999"}
    />
  <Dot show={hasProfileAlert} />
  </View>
) : (
  <Octicons
    name={isFocused ? "home-fill" : "home"}
    size={22}
    color={isFocused ? "#000" : "#999"}
  />
)}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- TABS LAYOUT ---------------- */

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    height: 72,
    borderRadius: 40,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 15,
    
  },

  tab: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    zIndex: 2,
  },

  circle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#e2dedeff",
    left: 0,
    zIndex: 1,
  },
  badge: {
  position: "absolute",
  top: -6,
  right: -10,
  backgroundColor: "#22c55e",
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
  elevation: 3,
},

badgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "700",
},
dot: {
  position: "absolute",
  top: -2,
  right: -4,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#22c55e",
},
});
