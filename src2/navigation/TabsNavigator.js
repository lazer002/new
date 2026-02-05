import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HouseSimple, User, MagnifyingGlass } from "phosphor-react-native";
import { useNavigation, TabActions } from "@react-navigation/native";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tabs = createBottomTabNavigator();

export default function TabsNavigator() {
  const navigation = useNavigation();

  return (
    <>
      {/* TAB SCENES */}
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: "none" },
          sceneContainerStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Tabs.Screen name="Home" component={HomeScreen} />
        <Tabs.Screen name="Profile" component={ProfileScreen} />
      </Tabs.Navigator>

      {/* CUSTOM TAB BAR OVERLAY */}
      <View style={styles.tabContainer} pointerEvents="box-none">
        <View style={styles.glassBar}>
          <TouchableOpacity
            onPress={() =>
              navigation.dispatch(TabActions.jumpTo("Home"))
            }
          >
            <View style={styles.circle}>
              <HouseSimple size={26} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={{ width: 60 }} />

          <TouchableOpacity
            onPress={() =>
              navigation.dispatch(TabActions.jumpTo("Profile"))
            }
          >
            <View style={styles.circle}>
              <User size={26} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.fabWrapper}
          onPress={() => navigation.navigate("SearchScreen")}
          activeOpacity={0.9}
        >
          <View style={styles.fab}>
            <MagnifyingGlass size={28} color="#000" />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    bottom: "5%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  glassBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "78%",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  fabWrapper: {
    position: "absolute",
    bottom: 22,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
