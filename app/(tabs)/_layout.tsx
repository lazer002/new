import { Tabs } from "expo-router";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

/* ---------------- CUSTOM TAB BAR ---------------- */

const CIRCLE_SIZE = 68;

function CustomTabBar({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const tabCount = state.routes.length;

  const navWidth = width * 0.6;      // ✅ NAV WIDTH
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
    <View style={[styles.tabWrapper, { width: navWidth }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateX }],
          },
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const iconName =
          route.name === "index"
            ? "home"
            : route.name === "search"
            ? "search"
            : "grid";

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, { width: tabWidth }]}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? "#000" : "rgba(255,255,255,0.7)"}
            />
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
        tabBarStyle: { display: "none" },
        // sceneStyle: { backgroundColor: "transparent" },
      }}
      // tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="menu" />
    </Tabs>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
tabWrapper: {
  position: "absolute",
  bottom: 24,
  width: "60%",
  alignSelf: "center",
  height: 80,
  borderRadius: 62,
  backgroundColor: "rgba(255, 255, 255, 0.12)",
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden",
},


  circle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#1edf05ff",
    left: 0,
  },

  tab: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
