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
import { useCart } from "@/context/CartContext";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useWishlist } from "@/context/WishlistContext";
import { useFilter } from "@/context/FilterContext";
import { useUI } from "@/context/UIContext";
const { height, width } = require("react-native").Dimensions.get("window");
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
const WRAPPER_HEIGHT = height * 0.078;
const PILL_HEIGHT = height * 0.055;

function CustomTabBar({
  state,
  navigation,
}: any) {
const insets = useSafeAreaInsets();
  const { width ,height} =
    useWindowDimensions();

  const { wishlist } =
    useWishlist();

  const { isFilterOpen } =
    useFilter();
const { items } = useCart();
  const {
    drawerOpen,
    tabBarVisible,
  } = useUI();

const isCartScreen =
  state.routes[state.index]?.name === "cart";

  const hasCartItems = items.length > 0;

  const tabCount =
    state.routes.length;

    const HORIZONTAL_PADDING = 10;
  const navWidth =    width * 0.88;

const tabWidth = (navWidth - HORIZONTAL_PADDING * 2) / tabCount;



  const activeWidth = tabWidth 

  const activeHeight = 54;

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
  HORIZONTAL_PADDING +
  state.index * tabWidth;

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
      tabBarVisible &&
   !(isCartScreen && hasCartItems);

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
    isCartScreen,
    hasCartItems
  ]);

  if (isFilterOpen)
    return null;


  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: navWidth,
 bottom: insets.bottom + 12,
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
            width: activeWidth,
            height: activeHeight,

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

            case "bundle":

              label = "Bundle";

              icon = (
                <MaterialIcons
                  name="inventory-2"
                  size={isFocused ? 26 : 21}
                  color={iconColor}
                />
              );

              break;

            case "cart":

              label = "Cart";

            icon = (
    <View>

      <MaterialIcons
        name="shopping-bag"
        size={isFocused ? 26 : 21}
        color={iconColor}
      />

      <Badge count={items.length} />

    </View>
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

                navigation.navigate(
                  route.name
                );

              }}
            >

          <View style={styles.tabContent}>

  <View
    style={{
      transform: [
        { scale: isFocused ? 1.12 : 1 },
        { translateY: isFocused ? -1 : 0 },
      ],
    }}
  >
    {icon}
  </View>

  <View style={styles.labelContainer}>
    {isFocused && (
      <Text style={styles.activeLabel}>
        {label}
      </Text>
    )}
  </View>

</View>

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
      <Tabs.Screen name="bundle" />
      <Tabs.Screen name="cart" />
    </Tabs>
  );
}

const styles = StyleSheet.create({

  wrapper: {

    position: "absolute",

    // bottom: height * 0.026,

    alignSelf: "center",

    height:height * 0.078,

    // width: "90%",

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

    left: 0,
top: (WRAPPER_HEIGHT - PILL_HEIGHT) / 2,
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
tab: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
},
  activeLabel: {

    marginTop: 0,

    fontSize: 10,

    fontWeight: "800",

    color: "#111",

    letterSpacing: .5,

    textTransform: "uppercase",

  },

  badge: {

    position: "absolute",

    top: -6,

    right: -10,

    backgroundColor: "#9DFF00",

    minWidth: width * 0.05,

    height:height * 0.018,

    borderRadius: 9,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 4,

  },
tabContent: {
  width: "100%",
 height:"100%",
  justifyContent: "center",
  alignItems: "center",
},

labelContainer: {
  height: 12,
  justifyContent: "center",
  alignItems: "center",
},
  badgeText: {

    color: "#111",

    fontWeight: "900",

    fontSize: 10,

  },

});