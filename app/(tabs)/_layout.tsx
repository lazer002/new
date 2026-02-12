import { Tabs } from "expo-router";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef } from "react";

import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/* ---------------- CONSTANTS ---------------- */

const CIRCLE_SIZE = 56;

/* ---------------- CUSTOM TAB BAR ---------------- */

function CustomTabBar({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const tabCount = state.routes.length;

  const navWidth = width * 0.85;
  const tabWidth = navWidth / tabCount;

  const translateX = useRef(new Animated.Value(0)).current;

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
              <MaterialIcons
                name={
                  isFocused
                    ? "notifications"
                    : "notifications-none"
                }
                size={26}
                color={isFocused ? "#000" : "#999"}
              />
            ) : (
              /* Other tabs (Octicons) */
              <Octicons
          name={
    route.name === "index"
      ? isFocused
        ? "home-fill"
        : "home"
      : route.name === "wishlist"
      ? isFocused
        ? "heart-fill"
        : "heart"
      : isFocused
      ? "person-fill"
      : "person"
  }
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
});
