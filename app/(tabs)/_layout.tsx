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


const ACTIVE_SIZE = 56;

function CustomTabBar({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const tabCount = state.routes.length;

  const navWidth = width * 0.85;
  const tabWidth = navWidth / tabCount;

  return (
    <View style={[styles.wrapper, { width: navWidth }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const iconName =
          route.name === "index"
            ? "home-outline"
            : route.name === "wishlist"
            ? "heart-outline"
            : route.name === "notifications"
            ? "bag-outline"
            : "person-outline";

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, { width: tabWidth }]}
          >
            {isFocused ? (
              <View style={styles.activeCircle}>
                <Ionicons name={iconName as any} size={22} color="#000" />
              </View>
            ) : (
              <Ionicons
                name={iconName as any}
                size={22}
                color="#999"
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
  },

  activeCircle: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    backgroundColor: "#505050ff",
    justifyContent: "center",
    alignItems: "center",
  },
});



































// import { Tabs } from "expo-router";
// import {
//   View,
//   Pressable,
//   StyleSheet,
//   Animated,
//   useWindowDimensions,
// } from "react-native";
// import { useEffect, useRef } from "react";
// import { Ionicons } from "@expo/vector-icons";

// /* ---------------- CUSTOM TAB BAR ---------------- */

// const CIRCLE_SIZE = 68;

// function CustomTabBar({ state, navigation }: any) {
//   const { width } = useWindowDimensions();
//   const tabCount = state.routes.length;

//   const navWidth = width * 1; // slightly wider for 4 tabs
//   const tabWidth = navWidth / tabCount;

//   const translateX = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const toValue =
//       state.index * tabWidth + (tabWidth - CIRCLE_SIZE) / 2;

//     Animated.spring(translateX, {
//       toValue,
//       useNativeDriver: true,
//       damping: 18,
//       stiffness: 120,
//     }).start();
//   }, [state.index, tabWidth]);

//   return (
//     <View style={[styles.tabWrapper, { width: navWidth }]}>
//       {/* Animated Green Circle */}
//       <Animated.View
//         style={[
//           styles.circle,
//           {
//             transform: [{ translateX }],
//           },
//         ]}
//       />

//       {state.routes.map((route: any, index: number) => {
//         const isFocused = state.index === index;

//         const iconName =
//           route.name === "index"
//             ? "home"
//             : route.name === "wishlist"
//             ? "heart"
//             : route.name === "notifications"
//             ? "notifications"
//             : "person";

//         return (
//           <Pressable
//             key={route.key}
//             onPress={() => navigation.navigate(route.name)}
//             style={[styles.tab, { width: tabWidth }]}
//           >
//             <Ionicons
//               name={iconName as any}
//               size={22}
//               color={isFocused ? "#000" : "rgba(255,255,255,0.6)"}
//             />
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// }

// /* ---------------- TABS LAYOUT ---------------- */

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         sceneStyle: { backgroundColor: "transparent" },
//       }}
//       tabBar={(props) => <CustomTabBar {...props} />}
//     >
//       <Tabs.Screen name="index" />
//       <Tabs.Screen name="wishlist" />
//       <Tabs.Screen name="notifications" />
//       <Tabs.Screen name="profile" />
//     </Tabs>
//   );
// }

// /* ---------------- STYLES ---------------- */

// const styles = StyleSheet.create({
//   tabWrapper: {
//     position: "absolute",
//     bottom: 0,
//     alignSelf: "center",
//     height: 80,
//     borderRadius: 42,
//     backgroundColor: "rgba(255, 255, 255, 1)",
//     flexDirection: "row",
//     alignItems: "center",
//     overflow: "hidden",
    
//   },

//   circle: {
//     position: "absolute",
//     width: CIRCLE_SIZE,
//     height: CIRCLE_SIZE,
//     borderRadius: CIRCLE_SIZE / 2,
//     backgroundColor: "#1edf05ff",
//     left: 0,
//   },

//   tab: {
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
