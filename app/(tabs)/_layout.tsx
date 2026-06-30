import { Tabs, router } from "expo-router";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Text,
} from "react-native";
import { useEffect, useRef } from "react";

import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useWishlist } from "@/context/WishlistContext";
import { useFilter } from "@/context/FilterContext";
import { useUI } from "@/context/UIContext";
const ACTIVE_WIDTH = 82;
const ACTIVE_HEIGHT = 54;

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

function CustomTabBar({
  state,
  navigation,
}: any) {

  const { width } =
    useWindowDimensions();

  const { wishlist } =
    useWishlist();

  const { isFilterOpen } =
    useFilter();

const {
  drawerOpen,
  tabBarVisible,
} = useUI();

  const tabCount =
    state.routes.length;

  const navWidth =
    width * 0.88;

  const tabWidth =
    navWidth / tabCount;

  const translateX =
    useRef(
      new Animated.Value(0)
    ).current;

  const scale =
    useRef(
      new Animated.Value(1)
    ).current;

    const footerTranslateY =
  useRef(
    new Animated.Value(0)
  ).current;

const footerOpacity =
  useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {

    const toValue =
      state.index * tabWidth +
      (tabWidth - ACTIVE_WIDTH) / 2;

    Animated.parallel([

      Animated.spring(
        translateX,
        {
          toValue,
          useNativeDriver: true,
          tension: 120,
          friction: 12,
        }
      ),

      Animated.sequence([

        Animated.timing(
          scale,
          {
            toValue: .95,
            duration: 90,
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          scale,
          {
            toValue: 1,
            useNativeDriver: true,
            tension: 180,
            friction: 8,
          }
        )

      ])

    ]).start();

  }, [
    state.index,
    tabWidth,
  ]);

  useEffect(() => {

  const visible =
    !drawerOpen &&
    !isFilterOpen &&
    tabBarVisible;

  Animated.parallel([

    Animated.timing(
      footerOpacity,
      {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }
    ),

    Animated.spring(
      footerTranslateY,
      {
        toValue: visible ? 0 : 120,
        tension: 120,
        friction: 12,
        useNativeDriver: true,
      }
    ),

  ]).start();

}, [
  drawerOpen,
  isFilterOpen,
  tabBarVisible,
]);

  if (isFilterOpen)
    return null;


  return (
<Animated.View
  style={[
    styles.wrapper,
    {
      width: navWidth,

      opacity: footerOpacity,

      transform: [
        {
          translateY:
            footerTranslateY,
        },
      ],

    },
  ]}
>
      {/* Active Pill */}

      <Animated.View
        style={[
          styles.activePill,
          {
            transform: [
              {
                translateX,
              },
              {
                scale,
              },
            ],
          },
        ]}
      />

      {state.routes.map(
        (
          route: any,
          index: number
        ) => {

          const isFocused =
            state.index === index;

          const iconColor =
            isFocused
              ? "#111"
              : "#7B7B7B";

          let label = "";
          let icon;

          switch (route.name) {

            case "index":

              label = "Home";

              icon = (
                <Octicons
                  name={
                    isFocused
                      ? "home-fill"
                      : "home"
                  }
                  size={
  isFocused
    ? 26
    : 21
}
                  color={iconColor}
                />
              );

              break;

            case "wishlist":

              label = "Wishlist";

              icon = (
                <View>

                  <Octicons
                    name={
                      isFocused
                        ? "heart-fill"
                        : "heart"
                    }
                    size={
  isFocused
    ? 26
    : 21
}
                    color={iconColor}
                  />

                  <Badge
                    count={
                      wishlist.length
                    }
                  />

                </View>
              );

              break;

            case "notifications":

              label = "Bundle";

              icon = (
                <MaterialIcons
                  name="inventory-2"
                  size={23}
                  color={iconColor}
                />
              );

              break;

            case "profile":

              label = "Cart";

              icon = (
                <MaterialIcons
                  name="shopping-bag"
                  size={23}
                  color={iconColor}
                />
              );

              break;

            default:
              return null;

          }

          return (

            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => {

                if (
                  route.name ===
                  "notifications"
                ) {

                  router.push(
                    "/bundle"
                  );

                  return;

                }

                if (
                  route.name ===
                  "profile"
                ) {

                  router.push(
                    "/(stack)/cart"
                  );

                  return;

                }

                navigation.navigate(
                  route.name
                );

              }}
            >

<View
  style={{
 transform: [
  { scale: isFocused ? 1.12 : 1 },
  { translateY: isFocused ? -2 : 0 },
]
  }}
>
  {icon}
</View>
        {isFocused && (

  <Text
    style={styles.activeLabel}
  >
    {label}
  </Text>

)}

            </Pressable>

          );

        }
      )}

    </Animated.View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "transparent",
        },
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

const styles = StyleSheet.create({

wrapper: {

  position: "absolute",

  bottom: 18,

  alignSelf: "center",

  height: 78,

  width: "90%",

  borderRadius: 30,

  backgroundColor: "#0E0E0E",

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: 10,

  borderWidth: 1,

  borderColor: "#1D1D1D",

  shadowColor: "#000",

  shadowOpacity: 0.32,

  shadowRadius: 26,

  shadowOffset: {
    width: 0,
    height: 14,
  },

  elevation: 24,

},

activePill: {

  position: "absolute",

  left: 8,

  width: ACTIVE_WIDTH,

  height: ACTIVE_HEIGHT,

  borderRadius: 22,

  backgroundColor: "#B6FF2E",

  borderWidth: 1,

  borderColor: "#D8FF77",

  shadowColor: "#B6FF2E",

  shadowOpacity: 0.65,

  shadowRadius: 22,

  shadowOffset: {
    width: 0,
    height: 10,
  },

  elevation: 18,

},
tab:{

  flex:1,

  justifyContent:"center",

  alignItems:"center",

  paddingTop:8,

},

activeLabel:{

  marginTop:4,

  fontSize:10,

  fontWeight:"800",

  color:"#111",

  letterSpacing:.5,

  textTransform:"uppercase",

},

  badge: {

    position: "absolute",

    top: -6,

    right: -10,

    backgroundColor: "#9DFF00",

    minWidth: 18,

    height: 18,

    borderRadius: 9,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 4,

  },

  badgeText: {

    color: "#111",

    fontWeight: "900",

    fontSize: 10,

  },

});